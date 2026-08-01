import { Child, FamilyProfile } from '../shared/types';
import { api } from './api';

// Children and vaccination records live in MySQL now, scoped to the signed-in parent.
// Only the dark-mode preference stays in localStorage — it is a device setting, not data.

export const fetchChildren = async (): Promise<FamilyProfile> => {
  const { children } = await api.get<{ children: Child[] }>('/children');
  return { children };
};

/** Replace the whole family in one call — mirrors how FamilyProfileSetup saves. */
export const saveChildren = async (children: Omit<Child, 'id'> & { id?: string }[] | Child[]): Promise<FamilyProfile> => {
  const { children: saved } = await api.put<{ children: Child[] }>('/children', { children });
  return { children: saved };
};

// --- Date helpers -----------------------------------------------------------

export const ageInMonths = (dob: string, ref: Date = new Date()): number => {
  const birth = new Date(dob);
  let months = (ref.getFullYear() - birth.getFullYear()) * 12 + (ref.getMonth() - birth.getMonth());
  if (ref.getDate() < birth.getDate()) months--;
  return Math.max(0, months);
};

export const ageInYears = (dob: string, ref: Date = new Date()): number =>
  Math.floor(ageInMonths(dob, ref) / 12);

// e.g. "7 months" / "3 years" — infants are described in months, older kids in years
export const formatChildAge = (dob: string, unitMonths: string, unitYears: string): string => {
  const months = ageInMonths(dob);
  if (months < 24) return `${months} ${unitMonths}`;
  return `${Math.floor(months / 12)} ${unitYears}`;
};

export const findChild = (profile: FamilyProfile, childId: string): Child | undefined =>
  profile.children.find(c => c.id === childId);

// Local-only id for unsaved rows in the profile form; the server assigns the real UUID.
export const newChildId = (): string => `new-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// --- Vaccination tracking ---------------------------------------------------

export const fetchGivenVaccines = async (childId: string): Promise<string[]> => {
  const { given } = await api.get<{ given: { doseId: string }[] }>(
    `/children/${childId}/vaccinations`,
  );
  return given.map(g => g.doseId);
};

export const toggleVaccineGiven = async (childId: string, doseId: string): Promise<boolean> => {
  const { given } = await api.post<{ doseId: string; given: boolean }>(
    `/children/${childId}/vaccinations/${doseId}/toggle`,
  );
  return given;
};
