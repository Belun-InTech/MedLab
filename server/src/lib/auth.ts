import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';

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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
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
