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
  requireAuth,
  verifyPassword,
} from '../lib/auth.js';

export const authRouter = Router();

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

const signupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(255),
  password: z.string().min(4).max(200),
  dob: isoDate,
});

const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(1).max(200),
});

// Never leak the password hash to the client.
const publicUser = (u: typeof schema.users.$inferSelect) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  dob: u.dob,
  subscribed: u.subscribed,
});

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
  res.json({ user: publicUser(user) });
});

authRouter.post('/logout', (_req, res) => {
  clearSession(res);
  res.status(204).end();
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, req.userId!))
    .limit(1);

  if (!user) {
    clearSession(res);
    res.status(401).json({ error: 'unauthenticated' });
    return;
  }
  res.json({ user: publicUser(user) });
});

// Mocked Premium — a flag, not a billing system.
authRouter.post('/subscribe', requireAuth, async (req, res) => {
  await db
    .update(schema.users)
    .set({ subscribed: true, subscribedAt: new Date() })
    .where(eq(schema.users.id, req.userId!));
  res.json({ subscribed: true });
});
