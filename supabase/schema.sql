-- ==============================================================================
-- MedBuddy Healthcare Platform Database Schema (PostgreSQL / Supabase)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('Patient', 'Doctor', 'Admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_status AS ENUM ('Active', 'Pending', 'Suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('Pending', 'Confirmed', 'Rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('Confirmed', 'Pending', 'Reschedule Requested', 'Checked in', 'Completed', 'Next');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_kind AS ENUM ('rx', 'lab', 'xray');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Core user identities)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL DEFAULT 'Patient',
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    status account_status NOT NULL DEFAULT 'Active',
    avatar_initials TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PATIENT DETAILS TABLE
CREATE TABLE IF NOT EXISTS patient_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    patient_code TEXT UNIQUE NOT NULL, -- e.g. CT-2048
    age INTEGER,
    gender TEXT,
    blood_group TEXT, -- e.g. O+, A+
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    emergency_contact_name TEXT,
    emergency_contact_relation TEXT,
    emergency_contact_phone TEXT,
    primary_doctor_id UUID REFERENCES profiles(id),
    weekly_adherence INTEGER DEFAULT 88,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. DOCTOR DETAILS TABLE
CREATE TABLE IF NOT EXISTS doctor_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL,
    nmc_number TEXT UNIQUE NOT NULL, -- Nepal Medical Council Registration
    license_file_name TEXT,
    verification_status verification_status NOT NULL DEFAULT 'Pending',
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    notes TEXT,
    image_url TEXT,
    next_follow_up_date DATE,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. MEDICATIONS TABLE (Medications prescribed or extracted from OCR)
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL, -- e.g. 500 mg
    form TEXT NOT NULL DEFAULT 'Tablet',
    morning BOOLEAN NOT NULL DEFAULT false,
    afternoon BOOLEAN NOT NULL DEFAULT false,
    night BOOLEAN NOT NULL DEFAULT false,
    meal_timing TEXT NOT NULL DEFAULT 'After meal', -- 'After meal' | 'Before meal'
    duration_days TEXT DEFAULT '30 days',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. MEDICATION LOGS TABLE (Daily intake tracking for adherence)
CREATE TABLE IF NOT EXISTS medication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    slot_time TEXT NOT NULL, -- 'Morning', 'Afternoon', 'Night'
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_taken BOOLEAN NOT NULL DEFAULT false,
    taken_at TIMESTAMPTZ,
    UNIQUE(medication_id, log_date, slot_time)
);

-- 9. MEDICAL RECORDS TABLE (Prescriptions, Lab Reports, X-Rays)
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Prescription', 'Lab Report', 'X-Ray'
    kind document_kind NOT NULL DEFAULT 'rx',
    doctor TEXT NOT NULL,
    note TEXT,
    file_url TEXT,
    record_date TEXT NOT NULL DEFAULT '24 Jun 2024',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. APPOINTMENTS TABLE (Follow-up queues & Doctor schedules)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES profiles(id),
    appointment_time TEXT NOT NULL, -- e.g. '10:30 AM'
    appointment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    department TEXT NOT NULL, -- e.g. 'Cardiology'
    visit_type TEXT NOT NULL DEFAULT 'Follow-up', -- 'Routine follow-up', 'New consultation'
    status appointment_status NOT NULL DEFAULT 'Confirmed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. RX TEMPLATES TABLE (Clinical regimens)
CREATE TABLE IF NOT EXISTS rx_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    medicines_count TEXT NOT NULL DEFAULT '3 medicines',
    medication_summary TEXT NOT NULL,
    instructions TEXT NOT NULL,
    medications_json JSONB DEFAULT '[]'::jsonb,
    updated_date TEXT NOT NULL DEFAULT '12 Jun 2024',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_patient_details_code ON patient_details(patient_code);
CREATE INDEX IF NOT EXISTS idx_doctor_details_nmc ON doctor_details(nmc_number);
CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_med_logs_patient_date ON medication_logs(patient_id, log_date);
CREATE INDEX IF NOT EXISTS idx_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date, doctor_id);

-- 14. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rx_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Permissive public development access policies (can be scoped to auth.uid() later)
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access on %I" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public access on %I" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;
