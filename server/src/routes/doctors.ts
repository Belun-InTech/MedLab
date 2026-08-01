import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { and, eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '../db/index.js';
import { requireAnyUser, requireDoctor, requireDoctorAccount } from '../lib/auth.js';
import { availabilitySummaries, doctorSlots, SLOT_HORIZON_DAYS } from '../lib/schedule.js';
import { publicDoctor } from './auth.js';
import { HEALTH_FACILITIES } from '../../../shared/facilities.js';

export const doctorsRouter = Router();

const MINUTES_IN_DAY = 24 * 60;
const ALLOWED_SLOT_MINUTES = [15, 20, 30, 45, 60] as const;

const profileSchema = z.object({
  licenseNumber: z.string().trim().min(3).max(64),
  specialty: z.enum(['Pediatrician', 'General Practitioner']),
  facilityId: z.number().int().positive(),
  languages: z.array(z.enum(['tet', 'pt', 'id', 'en'])).min(1),
  phone: z.string().trim().max(32).optional(),
  bio: z.string().trim().max(2000).optional(),
  photoUrl: z.string().trim().max(512).optional(),
});

const availabilitySchema = z.object({
  slotMinutes: z
    .number()
    .int()
    .refine((m): m is (typeof ALLOWED_SLOT_MINUTES)[number] =>
      (ALLOWED_SLOT_MINUTES as readonly number[]).includes(m),
    ),
  rules: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        startMinute: z.number().int().min(0).max(MINUTES_IN_DAY),
        endMinute: z.number().int().min(0).max(MINUTES_IN_DAY),
      }),
    )
    .max(50),
});

/**
 * Partial overlaps (09:00–12:00 vs 10:00–14:00) cannot be expressed as a unique index, so
 * they are rejected here. The index only catches exact duplicate start times.
 */
const hasOverlap = (rules: { weekday: number; startMinute: number; endMinute: number }[]): boolean => {
  for (let i = 0; i < rules.length; i++) {
    const a = rules[i]!;
    for (let j = i + 1; j < rules.length; j++) {
      const b = rules[j]!;
      if (a.weekday !== b.weekday) continue;
      if (a.startMinute < b.endMinute && b.startMinute < a.endMinute) return true;
    }
  }
  return false;
};

// --- The doctor's own profile ------------------------------------------------
// These two are the only routes a *pending* doctor may reach, so they compose the
// looser stack (no approval check) and load the profile themselves.

doctorsRouter.get('/me', ...requireDoctorAccount, async (req, res) => {
  const [profile] = await db
    .select()
    .from(schema.doctorProfiles)
    .where(eq(schema.doctorProfiles.userId, req.userId!))
    .limit(1);

  if (!profile) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json({ doctor: publicDoctor(profile) });
});

doctorsRouter.put('/me', ...requireDoctorAccount, async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }

  const [current] = await db
    .select()
    .from(schema.doctorProfiles)
    .where(eq(schema.doctorProfiles.userId, req.userId!))
    .limit(1);

  if (!current) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  const facility = HEALTH_FACILITIES.find((f) => f.id === parsed.data.facilityId);
  if (!facility) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }

  const licenseNumber = parsed.data.licenseNumber.trim().toUpperCase();
  const [clash] = await db
    .select({ userId: schema.doctorProfiles.userId })
    .from(schema.doctorProfiles)
    .where(
      and(
        eq(schema.doctorProfiles.licenseNumber, licenseNumber),
        ne(schema.doctorProfiles.userId, req.userId!),
      ),
    )
    .limit(1);

  if (clash) {
    res.status(409).json({ error: 'license_taken' });
    return;
  }

  // Changing the two facts an admin actually verified sends the account back for review.
  // Anything else (photo, bio, phone, languages) is cosmetic and keeps the approval.
  const needsReapproval =
    current.status === 'approved' &&
    (licenseNumber !== current.licenseNumber || parsed.data.specialty !== current.specialty);

  await db
    .update(schema.doctorProfiles)
    .set({
      licenseNumber,
      specialty: parsed.data.specialty,
      facilityId: facility.id,
      facilityName: facility.name,
      phone: parsed.data.phone || null,
      bio: parsed.data.bio || null,
      photoUrl: parsed.data.photoUrl || null,
      languages: parsed.data.languages,
      ...(needsReapproval ? { status: 'pending' as const, rejectionReason: null } : {}),
    })
    .where(eq(schema.doctorProfiles.userId, req.userId!));

  const [updated] = await db
    .select()
    .from(schema.doctorProfiles)
    .where(eq(schema.doctorProfiles.userId, req.userId!))
    .limit(1);

  res.json({ doctor: publicDoctor(updated!), reapprovalRequired: needsReapproval });
});

// --- Weekly working hours ----------------------------------------------------

doctorsRouter.get('/me/availability', ...requireDoctor, async (req, res) => {
  const rules = await db
    .select({
      weekday: schema.doctorAvailabilityRules.weekday,
      startMinute: schema.doctorAvailabilityRules.startMinute,
      endMinute: schema.doctorAvailabilityRules.endMinute,
    })
    .from(schema.doctorAvailabilityRules)
    .where(eq(schema.doctorAvailabilityRules.doctorId, req.userId!));

  res.json({ rules, slotMinutes: req.doctor!.slotMinutes });
});

/** Replace-all, mirroring the semantics of the existing PUT /api/children. */
doctorsRouter.put('/me/availability', ...requireDoctor, async (req, res) => {
  const parsed = availabilitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }
  const { rules, slotMinutes } = parsed.data;

  // A block shorter than one slot would silently produce no bookable time at all.
  if (rules.some((r) => r.endMinute - r.startMinute < slotMinutes)) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }
  if (hasOverlap(rules)) {
    res.status(409).json({ error: 'overlapping_rules' });
    return;
  }

  await db
    .delete(schema.doctorAvailabilityRules)
    .where(eq(schema.doctorAvailabilityRules.doctorId, req.userId!));

  if (rules.length) {
    await db.insert(schema.doctorAvailabilityRules).values(
      rules.map((r) => ({ id: randomUUID(), doctorId: req.userId!, ...r })),
    );
  }

  await db
    .update(schema.doctorProfiles)
    .set({ slotMinutes })
    .where(eq(schema.doctorProfiles.userId, req.userId!));

  res.json({ rules, slotMinutes });
});

// --- Public (to signed-in users) --------------------------------------------
// Declared AFTER /me: in Express 5, '/:id' would otherwise capture the literal "me".

const directoryColumns = {
  id: schema.doctorProfiles.userId,
  name: schema.users.name,
  specialty: schema.doctorProfiles.specialty,
  facilityName: schema.doctorProfiles.facilityName,
  phone: schema.doctorProfiles.phone,
  photoUrl: schema.doctorProfiles.photoUrl,
  bio: schema.doctorProfiles.bio,
  languages: schema.doctorProfiles.languages,
  ratingAvg: schema.doctorProfiles.ratingAvg,
  ratingCount: schema.doctorProfiles.ratingCount,
  slotMinutes: schema.doctorProfiles.slotMinutes,
};

/** decimal columns come back as strings from mysql2; the wire type is a number. */
const toSpecialist = (
  row: { ratingAvg: string | null; slotMinutes: number } & Record<string, unknown>,
  availability: { availableToday: boolean; nextSlotAt: string | null },
) => {
  const { slotMinutes, ratingAvg, ...rest } = row;
  return { ...rest, ratingAvg: ratingAvg === null ? null : Number(ratingAvg), ...availability };
};

doctorsRouter.get('/', ...requireAnyUser, async (req, res) => {
  const specialty = z
    .enum(['Pediatrician', 'General Practitioner'])
    .safeParse(req.query.specialty);
  const language = z.enum(['tet', 'pt', 'id', 'en']).safeParse(req.query.language);

  const rows = await db
    .select(directoryColumns)
    .from(schema.doctorProfiles)
    .innerJoin(schema.users, eq(schema.users.id, schema.doctorProfiles.userId))
    .where(
      and(
        // Only approved doctors exist as far as a family is concerned.
        eq(schema.doctorProfiles.status, 'approved'),
        specialty.success ? eq(schema.doctorProfiles.specialty, specialty.data) : undefined,
      ),
    );

  // Spoken languages are a JSON array, so this filter is in code rather than SQL — the
  // directory is a few dozen rows, not a table scan worth indexing.
  const filtered = language.success
    ? rows.filter((r) => r.languages.includes(language.data))
    : rows;

  const availability = await availabilitySummaries(filtered);
  const doctors = filtered.map((r) =>
    toSpecialist(r, availability.get(r.id) ?? { availableToday: false, nextSlotAt: null }),
  );

  // Bookable today first, then best rated — the order a parent actually wants.
  doctors.sort(
    (a, b) =>
      Number(b.availableToday) - Number(a.availableToday) ||
      (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0),
  );

  res.json({ doctors });
});

doctorsRouter.get('/:id', ...requireAnyUser, async (req, res) => {
  const [row] = await db
    .select(directoryColumns)
    .from(schema.doctorProfiles)
    .innerJoin(schema.users, eq(schema.users.id, schema.doctorProfiles.userId))
    .where(
      and(
        eq(schema.doctorProfiles.userId, String(req.params.id)),
        eq(schema.doctorProfiles.status, 'approved'),
      ),
    )
    .limit(1);

  // 404 rather than 403 for a doctor who exists but is not approved — no existence leak,
  // and consistent with how ownedChild answers for a child you do not own.
  if (!row) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  const availability = await availabilitySummaries([row]);
  res.json({
    doctor: toSpecialist(row, availability.get(row.id) ?? { availableToday: false, nextSlotAt: null }),
  });
});

doctorsRouter.get('/:id/slots', ...requireAnyUser, async (req, res) => {
  const [doctor] = await db
    .select({ userId: schema.doctorProfiles.userId, slotMinutes: schema.doctorProfiles.slotMinutes })
    .from(schema.doctorProfiles)
    .where(
      and(
        eq(schema.doctorProfiles.userId, String(req.params.id)),
        // A doctor who is not approved is not merely unbookable, they are invisible.
        eq(schema.doctorProfiles.status, 'approved'),
      ),
    )
    .limit(1);

  if (!doctor) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  const days = Math.min(Number(req.query.days) || SLOT_HORIZON_DAYS, SLOT_HORIZON_DAYS);
  res.json({ slots: await doctorSlots(doctor.userId, doctor.slotMinutes, days) });
});
