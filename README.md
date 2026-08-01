# Médiku Labarik (MédLab)

AI-powered **child health assistant for Timor-Leste** — a pitch demo for the EU-ASEAN SCOPE Trade Project.

MédLab helps parents and caregivers of children (from the first month of life):

- **Check symptoms** for a child — age-aware in months, with IMCI danger-sign screening — by text or photo, with AI analysis in **Tetum, English, or Indonesian**
- **Follow the EPI vaccination schedule** for each child with due/overdue status
- **Find health facilities** across Timor-Leste's municipalities
- **Book a real doctor** — browse verified doctors filtered by specialty and spoken
  language, pick a slot from their published working hours, and choose whether to share
  the child's health record with them, behind a mocked Premium subscription
- **Chat or call a doctor** (simulated in this demo)

Doctors and administrators have their own accounts and their own portals:

- A **doctor** registers with a licence number, specialty and facility, waits for admin
  approval, publishes weekly working hours, and sees their bookings. On a booked consult
  they can read that child's AI symptom history and vaccination gaps — but only if the
  parent shared them, and only for that one child — then write a clinical note that lands
  on the child's timeline next to the AI's guess.
- An **administrator** reviews doctor registrations and sees programme counters.

## Flow

```
Parent:  Sign up  →  Register children  →  Pick a child  →  Symptoms  →  Results  →  Book a doctor
Doctor:  Register  →  Await approval  →  Publish hours  →  Take bookings  →  Read record  →  Write note
Admin:   Verification queue  →  Approve / reject / suspend
```

Only a parent or guardian can register: sign-up asks for a date of birth and requires the
registrant to be 18 or over, enforced on the server. **This is a temporary placeholder for
parent verification — an age check, not identity proof.**

## Architecture

One repo, one deployable process. Express serves the built SPA *and* the API, so the
frontend and backend are the same origin — no CORS, and the AI provider key never reaches
the browser.

```
MedLab/
├── shared/               # types.ts + facilities.ts — imported by BOTH browser and server
├── App.tsx               # boot, session, theme, and the parent/doctor/admin branch
├── components/           # React SPA — one shell per role, then flat screens
├── services/             # thin API clients (api, auth, profile, analysis, doctor,
│                         #   appointment, admin, chat)
├── server/
│   ├── src/
│   │   ├── db/           # schema.ts (Drizzle → MySQL) + seed.ts
│   │   ├── lib/          # auth guards, access.ts (consent), schedule.ts (slots)
│   │   ├── ai/           # prompt + JSON schema + provider switch (ollama | opencode)
│   │   ├── routes/       # auth, children, consultations, doctors, appointments, admin
│   │   └── index.ts      # Express; serves dist/ in production
│   └── migrations/       # generated SQL, applied with drizzle-kit
└── dist/                 # built SPA
```

There is no router: `App.tsx` branches on the signed-in role into one of three shells,
each of which owns its own view state and header menu. See `CLAUDE.md` for the reasoning
and for the conventions this codebase expects.

**In dev** Vite serves the SPA on :3000 and proxies `/api` to Express on :3001.
**In production** `npm start` runs Express alone, serving `dist/` and `/api` from one port.

### Database

| Table | Holds |
|---|---|
| `users` | Every account — bcrypt password hash, DOB (backs the 18+ check), `role` (parent/doctor/admin), mocked `subscribed` flag |
| `children` | One row per child, cascade-deleted with the parent |
| `child_vaccinations` | One row per EPI dose actually given; `UNIQUE(child_id, dose_id)` makes the toggle idempotent |
| `consultations` | Every symptom check and its verdict — the child health timeline. Records provider/model/latency for auditing |
| `consultation_conditions` | The 3 ranked conditions per consultation, normalised so you can query "most common conditions this quarter". Medications stay JSON — always read with their condition, never queried alone |
| `doctor_profiles` | The clinical half of a doctor account, keyed by `user_id` so the 1:1 is enforced by the schema. Licence, specialty, facility, spoken languages, verification status |
| `doctor_availability_rules` | Weekly working hours as weekday + minutes-from-midnight, Dili wall-clock. Slots are expanded from these on read, never materialised |
| `appointments` | A booked slot. `UNIQUE(doctor_id, starts_at)` is what actually prevents double-booking; `shares_history` is the parent's per-appointment consent |
| `clinical_notes` | The doctor's verdict, one per appointment. This is the row that sits next to the AI's guess on the child's timeline |

The uploaded **photo is deliberately not stored** (only a `had_image` flag) — base64 blobs
don't belong in MySQL. The EPI schedule itself stays a constant in code: it's national
policy, not per-user data.

## Run locally

**Prerequisites:** Node.js 22 (see `.nvmrc`), Docker, and an AI provider (see below).

```bash
cp .env.example .env      # then edit as needed
npm install
npm run db:up             # MySQL 8.4 in Docker on :3307
npm run db:migrate        # apply migrations
npm run db:seed           # demo doctors + admin (idempotent)
npm run dev               # Vite :3000 + API :3001
```

Open http://localhost:3000.

**Demo accounts** — password `medlab123` for all of them:
`admin@medlab.tl` (admin) · `budi.santoso@medlab.tl` and five others (approved doctors) ·
`marcos.guterres@medlab.tl` (left **pending** on purpose, so the verification queue is not
empty on stage). Parents are created through the sign-up screen.

### AI provider

Set `AI_PROVIDER` in `.env`:

**`ollama`** (default) — local, offline-capable, free. This is the on-device story for
rural Timor-Leste.
```
AI_PROVIDER=ollama
OLLAMA_TEXT_MODEL=gemma3
OLLAMA_VISION_MODEL=llava
```

**`opencode`** — hosted, ~2-3× faster than a local 26B model. The key is read
**server-side only**; it is never sent to the browser and never appears in `dist/`.
```
AI_PROVIDER=opencode
OPENCODE_API_KEY=sk-...
OPENCODE_MODEL=deepseek-v4-flash-free
```

Verified working (2026-08-01): ~12s English, ~28s Tetum, vs ~29s on local `gemma4:26b`.

**Model ids: the `-free` suffix matters.** `deepseek-v4-flash-free` works on a workspace
with no payment method; `deepseek-v4-flash` is the paid route and returns
`401 CreditsError` until billing is added. Other free ids: `mimo-v2.5-free`, `big-pickle`.
`GET $OPENCODE_BASE_URL/models` lists all 60.

### Model choice is a safety decision, not just a speed one

**Do not switch models without re-testing Tetum danger-sign detection.** Schema support
and Tetum clinical quality are independent, and the second one matters more.

Measured 2026-08-01 on "fever 2 days, fast breathing, not drinking" (two IMCI general
danger signs — must flag as an emergency):

| Model | `json_schema` | Danger signs, English | Danger signs, **Tetum** |
|---|---|---|---|
| `deepseek-v4-flash-free` ✅ | rejected (400) | flagged 2/2 | **flagged 5/5** |
| `mimo-v2.5-free` | accepted | flagged 2/2 | **MISSED 2/2** |
| `gemma4:26b` (ollama) | n/a (enforced) | flagged | flagged |

`mimo-v2.5-free` supports the enforced schema but its Tetum is weak: it missed the danger
signs entirely and emitted incoherent condition names ("Oitu Hotu", "Imunidade Ka'rai").
Since Tetum is the default language and the primary audience, **it is not safe to use here
despite the better schema support.** `deepseek-v4-flash-free` also correctly returns *not*
an emergency for a benign case, so it isn't just flagging everything.

**Structured output varies by model**, and opencode doesn't document it, so the provider
negotiates down automatically and remembers what worked.

`GET /api/health` reports the negotiated mode. Because `json_object` does **not** enforce
the schema, models rename fields freely (`conditions` for `possibleConditions`, a plain
string per medication). The prompt therefore spells the exact shape out, and the server
normaliser accepts the common aliases — and **throws rather than returning a result with
no conditions**, since a hollow "emergency" with no advice is worse than an error.

> opencode.ai sends no CORS headers, so the browser cannot call it directly. Routing
> through this server is what makes the key usable at all.

**Demo performance tip:** a 26B local model takes ~30–40s per analysis on a laptop. For a
live pitch use a small fast model (`ollama pull gemma3:4b`) and warm it with one request
before going on stage, or switch to `opencode`.

## Build and deploy

```bash
npm run build     # vite build → dist/, tsc → dist-server/
npm start         # Express serves both on API_PORT
```

Single container: point it at a MySQL instance via `DATABASE_URL`, set `JWT_SECRET`, done.

## Useful scripts

| Script | Does |
|---|---|
| `npm run dev` | Vite + API together |
| `npm run typecheck` | Typechecks frontend and server |
| `npm test` | `node --test` via tsx — covers the slot arithmetic |
| `npm run db:generate` | Generate a migration from schema changes |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Demo doctors and admin; idempotent |
| `npm run db:studio` | Drizzle Studio |
| `npm run db:up` / `db:down` | MySQL container up/down |

## Demo notes — what is real and what is not

**Real:** accounts with bcrypt-hashed passwords, JWT sessions in an httpOnly cookie, MySQL
persistence, per-user data isolation (verified: one account cannot read or modify
another's children), server-enforced age gate, and genuine AI analysis with IMCI
danger-sign screening.

Also real, and new with the doctor feature: doctor registration and admin verification;
weekly availability and the slots generated from it; booking, cancellation and the unique
index that makes double-booking impossible; the consent-gated child record; and clinical
notes. Suspending a doctor takes effect on their **next request**, not when their cookie
expires, because role and status are re-read from the database every time.

**Simulated:**
- **Doctor chat** — scripted replies, no clinician involved. It lives behind
  `services/chatService.ts`, whose signatures are already the ones a real API would have,
  so making it real is a change to that one file plus a `messages` table.
- **Voice call** — no WebRTC, no signalling; only the doctor being called is real.
- **Premium subscription ($2.99/mo)** — a boolean on the user, no payment processor.
  Emergencies deliberately bypass it.
- **Doctor ratings** — seeded numbers; there is no reviews table.
- Facility phone numbers and the seeded doctor profiles are demo data.

### What a doctor can and cannot see

A doctor's authority to read a child's record comes from exactly one place: an appointment
they hold with that child. The record is scoped to that **one child**, not the family; the
parent's consent is a per-appointment checkbox they can decline; and the read is a separate
handler from the parent-scoped queries so widening one can never widen the other. There is
no admin route anywhere that returns a child's name, a symptom string or a clinical note —
the admin console is a verification queue plus counters.

**Not yet done:** the danger-sign detection has had no clinical validation, and the Tetum
medical vocabulary has not been reviewed by a medical translator. Both are the first
funded milestone.

MédLab provides information only; it is not a substitute for professional medical advice.
