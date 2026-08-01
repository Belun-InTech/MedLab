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
    // Mocked $2.99/mo Premium. A flag, not a billing system.
    subscribed: boolean('subscribed').notNull().default(false),
    subscribedAt: timestamp('subscribed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (t) => [uniqueIndex('users_email_unq').on(t.email)],
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

// --- Relations (for drizzle's query API) ------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  children: many(children),
  consultations: many(consultations),
}));

export const childrenRelations = relations(children, ({ one, many }) => ({
  user: one(users, { fields: [children.userId], references: [users.id] }),
  vaccinations: many(childVaccinations),
  consultations: many(consultations),
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
