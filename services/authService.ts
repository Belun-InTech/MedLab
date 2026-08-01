// Account handling now lives on the server: bcrypt-hashed passwords in MySQL and a
// JWT in an httpOnly cookie. Nothing sensitive is kept in localStorage any more, and
// the browser cannot read the session token.

import { Account, DoctorAccount, DoctorProfile, Role } from '../shared/types';
import { api, ApiError } from './api';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  dob: string;
  role: Role;
  subscribed: boolean;
  /** Present only when role === 'doctor'. Carries the verification status the shell gates on. */
  doctor?: DoctorProfile;
}

export const MIN_PARENT_AGE = 18;

/**
 * TEMPORARY parent verification, mirrored on the server (which is the real gate — this
 * copy only exists to give instant feedback before a round trip).
 */
export const isAdult = (dob: string, ref: Date = new Date()): boolean => {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return false;
  let years = ref.getFullYear() - birth.getFullYear();
  const monthDiff = ref.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) years--;
  return years >= MIN_PARENT_AGE;
};

/** Restore the session on boot. Returns null when not signed in. */
export const fetchSession = async (): Promise<SessionUser | null> => {
  try {
    const { user } = await api.get<{ user: SessionUser }>('/auth/me');
    return user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
};

export type SignupResult =
  | { status: 'ok'; user: SessionUser }
  | { status: 'error'; reason: 'under_age' | 'email_taken' | 'invalid_input' | 'network' };

export const signup = async (account: Account): Promise<SignupResult> => {
  try {
    const { user } = await api.post<{ user: SessionUser }>('/auth/signup', account);
    return { status: 'ok', user };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.code === 'under_age') return { status: 'error', reason: 'under_age' };
      if (err.code === 'email_taken') return { status: 'error', reason: 'email_taken' };
      return { status: 'error', reason: 'invalid_input' };
    }
    return { status: 'error', reason: 'network' };
  }
};

export type DoctorSignupResult =
  | { status: 'ok'; user: SessionUser }
  | {
      status: 'error';
      reason: 'under_age' | 'email_taken' | 'license_taken' | 'invalid_input' | 'network';
    };

/** Registers a health professional. The account lands in 'pending' until an admin approves. */
export const signupDoctor = async (account: DoctorAccount): Promise<DoctorSignupResult> => {
  try {
    const { user } = await api.post<{ user: SessionUser }>('/auth/signup/doctor', account);
    return { status: 'ok', user };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.code === 'under_age') return { status: 'error', reason: 'under_age' };
      if (err.code === 'email_taken') return { status: 'error', reason: 'email_taken' };
      if (err.code === 'license_taken') return { status: 'error', reason: 'license_taken' };
      return { status: 'error', reason: 'invalid_input' };
    }
    return { status: 'error', reason: 'network' };
  }
};

export type LoginResult =
  | { status: 'ok'; user: SessionUser }
  | { status: 'error'; reason: 'invalid_credentials' | 'network' };

export const login = async (email: string, password: string): Promise<LoginResult> => {
  try {
    const { user } = await api.post<{ user: SessionUser }>('/auth/login', { email, password });
    return { status: 'ok', user };
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', reason: 'invalid_credentials' };
    return { status: 'error', reason: 'network' };
  }
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

/** Mocked Premium — flips a flag on the account, no payment involved. */
export const subscribe = async (): Promise<void> => {
  await api.post('/auth/subscribe');
};
