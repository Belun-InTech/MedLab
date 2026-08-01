import type { Language } from '../../../shared/types.js';

/**
 * The clinical prompt and its output schema. These live server-side now: they are the
 * highest-risk asset in the product and no longer ship inside the browser bundle, so they
 * can be tuned without rebuilding the SPA.
 */

export interface AnalysisInput {
  name: string;
  ageYears: number;
  ageMonths: number;
  sex: 'Male' | 'Female' | '';
  weightKg?: number;
  symptomOnset: string;
  symptoms: string;
  image?: string;
}

export const ANALYSIS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    emergencyAlert: {
      type: 'boolean',
      description: 'True if the symptoms describe a potentially life-threatening emergency.',
    },
    emergencyMessage: {
      type: 'string',
      description: 'If emergencyAlert is true, a short urgent warning. Otherwise null.',
    },
    possibleConditions: {
      type: 'array',
      description: 'Exactly 3 possible conditions, ranked by likelihood.',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the disease or condition.' },
          probability: {
            type: 'string',
            description: "Likelihood: exactly 'High', 'Moderate', or 'Low'.",
          },
          description: { type: 'string', description: 'Brief explanation of the condition.' },
          reasoning: { type: 'string', description: 'Why this matches the symptoms.' },
          recommendedAction: {
            type: 'string',
            description: 'What the parent or caregiver should do next.',
          },
          suggestedMedications: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: {
                  type: 'string',
                  description: "One of: 'Over-the-counter', 'Prescription', 'Home Remedy'",
                },
                description: { type: 'string', description: 'What this medication does.' },
                dosage: { type: 'string', description: 'General dosage or consultation advice.' },
              },
              required: ['name', 'type', 'description'],
            },
          },
        },
        required: [
          'name',
          'probability',
          'description',
          'reasoning',
          'recommendedAction',
          'suggestedMedications',
        ],
      },
    },
    generalAdvice: {
      type: 'array',
      items: { type: 'string' },
      description: 'General health tips relevant to the symptoms.',
    },
    recommendedSpecialist: {
      type: 'string',
      description: "The best care provider: exactly 'Pediatrician' or 'General Practitioner'.",
    },
    disclaimer: { type: 'string', description: 'A mandatory medical disclaimer.' },
  },
  required: [
    'emergencyAlert',
    'possibleConditions',
    'generalAdvice',
    'recommendedSpecialist',
    'disclaimer',
  ],
} as const;

/**
 * Only Ollama can hard-enforce ANALYSIS_JSON_SCHEMA via its `format` parameter. Hosted
 * OpenAI-compatible providers may fall back to plain `json_object` mode, where the model
 * happily invents its own key names ("conditions" instead of "possibleConditions", etc.)
 * and silently loses half the response. Spelling the shape out in the prompt is what
 * keeps those providers usable.
 */
const SHAPE_HINT = `  {
    "emergencyAlert": true | false,
    "emergencyMessage": "string, only when emergencyAlert is true",
    "possibleConditions": [
      {
        "name": "condition name",
        "probability": "High" | "Moderate" | "Low",
        "description": "what this condition is",
        "reasoning": "why it matches these symptoms",
        "recommendedAction": "what the parent should do next",
        "suggestedMedications": [
          { "name": "...", "type": "Over-the-counter" | "Prescription" | "Home Remedy",
            "description": "what it does", "dosage": "dose advice" }
        ]
      }
    ],
    "generalAdvice": ["tip 1", "tip 2"],
    "recommendedSpecialist": "Pediatrician" | "General Practitioner",
    "disclaimer": "a medical disclaimer"
  }`;

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  tet: 'Tetum (Timor-Leste)',
  id: 'Indonesian (Bahasa Indonesia)',
};

export const languageName = (lang: Language) => LANGUAGE_NAMES[lang];

export const buildSystemInstruction = (lang: Language) =>
  `You are an AI child health assistant for Timor-Leste, supporting parents and caregivers of children. Your goal is to help them understand symptoms in their child. Prioritize safety above all: if symptoms suggest an emergency or an IMCI danger sign, provide an immediate warning and advise going to the nearest health facility. Provide clear, simple explanations in ${languageName(lang)}. Follow the JSON schema strictly.`;

export const buildPrompt = (p: AnalysisInput, lang: Language, symptomDescription: string) => {
  const langName = languageName(lang);
  return `
  Analyze the following PEDIATRIC case and identify potential medical conditions.

  Child Patient:
  - Age: ${p.ageMonths < 24 ? `${p.ageMonths} months old` : `${p.ageYears} years old`}
  - Sex: ${p.sex}
  ${p.weightKg ? `- Weight: ${p.weightKg} kg` : ''}

  Clinical Presentation:
  - Onset: ${p.symptomOnset}
  - Symptoms: ${symptomDescription}

  Tasks:
  - Identify 3 potential conditions appropriate for this child's age.
  - Screen carefully for IMCI general danger signs (unable to drink or breastfeed, vomits everything,
    convulsions, lethargy or unconsciousness, severe chest indrawing, fast breathing) — if any are
    present or strongly implied, set emergencyAlert to true.
  - Medication suggestions MUST be age-appropriate; when dosing depends on weight or age, say
    "dose must be set by a health worker" instead of giving adult doses.
  - Recommend the best care provider type (recommendedSpecialist).

  IMPORTANT RULES:
  1. RESPONSE MUST BE IN ${langName.toUpperCase()}. All descriptions, reasoning, advice, and names must be in ${langName}.
  2. EXCEPTION: The 'recommendedSpecialist' field MUST be in ENGLISH and either 'Pediatrician' or 'General Practitioner'.
  3. Maintain 'probability' values strictly as 'High', 'Moderate', or 'Low'.
  4. NEVER include raw image data or base64 strings in the response.
  5. Return ONE JSON object with EXACTLY these keys and no others:
${SHAPE_HINT}
`;
};

export const buildTranslationPrompt = (result: unknown, lang: Language) => `
      You are a professional medical translator.
      Translate the values of the following JSON object into ${languageName(lang)}.

      Input JSON:
      ${JSON.stringify(result)}

      RULES:
      1. Preserve the EXACT JSON structure.
      2. Do NOT translate the values for 'probability'. They MUST remain 'High', 'Moderate', or 'Low'.
      3. Do NOT translate the value for 'recommendedSpecialist'. It MUST remain in English.
      4. Translate all other string values (names, descriptions, advice, disclaimers) into ${languageName(lang)}.
      5. Ensure the output is valid JSON matching the original schema.
    `;
