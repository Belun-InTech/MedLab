export type Language = 'en' | 'tet' | 'id';

export type PatientMode = 'child' | 'pregnancy';

export interface Child {
  id: string;
  name: string;
  dob: string; // YYYY-MM-DD
  sex: 'Male' | 'Female';
}

export interface Mother {
  name: string;
  dob?: string;
  pregnant: boolean;
  lmp?: string; // last menstrual period, YYYY-MM-DD — drives gestational age
}

export interface FamilyProfile {
  mother: Mother;
  children: Child[];
}

export interface PatientData {
  mode: PatientMode;
  name: string;
  ageYears: number;
  ageMonths: number; // total age in months; primary age unit for infants
  sex: 'Male' | 'Female' | '';
  gestationalWeek?: number; // pregnancy mode only
  weightKg?: number; // child mode, optional
  symptomOnset: string;
  symptoms: string;
  image?: string;
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
