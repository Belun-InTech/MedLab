import { Router } from 'express';
import { count, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '../db/index.js';
import { requireAdmin } from '../lib/auth.js';

export const adminRouter = Router();

adminRouter.use(requireAdmin);

const rejectSchema = z.object({ reason: z.string().trim().min(1).max(255) });

const statusFilter = z.enum(['pending', 'approved', 'rejected', 'suspended']);

/**
 * The verification queue. Admins see the account and licence details they need to judge a
 * registration and nothing else — there is deliberately no admin route anywhere that
 * returns a child's name, a symptom string or a consultation body.
 */
adminRouter.get('/doctors', async (req, res) => {
  const parsedStatus = statusFilter.safeParse(req.query.status);

  const rows = await db
    .select({
      id: schema.doctorProfiles.userId,
      name: schema.users.name,
      email: schema.users.email,
      specialty: schema.doctorProfiles.specialty,
      licenseNumber: schema.doctorProfiles.licenseNumber,
      facilityName: schema.doctorProfiles.facilityName,
      phone: schema.doctorProfiles.phone,
      bio: schema.doctorProfiles.bio,
      photoUrl: schema.doctorProfiles.photoUrl,
      languages: schema.doctorProfiles.languages,
      status: schema.doctorProfiles.status,
      rejectionReason: schema.doctorProfiles.rejectionReason,
      createdAt: schema.doctorProfiles.createdAt,
    })
    .from(schema.doctorProfiles)
    .innerJoin(schema.users, eq(schema.users.id, schema.doctorProfiles.userId))
    .where(parsedStatus.success ? eq(schema.doctorProfiles.status, parsedStatus.data) : undefined)
    .orderBy(desc(schema.doctorProfiles.createdAt));

  res.json({ doctors: rows });
});

/** Shared by approve/reject/suspend — all three are the same UPDATE with a different status. */
const setStatus = async (
  doctorId: string,
  status: 'approved' | 'rejected' | 'suspended',
  rejectionReason: string | null,
): Promise<boolean> => {
  const [existing] = await db
    .select({ userId: schema.doctorProfiles.userId })
    .from(schema.doctorProfiles)
    .where(eq(schema.doctorProfiles.userId, doctorId))
    .limit(1);

  if (!existing) return false;

  await db
    .update(schema.doctorProfiles)
    .set({ status, rejectionReason })
    .where(eq(schema.doctorProfiles.userId, doctorId));

  return true;
};

/**
 * Programme counters. AGGREGATES ONLY — deliberately no symptom text, no child names, no
 * consultation bodies. An admin console is a verification queue plus counters, not a
 * surveillance tool, and there is no admin route anywhere that returns patient data.
 *
 * Uses the indexes that already existed: conditions_name_idx for the GROUP BY and
 * consultations_emergency_idx for the emergency share.
 */
adminRouter.get('/stats', async (_req, res) => {
  const one = async (query: Promise<{ value: number }[]>) => (await query)[0]?.value ?? 0;

  const [parents, doctors, pendingDoctors, children, consultations, appointments, emergencies] =
    await Promise.all([
      one(db.select({ value: count() }).from(schema.users).where(eq(schema.users.role, 'parent'))),
      one(db.select({ value: count() }).from(schema.doctorProfiles).where(eq(schema.doctorProfiles.status, 'approved'))),
      one(db.select({ value: count() }).from(schema.doctorProfiles).where(eq(schema.doctorProfiles.status, 'pending'))),
      one(db.select({ value: count() }).from(schema.children)),
      one(db.select({ value: count() }).from(schema.consultations)),
      one(db.select({ value: count() }).from(schema.appointments)),
      one(db.select({ value: count() }).from(schema.consultations).where(eq(schema.consultations.emergencyAlert, true))),
    ]);

  const topConditions = await db
    .select({ name: schema.consultationConditions.name, value: count() })
    .from(schema.consultationConditions)
    .groupBy(schema.consultationConditions.name)
    .orderBy(sql`count(*) desc`)
    .limit(8);

  res.json({
    totals: { parents, doctors, pendingDoctors, children, consultations, appointments },
    emergencyRate: consultations ? emergencies / consultations : 0,
    topConditions,
  });
});

adminRouter.post('/doctors/:id/approve', async (req, res) => {
  if (!(await setStatus(req.params.id, 'approved', null))) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json({ status: 'approved' });
});

adminRouter.post('/doctors/:id/reject', async (req, res) => {
  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }
  if (!(await setStatus(req.params.id, 'rejected', parsed.data.reason))) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json({ status: 'rejected' });
});

/**
 * Suspension takes effect on the doctor's very next request: loadApprovedDoctor re-reads
 * this column every time rather than trusting anything cached in the session.
 */
adminRouter.post('/doctors/:id/suspend', async (req, res) => {
  const parsed = rejectSchema.safeParse(req.body);
  if (!(await setStatus(req.params.id, 'suspended', parsed.success ? parsed.data.reason : null))) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json({ status: 'suspended' });
});
