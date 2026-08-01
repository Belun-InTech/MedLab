import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { and, asc, desc, eq, gte, inArray, lt } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '../db/index.js';
import { loadApprovedDoctor, requireAnyUser, requireRole, requireSubscribed } from '../lib/auth.js';
import { doctorAppointmentAccess } from '../lib/access.js';
import { doctorSlots } from '../lib/schedule.js';

export const appointmentsRouter = Router();

appointmentsRouter.use(requireAnyUser);

const bookSchema = z.object({
  doctorId: z.string().min(1),
  childId: z.string().min(1),
  startsAt: z.string().datetime(),
  reason: z.string().trim().max(500).optional(),
  consultationId: z.string().min(1).optional(),
  sharesHistory: z.boolean(),
});

/**
 * One row as either side sees it. The doctor's name and the child's name are joined in so
 * a list render needs no follow-up requests.
 */
const appointmentColumns = {
  id: schema.appointments.id,
  startsAt: schema.appointments.startsAt,
  durationMinutes: schema.appointments.durationMinutes,
  status: schema.appointments.status,
  reason: schema.appointments.reason,
  sharesHistory: schema.appointments.sharesHistory,
  consultationId: schema.appointments.consultationId,
  doctorId: schema.appointments.doctorId,
  doctorName: schema.users.name,
  doctorSpecialty: schema.doctorProfiles.specialty,
  doctorFacility: schema.doctorProfiles.facilityName,
  doctorPhotoUrl: schema.doctorProfiles.photoUrl,
  childId: schema.appointments.childId,
  childName: schema.children.name,
  childDob: schema.children.dob,
  childSex: schema.children.sex,
  // The doctor's verdict, joined in so it lands on the parent's timeline next to the AI's
  // guess without a second request. Null until the doctor writes it.
  noteAssessment: schema.clinicalNotes.assessment,
  notePlan: schema.clinicalNotes.plan,
  noteFollowUpDays: schema.clinicalNotes.followUpDays,
  noteCreatedAt: schema.clinicalNotes.createdAt,
};

const appointmentQuery = () =>
  db
    .select(appointmentColumns)
    .from(schema.appointments)
    .innerJoin(schema.doctorProfiles, eq(schema.doctorProfiles.userId, schema.appointments.doctorId))
    .innerJoin(schema.users, eq(schema.users.id, schema.appointments.doctorId))
    .innerJoin(schema.children, eq(schema.children.id, schema.appointments.childId))
    .leftJoin(schema.clinicalNotes, eq(schema.clinicalNotes.appointmentId, schema.appointments.id));

// Role first, then the paywall — otherwise a doctor hitting this gets the misleading
// 'subscription_required' rather than 'forbidden'.
appointmentsRouter.post('/', requireRole('parent'), requireSubscribed, async (req, res) => {
  const parsed = bookSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }
  const { doctorId, childId, startsAt, reason, consultationId, sharesHistory } = parsed.data;

  // Ownership, exactly as ownedChild does it in routes/children.ts — never trust a client id.
  const [child] = await db
    .select({ id: schema.children.id })
    .from(schema.children)
    .where(and(eq(schema.children.id, childId), eq(schema.children.userId, req.userId!)))
    .limit(1);

  if (!child) {
    res.status(404).json({ error: 'child_not_found' });
    return;
  }

  const [doctor] = await db
    .select({ userId: schema.doctorProfiles.userId, slotMinutes: schema.doctorProfiles.slotMinutes })
    .from(schema.doctorProfiles)
    .where(and(eq(schema.doctorProfiles.userId, doctorId), eq(schema.doctorProfiles.status, 'approved')))
    .limit(1);

  if (!doctor) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  // Seconds and milliseconds zeroed: slot keys are whole minutes, and the column is
  // second-resolution, so an off-by-a-fraction request must not create a phantom slot.
  const requested = new Date(startsAt);
  requested.setUTCSeconds(0, 0);

  // The slot list the client saw is a convenience; this is the authority.
  const slots = await doctorSlots(doctor.userId, doctor.slotMinutes);
  const slot = slots.find((s) => s.startsAt === requested.toISOString());
  if (!slot || slot.booked) {
    res.status(409).json({ error: 'slot_unavailable' });
    return;
  }

  const id = randomUUID();
  try {
    await db.insert(schema.appointments).values({
      id,
      doctorId: doctor.userId,
      parentId: req.userId!,
      childId,
      startsAt: requested,
      durationMinutes: slot.durationMinutes,
      reason: reason || null,
      consultationId: consultationId || null,
      sharesHistory,
    });
  } catch (err) {
    // Two parents can both pass the check above at the same instant. The unique index on
    // (doctor_id, starts_at) is what actually prevents the double booking.
    if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'slot_taken' });
      return;
    }
    throw err;
  }

  const [appointment] = await appointmentQuery().where(eq(schema.appointments.id, id)).limit(1);
  res.status(201).json({ appointment });
});

/**
 * Whose appointments these are is decided by the caller's role, never by a query
 * parameter — a client-supplied filter is a client-supplied authorisation decision.
 */
const scopeFor = (req: { userId?: string; user?: { role: string } }) =>
  req.user!.role === 'doctor'
    ? eq(schema.appointments.doctorId, req.userId!)
    : eq(schema.appointments.parentId, req.userId!);

appointmentsRouter.get('/', async (req, res) => {
  const past = req.query.scope === 'past';
  const now = new Date();

  const rows = await appointmentQuery()
    .where(
      and(
        scopeFor(req),
        past ? lt(schema.appointments.startsAt, now) : gte(schema.appointments.startsAt, now),
      ),
    )
    .orderBy(past ? desc(schema.appointments.startsAt) : asc(schema.appointments.startsAt));

  res.json({ appointments: rows });
});

appointmentsRouter.get('/:id', async (req, res) => {
  const [appointment] = await appointmentQuery()
    .where(and(eq(schema.appointments.id, String(req.params.id)), scopeFor(req)))
    .limit(1);

  if (!appointment) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json({ appointment });
});

/**
 * Cancelling deletes the row, which frees the slot for rebooking with no extra state.
 * A production build would soft-cancel and keep the audit trail; a demo does not need it.
 */
appointmentsRouter.delete('/:id', async (req, res) => {
  const [existing] = await db
    .select({ id: schema.appointments.id })
    .from(schema.appointments)
    .where(and(eq(schema.appointments.id, String(req.params.id)), scopeFor(req)))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  await db.delete(schema.appointments).where(eq(schema.appointments.id, existing.id));
  res.status(204).end();
});

// --- The consent-gated child record, and the doctor's verdict on it -----------

const noteSchema = z.object({
  assessment: z.string().trim().min(1).max(4000),
  plan: z.string().trim().min(1).max(4000),
  followUpDays: z.number().int().min(0).max(255).optional(),
});

/**
 * The only place a doctor reads someone else's child. Every rule that makes that legal
 * lives in lib/access.ts; this handler only shapes the response.
 *
 * Note this is a SEPARATE handler rather than a widened version of the parent-scoped
 * consultation queries. GET /api/consultations/:id keeps its `userId = req.userId` filter
 * forever — widening an ownership filter to "mine OR some doctor condition" is exactly how
 * these bugs get introduced, and a second handler cannot regress the first.
 */
appointmentsRouter.get('/:id/child-record', requireRole('doctor'), loadApprovedDoctor, async (req, res) => {
  const access = await doctorAppointmentAccess(req.userId!, String(req.params.id));
  if (!access.ok) {
    res.status(access.status).json({ error: access.reason });
    return;
  }
  const { appointment } = access;

  const [child] = await db
    .select({ name: schema.children.name, dob: schema.children.dob, sex: schema.children.sex })
    .from(schema.children)
    // Scoped to the child on the appointment, never to the parent: a parent with four
    // children who books for one exposes exactly one. parentId never appears here.
    .where(eq(schema.children.id, appointment.childId))
    .limit(1);

  if (!child) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  const consultations = await db
    .select({
      id: schema.consultations.id,
      createdAt: schema.consultations.createdAt,
      ageMonths: schema.consultations.ageMonths,
      symptoms: schema.consultations.symptoms,
      symptomOnset: schema.consultations.symptomOnset,
      emergencyAlert: schema.consultations.emergencyAlert,
      recommendedSpecialist: schema.consultations.recommendedSpecialist,
    })
    .from(schema.consultations)
    .where(eq(schema.consultations.childId, appointment.childId))
    .orderBy(desc(schema.consultations.createdAt))
    .limit(20);

  const conditions = consultations.length
    ? await db
        .select({
          consultationId: schema.consultationConditions.consultationId,
          name: schema.consultationConditions.name,
          probability: schema.consultationConditions.probability,
          position: schema.consultationConditions.position,
        })
        .from(schema.consultationConditions)
        .where(
          inArray(
            schema.consultationConditions.consultationId,
            consultations.map((c) => c.id),
          ),
        )
        .orderBy(asc(schema.consultationConditions.position))
    : [];

  // Vaccination *gaps* are computed client-side from constants/vaccineSchedule.ts, which
  // is the same logic VaccinationSchedule.tsx already runs — no second implementation.
  const vaccinations = await db
    .select({
      doseId: schema.childVaccinations.doseId,
      givenAt: schema.childVaccinations.givenAt,
    })
    .from(schema.childVaccinations)
    .where(eq(schema.childVaccinations.childId, appointment.childId));

  const notes = await db
    .select({
      id: schema.clinicalNotes.id,
      appointmentId: schema.clinicalNotes.appointmentId,
      assessment: schema.clinicalNotes.assessment,
      plan: schema.clinicalNotes.plan,
      followUpDays: schema.clinicalNotes.followUpDays,
      createdAt: schema.clinicalNotes.createdAt,
    })
    .from(schema.clinicalNotes)
    .where(eq(schema.clinicalNotes.childId, appointment.childId))
    .orderBy(desc(schema.clinicalNotes.createdAt));

  res.json({
    child,
    consultations: consultations.map((c) => ({
      ...c,
      conditions: conditions
        .filter((cond) => cond.consultationId === c.id)
        .map(({ consultationId, ...rest }) => rest),
    })),
    vaccinations,
    notes,
  });
});

/** Upsert: one note per appointment, enforced by note_appointment_unq. */
appointmentsRouter.put('/:id/note', requireRole('doctor'), loadApprovedDoctor, async (req, res) => {
  const parsed = noteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }

  // A note is a clinical record about this child, so it goes through the same gate as
  // reading one — a doctor whose consent was withdrawn cannot write to the timeline either.
  const access = await doctorAppointmentAccess(req.userId!, String(req.params.id));
  if (!access.ok) {
    res.status(access.status).json({ error: access.reason });
    return;
  }
  const { appointment } = access;

  const [existing] = await db
    .select({ id: schema.clinicalNotes.id })
    .from(schema.clinicalNotes)
    .where(eq(schema.clinicalNotes.appointmentId, appointment.id))
    .limit(1);

  const values = {
    assessment: parsed.data.assessment,
    plan: parsed.data.plan,
    followUpDays: parsed.data.followUpDays ?? null,
  };

  if (existing) {
    await db.update(schema.clinicalNotes).set(values).where(eq(schema.clinicalNotes.id, existing.id));
  } else {
    await db.insert(schema.clinicalNotes).values({
      id: randomUUID(),
      appointmentId: appointment.id,
      doctorId: req.userId!,
      childId: appointment.childId,
      ...values,
    });
  }

  const [note] = await db
    .select()
    .from(schema.clinicalNotes)
    .where(eq(schema.clinicalNotes.appointmentId, appointment.id))
    .limit(1);

  res.json({ note });
});

appointmentsRouter.post('/:id/complete', requireRole('doctor'), async (req, res) => {
  const [existing] = await db
    .select({ id: schema.appointments.id })
    .from(schema.appointments)
    .where(
      and(
        eq(schema.appointments.id, String(req.params.id)),
        eq(schema.appointments.doctorId, req.userId!),
      ),
    )
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  await db
    .update(schema.appointments)
    .set({ status: 'completed' })
    .where(eq(schema.appointments.id, existing.id));

  res.json({ status: 'completed' });
});
