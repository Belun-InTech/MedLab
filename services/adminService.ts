import { DoctorSpecialty, DoctorStatus, SpokenLanguage } from '../shared/types';
import { api } from './api';

/** A registration as the verification queue sees it — account details, never patient data. */
export interface AdminDoctorRow {
  id: string;
  name: string;
  email: string;
  specialty: DoctorSpecialty;
  licenseNumber: string;
  facilityName: string;
  phone: string | null;
  bio: string | null;
  photoUrl: string | null;
  languages: SpokenLanguage[];
  status: DoctorStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export const fetchDoctorRegistrations = async (status?: DoctorStatus): Promise<AdminDoctorRow[]> => {
  const query = status ? `?status=${status}` : '';
  const { doctors } = await api.get<{ doctors: AdminDoctorRow[] }>(`/admin/doctors${query}`);
  return doctors;
};

/** Aggregates only — the endpoint deliberately exposes no patient data. */
export interface AdminStats {
  totals: {
    parents: number;
    doctors: number;
    pendingDoctors: number;
    children: number;
    consultations: number;
    appointments: number;
  };
  emergencyRate: number;
  topConditions: { name: string; value: number }[];
}

export const fetchStats = async (): Promise<AdminStats> => api.get<AdminStats>('/admin/stats');

export const approveDoctor = async (id: string): Promise<void> => {
  await api.post(`/admin/doctors/${id}/approve`);
};

export const rejectDoctor = async (id: string, reason: string): Promise<void> => {
  await api.post(`/admin/doctors/${id}/reject`, { reason });
};

export const suspendDoctor = async (id: string, reason: string): Promise<void> => {
  await api.post(`/admin/doctors/${id}/suspend`, { reason });
};
