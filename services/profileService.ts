import { FamilyProfile, Child } from '../types';

const PROFILE_KEY = 'medlab_family_profile';
const SUBSCRIPTION_KEY = 'medlab_subscribed';

export const getFamilyProfile = (): FamilyProfile | null => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) return JSON.parse(stored) as FamilyProfile;
  } catch (e) {
    console.warn('Error reading family profile', e);
  }
  return null;
};

export const saveFamilyProfile = (profile: FamilyProfile): void => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const clearFamilyProfile = (): void => {
  localStorage.removeItem(PROFILE_KEY);
};

export const isSubscribed = (): boolean =>
  localStorage.getItem(SUBSCRIPTION_KEY) === 'true';

export const setSubscribed = (value: boolean): void => {
  localStorage.setItem(SUBSCRIPTION_KEY, String(value));
};

export const newChildId = (): string => `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// --- Date helpers -----------------------------------------------------------

const MS_PER_DAY = 1000 * 60 * 60 * 24;

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

export const gestationalWeek = (lmp: string, ref: Date = new Date()): number => {
  const days = Math.floor((ref.getTime() - new Date(lmp).getTime()) / MS_PER_DAY);
  return Math.max(0, Math.floor(days / 7));
};

// Naegele's rule: due date = LMP + 280 days
export const dueDate = (lmp: string): Date =>
  new Date(new Date(lmp).getTime() + 280 * MS_PER_DAY);

export const trimesterOf = (week: number): 1 | 2 | 3 => {
  if (week < 13) return 1;
  if (week < 28) return 2;
  return 3;
};

export const findChild = (profile: FamilyProfile, childId: string): Child | undefined =>
  profile.children.find(c => c.id === childId);

// --- Vaccination tracking ---------------------------------------------------

const vaccineKey = (childId: string) => `medlab_vaccines_given_${childId}`;

export const getGivenVaccines = (childId: string): string[] => {
  try {
    const stored = localStorage.getItem(vaccineKey(childId));
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn('Error reading vaccine record', e);
  }
  return [];
};

export const toggleVaccineGiven = (childId: string, doseId: string): string[] => {
  const given = getGivenVaccines(childId);
  const updated = given.includes(doseId) ? given.filter(id => id !== doseId) : [...given, doseId];
  localStorage.setItem(vaccineKey(childId), JSON.stringify(updated));
  return updated;
};
