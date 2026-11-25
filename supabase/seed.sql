-- ==============================================================================
-- MedBuddy Seed Data (Nepali Healthcare Context)
-- ==============================================================================

-- 1. Insert Core Profiles
INSERT INTO profiles (id, role, full_name, phone, status, avatar_initials)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Patient', 'Ramesh Sharma', '+977 981-234-5678', 'Active', 'RS'),
    ('a0000000-0000-0000-0000-000000000002', 'Patient', 'Maya Gurung', '+977 984-625-0198', 'Active', 'MG'),
    ('a0000000-0000-0000-0000-000000000003', 'Patient', 'Bikash Thapa', '+977 986-315-7610', 'Suspended', 'BT'),
    ('a0000000-0000-0000-0000-000000000004', 'Patient', 'Sita Rai', '+977 981-998-1122', 'Active', 'SR'),
    ('a0000000-0000-0000-0000-000000000005', 'Patient', 'Kiran Lama', '+977 984-112-9988', 'Active', 'KL'),
    ('a0000000-0000-0000-0000-000000000006', 'Patient', 'Anu Maharjan', '+977 980-334-7766', 'Active', 'AM'),
    ('a0000000-0000-0000-0000-000000000007', 'Patient', 'Nabin KC', '+977 986-554-3321', 'Active', 'NK'),
    ('b0000000-0000-0000-0000-000000000001', 'Doctor', 'Dr. Sushil Adhikari', '+977 980-112-4482', 'Active', 'SA'),
    ('b0000000-0000-0000-0000-000000000002', 'Doctor', 'Dr. Anjali Karki', '+977 985-018-4431', 'Active', 'AK'),
    ('b0000000-0000-0000-0000-000000000003', 'Doctor', 'Dr. Bimal Shrestha', '+977 981-554-9988', 'Active', 'BS'),
    ('b0000000-0000-0000-0000-000000000004', 'Doctor', 'Dr. Pratik Manandhar', '+977 981-776-8304', 'Pending', 'PM'),
    ('b0000000-0000-0000-0000-000000000005', 'Doctor', 'Dr. Sneha Poudel', '+977 980-332-1199', 'Pending', 'SP'),
    ('b0000000-0000-0000-0000-000000000006', 'Doctor', 'Dr. Aayush Shahi', '+977 984-889-2233', 'Pending', 'AS'),
    ('b0000000-0000-0000-0000-000000000007', 'Doctor', 'Dr. Rojina Tamang', '+977 981-223-9900', 'Pending', 'RT'),
    ('b0000000-0000-0000-0000-000000000008', 'Doctor', 'Dr. Samir Khadka', '+977 986-001-4455', 'Pending', 'SK'),
    ('c0000000-0000-0000-0000-000000000001', 'Admin', 'Nisha Aryal', '+977 980-887-1265', 'Active', 'NA')
ON CONFLICT (id) DO NOTHING;

-- 2. Patient Details
INSERT INTO patient_details (profile_id, patient_code, age, gender, blood_group, allergies, emergency_contact_name, emergency_contact_relation, emergency_contact_phone, weekly_adherence, blood_pressure_target_upper, blood_pressure_target_lower, weight_kg, daily_steps)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'CT-2048', 64, 'Male', 'O+', ARRAY['Penicillin'], 'Maya Sharma', 'Daughter', '+977 981-234-5678', 88, 122, 78, 69, 8000),
    ('a0000000-0000-0000-0000-000000000002', 'CT-1987', 58, 'Female', 'B+', ARRAY['Sulfa'], 'Rajan Gurung', 'Son', '+977 984-625-0199', 92, 120, 80, 62, 10000),
    ('a0000000-0000-0000-0000-000000000003', 'CT-2186', 42, 'Male', 'A+', ARRAY[]::TEXT[], 'Sabita Thapa', 'Wife', '+977 986-315-7611', 52, 128, 82, 60, 6000),
    ('a0000000-0000-0000-0000-000000000004', 'CT-1934', 61, 'Female', 'AB+', ARRAY[]::TEXT[], 'Ashok Rai', 'Son', '+977 981-998-1123', 76, 118, 76, 74, 9000),
    ('a0000000-0000-0000-0000-000000000005', 'CT-2231', 35, 'Male', 'O-', ARRAY[]::TEXT[], 'Dolma Lama', 'Sister', '+977 984-112-9989', 95, 116, 74, 66, 7000),
    ('a0000000-0000-0000-0000-000000000006', 'CT-2076', 49, 'Female', 'B-', ARRAY['Aspirin'], 'Suman Maharjan', 'Husband', '+977 980-334-7767', 84, 130, 84, 80, 5000),
    ('a0000000-0000-0000-0000-000000000007', 'CT-1812', 53, 'Male', 'O+', ARRAY[]::TEXT[], 'Sunita KC', 'Wife', '+977 986-554-3322', 89, 124, 79, 57, 11000)
ON CONFLICT (patient_code) DO NOTHING;

-- 3. Doctor Details
INSERT INTO doctor_details (profile_id, specialization, nmc_number, license_file_name, verification_status)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Cardiology', 'NMC 18422', 'license-sushil.pdf', 'Confirmed'),
    ('b0000000-0000-0000-0000-000000000002', 'General Medicine', 'NMC 23091', 'license-anjali.pdf', 'Confirmed'),
    ('b0000000-0000-0000-0000-000000000003', 'Endocrinology', 'NMC 19800', 'license-bimal.pdf', 'Confirmed'),
    ('b0000000-0000-0000-0000-000000000004', 'Internal Medicine', 'NMC 24871', 'license-pratik.pdf', 'Pending'),
    ('b0000000-0000-0000-0000-000000000005', 'Dermatology', 'NMC 31209', 'license-sneha.pdf', 'Pending'),
    ('b0000000-0000-0000-0000-000000000006', 'Paediatrics', 'NMC 29714', 'license-aayush.pdf', 'Pending'),
    ('b0000000-0000-0000-0000-000000000007', 'Obstetrics & Gynaecology', 'NMC 26583', 'license-rojina.pdf', 'Pending'),
    ('b0000000-0000-0000-0000-000000000008', 'General Practice', 'NMC 33410', 'license-samir.pdf', 'Pending')
ON CONFLICT (nmc_number) DO NOTHING;

-- 4. Prescriptions
INSERT INTO prescriptions (id, patient_id, doctor_id, title, notes, image_url, next_follow_up_date)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Cardiology & Glycemic Maintenance', 'Continue Metformin with food. Monitor fasting glucose weekly.', '/prescription-nepal.png', '2024-07-22')
ON CONFLICT (id) DO NOTHING;

-- 5. Medications
INSERT INTO medications (id, prescription_id, patient_id, name, dosage, form, morning, afternoon, night, meal_timing, duration_days)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Metformin', '500 mg', 'Tablet', true, false, true, 'After meal', '30 days'),
    ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Amlodipine', '5 mg', 'Tablet', true, false, false, 'After meal', '30 days'),
    ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Calcium + D3', '500 mg', 'Tablet', false, true, false, 'After meal', '5 days'),
    ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Atorvastatin', '10 mg', 'Tablet', false, false, true, 'After meal', '30 days')
ON CONFLICT (id) DO NOTHING;

-- 6. Medical Records
INSERT INTO medical_records (id, patient_id, title, type, kind, doctor, note, record_date)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Cardiology Follow-up', 'Prescription', 'rx', 'Dr. Sushil Adhikari', 'Continue current medication; review in 4 weeks.', '24 Jun 2024'),
    ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'HbA1c & Glucose Panel', 'Lab Report', 'lab', 'Norvic Laboratory', 'HbA1c improved to 6.8%. Maintain diet plan.', '21 Jun 2024'),
    ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Diabetes Review', 'Prescription', 'rx', 'Dr. Anjali Karki', 'Metformin dose adjusted to twice daily.', '06 May 2024'),
    ('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Chest X-Ray — PA View', 'X-Ray', 'xray', 'Patan Hospital', 'No active pulmonary lesion identified.', '18 Apr 2024'),
    ('f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Lipid Profile', 'Lab Report', 'lab', 'National Path Lab', 'LDL slightly elevated; repeat after 3 months.', '14 Apr 2024'),
    ('f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'General Medicine Visit', 'Prescription', 'rx', 'Dr. Bimal Shrestha', 'Blood pressure stable. Continue Amlodipine.', '02 Mar 2024')
ON CONFLICT (id) DO NOTHING;

-- 7. Appointments (stable IDs + ON CONFLICT make re-running this seed safe)
INSERT INTO appointments (id, patient_id, doctor_id, appointment_time, appointment_date, department, visit_type, status)
VALUES
    ('90000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '09:30 AM', CURRENT_DATE, 'Cardiology', 'Routine follow-up', 'Checked in'),
    ('90000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '10:30 AM', CURRENT_DATE, 'Cardiology', 'Cardiology review', 'Confirmed'),
    ('90000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', '11:15 AM', CURRENT_DATE, 'General Medicine', 'New consultation', 'Pending'),
    ('90000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', '12:00 PM', CURRENT_DATE, 'Endocrinology', 'Medication review', 'Reschedule Requested'),
    ('90000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', '01:30 PM', CURRENT_DATE, 'General Medicine', 'Routine follow-up', 'Confirmed'),
    ('90000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', '02:15 PM', CURRENT_DATE, 'Orthopaedics', 'Post-op review', 'Pending'),
    ('90000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', '03:00 PM', CURRENT_DATE, 'Endocrinology', 'Follow-up', 'Confirmed')
ON CONFLICT (id) DO NOTHING;

-- 8. Rx Templates (stable IDs + ON CONFLICT make re-running this seed safe)
INSERT INTO rx_templates (id, title, department, medicines_count, medication_summary, instructions, medications_json)
VALUES
    ('91000000-0000-0000-0000-000000000001', 'Viral Fever 1-0-1', 'General Medicine', '3 medicines', 'Paracetamol · Cetirizine · Pantoprazole', 'Take medicines after meals. Maintain hydration and return if fever persists > 3 days.',
     '[{"name": "Paracetamol", "dosage": "500 mg", "timing": "1 - 0 - 1"}, {"name": "Cetirizine", "dosage": "10 mg", "timing": "0 - 0 - 1"}, {"name": "Pantoprazole", "dosage": "40 mg", "timing": "1 - 0 - 0"}]'::jsonb),
    ('91000000-0000-0000-0000-000000000002', 'Gastritis Regimen', 'Gastroenterology', '2 medicines', 'Pantoprazole · Antacid suspension', 'Take pantoprazole 30 mins before breakfast. Antacid as needed after meals.',
     '[{"name": "Pantoprazole", "dosage": "40 mg", "timing": "1 - 0 - 0"}, {"name": "Antacid Gel", "dosage": "10 ml", "timing": "1 - 1 - 1"}]'::jsonb),
    ('91000000-0000-0000-0000-000000000003', 'Post-Op Care', 'Surgery', '4 medicines', 'Antibiotic · Analgesic · PPI · Supplement', 'Complete full antibiotic course. Avoid heavy lifting and keep wound dry.',
     '[{"name": "Cefixime", "dosage": "200 mg", "timing": "1 - 0 - 1"}, {"name": "Ibuprofen", "dosage": "400 mg", "timing": "1 - 0 - 1"}, {"name": "Pantoprazole", "dosage": "40 mg", "timing": "1 - 0 - 0"}]'::jsonb),
    ('91000000-0000-0000-0000-000000000004', 'Hypertension Review', 'Cardiology', '3 medicines', 'Amlodipine · Losartan · Atorvastatin', 'Record blood pressure every morning. Reduce sodium in diet.',
     '[{"name": "Amlodipine", "dosage": "5 mg", "timing": "1 - 0 - 0"}, {"name": "Losartan", "dosage": "50 mg", "timing": "1 - 0 - 0"}, {"name": "Atorvastatin", "dosage": "10 mg", "timing": "0 - 0 - 1"}]'::jsonb),
    ('91000000-0000-0000-0000-000000000005', 'Diabetes Follow-Up', 'Endocrinology', '3 medicines', 'Metformin · Sitagliptin · Calcium D3', 'Maintain regular carbohydrate portions. Check fasting glucose weekly.',
     '[{"name": "Metformin", "dosage": "500 mg", "timing": "1 - 0 - 1"}, {"name": "Sitagliptin", "dosage": "50 mg", "timing": "1 - 0 - 0"}, {"name": "Calcium + D3", "dosage": "500 mg", "timing": "0 - 1 - 0"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;
