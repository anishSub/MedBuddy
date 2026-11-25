
Product Requirements Document
MedBuddy
Document ID PRD-001
Version 1.0 (Bootcamp MVP)
Status Ready for Development
Team Team 4 — CODE Bootcamp Pokhara (Leapfrog Connect)
Target Platform Responsive Web Application (Desktop & Mobile Browser)
Core Tech Stack React (Frontend), Node.js / Express (Backend), Relational Database (PostgreSQL /
MySQL), AI Vision/LLM API for Prescription Parsing

1. Executive Summary & Problem Statement
   Overview
   MedBuddy is a role-based healthcare web application that bridges the gap between clinical
   consultations and daily home medication adherence. It connects Patients, Doctors, and Clinic Admins
   in a single closed-loop workflow—turning paper or digital prescriptions into automated daily medicine
   reminders, trackable adherence logs, and confirmed follow-up visits.
   Problem Statement
   Patients visiting local clinics and outpatient departments in Nepal struggle to consistently follow
   multi-drug prescriptions and attend scheduled follow-ups because medical records, handwritten
   prescription slips, and dosage schedules (1-0-1, pre/post-meal rules) are scattered across
   unorganized paper documents with no automated tracking or reminder system. Meanwhile, doctors
   lack visibility into whether patients actually took their prescribed doses between visits, and clinic
   admins face unpredictable no-shows.
2. Goals & Non-Goals (Scope Firewall)
   MVP Goals (In Scope)
   • Unified Role-Based Access: Enable seamless authentication and permission separation across
   Patient, Doctor, and Admin roles.
   • Zero-Friction Prescription Digitization: Support both rapid doctor-side prescription creation (via
   reusable templates) and patient-side “Snap-to-Schedule” AI extraction from uploaded paper
   prescription photos.
   • Closed-Loop Reminders & Follow-Ups: Deliver interactive medicine reminders (Taken / Missed)
   and automated follow-up alerts (Confirm Visit / Request Reschedule) that update doctor and
   admin views in real time.
   MedBuddy — PRD-001 v1.0 (Bootcamp MVP) Page 1
   • Instant Clinic Lookup: Provide every patient with a unique QR Health Card and categorized
   medical attachment gallery for instant record retrieval at clinics.
   Non-Goals (Explicitly Out of Scope for v1)
   • Online payment gateways, clinic billing, or insurance claim processing.
   • Pharmacy inventory management or direct medicine e-commerce delivery.
   • Native iOS/Android mobile binaries (delivered strictly as a mobile-responsive web app).
   • Third-party hospital LIS/RIS lab machine integrations or offline-first local database sync.
   • Automated SMS/WhatsApp telecom gateway billing (notifications will run via Web Push and in-app
   real-time notification feeds for reliable MVP execution).
3. Target Users & Roles
   Role Primary Persona Core Responsibility & Context
   Patient (Primary
   User)
   Outpatient or family caregiver
   managing prescriptions for
   themselves or elderly parents via
   smartphone/laptop browser.
   Uploads prescription photos, tracks daily doses
   (Morning / Afternoon / Night), manages family
   sub-profiles, shares QR Health Card at clinic visits,
   and confirms follow-ups.
   Doctor Clinic physician managing 15–40
   outpatient consultations daily on a
   desktop or tablet browser.
   Scans patient QR codes, reviews adherence rates
   and past lab/prescription photos, issues structured
   prescriptions using quick templates, and sets
   follow-up dates.
   Admin Clinic receptionist or operations
   coordinator on a desktop browser.
   Verifies newly registered doctor accounts, monitors
   daily confirmed vs. rescheduled follow-up queues,
   and assists with patient check-ins.
4. User Stories & Acceptance Criteria
   Epic 1: Authentication, Roles & Patient Identity
   US-1.1 (Role Auth)
   As a new user, I want to sign up and log in as a Patient, Doctor, or Admin so that I only access tools
   and records relevant to my role.
   Acceptance Criteria: System issues role-scoped session tokens; unverified doctors see a “Pending Admin
   Verification” state before issuing prescriptions.
   US-1.2 (Caregiver / Family Mode)
   As a patient caring for elderly parents, I want to add and switch between family member profiles
   under one login so I can track their medicines and receive their reminders.
   Acceptance Criteria: Top navigation switcher toggles active profile context (Self, Dad, Mom), updating the
   visible schedule, QR card, and records immediately.
   US-1.3 (QR Health Card)
   As a patient arriving at a clinic, I want to display a unique QR code containing my Patient ID and
   emergency medical summary (blood group, allergies) so the doctor or admin can open my chart
   immediately.
   MedBuddy — PRD-001 v1.0 (Bootcamp MVP) Page 2
   Acceptance Criteria: Scanning or entering the encoded Patient ID redirects an authenticated Doctor/Admin
   directly to that patient’s clinical record.
   Epic 2: Records & “Snap-to-Schedule” Prescriptions
   US-2.1 (Categorized Photo Gallery)
   As a patient or doctor, I want to upload images categorized as Handwritten Prescription, Lab Report,
   or X-Ray with dates and notes so medical history is organized chronologically.
   Acceptance Criteria: Files upload to cloud/server storage via Node.js, store metadata + photo_url, and filter
   cleanly by category tag.
   US-2.2 (AI Snap-to-Schedule — Patient Path)
   As a patient with a handwritten paper prescription, I want to upload its photo and have the system
   automatically extract medicine names, dosages, timings (1-0-1), and durations so I don’t have to type
   them manually.
   Acceptance Criteria: Uploading an image returns structured JSON rows within 5 seconds; user can edit any
   field and click “Activate Reminders” to generate daily dose schedules.
   US-2.3 (Template Prescription Builder — Doctor Path)
   As a doctor, I want to select a preset regimen (e.g., Viral Fever 1-0-1, Post-Op Antibiotics), customize
   timings (Before/After Meal) and follow-up date, and submit it directly to the patient’s account.
   Acceptance Criteria: Submitting immediately populates the patient’s active medication timeline and
   schedules their follow-up reminder.
   Epic 3: Closed-Loop Reminders & Clinic Queue
   US-3.1 (Interactive Medicine Reminders)
   As a patient, I want to receive timely reminders for Morning, Afternoon, and Night doses with a 1-tap
   Mark as Taken button so I stay on track.
   Acceptance Criteria: Tapping Mark as Taken logs a timestamped DoseLog entry and recalculates the
   patient’s adherence percentage in real time.
   US-3.2 (Smart Follow-Up Confirmation)
   As a patient nearing the end of a prescription, I want to receive a follow-up reminder notification with
   Confirm Visit and Request Reschedule actions.
   Acceptance Criteria: Selecting an action updates the appointment status on the Admin’s live clinic queue
   immediately.
   US-3.3 (Admin Clinic & Doctor Management)
   As a clinic admin, I want to view today’s follow-up statuses and approve newly registered doctors so
   clinic operations run smoothly.
   Acceptance Criteria: Admin can filter follow-ups by Confirmed, Pending, or Reschedule Requested, and
   toggle doctor verification status with one click.
   MedBuddy — PRD-001 v1.0 (Bootcamp MVP) Page 3
   ID Module Requirement Specification
   FR-01 Auth & RBAC The system shall support registration and login with strict role-based access
   control (patient, doctor, admin).
   FR-02 Family Profiles A patient account shall support creating multiple dependent profiles linked to
   the primary account ID.
   FR-03 QR Lookup The system shall generate a unique QR code per patient profile and resolve
   scanned/searched IDs to patient clinical records.
   FR-04 Media Gallery The system shall accept image uploads (JPG, PNG, WEBP up to 10MB), store
   photo_url links, and tag records by type (Prescription, Lab Report, X-Ray).
   FR-05 AI Rx Parser The Node.js backend shall process uploaded prescription images via a
   multimodal LLM API and return structured fields (medicine_name, dosage,
   timing_pattern, meal_instruction, duration_days).
   FR-06 Rx Templates Doctors shall be able to load pre-configured prescription templates and assign
   customized schedules and follow-up dates to any patient.
   FR-07 Dose Tracking The system shall generate daily dose slots from active prescriptions and
   calculate Adherence % = (Taken Doses / Total Scheduled Doses) × 100.
   FR-08 Follow-Up Loop The system shall trigger follow-up notifications 24 hours prior to scheduled
   dates and sync Confirmed / Reschedule responses to the Admin dashboard.
   Entity Fields
   Users id, name, email_or_phone, password_hash, role (patient | doctor | admin), is_verified
   (boolean for doctors), nmc_number (nullable)
   PatientProfiles id, account_user_id (FK to Users), full_name, relation (Self | Parent | Child),
   blood_group, allergies, emergency_contact, qr_token
   MedicalRecords id, patient_profile_id (FK), uploaded_by_user_id (FK), category (Prescription | Lab
   Report | X-Ray), photo_url, notes, record_date
   Prescriptions id, patient_profile_id (FK), doctor_user_id (FK, nullable if AI-scanned), source_type
   (doctor_issued | ai_scanned), status (active | completed), created_at
   PrescriptionItems id, prescription_id (FK), medicine_name, dosage, morning (bool), afternoon (bool),
   night (bool), meal_rule (before | after), duration_days
   DoseLogs id, prescription_item_id (FK), scheduled_time, status (pending | taken | missed),
   logged_at
   FollowUps id, patient_profile_id (FK), doctor_user_id (FK), scheduled_date, status (pending |
   confirmed | reschedule_requested), notes
5. Functional Requirements Summary
6. High-Level Data Model (Entity Overview)
   To keep the React + Node.js implementation clean, structure the database around these 6 core
   entities:
   MedBuddy — PRD-001 v1.0 (Bootcamp MVP) Page 4
   Note: PrescriptionItems and DoseLogs are grouped as one core entity pair, giving six entity groups in total.
7. Non-Functional Requirements & Guardrails
   • Performance: Standard API responses (GET records, POST dose logs) must complete in <
   400ms; AI prescription image parsing must complete or display progressive loading feedback
   within < 6 seconds.
   • Security & Privacy: Passwords hashed via bcrypt; JWT authentication on all protected routes;
   role middleware verifying that patients can only view profiles linked to their own account and
   doctors can only access records via valid lookup/assignment.
   • Usability & Accessibility: High-contrast clinical UI (#0F172A on #FFFFFF), minimum 16px body
   font for medicine instructions, and clear visual timing badges (1-0-1) readable by elderly patients.
   • Reliability (Demo Safety): If the external AI vision API experiences latency or rate limits during a
   live demo, provide a fallback sample prescription parser response so the end-to-end demo never
   stalls.
8. Bootcamp Execution Timeline & Success Metrics
   Suggested Build Milestones
   Day Milestone
   Day 1 Finalize Team Spec, Figma web wireframes, database schema, and role-based auth (Patient /
   Doctor / Admin).
   Day 2 Build Patient Profile/Caregiver switcher, QR Health Card generator/scanner, and Categorized
   Photo Record upload (photo_url).
   Day 3 Implement Doctor Prescription Builder (with templates) + AI “Snap-to-Schedule” prescription
   parser endpoint.
   Day 4 Build Interactive Medicine Timeline (Mark as Taken), Adherence calculation, and Follow-Up
   Confirmation loop (Admin & Patient sync).
   Day 5 End-to-end QA testing across all 3 roles, seed realistic demo data (Pokhara clinic scenario), and
   rehearse 3-minute live pitch.
   Success Metrics (MVP Validation)
   • Onboarding Speed: A first-time user can register, digitize a prescription (via AI snap or doctor
   template), and activate reminders in < 3 minutes.
   • Clinic Lookup Speed: Doctor/Admin pulls up a patient’s full medical history and active
   medications via QR scan in < 5 seconds.
   • End-to-End Demo Completion: 100% live execution across all three portals (Patient → Doctor →
   Admin) without manual database intervention.
   MedBuddy — PRD-001 v1.0 (Bootcamp MVP) Page 5
