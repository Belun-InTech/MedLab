
export type Language = 'en' | 'tet' | 'id';

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email?: string;
  password?: string; // For demo purposes only
  avatar?: string;
  dob?: string;
  sex?: 'Male' | 'Female' | 'Other' | '';
  lastLogin?: string; // ISO timestamp of last sign-in
  role?: 'Patient' | 'Specialist';
  specialistId?: number; // Links to a specific specialist profile if role is 'Specialist'
}

export interface Appointment {
  id?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  specialistId: number;
  patientId?: string;
  patientName?: string;
  patientSymptoms?: string;
  patientAge?: number;
  patientSex?: string;
  analysisResult?: AnalysisResult;
  auscultation?: AuscultationData;
  reminder?: {
    enabled: boolean;
    method: 'email' | 'app';
    timing: string; // e.g., "1h", "24h"
  };
}

export interface AuscultationData {
  heartSounds: string;
  lungSounds: string;
  bowelSounds: string;
  findings: string;
  performedBy: string;
  date: string;
}

export interface HistoryRecord {
  id: string;
  date: string; // ISO Date string
  symptoms: string;
  diagnosis: string;
  doctorMet: string; // Specialist name or "General Practitioner"
  notes: string; // Short summary or emergency alert status
  status: 'Completed' | 'Pending' | 'Emergency';
  fullResult?: AnalysisResult; // Store the original AI result
  selectedSpecialist?: Specialist; // The specific doctor chosen by the patient
  appointment?: Appointment; // Link to a scheduled appointment
  auscultation?: AuscultationData; // New physical exam data
  patientSnapshot?: PatientData; // Preserve patient details for certificate
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
  recommendedSpecialist: string; // e.g. "Dermatologist"
  disclaimer: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface PatientData {
  name: string;
  dob: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other' | '';
  address: string;
  symptomOnset: string;
  symptoms: string;
  image?: string;
}

export interface Specialist {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  phone: string;
  image: string;
  availability: string;
  availabilitySlots: string[]; // Array of strings representing available time slots (e.g., ["09:00", "10:30"])
}
