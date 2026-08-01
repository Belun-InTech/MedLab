import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { AnalysisResult } from '../../../shared/types.js';
import { db, schema } from '../db/index.js';
import { requireAuth } from '../lib/auth.js';
import { chat, extractJson } from '../ai/providers.js';
import {
  buildPrompt,
  buildSystemInstruction,
  buildTranslationPrompt,
} from '../ai/prompt.js';

export const consultationsRouter = Router();
consultationsRouter.use(requireAuth);

const analyzeSchema = z.object({
  childId: z.string().min(1),
  language: z.enum(['en', 'tet', 'id']),
  symptoms: z.string().max(4000).default(''),
  symptomOnset: z.string().max(255).default(''),
  weightKg: z.number().positive().max(200).optional(),
  // data: URL. Not persisted — see the note on the consultations table.
  image: z.string().max(8_000_000).optional(),
});

const ageInMonths = (dob: string, ref = new Date()): number => {
  const birth = new Date(dob);
  let months = (ref.getFullYear() - birth.getFullYear()) * 12 + (ref.getMonth() - birth.getMonth());
  if (ref.getDate() < birth.getDate()) months--;
  return Math.max(0, months);
};

/** First non-empty value among several candidate key names. */
const pick = (obj: any, ...keys: string[]): any => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
};

const DEFAULT_DISCLAIMER =
  'This information is for guidance only and is not a medical diagnosis. Always consult a health worker.';

/**
 * Trust nothing the model returns.
 *
 * Only Ollama enforces the schema; hosted providers running in `json_object` mode invent
 * their own key names, so we accept the common aliases rather than silently dropping the
 * whole clinical payload.
 */
const normalise = (raw: any): AnalysisResult => {
  if (!raw || typeof raw !== 'object') throw new Error('Model returned a non-object');
  const probabilities = new Set(['High', 'Moderate', 'Low']);

  const conditions = pick(raw, 'possibleConditions', 'conditions', 'possible_conditions') ?? [];
  if (!Array.isArray(conditions) || conditions.length === 0) {
    // Never hand back an "emergency" with no conditions and no advice — a hollow result
    // is worse than an error, because the UI would render it as a finished analysis.
    throw new Error('Model returned no conditions');
  }

  const specialistRaw = String(pick(raw, 'recommendedSpecialist', 'specialist') ?? '');

  return {
    emergencyAlert: Boolean(pick(raw, 'emergencyAlert', 'emergency_alert', 'emergency')),
    emergencyMessage: pick(raw, 'emergencyMessage', 'emergency_message'),
    possibleConditions: conditions.slice(0, 3).map((c: any) => ({
      name: String(pick(c, 'name', 'condition', 'conditionName') ?? ''),
      probability: probabilities.has(c?.probability) ? c.probability : 'Low',
      description: String(pick(c, 'description', 'explanation', 'about') ?? ''),
      reasoning: String(pick(c, 'reasoning', 'why', 'rationale') ?? ''),
      recommendedAction: String(
        pick(c, 'recommendedAction', 'action', 'nextSteps', 'recommendation') ?? '',
      ),
      suggestedMedications: (
        pick(c, 'suggestedMedications', 'medicationSuggestions', 'medications') ?? []
      )
        .slice(0, 6)
        .map((m: any) =>
          // Some models return a plain string per medication instead of an object.
          typeof m === 'string'
            ? { name: m, type: 'Over-the-counter' as const, description: '' }
            : {
                name: String(pick(m, 'name', 'medication') ?? ''),
                type: m?.type ?? 'Over-the-counter',
                description: String(m?.description ?? ''),
                dosage: m?.dosage ? String(m.dosage) : undefined,
              },
        ),
    })),
    generalAdvice: (pick(raw, 'generalAdvice', 'advice', 'general_advice', 'tips') ?? []).map(
      String,
    ),
    // "Pediatric Emergency", "pediatrician" etc. should not silently become a GP.
    recommendedSpecialist: /p(a)?ediatric/i.test(specialistRaw)
      ? 'Pediatrician'
      : 'General Practitioner',
    disclaimer: String(pick(raw, 'disclaimer', 'note') ?? DEFAULT_DISCLAIMER),
  };
};

consultationsRouter.post('/analyze', async (req, res) => {
  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }
  const { childId, language, symptoms, symptomOnset, weightKg, image } = parsed.data;

  if (!symptoms.trim() && !image) {
    res.status(400).json({ error: 'symptoms_or_image_required' });
    return;
  }

  const [child] = await db
    .select()
    .from(schema.children)
    .where(and(eq(schema.children.id, childId), eq(schema.children.userId, req.userId!)))
    .limit(1);

  if (!child) {
    res.status(404).json({ error: 'child_not_found' });
    return;
  }

  const months = ageInMonths(child.dob);
  const description =
    symptoms.trim() ||
    'Visual symptoms are presented in the attached image. Please analyze the image carefully to identify the condition.';

  const prompt = buildPrompt(
    {
      name: child.name,
      ageYears: Math.floor(months / 12),
      ageMonths: months,
      sex: child.sex,
      weightKg,
      symptomOnset: symptomOnset.trim() || 'Recently',
      symptoms: description,
    },
    language,
    description,
  );

  // Providers without enforced schemas occasionally emit malformed or incomplete JSON.
  // One retry turns most of those into a normal result instead of an error the parent sees.
  const ATTEMPTS = 2;
  let result: AnalysisResult | undefined;
  let meta: { provider: string; model: string; latencyMs: number } | undefined;
  let lastError: unknown;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const completion = await chat({
        system: buildSystemInstruction(language),
        user: prompt,
        image,
        structured: true,
      });
      result = normalise(extractJson(completion.text));
      meta = completion;
      break;
    } catch (err) {
      lastError = err;
      console.warn(`[analyze] attempt ${attempt}/${ATTEMPTS} failed:`, err);
    }
  }

  if (!result || !meta) {
    console.error('[analyze] provider failure:', lastError);
    res.status(502).json({ error: 'ai_unavailable' });
    return;
  }

  // Persist the consultation — this is the child health timeline.
  const consultationId = randomUUID();
  await db.insert(schema.consultations).values({
    id: consultationId,
    childId: child.id,
    userId: req.userId!,
    ageMonths: months,
    weightKg: weightKg != null ? String(weightKg) : null,
    language,
    symptomOnset: symptomOnset.trim() || 'Recently',
    symptoms: symptoms.trim(),
    hadImage: Boolean(image),
    emergencyAlert: result.emergencyAlert,
    emergencyMessage: result.emergencyMessage ?? null,
    generalAdvice: result.generalAdvice,
    recommendedSpecialist: result.recommendedSpecialist,
    disclaimer: result.disclaimer,
    provider: meta.provider,
    model: meta.model,
    latencyMs: meta.latencyMs,
  });

  if (result.possibleConditions.length) {
    await db.insert(schema.consultationConditions).values(
      result.possibleConditions.map((c, i) => ({
        id: randomUUID(),
        consultationId,
        position: i + 1,
        name: c.name,
        probability: c.probability,
        description: c.description,
        reasoning: c.reasoning,
        recommendedAction: c.recommendedAction,
        suggestedMedications: c.suggestedMedications,
      })),
    );
  }

  res.json({ id: consultationId, result });
});

/** Re-translate an existing result when the UI language changes. */
consultationsRouter.post('/translate', async (req, res) => {
  const parsed = z
    .object({ result: z.unknown(), language: z.enum(['en', 'tet', 'id']) })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }
  try {
    const completion = await chat({
      user: buildTranslationPrompt(parsed.data.result, parsed.data.language),
      structured: true,
    });
    res.json({ result: normalise(extractJson(completion.text)) });
  } catch (err) {
    console.error('[translate] failed:', err);
    // The UI must never break on a failed translation — hand back the original.
    res.json({ result: parsed.data.result });
  }
});

/** Consultation history — the timeline a Ministry partner would care about. */
consultationsRouter.get('/', async (req, res) => {
  const childId = typeof req.query.childId === 'string' ? req.query.childId : undefined;

  const rows = await db
    .select({
      id: schema.consultations.id,
      childId: schema.consultations.childId,
      childName: schema.children.name,
      ageMonths: schema.consultations.ageMonths,
      symptoms: schema.consultations.symptoms,
      emergencyAlert: schema.consultations.emergencyAlert,
      recommendedSpecialist: schema.consultations.recommendedSpecialist,
      createdAt: schema.consultations.createdAt,
    })
    .from(schema.consultations)
    .innerJoin(schema.children, eq(schema.children.id, schema.consultations.childId))
    .where(
      childId
        ? and(
            eq(schema.consultations.userId, req.userId!),
            eq(schema.consultations.childId, childId),
          )
        : eq(schema.consultations.userId, req.userId!),
    )
    .orderBy(desc(schema.consultations.createdAt))
    .limit(100);

  res.json({ consultations: rows });
});

consultationsRouter.get('/:id', async (req, res) => {
  const [consultation] = await db
    .select()
    .from(schema.consultations)
    .where(
      and(eq(schema.consultations.id, req.params.id), eq(schema.consultations.userId, req.userId!)),
    )
    .limit(1);

  if (!consultation) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  const conditions = await db
    .select()
    .from(schema.consultationConditions)
    .where(eq(schema.consultationConditions.consultationId, consultation.id))
    .orderBy(schema.consultationConditions.position);

  res.json({ consultation, conditions });
});
