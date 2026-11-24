# AGENTS.md — MedBuddy

Rules for any AI agent working in this repository. Read this before editing.

This is a **small project** (39 source files, 1 package). The goal is correct, minimal change — not impressive-sounding output.

---

## 1. What this project actually is

Healthcare web app for patients, doctors, and clinic admins (Nepal context).

| Fact | Value |
|---|---|
| Framework | Next.js 15, App Router (`src/app`) |
| React | 19 |
| Language | TypeScript, `strict: true` |
| Styling | Tailwind CSS v4 (CSS-first: `@import "tailwindcss"` in `globals.css`) |
| Data | Supabase JS v2 (`@supabase/supabase-js`) |
| Package manager | npm (single package, no workspaces) |
| Import alias | `@/*` → `./src/*` |
| Source files | 39 under `src/` |

### Commands that exist

```bash
npm run dev     # next dev
npm run build   # next build
npm start       # next start
```

**There is no linter, no formatter, and no test runner.** `npm run lint` and `npm test` do not exist. Never run them. Never tell the user to run them. If you need to verify code, use `npx tsc --noEmit` (TypeScript is installed) and `npm run build`.

---

## 2. Anti-hallucination rules (highest priority)

These rules exist because this codebase contains plausible-looking traps (see §4). Violating them is a bug.

### R1 — Never describe code you have not read in this session
Before saying a file, route, component, export, table, or column exists, open it. When you report a fact, cite it: `src/lib/supabase/client.ts:3`.

Do **not** infer that a file exists because the README says so. `README.md` is out of date on at least one point (it does not mention `src/context/AuthContext.tsx`). The filesystem is the source of truth.

### R2 — Never invent scripts, dependencies, env vars, or routes
- Scripts and deps: verify in `package.json`.
- Env vars: verify in `.env.local.example` and by `grep -rn "process.env" src`.
- Routes: verify with `find src/app -name "page.tsx"`.

If it is not there, it does not exist. Say so plainly.

### R3 — Report reality, not expectation
- Quote command output as it happened. If a command failed, say it failed and paste the error.
- If you did not run a command, say **"not run"**. Never imply verification you did not perform.
- Never claim "the build passes", "types check", or "the DB works" without having run it in this session.

### R4 — Distinguish real data from mock data, every time
Most page bodies currently render **hardcoded arrays** (e.g. `src/app/dashboard/page.tsx:8` defines `medicineGroups` as a literal). When describing behavior, say "hardcoded mock data", not "loads the patient's medications".

Conversely, do not claim a page is mocked if it reads from `useAuth()`.

### R5 — Say "I don't know" instead of guessing
If unsure which library version behaves how, stop and check `node_modules/@supabase/supabase-js/package.json` or the docs. A short "I don't know, let me check" is always better than a confident wrong answer.

### R6 — No invented history or intent
Do not write comments, commit messages, or PR notes inventing reasons for code ("added for HIPAA compliance") unless you can point to where that is stated. There are **no git commits yet** in this repo.

### R7 — Keep `AGENTS.md` honest
If a rule here becomes false (e.g. you add a test runner), update this file in the same change.

---

## 3. Scope discipline (this is a small project)

- **Do not add dependencies** without asking. The dependency list is deliberately tiny.
- **Do not refactor what you were not asked to touch.** No renaming, reformatting, or "while I'm here" cleanup.
- **No speculative abstraction.** No generic `<DataTable>`, no repository layer, no state library, no `utils/` folder for one function.
- **Prefer editing an existing file** over creating a new one.
- **Match existing style**: small `'use client'` page files, literal mock arrays at module scope, components in `src/components/{patient,doctor,admin,common}`.
- If a request is ambiguous, ask one short question rather than building the wrong thing.

---

## 4. Known traps in this codebase

Read this section before touching data code. These are real, current-state issues — not hypotheticals.

### 4.1 The live database is applied and seeded
Project `rgazcagnqduocafubkxp`: URL and publishable key are valid. `schema.sql` and `seed.sql` were applied in the Supabase SQL Editor. Verified via REST on 2026-11-24: all 10 tables return 200.

Expected row counts: profiles 16, patient_details 7, doctor_details 8, prescriptions 1, medications 4, medication_logs 0, medical_records 6, appointments 7, rx_templates 5, audit_logs 0.

If a table returns `404 PGRST205`, the schema was not applied to that project — say so, do not assume it is a code bug. Re-verify with:

```bash
curl "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/profiles?select=*&limit=1" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

`seed.sql` is now idempotent (stable IDs + `ON CONFLICT (id) DO NOTHING` on appointments and rx_templates). RLS is still permissive — see §4.5.

### 4.2 Two data layers, both live
- `src/context/AuthContext.tsx` — login, profile, session. Used by `src/app/layout.tsx` and `src/app/page.tsx`.
- `src/lib/supabase/services.ts` (447 lines, 4 service objects) — **no longer dead code**. Imported as `patientService` by `src/app/dashboard/page.tsx:7` and `src/app/scan/page.tsx:9`.

This changed during development. Re-check before claiming either is unused:

```bash
grep -rn "lib/supabase/services" src
```

### 4.3 Fake fallback numbers
Several places return invented data when the DB is empty or unreachable. Do not mistake these for real values:

| Location | Fake behavior |
|---|---|
| `services.ts:369-372` | `scheduled \|\| 24`, `confirmed \|\| 18`, `reschedule \|\| 3`, `pendingDoctors \|\| 2` |
| `AuthContext.tsx:73` | Hardcoded patient code `CT-2048` |
| `AuthContext.tsx:95` | Hardcoded doctor detail `NMC 18422` / `Confirmed` |
| `AuthContext.tsx:121` | Default profile id `a0000000-0000-0000-0000-000000000001` |

When you touch this, say clearly whether you removed, kept, or relied on the fallback.

### 4.4 Two different type modules — do not mix them
- `src/types/index.ts` — **UI** types (`IconName`, `MedicineScheduleItem`, `DocumentItem`, …), imported as `@/types`.
- `src/lib/supabase/types.ts` — **DB** types (`Json`, enums like `UserRole`, `AppointmentStatus`).
- `services.ts` imports enums from `./types`; `AuthContext.tsx` imports `UserRole` from `@/types`.

`UserRole`, `AccountStatus`, and `AppointmentStatus` are duplicated in both files. If you change an enum, check **both** — a mismatch already broke the build once (`dashboard/page.tsx` imported `AppointmentStatus` from `@/types` before it was exported there).

### 4.5 Auth is not real auth
Login is **phone-number lookup/insert into `profiles`**, not Supabase Auth. Session lives in `localStorage['medbuddy_user']`. There is no `auth.users` usage, no password, no JWT. RLS is enabled (`schema.sql:190-199`) but the policies are permissive (`schema.sql:213`: `FOR ALL USING (true)`).

Do not describe this as secure, authenticated, or production-ready.

### 4.6 Stale Supabase fallback
`src/lib/supabase/client.ts:3-6` falls back to a **different** project (`txulntnihkqvscxknoei`) with a legacy anon JWT. It is dead code when `.env.local` is present, but it is a real trap: a missing env var would silently hit the wrong database. Known issue — flagged, not yet fixed.

### 4.7 README drift
`README.md` omits `src/context/`, `src/lib/`, and `supabase/`. Treat it as a rough overview, never as a file listing.

---

## 5. Data & schema rules

- Source of truth for schema: `supabase/schema.sql` (215 lines). Seed data: `supabase/seed.sql` (100 lines).
- **Never invent a column.** Verify with `grep -n "" supabase/schema.sql` before referencing one.
- Columns that are easy to get wrong:
  - `profiles` has **no** `email`, **no** `password`. `phone` is `UNIQUE NOT NULL`.
  - `patient_details` has `weekly_adherence`, not `adherence`.
  - `medication_logs` is unique on `(medication_id, log_date, slot_time)` — the upsert in `services.ts:145` depends on this exact triple.
  - `medications` has separate `morning` / `afternoon` / `night` booleans, not a timing string.
- Enum values are case-sensitive and capitalised: `'Patient' | 'Doctor' | 'Admin'`, `'Active' | 'Pending' | 'Suspended'`, `'Confirmed' | 'Pending' | 'Reschedule Requested' | 'Checked in' | 'Completed' | 'Next'`.
- Foreign-key hint strings in `.select()` calls (e.g. `profiles!patient_details_profile_id_fkey`) must match constraints in `schema.sql` exactly.

## 6. Env rules

`.env.local` (git-ignored) currently holds:

```
NEXT_PUBLIC_SUPABASE_URL=https://rgazcagnqduocafubkxp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...   # new publishable key format
```

- Never commit, print, or paste these values into code or docs.
- Only `NEXT_PUBLIC_*` vars are safe for the browser. A secret key must never appear in `src/`.
- If you add an env var, add it to `.env.local.example` too.
- The `/rest/v1/` OpenAPI root returns `401 Secret API key required` with a publishable key. That is expected; it is not a broken connection.

## 7. Definition of done

Before you claim a task is complete:

1. You ran `npx tsc --noEmit` (or `npm run build`) and are quoting the real result.
2. Every file path you mention was read or listed in this session.
3. You stated clearly whether data is real or mock, and whether the DB actually has tables.
4. No new dependency, no unrelated edits, no invented API.
5. If you changed behavior that this file describes, you updated this file.
