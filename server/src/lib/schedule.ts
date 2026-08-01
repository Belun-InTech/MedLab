import { and, eq, gte, inArray, lt } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import type { AvailabilityRule, Slot } from '../../../shared/types.js';

/**
 * Timor-Leste is Asia/Dili = UTC+9 all year, with no daylight saving, ever. The whole
 * timezone problem therefore collapses to one constant. Availability rules are stored in
 * Dili wall-clock (weekday + minute of day); slots are emitted as absolute UTC instants
 * and rendered by the browser.
 *
 * Nothing in this file uses the process timezone — getDay()/getHours() are deliberately
 * absent, because they would read whatever timezone the container happens to run in.
 */
export const DILI_OFFSET_MIN = 9 * 60;

const MS_MIN = 60_000;
const MS_DAY = 24 * 60 * MS_MIN;

/** Minimum notice before a slot can be booked — no "in three minutes" appointments. */
export const LEAD_MINUTES = 60;
export const SLOT_HORIZON_DAYS = 14;

/** The UTC instant of midnight in Dili, for the Dili civil day containing `ref`. */
const diliMidnightUtc = (ref: Date): Date => {
  const shifted = ref.getTime() + DILI_OFFSET_MIN * MS_MIN;
  return new Date(Math.floor(shifted / MS_DAY) * MS_DAY - DILI_OFFSET_MIN * MS_MIN);
};

/** Dili weekday (0 = Sunday) of the civil day beginning at this UTC instant. */
const diliWeekday = (midnightUtc: Date): number =>
  new Date(midnightUtc.getTime() + DILI_OFFSET_MIN * MS_MIN).getUTCDay();

/**
 * Expands weekly rules into concrete slots. Pure — no I/O — which is what makes it the one
 * piece of this feature worth a unit test.
 *
 * Slots are computed on read rather than materialised into a table: there is no cron or
 * job runner in this repo, so a materialised table would go stale the moment a doctor
 * edits their hours. Booking correctness does not depend on this list anyway — the booking
 * route re-derives it server-side, and the unique index on (doctor_id, starts_at) is the
 * final arbiter.
 */
export const expandSlots = (
  rules: AvailabilityRule[],
  slotMinutes: number,
  bookedIso: ReadonlySet<string>,
  days: number = SLOT_HORIZON_DAYS,
  now: Date = new Date(),
): Slot[] => {
  const slots: Slot[] = [];
  const earliest = now.getTime() + LEAD_MINUTES * MS_MIN;
  const day0 = diliMidnightUtc(now);

  for (let d = 0; d < days; d++) {
    // Adding a flat 24h is safe: Dili has never observed DST, so every civil day is 24h.
    const midnight = new Date(day0.getTime() + d * MS_DAY);
    const weekday = diliWeekday(midnight);

    for (const rule of rules) {
      if (rule.weekday !== weekday) continue;
      for (let m = rule.startMinute; m + slotMinutes <= rule.endMinute; m += slotMinutes) {
        const start = midnight.getTime() + m * MS_MIN;
        if (start < earliest) continue; // already past, or inside the notice window
        // Whole-minute by construction, so this ISO string is a stable key against the
        // second-resolution TIMESTAMP column it is compared to.
        const iso = new Date(start).toISOString();
        slots.push({ startsAt: iso, durationMinutes: slotMinutes, booked: bookedIso.has(iso) });
      }
    }
  }

  return slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
};

/** Booked slot keys for one doctor over a window. One indexed query. */
export const bookedSlotKeys = async (doctorId: string, from: Date, to: Date): Promise<Set<string>> => {
  const rows = await db
    .select({ startsAt: schema.appointments.startsAt })
    .from(schema.appointments)
    .where(
      and(
        eq(schema.appointments.doctorId, doctorId),
        gte(schema.appointments.startsAt, from),
        lt(schema.appointments.startsAt, to),
      ),
    );
  return new Set(rows.map((r) => r.startsAt.toISOString()));
};

/** The horizon window [now, now + days), used for both the query and the expansion. */
export const horizonWindow = (days: number, now: Date = new Date()): [Date, Date] => [
  now,
  new Date(diliMidnightUtc(now).getTime() + days * MS_DAY),
];

/** Every slot for one doctor, booked ones flagged. The single entry point for routes. */
export const doctorSlots = async (
  doctorId: string,
  slotMinutes: number,
  days: number = SLOT_HORIZON_DAYS,
  now: Date = new Date(),
): Promise<Slot[]> => {
  const rules = await db
    .select({
      weekday: schema.doctorAvailabilityRules.weekday,
      startMinute: schema.doctorAvailabilityRules.startMinute,
      endMinute: schema.doctorAvailabilityRules.endMinute,
    })
    .from(schema.doctorAvailabilityRules)
    .where(eq(schema.doctorAvailabilityRules.doctorId, doctorId));

  if (!rules.length) return [];

  const [from, to] = horizonWindow(days, now);
  return expandSlots(rules, slotMinutes, await bookedSlotKeys(doctorId, from, to), days, now);
};

/**
 * The directory needs an "available today" flag for many doctors at once. Two batched
 * queries plus in-memory expansion, rather than N round trips per card.
 */
export const availabilitySummaries = async (
  doctors: { id: string; slotMinutes: number }[],
  now: Date = new Date(),
): Promise<Map<string, { availableToday: boolean; nextSlotAt: string | null }>> => {
  const summary = new Map<string, { availableToday: boolean; nextSlotAt: string | null }>();
  for (const d of doctors) summary.set(d.id, { availableToday: false, nextSlotAt: null });
  if (!doctors.length) return summary;

  const ids = doctors.map((d) => d.id);
  const [from, to] = horizonWindow(SLOT_HORIZON_DAYS, now);

  const rules = await db
    .select()
    .from(schema.doctorAvailabilityRules)
    .where(inArray(schema.doctorAvailabilityRules.doctorId, ids));

  const booked = await db
    .select({
      doctorId: schema.appointments.doctorId,
      startsAt: schema.appointments.startsAt,
    })
    .from(schema.appointments)
    .where(
      and(
        inArray(schema.appointments.doctorId, ids),
        gte(schema.appointments.startsAt, from),
        lt(schema.appointments.startsAt, to),
      ),
    );

  const rulesByDoctor = new Map<string, AvailabilityRule[]>();
  for (const r of rules) {
    const list = rulesByDoctor.get(r.doctorId) ?? [];
    list.push({ weekday: r.weekday, startMinute: r.startMinute, endMinute: r.endMinute });
    rulesByDoctor.set(r.doctorId, list);
  }

  const bookedByDoctor = new Map<string, Set<string>>();
  for (const b of booked) {
    const set = bookedByDoctor.get(b.doctorId) ?? new Set<string>();
    set.add(b.startsAt.toISOString());
    bookedByDoctor.set(b.doctorId, set);
  }

  // End of today in Dili, as a UTC instant — what "available today" is measured against.
  const endOfToday = diliMidnightUtc(now).getTime() + MS_DAY;

  for (const doc of doctors) {
    const docRules = rulesByDoctor.get(doc.id);
    if (!docRules?.length) continue;

    const slots = expandSlots(
      docRules,
      doc.slotMinutes,
      bookedByDoctor.get(doc.id) ?? new Set(),
      SLOT_HORIZON_DAYS,
      now,
    ).filter((s) => !s.booked);

    summary.set(doc.id, {
      availableToday: slots.some((s) => Date.parse(s.startsAt) < endOfToday),
      nextSlotAt: slots[0]?.startsAt ?? null,
    });
  }

  return summary;
};
