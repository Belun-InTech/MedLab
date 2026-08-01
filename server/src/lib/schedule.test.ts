/**
 * The only unit test in the repo, and deliberately so: expandSlots is pure, is where the
 * timezone arithmetic lives, and fails in ways that look like "the calendar is slightly
 * wrong" rather than an exception. Run with `npm run test`.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { expandSlots, LEAD_MINUTES } from './schedule.js';

// A Wednesday. 09:00 in Dili (UTC+9) is 00:00Z the same day.
const WED_MIDNIGHT_UTC = new Date('2026-08-04T15:00:00.000Z'); // = Wed 05 Aug 00:00 Dili
const WEDNESDAY = 3;

const morning = { weekday: WEDNESDAY, startMinute: 9 * 60, endMinute: 12 * 60 };

test('09:00 Dili is emitted as 00:00Z', () => {
  const slots = expandSlots([morning], 30, new Set(), 1, WED_MIDNIGHT_UTC);
  assert.equal(slots[0]!.startsAt, '2026-08-05T00:00:00.000Z');
});

test('a three-hour block yields six 30-minute slots', () => {
  const slots = expandSlots([morning], 30, new Set(), 1, WED_MIDNIGHT_UTC);
  assert.equal(slots.length, 6);
  assert.equal(slots.at(-1)!.startsAt, '2026-08-05T02:30:00.000Z');
});

test('a trailing part-slot is dropped rather than overrunning the block', () => {
  // 09:00–12:00 at 45 minutes = 4 slots, ending 11:45; there is no 12:00–12:45.
  const slots = expandSlots([morning], 45, new Set(), 1, WED_MIDNIGHT_UTC);
  assert.equal(slots.length, 4);
  assert.equal(slots.at(-1)!.startsAt, '2026-08-05T02:15:00.000Z');
});

test('slots inside the lead window are not offered', () => {
  // "Now" is 09:10 Dili, so 09:00 has passed and 09:30 is inside the 60-minute notice.
  const now = new Date('2026-08-05T00:10:00.000Z');
  const slots = expandSlots([morning], 30, new Set(), 1, now);
  const earliest = new Date(now.getTime() + LEAD_MINUTES * 60_000);
  assert.ok(slots.every((s) => new Date(s.startsAt) >= earliest));
  assert.equal(slots[0]!.startsAt, '2026-08-05T01:30:00.000Z');
});

test('booked slots are flagged, not removed', () => {
  const booked = new Set(['2026-08-05T00:30:00.000Z']);
  const slots = expandSlots([morning], 30, booked, 1, WED_MIDNIGHT_UTC);
  assert.equal(slots.length, 6);
  assert.equal(slots.filter((s) => s.booked).length, 1);
  assert.equal(slots.find((s) => s.booked)!.startsAt, '2026-08-05T00:30:00.000Z');
});

test('a rule only fires on its own weekday', () => {
  // Two weeks from Wednesday contains exactly two Wednesdays.
  const slots = expandSlots([morning], 30, new Set(), 14, WED_MIDNIGHT_UTC);
  assert.equal(slots.length, 12);
});

test('slots come back in chronological order across days and blocks', () => {
  const afternoon = { weekday: WEDNESDAY, startMinute: 14 * 60, endMinute: 17 * 60 };
  const slots = expandSlots([afternoon, morning], 60, new Set(), 14, WED_MIDNIGHT_UTC);
  const times = slots.map((s) => s.startsAt);
  assert.deepEqual(times, [...times].sort());
});

test('no rules means no slots', () => {
  assert.deepEqual(expandSlots([], 30, new Set(), 14, WED_MIDNIGHT_UTC), []);
});
