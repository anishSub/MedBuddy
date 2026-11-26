# MedBuddy — Presentation

## Slide 1 — Title

- **MedBuddy** — healthcare platform for patients, doctors, and clinic admins
- Context: Nepal (domestic healthcare coordination)

## Slide 2 — The Problem

- Patients lack a single place for records, prescriptions, and visits
- Medication adherence is hard to track manually
- Emergency access to numbers / hospitals is fragmented
- Doctor workflows (templates, patient context, follow-ups) live outside the patient flow

## Slide 3 — The Solution

- One app covering the full care loop: book → consult → prescribe → track → records → emergency

## Slide 4 — Patient Features

- Dashboard (adherence, upcoming visits, follow-up)
- Medical Records (prescriptions, lab reports, X-rays) with illustrated cards
- Medicine Tracker (morning/afternoon/night slots)
- Appointment booking (doctor, free slot, call type, date/time, confirm)
- QR Health Pass
- Emergency numbers (ambulance, hospitals, emergency line, caretaker office) + Call Now buttons

## Slide 5 — Doctor Features

- Dashboard (appointments, stats)
- Patient page (clinical context, active meds, records, Rx builder, templates)
- Templates (treatment plans, apply to patient)
- Scan (patient code → context)
- Messages (consultation booking from chat)
- Appointments / analytics

## Slide 6 — Admin Features

- Overview, Users, Verification, Follow-ups, Analytics

## Slide 7 — Tech Stack

- Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS v4
- Supabase (Postgres + REST) for data
- npm; ESLint + Prettier + Husky (pre-commit) + GitHub Actions CI

## Slide 8 — Architecture & Data

- Two data layers: `AuthContext` (session) + `services` (Supabase queries)
- `supabase/schema.sql` + `seed.sql`; RLS present but permissive
- Mock/demo fallbacks in pages; booking currently UI-state only

## Slide 9 — Current Status

- Live DB seeded and applied
- Booking moved from appointments page to dedicated `/book-appointment` page
- Medical record card images now use real medical photos
- Emergency cards now offer direct "Call Now"
- CI (lint, format, typecheck, build) + pre-commit hooks in place
