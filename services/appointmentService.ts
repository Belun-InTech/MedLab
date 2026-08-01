import { Appointment, BookingRequest, ChildRecord, ClinicalNoteInput } from '../shared/types';
import { api, ApiError } from './api';

export type ChildRecordResult =
  | { status: 'ok'; record: ChildRecord }
  | { status: 'error'; reason: 'history_not_shared' | 'not_found' | 'network' };

/**
 * The consent-gated read. Scoped to one appointment id, never to a doctor+child pair — the
 * server refuses anything else. See server/src/lib/access.ts.
 */
export const fetchChildRecord = async (appointmentId: string): Promise<ChildRecordResult> => {
  try {
    return { status: 'ok', record: await api.get<ChildRecord>(`/appointments/${appointmentId}/child-record`) };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.code === 'history_not_shared') return { status: 'error', reason: 'history_not_shared' };
      return { status: 'error', reason: 'not_found' };
    }
    return { status: 'error', reason: 'network' };
  }
};

export const saveClinicalNote = async (
  appointmentId: string,
  note: ClinicalNoteInput,
): Promise<{ status: 'ok' } | { status: 'error'; reason: string }> => {
  try {
    await api.put(`/appointments/${appointmentId}/note`, note);
    return { status: 'ok' };
  } catch (err) {
    return { status: 'error', reason: err instanceof ApiError ? err.code : 'network' };
  }
};

export type BookingResult =
  | { status: 'ok'; appointment: Appointment }
  | {
      status: 'error';
      reason: 'slot_taken' | 'subscription_required' | 'child_not_found' | 'invalid_input' | 'network';
    };

export const bookAppointment = async (request: BookingRequest): Promise<BookingResult> => {
  try {
    const { appointment } = await api.post<{ appointment: Appointment }>('/appointments', request);
    return { status: 'ok', appointment };
  } catch (err) {
    if (err instanceof ApiError) {
      // slot_unavailable and slot_taken mean the same thing to a parent: pick another time.
      if (err.code === 'slot_taken' || err.code === 'slot_unavailable') {
        return { status: 'error', reason: 'slot_taken' };
      }
      if (err.code === 'subscription_required') return { status: 'error', reason: 'subscription_required' };
      if (err.code === 'child_not_found') return { status: 'error', reason: 'child_not_found' };
      return { status: 'error', reason: 'invalid_input' };
    }
    return { status: 'error', reason: 'network' };
  }
};

/** Scoped server-side by the caller's role — a parent sees theirs, a doctor sees theirs. */
export const fetchAppointments = async (scope: 'upcoming' | 'past' = 'upcoming'): Promise<Appointment[]> => {
  const { appointments } = await api.get<{ appointments: Appointment[] }>(`/appointments?scope=${scope}`);
  return appointments;
};

export const fetchAppointment = async (id: string): Promise<Appointment> => {
  const { appointment } = await api.get<{ appointment: Appointment }>(`/appointments/${id}`);
  return appointment;
};

/** Cancelling removes the booking and frees the slot again. */
export const cancelAppointment = async (id: string): Promise<void> => {
  await api.del(`/appointments/${id}`);
};

export const completeAppointment = async (id: string): Promise<void> => {
  await api.post(`/appointments/${id}/complete`);
};
