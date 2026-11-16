# MédLab — repository guide

> **Every change to this repository must update this file in the same commit.**
> A new table, route, component, service, environment variable, script or convention is
> described here *before* the work is considered done. This file is loaded as context by
> anyone — human or agent — picking the project up, so a stale `CLAUDE.md` is worse than
> no `CLAUDE.md`: it will be trusted.

---

## What this is

**Médiku Labarik (MédLab)** — a child-health demo for an EU-ASEAN SCOPE pitch, aimed at
Timor-Leste. Child-only: the adult exists purely as the account holder.

Three roles:

| Role | What they do |
|---|---|
| **parent** | Registers children, runs AI symptom checks, tracks EPI vaccinations, finds facilities, books doctors |
| **doctor** | Registers with a licence, waits for approval, publishes weekly hours, takes bookings, reads a booked child's record, writes a clinical note |
| **admin** | Approves / rejects / suspends doctor registrations, reads programme counters. Seed-only — no signup route can produce an admin |

## Demo, not product — what is real and what is not

The rule: anything a reviewer will **click** is real; anything they will only **watch** is
simulated. Do not "fix" the simulated parts as if they were bugs.

**Real (MySQL + API):** accounts and roles · doctor profiles, licences, specialties,
spoken languages, facility · admin verification · weekly availability and generated slots ·
booking, cancellation, completion · the consent-gated child record · clinical notes ·
programme counters.

**Simulated:**
- **Chat** — `services/chatService.ts`. State is in `sessionStorage`; the doctor's replies
  are scripted from `t.doctorTalk.cannedReplies`. Every function there is already async
  and already shaped like the eventual API, so making chat real is a change to that one
  file plus a `messages` table — no component above it changes. The file documents exactly
  what a real implementation needs.
- **Voice calls** — `components/DoctorCall.tsx`. No WebRTC, no signalling. Only the doctor
  being called is real.
- **Ratings** — `doctor_profiles.rating_avg` / `rating_count` are seeded numbers. There is
  no reviews table and no way to submit one.
- **The paywall** — `users.subscribed` is a boolean flipped by `POST /api/auth/subscribe`.
  No payment processor.

### How the paywall behaves

Doctor access is the premium feature, and there are **no bypasses**. An unsubscribed parent
sees `components/DoctorUpsell.tsx` where the directory would be: a real count and the
localised specialty, and deliberately nothing identifying — no names, photos, facilities,
phone numbers or ratings.

An `emergencyAlert` result does **not** reveal the list. Instead the red banner's primary
action, for *both* tiers, is the facility finder — free, and the right advice for a danger
sign. Subscribers get the call/chat button in addition to it, never instead of it. Do not
"restore" an emergency bypass here: it was removed on purpose.

The paywall returns the user wherever they were headed — back to the results screen with
the list revealed, or straight into the booking calendar — by carrying the destination in
the URL as `/subscribe?next=<encoded path>`, not in state. `handleSubscribe` navigates
there with `replace`, so Back never re-enters the paywall. `next` is sanitised to a
same-origin path (`//evil.com` is protocol-relative, not a route). Route new premium entry
points through `openPaywall('/path')`.

**The premium routes also deny in their own right.** `/doctors`, `/booking/:doctorId`,
`/chat/:doctorId` and `/call/:doctorId` re-check `subscribed` in the route guard and bounce
to the paywall. Before routing this was unnecessary — every entry point checked first, so
an unsubscribed parent could not reach the directory at all. A typeable URL removes that
funnel, and `DoctorDirectory` shows exactly the names, photos, facilities, phones and
ratings `DoctorUpsell` exists to withhold. Do not drop that guard when adding a route.

## Layout

Single repo, single origin. **There is no `src/` directory.**

Routing is `react-router-dom` v7 in **declarative `<Routes>` mode** — no
`createBrowserRouter`, no loaders or actions (data fetching stays in `services/`), and
therefore no `<ScrollRestoration>`. `<BrowserRouter>` is in `index.tsx`. Each role shell
owns its own route table and they share one path space, because **only one shell is ever
mounted**: `App.tsx` still branches on `user.role`, so the session decides which tree
exists and the URL never does.

```
App.tsx                  boot + session + theme + the role branch, nothing else
components/*.tsx         flat, PascalCase, one default-exported React.FC each
public/                  static assets, copied verbatim into dist/ by Vite (default
                         publicDir — vite.config.ts sets none) and served by
                         express.static ahead of the SPA catch-all. Holds the brand mark
services/*.ts            fetch wrapper + one client per domain
constants/*.ts           translations, vaccine schedule, facilities re-export
shared/                  types.ts + facilities.ts — imported by BOTH browser and server
server/src/              Express 5 API
  index.ts               router mounts; the /api 404 fallback must stay LAST, and in prod
                         the SPA catch-all sits after it and must stay GET-only
  env.ts db/ lib/ routes/ ai/
server/migrations/       drizzle-kit output
Dockerfile               two-stage production image (build → runtime), used by Dokploy
```

Vite proxies `/api` → `localhost:${API_PORT}` in dev; in production the same Express
process serves `dist/`. No CORS anywhere, by design.

## Running it

```bash
nvm use            # Node 22 — nvm's default here is 16 and will not work
npm ci
npm run db:up      # MySQL 8.4 in docker, host port 3307
npm run db:migrate
npm run db:seed
npm run dev        # vite :3000 + api :3001
```

| Script | |
|---|---|
| `db:generate` | edit `server/src/db/schema.ts` first, then generate, then `db:migrate`. Migrations are **not** applied at boot |
| `db:seed` | idempotent — safe to re-run |
| `db:studio` | drizzle studio |
| `test` | `node --test` via tsx. Only `server/src/lib/schedule.test.ts` exists |
| `typecheck` | runs **both** tsconfigs. Do this before calling anything done |

### Demo accounts

Password for every seeded account: **`medlab123`**

- `admin@medlab.tl` — admin
- `budi.santoso@medlab.tl` and five others — approved doctors with Mon–Fri hours
- `marcos.guterres@medlab.tl` — deliberately left **pending**, so the verification queue
  is not empty on stage. Do not approve him in the seed.

Parents are created through the UI; there are no seeded parent accounts.

## Deploying (Dokploy)

Deployed as **one Dokploy Application built from `Dockerfile`** plus a **separate Dokploy
MySQL 8.4 database**, both on `dokploy-network`. Push to `main` → GitHub webhook →
rebuild. `docker-compose.yml` is for local MySQL only and is never deployed.

The runtime image keeps the full `node_modules`, `server/src` and `server/migrations` so
`db:migrate` and `db:seed` can be run from the Dokploy terminal — that is deliberate, not
bloat. `SPA_DIR` is not needed: `/app/dist-server/server/src/index.js` resolves
`../../../dist` to `/app/dist` correctly.

| Setting | Value |
|---|---|
| Build type | Dockerfile, path `Dockerfile`, context `.` |
| Container port for the domain | `3001` |
| HTTPS | **required** — `issueSession` sets `secure: true` when `NODE_ENV=production`, so login silently fails over plain HTTP |
| `DATABASE_URL` | points at the Dokploy MySQL *internal* hostname on port **3306**, not 3307 |
| `AI_PROVIDER` | `opencode` or `dr7` — there is no Ollama on the VPS |
| `DR7_API_KEY` / `DR7_MODEL` | required when `AI_PROVIDER=dr7`; model defaults to `medgemma-4b-it` (multimodal). `DR7_BASE_URL` defaults to `https://dr7.ai/api/v1/medical`. `DR7_MAX_TOKENS` defaults to 2048 — dr7's silent default of 1000 truncates Tetum JSON while still reporting `finish_reason: stop` |
| `RUN_MIGRATIONS` | unset by default. Set to `true` for the one deploy carrying a schema change, then unset. Migrations are still never applied at boot by default |

## Conventions worth stating

These are unusual enough that new code gets them wrong by default.

- **Routing rules new code gets wrong by default.**
  1. **Object-valued route params are never refetched by id.** `/booking/:doctorId`,
     `/chat/:doctorId`, `/call/:doctorId` and `/consult/:appointmentId` need an object that
     lives in memory; the id is in the path only to keep the URL honest and to catch a
     hand-edited one. A cold deep link, a reload or a mismatched id redirects to the list.
  2. **Never `navigate(-1)`.** Every back target here is known. Ending a call *replaces*
     `/call` with `/chat`, so the previous entry is `/chat` too and `-1` would appear to do
     nothing; from a deep link it leaves the app entirely.
  3. **`element` props are constructed eagerly on every render of the shell**, including
     for routes that do not match. Anything dereferencing `profile` must sit behind a gate
     or inside a callback, and route wrapper components must live at **module scope** —
     defined inline they are a new component type each render, which remounts the child and
     would destroy an open chat thread.
  4. **The onboarding and doctor-approval gates render *instead of* `<Routes>`**, they are
     not URLs. `/setup` and `/pending` would imply navigability and would each need their
     own return-path plumbing; the early return keeps the target URL untouched, so
     finishing setup lands the parent where they were headed.
  5. Every shell ends with `<Route path="*">` → its home, which also self-heals a URL left
     over from another role in the same tab.
- **AI providers are a strategy map** in `server/src/ai/providers.ts`, keyed by
  `AI_PROVIDER` (`ollama` · `opencode` · `dr7`). Any OpenAI-compatible host goes through
  `openAiCompatible(name, cfg)` — add a config block in `env.ts` and one map entry, nothing
  else. Each instance negotiates its own structured-output mode (`json_schema` →
  `json_object` → prompt-only) once per process, reported by `/api/health`.
- **Services return result objects, they do not throw.** Anything a form can fail at
  returns `{status:'ok'|'error', reason}`; reads return plain values. `ApiError` is caught
  in the service layer, never at a component boundary.
- **`t: any` prop drilling.** Every screen takes `t` plus explicit callbacks. There is no
  i18n library and no context. **A missing key renders `undefined`, not a compile error** —
  which makes it the most likely source of a blank panel during a demo. Add all three
  locales (`en`, `tet`, `id`) **in the same edit** as the component that consumes them.
  The app defaults to Tetum.
- **`Language` ≠ `SpokenLanguage`.** `Language` is simultaneously the UI locale, the
  `consultations.language` enum and the AI prompt switch. Doctors speak Portuguese, which
  is not a MédLab locale — that is why `SpokenLanguage` is a separate union. Never widen
  `Language` to fit a doctor.
- **Error codes are snake_case strings** in `{ error: '…' }`. A resource the caller is not
  part of returns **404 `not_found`**, never 403 — consistent with `ownedChild`, and no
  existence leak.
- **Ownership is always re-derived server-side.** `ownedChild()` (`routes/children.ts`) for
  parents, `doctorAppointmentAccess()` (`lib/access.ts`) for doctors. A client-supplied
  filter is a client-supplied authorisation decision.
- **The logo swaps by Tailwind `dark:` class, not by the `darkMode` prop.**
  `components/Logo.tsx` renders *both* `public/medlab-light.png` and `public/medlab-dark.png`
  and hides one. It is not a `src` ternary, because `AuthScreen` renders before `ShellProps`
  exists in `App.tsx` and so never receives `darkMode` — the signed-out tree would need a new
  prop threaded through it for nothing. It is not `<picture>` / `prefers-color-scheme`
  either: dark mode here is a `.dark` class backed by `localStorage['medlab_dark_mode']`, so
  a media query follows the OS and desyncs the moment a user hits the header toggle. The
  favicon in `index.html` *does* use `prefers-color-scheme`, because a `<link rel=icon>` has
  no other option — that one really is OS-only and is not a bug.
- **Tailwind via CDN `<script>`** in `index.html`. No PostCSS, no build plugin, no CSS
  files at all. Repeated class strings are hoisted to file-local consts.
  `animate-fade-in` / `animate-shake` are used everywhere and **defined nowhere** — they
  are inert. Copying them is harmless.
- **Forms are manual** — one `useState` per field, no react-hook-form, no client-side zod
  (zod is server-only).
- **Drizzle style:** `char(36)` UUID PKs, snake_case columns, indexes returned as an array
  from `(t) => [...]`, FKs `onDelete: 'cascade'`, `date(..., {mode:'string'})`.
- **Server imports carry explicit `.js` extensions** (NodeNext ESM), including across the
  boundary: `import type { … } from '../../../shared/types.js'`.
- **Express 5:** `/api/doctors/me*` must be declared **before** `/api/doctors/:id`, or
  `:id` captures the literal `"me"`. `req.params.x` is typed `string | string[]` — wrap in
  `String()`.

## Auth and roles

JWT (`{sub}` only) in an httpOnly cookie `medlab_session`, bcrypt password hashes.

**Role and subscription are re-read from the database on every request, never carried in
the JWT.** A role claim in a 7-day cookie is a 7-day stale capability; an admin suspending
a doctor must take effect on that doctor's next call. Guards compose in
`server/src/lib/auth.ts`:

```ts
requireAnyUser        = [requireAuth, loadUser]
requireParent         = [...,  requireRole('parent')]
requireDoctorAccount  = [...,  requireRole('doctor')]                      // pending doctors too
requireDoctor         = [...requireDoctorAccount, loadApprovedDoctor]      // approved only
requireAdmin          = [...,  requireRole('admin')]
requireSubscribed                                                          // the paywall, server-side
```

Pass these to a route with a **spread** (`router.get('/x', ...requireAnyUser, handler)`) —
Express's types do not infer handler params from an array argument.

## The security core: what lets a doctor read a child

`GET /api/appointments/:id/child-record` is the only place a doctor reads someone else's
child. All of these hold, and all are enforced in `server/src/lib/access.ts`:

1. The appointment must exist **and** have `doctor_id = req.userId`.
2. `appointments.shares_history` must be true — consent is **per appointment**, ticked by
   the parent at booking time. Not per doctor, not per account, re-read every request.
3. The record is scoped to `appointment.child_id`, **never** `parent_id`. A parent with
   four children who books for one exposes exactly one.
4. It is a **separate handler**, not a widened parent query. `GET /api/consultations/:id`
   keeps its `userId = req.userId` filter forever. Widening an ownership filter to
   "mine OR some doctor condition" is how these bugs get introduced.
5. Writing a clinical note goes through the same gate as reading.
6. Admin routes touch `users`, `doctor_profiles` and aggregate counts only. **No admin
   route returns a child's name, a symptom string, or a consultation body.**

## Time and slots

`server/src/lib/schedule.ts`. **Asia/Dili is UTC+9 all year with no daylight saving,
ever**, so the entire timezone story is one constant. Availability rules are stored as
weekday + minutes-from-midnight in Dili wall-clock; slots are emitted as absolute UTC ISO
instants and rendered by the browser.

**Never call `getDay()` or `getHours()` on the server** — they read the container's
timezone. The file deliberately contains neither.

Slots are **computed on read, never materialised**: there is no cron or job runner in this
repo, so a materialised table would go stale the moment a doctor edits their hours. The
returned slot list is a UI convenience — `POST /api/appointments` re-derives it
server-side, and the unique index on `(doctor_id, starts_at)` is the final arbiter of
double-booking. Cancelling **deletes** the row, which frees the slot again.

`expandSlots` is pure and is the one thing in the repo with unit tests. Keep it that way.

## Database

`users` (+ `role`) · `children` · `child_vaccinations` · `consultations` ·
`consultation_conditions` · `doctor_profiles` · `doctor_availability_rules` ·
`appointments` · `clinical_notes`

Constraints that carry real weight:

| Index | Why |
|---|---|
| `appt_doctor_slot_unq (doctor_id, starts_at)` | the only thing that actually prevents double-booking under concurrency |
| `doctor_license_unq` | one licence, one account |
| `note_appointment_unq` | one note per appointment, so the write endpoint is an upsert |
| `availability_rule_unq` | makes the replace-all availability PUT idempotent |

`server/src/db/index.ts` sets `timezone: 'Z'` on the pool. Without it mysql2 converts
`TIMESTAMP` using the *process* timezone and the same appointment reads differently in a
UTC container and on a UTC+9 laptop.

## Client routes

One path space, one shell mounted at a time. `/about` and `/faq` exist in both the parent
and doctor tables and render that shell's own version.

```
parent   /  ·  /about  ·  /faq  ·  /profile  ·  /checker  ·  /vaccines  ·  /facilities
         /appointments  ·  /subscribe?next=
         /doctors  ·  /booking/:doctorId  ·  /chat/:doctorId  ·  /call/:doctorId   ← premium
doctor   /  ·  /about  ·  /faq  ·  /availability  ·  /schedule  ·  /consult/:appointmentId
admin    /verification  ·  /stats            (/ redirects to /verification)
every shell  *  →  its home, replace
```

`/checker` is **one route with two faces**: the form, and the results once `status` is
`SUCCESS`. `status` and `result` stay in memory — a `/checker/results` URL could not be
restored without re-running the AI analysis, so do not add one. This works because
`ParentApp` is mounted by the role branch rather than by a route, so moving between paths
never unmounts it and an analysis survives a trip to the facility finder and back.

Client route names must not collide with anything in `dist/` (`assets/`, plus everything
copied out of `public/` — currently `medlab-light.png` and `medlab-dark.png`), which
`express.static` serves before the catch-all.

## API surface

```
GET    /api/health
       /api/auth      POST signup · signup/doctor · login · logout · subscribe   GET me
       /api/children  GET · POST · PUT (bulk) · PUT/DELETE /:id · vaccinations
       /api/consultations  POST analyze · POST translate · GET · GET /:id
       /api/doctors   GET /me · PUT /me · GET|PUT /me/availability
                      GET / (?specialty=&language=) · GET /:id · GET /:id/slots
       /api/appointments  POST · GET (?scope=) · GET /:id · DELETE /:id
                          POST /:id/complete · GET /:id/child-record · PUT /:id/note
       /api/admin     GET doctors (?status=) · POST doctors/:id/{approve,reject,suspend}
                      GET stats
```

## Known debt

1. **The root `tsconfig.json` is not strict** (only `server/tsconfig.json` is). The whole
   frontend therefore gets none of the safety the routes get; implicit `any` passes
   silently. Turning it on will surface dozens of pre-existing errors — worth doing, but
   as its own change, not folded into a feature.
2. **No ESLint config and no CI**, despite `eslint-disable` comments in the tree.
3. **One test file.** `expandSlots` is covered; nothing else is.
4. `requireSubscribed` guards `POST /api/appointments` only. **`GET /api/doctors`,
   `/:id` and `/:id/slots` are open to any signed-in user**, so hiding the directory from
   unsubscribed parents is a product boundary, not a security one — the data is one fetch
   away. Booking itself is genuinely enforced. Closing this means adding `requireSubscribed`
   to those three routes and giving the teaser a count-only endpoint to call instead. The
   client-side `Premium` route guard is the same kind of boundary — product, not security.
5. **Deep links to `/booking`, `/chat`, `/call` and `/consult` redirect to their list**
   rather than restoring, because the object they need is only in memory. Making them
   genuinely refresh-proof means refetching by id in those four components, using the
   existing `GET /api/doctors/:id` and `GET /api/appointments/:id`, plus a loading and a
   not-found state for each.
