# DATA.md — MedBuddy Seeded Data Reference

Random-data reference for development, generated from the **live Supabase database** on 2026-11-24 via the REST API (not transcribed from `seed.sql`). Use these IDs to test logins, lookups, and mutations.

Project: `https://rgazcagnqduocafubkxp.supabase.co`

## Counts (expected)

| Table           | Rows |
| --------------- | ---- |
| profiles        | 16   |
| patient_details | 7    |
| doctor_details  | 8    |
| prescriptions   | 1    |
| medications     | 4    |
| medication_logs | 0    |
| medical_records | 6    |
| appointments    | 7    |
| rx_templates    | 5    |
| audit_logs      | 0    |

## Important: stable IDs vs. generated IDs

`profiles`, `patient_details`, `doctor_details`, `prescriptions`, `medications`, and `medical_records` use **stable, human-readable UUIDs** that match `seed.sql` exactly.

`doctor_details.id`, `appointments.id`, and `rx_templates.id` are **randomly generated** (the seed inserts did not specify IDs). The values below are the actual live IDs. They will change if the database is reset and re-seeded.

⚠️ `supabase/seed.sql` was edited to use stable IDs for appointments (`90000000-…`) and rx_templates (`91000000-…`) so re-runs are safe. **Do not re-run that updated seed against the current database** — it would insert 12 extra rows, because the live rows still have the original random IDs. The current live database is already clean (7 appointments, 5 templates).

## Demo accounts

Login is phone-based, not Supabase Auth. The login form looks up `phone` in `profiles` and checks a derived demo password (see `AuthContext.tsx`). Password rule: **first name + `@123`**, ignoring a leading `Dr.` (e.g. `Ramesh@123`, `Sushil@123`). Use the full phone values below.

⚠️ This check runs in the browser only — it is a demo gate, not real authentication. The password is not stored in the database.

### Patients

| Profile ID                             | Name          | Patient code | Phone               | Password     | Status    |
| -------------------------------------- | ------------- | ------------ | ------------------- | ------------ | --------- |
| `a0000000-0000-0000-0000-000000000001` | Ramesh Sharma | CT-2048      | `+977 981-234-5678` | `Ramesh@123` | Active    |
| `a0000000-0000-0000-0000-000000000002` | Maya Gurung   | CT-1987      | `+977 984-625-0198` | `Maya@123`   | Active    |
| `a0000000-0000-0000-0000-000000000003` | Bikash Thapa  | CT-2186      | `+977 986-315-7610` | `Bikash@123` | Suspended |
| `a0000000-0000-0000-0000-000000000004` | Sita Rai      | CT-1934      | `+977 981-998-1122` | `Sita@123`   | Active    |
| `a0000000-0000-0000-0000-000000000005` | Kiran Lama    | CT-2231      | `+977 984-112-9988` | `Kiran@123`  | Active    |
| `a0000000-0000-0000-0000-000000000006` | Anu Maharjan  | CT-2076      | `+977 980-334-7766` | `Anu@123`    | Active    |
| `a0000000-0000-0000-0000-000000000007` | Nabin KC      | CT-1812      | `+977 986-554-3321` | `Nabin@123`  | Active    |

The default demo session in `AuthContext.tsx:121` is Ramesh Sharma (`a0000000-…-0001`, CT-2048).

### Doctors

| Profile ID                             | Name                 | Phone               | Password     | Status  | doctor_details.id                      |
| -------------------------------------- | -------------------- | ------------------- | ------------ | ------- | -------------------------------------- |
| `b0000000-0000-0000-0000-000000000001` | Dr. Sushil Adhikari  | `+977 980-112-4482` | `Sushil@123` | Active  | `d83821ba-c3ca-48db-80c5-289b1e6c3193` |
| `b0000000-0000-0000-0000-000000000002` | Dr. Anjali Karki     | `+977 985-018-4431` | `Anjali@123` | Active  | `fa385977-910b-4eb6-9039-ae4cbd7274da` |
| `b0000000-0000-0000-0000-000000000003` | Dr. Bimal Shrestha   | `+977 981-554-9988` | `Bimal@123`  | Active  | `dfe20bbb-1efa-48df-86ed-8bc2b2ff46cd` |
| `b0000000-0000-0000-0000-000000000004` | Dr. Pratik Manandhar | `+977 981-776-8304` | `Pratik@123` | Pending | `85833693-689a-4464-87db-f2a03d3f0d93` |
| `b0000000-0000-0000-0000-000000000005` | Dr. Sneha Poudel     | `+977 980-332-1199` | `Sneha@123`  | Pending | `08b52d2f-049f-49f1-a34f-85ff1a346e48` |
| `b0000000-0000-0000-0000-000000000006` | Dr. Aayush Shahi     | `+977 984-889-2233` | `Aayush@123` | Pending | `e7786c97-8044-47ab-a69b-7445d1efbc94` |
| `b0000000-0000-0000-0000-000000000007` | Dr. Rojina Tamang    | `+977 981-223-9900` | `Rojina@123` | Pending | `09d7c210-6b29-46d2-bae0-922780f8e5c6` |
| `b0000000-0000-0000-0000-000000000008` | Dr. Samir Khadka     | `+977 986-001-4455` | `Samir@123`  | Pending | `3d932c6c-6e58-4b4c-a48d-10d71dd745e3` |

### Admin (Clinic Administrator)

The dedicated admin login screen was merged into the main login page (`/login` or `/`). You can log in as Admin directly from the Patient login page using either method:

| Profile ID                             | Name        | Phone / Username                                | Password                     | Status | Destination       |
| -------------------------------------- | ----------- | ----------------------------------------------- | ---------------------------- | ------ | ----------------- |
| `c0000000-0000-0000-0000-000000000001` | Nisha Aryal | `+977 980-887-1265` (or `admin` / `9808871265`) | `Nisha@123` (or `Admin@123`) | Active | `/admin/overview` |

#### How to log in as Admin:

1. **1-Click Demo Button**: On the login page, scroll down to **"Quick 1-Click Demo Profiles (Supabase Live)"** and click **`⚙️ Nisha Aryal (Clinic Admin)`**.
2. **Manual Form Login**:
   - Stay on the default **Patient** tab.
   - Enter **Mobile Number**: `+977 980-887-1265` (or simply type `admin`).
   - Enter **Password**: `Nisha@123` or `Admin@123`.
   - Click **Sign in**. The app automatically detects the Admin role and routes you to `/admin/overview`.

## Patient details

| Patient code | Profile ID        | Age | Gender | Blood | Allergies  | Emergency contact                 | Adherence |
| ------------ | ----------------- | --- | ------ | ----- | ---------- | --------------------------------- | --------- |
| CT-2048      | `a0000000-…-0001` | 64  | Male   | O+    | Penicillin | Maya Sharma, +977 981-234-5678    | 88        |
| CT-1987      | `a0000000-…-0002` | 58  | Female | B+    | Sulfa      | Rajan Gurung, +977 984-625-0199   | 92        |
| CT-2186      | `a0000000-…-0003` | 42  | Male   | A+    | —          | Sabita Thapa, +977 986-315-7611   | 52        |
| CT-1934      | `a0000000-…-0004` | 61  | Female | AB+   | —          | Ashok Rai, +977 981-998-1123      | 76        |
| CT-2231      | `a0000000-…-0005` | 35  | Male   | O-    | —          | Dolma Lama, +977 984-112-9989     | 95        |
| CT-2076      | `a0000000-…-0006` | 49  | Female | B-    | Aspirin    | Suman Maharjan, +977 980-334-7767 | 84        |
| CT-1812      | `a0000000-…-0007` | 53  | Male   | O+    | —          | Sunita KC, +977 986-554-3322      | 89        |

## Doctor details

| Name                 | Specialization           | NMC number | Verification | License file       |
| -------------------- | ------------------------ | ---------- | ------------ | ------------------ |
| Dr. Sushil Adhikari  | Cardiology               | NMC 18422  | Confirmed    | license-sushil.pdf |
| Dr. Anjali Karki     | General Medicine         | NMC 23091  | Confirmed    | license-anjali.pdf |
| Dr. Bimal Shrestha   | Endocrinology            | NMC 19800  | Confirmed    | license-bimal.pdf  |
| Dr. Pratik Manandhar | Internal Medicine        | NMC 24871  | Pending      | license-pratik.pdf |
| Dr. Sneha Poudel     | Dermatology              | NMC 31209  | Pending      | license-sneha.pdf  |
| Dr. Aayush Shahi     | Paediatrics              | NMC 29714  | Pending      | license-aayush.pdf |
| Dr. Rojina Tamang    | Obstetrics & Gynaecology | NMC 26583  | Pending      | license-rojina.pdf |
| Dr. Samir Khadka     | General Practice         | NMC 33410  | Pending      | license-samir.pdf  |

## Prescription + medications (patient CT-2048)

Prescription `d0000000-0000-0000-0000-000000000001` — "Cardiology & Glycemic Maintenance", doctor `b0000000-…-0001`, image `/prescription-nepal.png`, follow-up `2024-07-22`.

| Medication ID     | Name         | Dosage | M / A / N | Meal       | Duration |
| ----------------- | ------------ | ------ | --------- | ---------- | -------- |
| `e0000000-…-0001` | Metformin    | 500 mg | 1 / 0 / 1 | After meal | 30 days  |
| `e0000000-…-0002` | Amlodipine   | 5 mg   | 1 / 0 / 0 | After meal | 30 days  |
| `e0000000-…-0003` | Calcium + D3 | 500 mg | 0 / 1 / 0 | After meal | 5 days   |
| `e0000000-…-0004` | Atorvastatin | 10 mg  | 0 / 0 / 1 | After meal | 30 days  |

## Medical records (all patient CT-2048)

| ID                | Type         | Kind | Title                  | Doctor / facility   | Date        |
| ----------------- | ------------ | ---- | ---------------------- | ------------------- | ----------- |
| `f0000000-…-0001` | Prescription | rx   | Cardiology Follow-up   | Dr. Sushil Adhikari | 24 Jun 2024 |
| `f0000000-…-0002` | Lab Report   | lab  | HbA1c & Glucose Panel  | Norvic Laboratory   | 21 Jun 2024 |
| `f0000000-…-0003` | Prescription | rx   | Diabetes Review        | Dr. Anjali Karki    | 06 May 2024 |
| `f0000000-…-0004` | X-Ray        | xray | Chest X-Ray — PA View  | Patan Hospital      | 18 Apr 2024 |
| `f0000000-…-0005` | Lab Report   | lab  | Lipid Profile          | National Path Lab   | 14 Apr 2024 |
| `f0000000-…-0006` | Prescription | rx   | General Medicine Visit | Dr. Bimal Shrestha  | 02 Mar 2024 |

## Appointments (all dated 2026-11-24)

| ID                                     | Time     | Patient       | Doctor              | Department       | Visit             | Status               |
| -------------------------------------- | -------- | ------------- | ------------------- | ---------------- | ----------------- | -------------------- |
| `7d1748aa-e813-4f92-a37a-0e2501920a5f` | 09:30 AM | Maya Gurung   | Dr. Sushil Adhikari | Cardiology       | Routine follow-up | Checked in           |
| `03abf6e1-2ec2-4587-91b8-952ed2697611` | 10:30 AM | Ramesh Sharma | Dr. Sushil Adhikari | Cardiology       | Cardiology review | Confirmed            |
| `3470fa8c-f4ed-4217-adfa-cffcf2c26bed` | 11:15 AM | Bikash Thapa  | Dr. Anjali Karki    | General Medicine | New consultation  | Pending              |
| `799f1f3a-b01b-4315-870f-ce3ea95a36e4` | 12:00 PM | Sita Rai      | Dr. Bimal Shrestha  | Endocrinology    | Medication review | Reschedule Requested |
| `27b02be1-2123-4c89-8622-b2547c2fa983` | 01:30 PM | Kiran Lama    | Dr. Anjali Karki    | General Medicine | Routine follow-up | Confirmed            |
| `e48a667e-be89-4bc7-8319-7d3c8bd0b17c` | 02:15 PM | Anu Maharjan  | Dr. Sushil Adhikari | Orthopaedics     | Post-op review    | Pending              |
| `8e8adb3a-ddad-4e6f-9fc5-1cf06b8f51cf` | 03:00 PM | Nabin KC      | Dr. Bimal Shrestha  | Endocrinology    | Follow-up         | Confirmed            |

## Rx templates

| ID                                     | Title               | Department       | Medicines                               |
| -------------------------------------- | ------------------- | ---------------- | --------------------------------------- |
| `7727727b-8723-48da-a3e7-03e7248c8a47` | Viral Fever 1-0-1   | General Medicine | Paracetamol · Cetirizine · Pantoprazole |
| `f81e34c6-7e01-4da6-bed0-94e6d1bdbaac` | Gastritis Regimen   | Gastroenterology | Pantoprazole · Antacid Gel              |
| `edbdf47c-b0dc-40f2-b02c-bff81c0401e7` | Post-Op Care        | Surgery          | Cefixime · Ibuprofen · Pantoprazole     |
| `67b60111-1023-4707-ab11-59bcac0cff18` | Hypertension Review | Cardiology       | Amlodipine · Losartan · Atorvastatin    |
| `6a34e2eb-e3c5-4442-ad14-a523abf8facb` | Diabetes Follow-Up  | Endocrinology    | Metformin · Sitagliptin · Calcium D3    |

## Enum values (case-sensitive)

- Role: `Patient` | `Doctor` | `Admin`
- Account status: `Active` | `Pending` | `Suspended`
- Verification: `Pending` | `Confirmed` | `Rejected`
- Appointment: `Confirmed` | `Pending` | `Reschedule Requested` | `Checked in` | `Completed` | `Next`
- Document kind: `rx` | `lab` | `xray`

## Empty tables

`medication_logs` and `audit_logs` are empty. Use `patientService.toggleLog()` to create a medication log; nothing in the app writes to `audit_logs` yet.
