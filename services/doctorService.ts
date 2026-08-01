import {
  AvailabilityRule,
  DoctorAccount,
  DoctorProfile,
  DoctorSpecialty,
  Slot,
  Specialist,
  SpokenLanguage,
} from '../shared/types';
import { api, ApiError } from './api';

export interface DoctorFilters {
  specialty?: DoctorSpecialty;
  language?: SpokenLanguage;
}

/** The parent-facing directory. Approved doctors only — the server enforces that. */
export const fetchDoctors = async (filters: DoctorFilters = {}): Promise<Specialist[]> => {
  const query = new URLSearchParams();
  if (filters.specialty) query.set('specialty', filters.specialty);
  if (filters.language) query.set('language', filters.language);

  const suffix = query.toString() ? `?${query}` : '';
  const { doctors } = await api.get<{ doctors: Specialist[] }>(`/doctors${suffix}`);
  return doctors;
};

export const fetchDoctor = async (id: string): Promise<Specialist> => {
  const { doctor } = await api.get<{ doctor: Specialist }>(`/doctors/${id}`);
  return doctor;
};

export const fetchMyDoctorProfile = async (): Promise<DoctorProfile> => {
  const { doctor } = await api.get<{ doctor: DoctorProfile }>('/doctors/me');
  return doctor;
};

export type SaveProfileResult =
  | { status: 'ok'; doctor: DoctorProfile; reapprovalRequired: boolean }
  | { status: 'error'; reason: 'license_taken' | 'invalid_input' | 'network' };

/** Editing the licence number or specialty sends the account back for admin review. */
export const saveMyDoctorProfile = async (
  profile: Omit<DoctorAccount, 'name' | 'email' | 'password' | 'dob'>,
): Promise<SaveProfileResult> => {
  try {
    const res = await api.put<{ doctor: DoctorProfile; reapprovalRequired: boolean }>(
      '/doctors/me',
      profile,
    );
    return { status: 'ok', ...res };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.code === 'license_taken') return { status: 'error', reason: 'license_taken' };
      return { status: 'error', reason: 'invalid_input' };
    }
    return { status: 'error', reason: 'network' };
  }
};

export interface Availability {
  rules: AvailabilityRule[];
  slotMinutes: number;
}

export const fetchAvailability = async (): Promise<Availability> =>
  api.get<Availability>('/doctors/me/availability');

export type SaveAvailabilityResult =
  | { status: 'ok'; availability: Availability }
  | { status: 'error'; reason: 'overlapping_rules' | 'invalid_input' | 'network' };

/** Replace-all, matching the semantics of saveChildren in profileService. */
export const saveAvailability = async (
  availability: Availability,
): Promise<SaveAvailabilityResult> => {
  try {
    return { status: 'ok', availability: await api.put<Availability>('/doctors/me/availability', availability) };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.code === 'overlapping_rules') return { status: 'error', reason: 'overlapping_rules' };
      return { status: 'error', reason: 'invalid_input' };
    }
    return { status: 'error', reason: 'network' };
  }
};

export const fetchSlots = async (doctorId: string, days = 14): Promise<Slot[]> => {
  const { slots } = await api.get<{ slots: Slot[] }>(`/doctors/${doctorId}/slots?days=${days}`);
  return slots;
};
