# MedBuddy - Connected Healthcare Platform

MedBuddy is a modern healthcare web application built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. Migrated from Figma Make / CareTrack, it connects patients, doctors, and clinic administrators across Nepal for medicine schedules, prescription scanning, health records, and follow-up management.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (tested with Node.js 24)
- npm, pnpm, or yarn

### Installation

Dependencies are already installed. If running in a fresh clone:

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

---

## 📁 Project Architecture & File Structure

```
MedBuddy/
├── public/
│   ├── favicon.png                 # App icon
│   └── prescription-nepal.png      # Nepali prescription sample image
├── src/
│   ├── app/                        # Next.js App Router routes & layouts
│   │   ├── layout.tsx              # Root HTML & body layout with Inter font
│   │   ├── globals.css             # Tailwind CSS & design system rules
│   │   ├── page.tsx                # Welcome & sign-in / role switcher page
│   │   ├── login/page.tsx          # Dedicated login page
│   │   ├── dashboard/page.tsx      # Patient dashboard & medication schedule
│   │   ├── scan/page.tsx           # Prescription scanner & schedule extractor
│   │   ├── records/page.tsx        # Medical records & lab reports gallery
│   │   ├── health-pass/page.tsx    # Patient QR Health Pass modal & download
│   │   ├── doctor/                 # Doctor Workspace
│   │   │   ├── layout.tsx          # Doctor portal shell & top bar
│   │   │   ├── page.tsx            # Redirects to /doctor/dashboard
│   │   │   ├── dashboard/page.tsx  # Appointments & clinical attention queue
│   │   │   ├── patient/page.tsx    # Patient clinical history & Rx builder
│   │   │   ├── scan/page.tsx       # QR code scanner for verified patient lookup
│   │   │   └── templates/page.tsx  # Reusable Rx prescription templates
│   │   └── admin/                  # Clinic Administration
│   │       ├── layout.tsx          # Admin portal shell
│   │       ├── page.tsx            # Redirects to /admin/overview
│   │       ├── overview/page.tsx   # Clinic metrics & appointments list
│   │       ├── follow-ups/page.tsx # Patient follow-up queue with status controls
│   │       ├── users/page.tsx      # People & access directory
│   │       └── verification/page.tsx # Doctor NMC verification & license reviews
│   ├── components/                 # Modular, reusable UI components
│   │   ├── common/
│   │   │   ├── Icon.tsx            # Full SVG icon library
│   │   │   ├── Logo.tsx            # MedBuddy brand logo
│   │   │   └── StatusPill.tsx      # Status indicators (Confirmed, Pending, etc.)
│   │   ├── patient/
│   │   │   ├── PatientSidebar.tsx  # Patient navigation sidebar
│   │   │   ├── PatientHeader.tsx   # Patient top header
│   │   │   ├── PatientShell.tsx    # Patient artboard shell layout
│   │   │   ├── Timing.tsx          # 1-0-1 dosage timing badge
│   │   │   ├── DocumentThumb.tsx   # Prescription / Lab / X-Ray graphics
│   │   │   ├── QRCode.tsx          # Vector procedural QR code generator
│   │   │   └── HealthPassModal.tsx # Downloadable QR pass modal dialog
│   │   ├── doctor/
│   │   │   ├── DoctorSidebar.tsx   # Doctor navigation sidebar
│   │   │   └── DoctorTopBar.tsx    # Doctor top search & notifications bar
│   │   └── admin/
│   │       ├── AdminSidebar.tsx    # Admin navigation sidebar
│   │       └── AdminHeader.tsx     # Admin header with notifications & avatar
│   └── types/
│       └── index.ts                # TypeScript interfaces and domain types
├── next.config.ts                  # Next.js configuration
├── postcss.config.mjs              # PostCSS configuration for Tailwind CSS
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Project metadata & scripts
```

---

## 🗺️ Route Mapping

| Route                 | View                     | Description                                                           |
| --------------------- | ------------------------ | --------------------------------------------------------------------- |
| `/` or `/login`       | **Welcome / Login**      | Role selector (`Patient`, `Doctor`, `Admin`) and sign in / sign up    |
| `/dashboard`          | **Patient Overview**     | Today's medicine schedule, weekly adherence chart, upcoming follow-up |
| `/scan`               | **Prescription Scanner** | Image viewer with zoom, Nepali prescription preview, schedule table   |
| `/records`            | **Medical Records**      | Filterable records (All, Prescriptions, Lab Reports, X-Rays)          |
| `/health-pass`        | **QR Health Pass**       | Verified emergency health pass with text download                     |
| `/doctor/dashboard`   | **Doctor Dashboard**     | Appointment stats, today's schedule, priority clinical alerts         |
| `/doctor/patient`     | **Clinical Record & Rx** | Patient context, active meds, and interactive Prescription Builder    |
| `/doctor/scan`        | **Doctor QR Lookup**     | Camera scanner interface and verified patient identity modal          |
| `/doctor/templates`   | **Rx Templates**         | Standard clinical regimens (Viral Fever, Gastritis, Post-Op, etc.)    |
| `/admin/overview`     | **Clinic Overview**      | Departmental stats and today's follow-up list                         |
| `/admin/follow-ups`   | **Follow-Up Queue**      | Patient coordination queue with interactive status confirmations      |
| `/admin/users`        | **User Directory**       | Searchable patient, doctor, and admin accounts with suspend/restore   |
| `/admin/verification` | **Doctor Verification**  | NMC registrations and license document approval workflow              |
