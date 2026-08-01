import { and, eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';

/**
 * The doctor-side counterpart to ownedChild() in routes/children.ts.
 *
 * A doctor's authority to read a child's record comes from exactly ONE place: an
 * appointment they hold with that child. There is deliberately no doctorId + childId
 * lookup anywhere in this codebase — every doctor-side read is scoped to a single
 * appointment id in the URL, so a doctor cannot enumerate a family and cannot reach the
 * parent's other children.
 *
 * The doctor must also still be `approved`, which loadApprovedDoctor re-reads from the
 * database on every single request — a suspended doctor loses access on their next click,
 * not when their cookie expires.
 */
export type DoctorAccess =
  | { ok: true; appointment: typeof schema.appointments.$inferSelect }
  | { ok: false; status: number; reason: 'not_found' | 'history_not_shared' };

export const doctorAppointmentAccess = async (
  doctorId: string,
  appointmentId: string,
): Promise<DoctorAccess> => {
  const [appointment] = await db
    .select()
    .from(schema.appointments)
    .where(
      and(
        eq(schema.appointments.id, appointmentId),
        // Never a client-supplied doctor id — always the authenticated one.
        eq(schema.appointments.doctorId, doctorId),
      ),
    )
    .limit(1);

  // 404 rather than 403 for "not yours", same as ownedChild: no existence leak.
  if (!appointment) return { ok: false, status: 404, reason: 'not_found' };

  // Consent is per appointment — a checkbox the parent ticked at booking time. It is not
  // a doctor-level setting, not an account-level setting, and it is re-read every request
  // rather than cached anywhere in the session.
  if (!appointment.sharesHistory) {
    return { ok: false, status: 403, reason: 'history_not_shared' };
  }

  return { ok: true, appointment };
};
