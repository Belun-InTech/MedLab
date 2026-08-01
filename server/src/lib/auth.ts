import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { env } from '../env.js';
import { db, schema } from '../db/index.js';

const COOKIE_NAME = 'medlab_session';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const MIN_PARENT_AGE = 18;

export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

/**
 * TEMPORARY parent verification: we only check the registrant is an adult by date of
 * birth. A real deployment needs something stronger — this is a placeholder, not identity
 * proof. Enforced here on the server so it cannot be bypassed from the client.
 */
export const isAdult = (dob: string, ref: Date = new Date()): boolean => {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return false;
  let years = ref.getFullYear() - birth.getFullYear();
  const monthDiff = ref.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) years--;
  return years >= MIN_PARENT_AGE;
};

export const issueSession = (res: Response, userId: string): void => {
  const token = jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: '7d' });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true, // browser JS cannot read it — no XSS token theft
    sameSite: 'lax',
    secure: env.isProd,
    maxAge: MAX_AGE_MS,
    path: '/',
  });
};

export const clearSession = (res: Response): void => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
};

export type Role = 'parent' | 'doctor' | 'admin';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      user?: typeof schema.users.$inferSelect;
      doctor?: typeof schema.doctorProfiles.$inferSelect;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: 'unauthenticated' });
    return;
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    clearSession(res);
    res.status(401).json({ error: 'unauthenticated' });
  }
};

/**
 * Loads the account row once per request.
 *
 * Role and subscription are read from the database on every request, never from the JWT.
 * A role claim in a 7-day cookie is a 7-day stale capability: an admin suspending a doctor
 * must take effect on that doctor's very next call. `subscribed` already worked this way,
 * so this keeps one freshness model rather than two.
 */
export const loadUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  req.user = user;
  next();
};

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'unauthenticated' });
      return;
    }
    if (!roles.includes(req.user.role as Role)) {
      res.status(403).json({ error: 'forbidden' });
      return;
    }
    next();
  };

/** The mocked $2.99/mo Premium — enforced on the server for the first time. */
export const requireSubscribed = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user?.subscribed) {
    res.status(403).json({ error: 'subscription_required' });
    return;
  }
  next();
};

/** Loads the doctor profile and refuses anyone not currently approved. */
export const loadApprovedDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const [profile] = await db
    .select()
    .from(schema.doctorProfiles)
    .where(eq(schema.doctorProfiles.userId, req.userId!))
    .limit(1);

  if (!profile) {
    res.status(403).json({ error: 'forbidden' });
    return;
  }
  if (profile.status !== 'approved') {
    res.status(403).json({ error: 'doctor_not_approved' });
    return;
  }
  req.doctor = profile;
  next();
};

// Composed stacks. Express accepts arrays of handlers, so these drop straight into
// `router.use(...)` exactly like the existing `childrenRouter.use(requireAuth)`.
//
// requireDoctor deliberately bundles the approval check: a *pending* doctor needs only
// GET/PUT /api/doctors/me, and those two compose the looser stack explicitly. Everything
// else a doctor can do requires approval, so the default stack is the strict one.
export const requireAnyUser = [requireAuth, loadUser];
export const requireParent = [requireAuth, loadUser, requireRole('parent')];
export const requireDoctorAccount = [requireAuth, loadUser, requireRole('doctor')];
export const requireDoctor = [...requireDoctorAccount, loadApprovedDoctor];
export const requireAdmin = [requireAuth, loadUser, requireRole('admin')];
