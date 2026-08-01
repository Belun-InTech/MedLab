export type Language = 'en' | 'tet' | 'id';

/**
 * Languages a doctor SPEAKS. Deliberately a separate union from `Language`, which is
 * simultaneously the UI locale, the consultations.language enum and the AI prompt switch.
 * Portuguese is widely spoken in Timor-Leste but MédLab has no `pt` interface, so widening
 * `Language` to fit doctors would silently widen the database enum too.
 */
export type SpokenLanguage = 'tet' | 'pt' | 'id' | 'en';

export type Role = 'parent' | 'doctor' | 'admin';

/** The two values routes/consultations.ts normalises the AI's recommendation to. */
export type DoctorSpecialty = 'Pediatrician' | 'General Practitioner';

export type DoctorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

/** A doctor's own view of their profile — what they can edit, plus their review status. */
export interface DoctorProfile {
  id: string;
  specialty: DoctorSpecialty;
  licenseNumber: string;
  facilityId: number | null;
  facilityName: string;
  phone: string | null;
  photoUrl: string | null;
  bio: string | null;
  languages: SpokenLanguage[];
  slotMinutes: number;
  status: DoctorStatus;
  rejectionReason: string | null;
  ratingAvg: number | null;
  ratingCount: number;
}

/** POST /api/auth/signup/doctor. Separate from `Account` so no caller can send a role. */
export interface DoctorAccount extends Account {
  licenseNumber: string;
  specialty: DoctorSpecialty;
  facilityId: number;
  languages: SpokenLanguage[];
  phone?: string;
  bio?: string;
  photoUrl?: string;
}

/** One weekly working block, in Asia/Dili wall-clock minutes from midnight. */
export interface AvailabilityRule {
  weekday: number; // 0 = Sunday .. 6 = Saturday
  startMinute: number;
  endMinute: number;
}

/** A bookable slot. `startsAt` is always an absolute UTC ISO instant. */
export interface Slot {
  startsAt: string;
  durationMinutes: number;
  booked: boolean;
}

/** A booked consultation, as either the parent or the doctor sees it. */
export interface Appointment {
  id: string;
  startsAt: string;
  durationMinutes: number;
  status: 'booked' | 'completed';
  reason: string | null;
  /** Parent consent, per appointment: false means the doctor sees no history at all. */
  sharesHistory: boolean;
  consultationId: string | null;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: DoctorSpecialty;
  doctorFacility: string;
  doctorPhotoUrl: string | null;
  childId: string;
  childName: string;
  childDob: string;
  childSex: 'Male' | 'Female';
  /** The doctor's verdict. Null until it is written. */
  noteAssessment: string | null;
  notePlan: string | null;
  noteFollowUpDays: number | null;
  noteCreatedAt: string | null;
}

/** What a doctor writes after a consult — this is what lands on the child's timeline. */
export interface ClinicalNoteInput {
  assessment: string;
  plan: string;
  followUpDays?: number;
}

/** The consent-gated view of a child, returned only for a doctor's own appointment. */
export interface ChildRecord {
  child: { name: string; dob: string; sex: 'Male' | 'Female' };
  consultations: {
    id: string;
    createdAt: string;
    ageMonths: number;
    symptoms: string;
    symptomOnset: string;
    emergencyAlert: boolean;
    recommendedSpecialist: string;
    conditions: { name: string; probability: 'High' | 'Moderate' | 'Low'; position: number }[];
  }[];
  vaccinations: { doseId: string; givenAt: string }[];
  notes: {
    id: string;
    appointmentId: string;
    assessment: string;
    plan: string;
    followUpDays: number | null;
    createdAt: string;
  }[];
}

export interface BookingRequest {
  doctorId: string;
  childId: string;
  startsAt: string;
  reason?: string;
  consultationId?: string;
  sharesHistory: boolean;
}

export interface Child {
  id: string;
  name: string;
  dob: string; // YYYY-MM-DD
  sex: 'Male' | 'Female';
}

// The parent/guardian identity lives on the Account (see services/authService.ts);
// the family profile is only the children they consult for.
export interface FamilyProfile {
  children: Child[];
}

// Demo-only local account — see services/authService.ts
export interface Account {
  name: string;
  email: string;
  password: string;
  dob: string; // YYYY-MM-DD — backs the temporary "is a parent" age check
}

/**
 * What the browser sends to POST /api/analyze. The child's name, age and sex are NOT
 * sent — the server reads them from the database by childId, so a client cannot analyse
 * against a child it does not own or fake an age.
 */
export interface AnalyzeRequest {
  childId: string;
  language: Language;
  symptoms: string;
  symptomOnset: string;
  weightKg?: number;
  image?: string;
}

/** A row in the child health timeline. */
export interface ConsultationSummary {
  id: string;
  childId: string;
  childName: string;
  ageMonths: number;
  symptoms: string;
  emergencyAlert: boolean;
  recommendedSpecialist: string;
  createdAt: string;
}

export interface Medication {
  name: string;
  dosage?: string;
  type: 'Over-the-counter' | 'Prescription' | 'Home Remedy';
  description: string;
}

export interface Condition {
  name: string;
  probability: 'High' | 'Moderate' | 'Low';
  description: string;
  reasoning: string;
  recommendedAction: string;
  suggestedMedications: Medication[];
}

export interface AnalysisResult {
  emergencyAlert: boolean;
  emergencyMessage?: string;
  possibleConditions: Condition[];
  generalAdvice: string[];
  recommendedSpecialist: string; // English specialty name, matched against MOCK_SPECIALISTS
  disclaimer: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

/**
 * A doctor as a family sees them. Backed by a real, admin-approved account — `id` is the
 * doctor's char(36) user id, not the small integer the old MOCK_SPECIALISTS array used.
 *
 * `availableToday` and `nextSlotAt` are computed from real availability rules and real
 * bookings, replacing the freehand "Available Today" string that used to be filtered by
 * English substring matching.
 */
export interface Specialist {
  id: string;
  name: string;
  specialty: DoctorSpecialty;
  facilityName: string;
  phone: string | null;
  photoUrl: string | null;
  bio: string | null;
  languages: SpokenLanguage[];
  ratingAvg: number | null;
  ratingCount: number;
  availableToday: boolean;
  nextSlotAt: string | null;
}

export interface HealthFacility {
  id: number;
  name: string;
  type: 'Hospital' | 'CHC' | 'Health Post' | 'Clinic';
  municipality: string;
  phone: string;
}

export interface VaccineDose {
  id: string;
  vaccine: string;
  doseLabel: string;
  ageMonths: number; // scheduled age in months (fractions allowed for week-based doses)
}
