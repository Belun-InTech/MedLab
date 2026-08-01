import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '../db/index.js';
import {
  clearSession,
  hashPassword,
  isAdult,
  issueSession,
  requireAnyUser,
  requireAuth,
  verifyPassword,
} from '../lib/auth.js';
import { HEALTH_FACILITIES } from '../../../shared/facilities.js';

export const authRouter = Router();

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

const signupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(255),
  password: z.string().min(4).max(200),
  dob: isoDate,
});

/**
 * Doctor signup is a SEPARATE route rather than a `role` field on /signup: a body field
 * would let any caller POST role:'admin'. This route hard-codes role 'doctor' and status
 * 'pending', and no route anywhere produces 'admin' — admins come from the seed only.
 */
const doctorSignupSchema = signupSchema.extend({
  licenseNumber: z.string().trim().min(3).max(64),
  specialty: z.enum(['Pediatrician', 'General Practitioner']),
  facilityId: z.number().int().positive(),
  languages: z.array(z.enum(['tet', 'pt', 'id', 'en'])).min(1),
  phone: z.string().trim().max(32).optional(),
  bio: z.string().trim().max(2000).optional(),
  photoUrl: z.string().trim().max(512).optional(),
});

const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(1).max(200),
});

// Never leak the password hash to the client.
export const publicUser = (u: typeof schema.users.$inferSelect) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  dob: u.dob,
  role: u.role,
  subscribed: u.subscribed,
});

/** The doctor's own view of their profile — everything they can edit, plus review status. */
export const publicDoctor = (d: typeof schema.doctorProfiles.$inferSelect) => ({
  id: d.userId,
  specialty: d.specialty,
  licenseNumber: d.licenseNumber,
  facilityId: d.facilityId,
  facilityName: d.facilityName,
  phone: d.phone,
  photoUrl: d.photoUrl,
  bio: d.bio,
  languages: d.languages,
  slotMinutes: d.slotMinutes,
  status: d.status,
  rejectionReason: d.rejectionReason,
  ratingAvg: d.ratingAvg === null ? null : Number(d.ratingAvg),
  ratingCount: d.ratingCount,
});

/**
 * The session shape every auth endpoint returns. A doctor carries their profile inline so
 * the frontend shell can gate on `doctor.status` without a second round trip on boot.
 */
const sessionPayload = async (u: typeof schema.users.$inferSelect) => {
  if (u.role !== 'doctor') return { user: publicUser(u) };

  const [profile] = await db
    .select()
    .from(schema.doctorProfiles)
    .where(eq(schema.doctorProfiles.userId, u.id))
    .limit(1);

  return { user: { ...publicUser(u), doctor: profile ? publicDoctor(profile) : undefined } };
};

authRouter.post('/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }
  const { name, email, password, dob } = parsed.data;

  // Re-checked server-side: the client check is a UX affordance, this is the real gate.
  if (!isAdult(dob)) {
    res.status(403).json({ error: 'under_age' });
    return;
  }

  const normalisedEmail = email.trim().toLowerCase();
  const [existing] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, normalisedEmail))
    .limit(1);

  if (existing) {
    res.status(409).json({ error: 'email_taken' });
    return;
  }

  const id = randomUUID();
  await db.insert(schema.users).values({
    id,
    name,
    email: normalisedEmail,
    passwordHash: await hashPassword(password),
    dob,
  });

  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  issueSession(res, id);
  res.status(201).json({ user: publicUser(user!) });
});

authRouter.post('/signup/doctor', async (req, res) => {
  const parsed = doctorSignupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }
  const { name, email, password, dob, licenseNumber, specialty, facilityId, languages } =
    parsed.data;

  // A doctor is an adult by definition, so the same gate applies — it is just not
  // *sufficient* for them. Admin approval is the real verification.
  if (!isAdult(dob)) {
    res.status(403).json({ error: 'under_age' });
    return;
  }

  // Facilities are a fixed national list, not free text — that is what makes the doctor
  // directory and FacilityFinder the same dataset.
  const facility = HEALTH_FACILITIES.find((f) => f.id === facilityId);
  if (!facility) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }

  const normalisedEmail = email.trim().toLowerCase();
  const [existingEmail] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, normalisedEmail))
    .limit(1);

  if (existingEmail) {
    res.status(409).json({ error: 'email_taken' });
    return;
  }

  const normalisedLicense = licenseNumber.trim().toUpperCase();
  const [existingLicense] = await db
    .select({ userId: schema.doctorProfiles.userId })
    .from(schema.doctorProfiles)
    .where(eq(schema.doctorProfiles.licenseNumber, normalisedLicense))
    .limit(1);

  if (existingLicense) {
    res.status(409).json({ error: 'license_taken' });
    return;
  }

  const id = randomUUID();
  await db.insert(schema.users).values({
    id,
    name,
    email: normalisedEmail,
    passwordHash: await hashPassword(password),
    dob,
    role: 'doctor',
  });

  await db.insert(schema.doctorProfiles).values({
    userId: id,
    specialty,
    licenseNumber: normalisedLicense,
    facilityId: facility.id,
    facilityName: facility.name,
    phone: parsed.data.phone || null,
    bio: parsed.data.bio || null,
    photoUrl: parsed.data.photoUrl || null,
    languages,
    // status defaults to 'pending' — invisible to parents until an admin approves.
  });

  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  issueSession(res, id);
  res.status(201).json(await sessionPayload(user!));
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_input' });
    return;
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, parsed.data.email.trim().toLowerCase()))
    .limit(1);

  // Same response for "no such user" and "wrong password" — don't confirm which emails
  // are registered. The client decides its own wording.
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: 'invalid_credentials' });
    return;
  }

  issueSession(res, user.id);
  res.json(await sessionPayload(user));
});

authRouter.post('/logout', (_req, res) => {
  clearSession(res);
  res.status(204).end();
});

authRouter.get('/me', ...requireAnyUser, async (req, res) => {
  res.json(await sessionPayload(req.user!));
});

// Mocked Premium — a flag, not a billing system.
authRouter.post('/subscribe', requireAuth, async (req, res) => {
  await db
    .update(schema.users)
    .set({ subscribed: true, subscribedAt: new Date() })
    .where(eq(schema.users.id, req.userId!));
  res.json({ subscribed: true });
});
