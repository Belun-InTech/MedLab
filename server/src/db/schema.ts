import { relations } from 'drizzle-orm';
import {
  boolean,
  char,
  date,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  tinyint,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

// CHAR(36) UUID primary keys so `Child.id` stays a string on the wire and the frontend
// types in shared/types.ts need no change. Fixed-width CHAR indexes better than VARCHAR.

/**
 * The parent or guardian. This is the account — there is no separate "mother" record any
 * more: the app is child-only, and the adult exists purely as the account holder.
 * `dob` backs the temporary 18+ parent check.
 */
export const users = mysqlTable(
  'users',
  {
    id: char('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    // bcrypt hash — never a plaintext password, even in the demo
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    dob: date('dob', { mode: 'string' }).notNull(),
    /**
     * 'parent' is the default, so every row that existed before doctors did is already
     * correct — the migration needs no backfill. Never read from the JWT: loadUser() in
     * lib/auth.ts re-selects this on every request so an admin suspending a doctor takes
     * effect immediately rather than when a 7-day cookie expires.
     *
     * No signup route can produce 'admin'. Admins come from the seed only.
     */
    role: mysqlEnum('role', ['parent', 'doctor', 'admin']).notNull().default('parent'),
    // Mocked $2.99/mo Premium. A flag, not a billing system.
    subscribed: boolean('subscribed').notNull().default(false),
    subscribedAt: timestamp('subscribed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (t) => [uniqueIndex('users_email_unq').on(t.email), index('users_role_idx').on(t.role)],
);

/** A child belonging to one parent account. Cascade: deleting a parent removes the family. */
export const children = mysqlTable(
  'children',
  {
    id: char('id', { length: 36 }).primaryKey(),
    userId: char('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 120 }).notNull(),
    dob: date('dob', { mode: 'string' }).notNull(),
    sex: mysqlEnum('sex', ['Male', 'Female']).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (t) => [index('children_user_idx').on(t.userId)],
);

/**
 * One row per EPI dose actually given. `doseId` matches the ids in
 * constants/vaccineSchedule.ts ('bcg', 'penta1', 'mr2', ...) — the schedule itself stays
 * a constant in code, since it is national policy rather than per-user data.
 */
export const childVaccinations = mysqlTable(
  'child_vaccinations',
  {
    id: char('id', { length: 36 }).primaryKey(),
    childId: char('child_id', { length: 36 })
      .notNull()
      .references(() => children.id, { onDelete: 'cascade' }),
    doseId: varchar('dose_id', { length: 32 }).notNull(),
    givenAt: date('given_at', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  // A dose is given once per child — this is what makes the toggle idempotent.
  (t) => [uniqueIndex('child_dose_unq').on(t.childId, t.doseId)],
);

/**
 * One symptom check and the AI verdict it produced. This is the child health timeline —
 * the part a Ministry partner would actually want to see.
 *
 * NOTE: the uploaded photo is deliberately NOT stored. Base64 image blobs do not belong
 * in MySQL; only the fact that one was attached is recorded.
 */
export const consultations = mysqlTable(
  'consultations',
  {
    id: char('id', { length: 36 }).primaryKey(),
    childId: char('child_id', { length: 36 })
      .notNull()
      .references(() => children.id, { onDelete: 'cascade' }),
    // Denormalised so "all consultations for this account" is one index hit, no join.
    userId: char('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Snapshot of the child at the time of the check — ages change, history must not.
    ageMonths: tinyint('age_months', { unsigned: true }).notNull(),
    weightKg: decimal('weight_kg', { precision: 5, scale: 2 }),

    language: mysqlEnum('language', ['en', 'tet', 'id']).notNull(),
    symptomOnset: varchar('symptom_onset', { length: 255 }).notNull(),
    symptoms: text('symptoms').notNull(),
    hadImage: boolean('had_image').notNull().default(false),

    // The verdict
    emergencyAlert: boolean('emergency_alert').notNull().default(false),
    emergencyMessage: text('emergency_message'),
    generalAdvice: json('general_advice').$type<string[]>().notNull(),
    recommendedSpecialist: varchar('recommended_specialist', { length: 64 }).notNull(),
    disclaimer: text('disclaimer').notNull(),

    // Provenance — which model said this. Essential for auditing clinical output later.
    provider: varchar('provider', { length: 32 }).notNull(),
    model: varchar('model', { length: 96 }).notNull(),
    // int, not tinyint — a local 26B model takes minutes, far past 255ms
    latencyMs: int('latency_ms', { unsigned: true }),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('consultations_child_idx').on(t.childId, t.createdAt),
    index('consultations_user_idx').on(t.userId, t.createdAt),
    // Powers "how often did we flag a danger sign" without scanning the table.
    index('consultations_emergency_idx').on(t.emergencyAlert, t.createdAt),
  ],
);

/**
 * The 3 ranked conditions per consultation. Normalised rather than dumped as JSON so you
 * can answer "most common conditions this quarter" in SQL — a real reporting story for
 * the pitch.
 *
 * Medications stay JSON: they are always read together with their condition and never
 * queried independently, so a child table would cost a join for nothing.
 */
export const consultationConditions = mysqlTable(
  'consultation_conditions',
  {
    id: char('id', { length: 36 }).primaryKey(),
    consultationId: char('consultation_id', { length: 36 })
      .notNull()
      .references(() => consultations.id, { onDelete: 'cascade' }),
    position: tinyint('position', { unsigned: true }).notNull(), // 1 = most likely
    name: varchar('name', { length: 255 }).notNull(),
    probability: mysqlEnum('probability', ['High', 'Moderate', 'Low']).notNull(),
    description: text('description').notNull(),
    reasoning: text('reasoning').notNull(),
    recommendedAction: text('recommended_action').notNull(),
    suggestedMedications: json('suggested_medications')
      .$type<{ name: string; type: string; description: string; dosage?: string }[]>()
      .notNull(),
  },
  (t) => [
    index('conditions_consultation_idx').on(t.consultationId, t.position),
    index('conditions_name_idx').on(t.name),
  ],
);

/**
 * The clinical half of a doctor account. The primary key IS the user id, so the 1:1
 * relationship is enforced by the schema rather than by convention and a doctor's id in
 * every API response is simply their user id — one identifier, not two.
 *
 * A doctor is invisible to parents until `status` is 'approved'. Self-registration with
 * no review would mean anyone could pose as a paediatrician, which is not a defensible
 * demo for a health ministry.
 */
export const doctorProfiles = mysqlTable(
  'doctor_profiles',
  {
    userId: char('user_id', { length: 36 })
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),

    // The same two canonical values routes/consultations.ts normalises the AI's
    // recommendedSpecialist to, so matching a consultation to a doctor is plain equality.
    specialty: mysqlEnum('specialty', ['Pediatrician', 'General Practitioner']).notNull(),
    licenseNumber: varchar('license_number', { length: 64 }).notNull(),

    // Facilities are national reference data in shared/facilities.ts, not user data —
    // hence an int id rather than the char(36) used for everything user-generated. The
    // name is snapshotted so a directory listing needs no lookup.
    facilityId: int('facility_id', { unsigned: true }),
    facilityName: varchar('facility_name', { length: 160 }).notNull(),

    phone: varchar('phone', { length: 32 }),
    photoUrl: varchar('photo_url', { length: 512 }),
    bio: text('bio'),
    // Languages the doctor SPEAKS, not UI locales — this includes 'pt', which MédLab has
    // no interface for. Deliberately not the Language union in shared/types.ts.
    languages: json('languages').$type<('tet' | 'pt' | 'id' | 'en')[]>().notNull(),
    slotMinutes: tinyint('slot_minutes', { unsigned: true }).notNull().default(30),

    status: mysqlEnum('status', ['pending', 'approved', 'rejected', 'suspended'])
      .notNull()
      .default('pending'),
    rejectionReason: varchar('rejection_reason', { length: 255 }),

    // Demo: seeded, not computed. Real ratings need a reviews table and moderation.
    ratingAvg: decimal('rating_avg', { precision: 3, scale: 2 }),
    ratingCount: int('rating_count', { unsigned: true }).notNull().default(0),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (t) => [
    // One licence, one account — the only hard uniqueness a demo can actually enforce.
    uniqueIndex('doctor_license_unq').on(t.licenseNumber),
    // The exact shape of the parent-facing directory query.
    index('doctor_status_specialty_idx').on(t.status, t.specialty),
  ],
);

/**
 * Weekly recurring working hours in Asia/Dili wall-clock. Minutes-from-midnight rather
 * than a TIME column because every consumer does arithmetic on these (lib/schedule.ts)
 * and an int needs no parsing. Timor-Leste is UTC+9 with no daylight saving, ever, so a
 * weekday plus a minute offset is an unambiguous recurring time forever.
 */
export const doctorAvailabilityRules = mysqlTable(
  'doctor_availability_rules',
  {
    id: char('id', { length: 36 }).primaryKey(),
    doctorId: char('doctor_id', { length: 36 })
      .notNull()
      .references(() => doctorProfiles.userId, { onDelete: 'cascade' }),
    weekday: tinyint('weekday', { unsigned: true }).notNull(), // 0 = Sunday .. 6 = Saturday
    startMinute: int('start_minute', { unsigned: true }).notNull(), // 0..1440
    endMinute: int('end_minute', { unsigned: true }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  // Makes the replace-all PUT idempotent and blocks duplicate blocks. Partial overlaps
  // (09:00-12:00 vs 10:00-14:00) can't be expressed as an index and are rejected in the route.
  (t) => [
    uniqueIndex('availability_rule_unq').on(t.doctorId, t.weekday, t.startMinute),
    index('availability_doctor_idx').on(t.doctorId, t.weekday),
  ],
);

/**
 * A booked slot. `startsAt` is an absolute UTC instant; the doctor's local wall-clock
 * exists only in the availability rules.
 *
 * The unique index — not the handler — is what makes double-booking impossible: two
 * parents can pass an availability check simultaneously, and only one INSERT survives.
 * Cancelling DELETEs the row, which frees the slot again with no extra column and no
 * state machine. A production build would soft-cancel and keep the audit trail.
 */
export const appointments = mysqlTable(
  'appointments',
  {
    id: char('id', { length: 36 }).primaryKey(),
    doctorId: char('doctor_id', { length: 36 })
      .notNull()
      .references(() => doctorProfiles.userId, { onDelete: 'cascade' }),
    parentId: char('parent_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    childId: char('child_id', { length: 36 })
      .notNull()
      .references(() => children.id, { onDelete: 'cascade' }),

    startsAt: timestamp('starts_at').notNull(),
    durationMinutes: tinyint('duration_minutes', { unsigned: true }).notNull(),
    status: mysqlEnum('status', ['booked', 'completed']).notNull().default('booked'),
    reason: varchar('reason', { length: 500 }),

    // The AI check that prompted the booking, if any — the first thing the doctor opens.
    consultationId: char('consultation_id', { length: 36 }).references(() => consultations.id, {
      onDelete: 'set null',
    }),
    /**
     * Explicit parent consent, per appointment — never per doctor and never account-wide.
     * When false the doctor sees the child's name, age and sex and nothing else: no AI
     * history, no vaccination record. See lib/access.ts.
     */
    sharesHistory: boolean('shares_history').notNull().default(true),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (t) => [
    uniqueIndex('appt_doctor_slot_unq').on(t.doctorId, t.startsAt),
    index('appt_parent_time_idx').on(t.parentId, t.startsAt),
    index('appt_child_idx').on(t.childId, t.startsAt),
  ],
);

/**
 * The doctor's verdict, written after a consult. This is the row that sits next to the
 * AI's guess on the child's timeline — the entire point of putting a human in the loop.
 * One note per appointment, enforced by index, so the write endpoint is a plain upsert.
 */
export const clinicalNotes = mysqlTable(
  'clinical_notes',
  {
    id: char('id', { length: 36 }).primaryKey(),
    appointmentId: char('appointment_id', { length: 36 })
      .notNull()
      .references(() => appointments.id, { onDelete: 'cascade' }),
    doctorId: char('doctor_id', { length: 36 })
      .notNull()
      .references(() => doctorProfiles.userId, { onDelete: 'cascade' }),
    // Denormalised so the child timeline is one indexed read, for the same reason
    // consultations.userId is denormalised.
    childId: char('child_id', { length: 36 })
      .notNull()
      .references(() => children.id, { onDelete: 'cascade' }),

    assessment: text('assessment').notNull(),
    plan: text('plan').notNull(),
    followUpDays: tinyint('follow_up_days', { unsigned: true }),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (t) => [
    uniqueIndex('note_appointment_unq').on(t.appointmentId),
    index('note_child_idx').on(t.childId, t.createdAt),
  ],
);

// --- Relations (for drizzle's query API) ------------------------------------

export const usersRelations = relations(users, ({ one, many }) => ({
  children: many(children),
  consultations: many(consultations),
  doctorProfile: one(doctorProfiles, {
    fields: [users.id],
    references: [doctorProfiles.userId],
  }),
  appointments: many(appointments),
}));

export const childrenRelations = relations(children, ({ one, many }) => ({
  user: one(users, { fields: [children.userId], references: [users.id] }),
  vaccinations: many(childVaccinations),
  consultations: many(consultations),
  appointments: many(appointments),
  clinicalNotes: many(clinicalNotes),
}));

export const childVaccinationsRelations = relations(childVaccinations, ({ one }) => ({
  child: one(children, { fields: [childVaccinations.childId], references: [children.id] }),
}));

export const consultationsRelations = relations(consultations, ({ one, many }) => ({
  child: one(children, { fields: [consultations.childId], references: [children.id] }),
  user: one(users, { fields: [consultations.userId], references: [users.id] }),
  conditions: many(consultationConditions),
}));

export const consultationConditionsRelations = relations(consultationConditions, ({ one }) => ({
  consultation: one(consultations, {
    fields: [consultationConditions.consultationId],
    references: [consultations.id],
  }),
}));

export const doctorProfilesRelations = relations(doctorProfiles, ({ one, many }) => ({
  user: one(users, { fields: [doctorProfiles.userId], references: [users.id] }),
  availabilityRules: many(doctorAvailabilityRules),
  appointments: many(appointments),
}));

export const doctorAvailabilityRulesRelations = relations(doctorAvailabilityRules, ({ one }) => ({
  doctor: one(doctorProfiles, {
    fields: [doctorAvailabilityRules.doctorId],
    references: [doctorProfiles.userId],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  doctor: one(doctorProfiles, {
    fields: [appointments.doctorId],
    references: [doctorProfiles.userId],
  }),
  parent: one(users, { fields: [appointments.parentId], references: [users.id] }),
  child: one(children, { fields: [appointments.childId], references: [children.id] }),
  note: one(clinicalNotes, {
    fields: [appointments.id],
    references: [clinicalNotes.appointmentId],
  }),
}));

export const clinicalNotesRelations = relations(clinicalNotes, ({ one }) => ({
  appointment: one(appointments, {
    fields: [clinicalNotes.appointmentId],
    references: [appointments.id],
  }),
  doctor: one(doctorProfiles, {
    fields: [clinicalNotes.doctorId],
    references: [doctorProfiles.userId],
  }),
  child: one(children, { fields: [clinicalNotes.childId], references: [children.id] }),
}));
