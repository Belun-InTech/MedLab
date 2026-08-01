export type Language = 'en' | 'tet' | 'id';

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

export interface Specialist {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  phone: string;
  image: string;
  availability: string;
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
