import { supabase } from './client';
import type {
  UserRole,
  AccountStatus,
  VerificationStatus,
  AppointmentStatus,
  DocumentKind,
} from './types';

// ==============================================================================
// 1. AUTH & PROFILE SERVICE
// ==============================================================================
export const authService = {
  async getProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async loginOrRegister(fullName: string, phone: string, role: UserRole) {
    // 1. Try finding existing profile by phone
    const { data: existing, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      // If role differs, update it or keep existing
      return existing;
    }

    // 2. Create new profile
    const initials = fullName
      .split(' ')
      .filter((n) => n !== 'Dr.')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        full_name: fullName,
        phone,
        role,
        avatar_initials: initials || 'MB',
        status: 'Active',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // If patient, create patient_details record
    if (role === 'Patient') {
      const code = `CT-${Math.floor(1000 + Math.random() * 9000)}`;
      await supabase.from('patient_details').insert({
        profile_id: newProfile.id,
        patient_code: code,
        age: 45,
        blood_group: 'O+',
        allergies: [],
      });
    }

    // If doctor, create doctor_details record
    if (role === 'Doctor') {
      const nmc = `NMC ${Math.floor(10000 + Math.random() * 90000)}`;
      await supabase.from('doctor_details').insert({
        profile_id: newProfile.id,
        specialization: 'General Practice',
        nmc_number: nmc,
        verification_status: 'Pending',
      });
    }

    return newProfile;
  },
};

// ==============================================================================
// 2. PATIENT SERVICE
// ==============================================================================
export const patientService = {
  async getPatientProfile(patientCode = 'CT-2048') {
    const { data, error } = await supabase
      .from('patient_details')
      .select('*, profiles!patient_details_profile_id_fkey(*)')
      .eq('patient_code', patientCode)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getMedications(patientProfileId = 'a0000000-0000-0000-0000-000000000001') {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('patient_id', patientProfileId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getTodayLogs(patientProfileId = 'a0000000-0000-0000-0000-000000000001') {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('patient_id', patientProfileId)
      .eq('log_date', today);

    if (error) throw error;
    return data || [];
  },

  async toggleLog(
    patientProfileId: string,
    medicationId: string,
    slotTime: string,
    isTaken: boolean
  ) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('medication_logs')
      .upsert(
        {
          patient_id: patientProfileId,
          medication_id: medicationId,
          slot_time: slotTime,
          log_date: today,
          is_taken: isTaken,
          taken_at: isTaken ? new Date().toISOString() : null,
        },
        { onConflict: 'medication_id,log_date,slot_time' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUpcomingAppointment(patientProfileId = 'a0000000-0000-0000-0000-000000000001') {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, doctor:profiles!appointments_doctor_id_fkey(full_name)')
      .eq('patient_id', patientProfileId)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async saveScannedPrescription(
    patientProfileId: string,
    items: Array<{
      name: string;
      dosage: string;
      morning: boolean;
      afternoon: boolean;
      night: boolean;
      meal_timing: string;
      duration_days: string;
    }>
  ) {
    const { data: rx, error: rxErr } = await supabase
      .from('prescriptions')
      .insert({
        patient_id: patientProfileId,
        title: 'Prescription Scan (Nepali Rx)',
        image_url: '/prescription-nepal.png',
        status: 'active',
      })
      .select()
      .single();

    if (rxErr) throw rxErr;

    const medRows = items.map((item) => ({
      prescription_id: rx.id,
      patient_id: patientProfileId,
      name: item.name,
      dosage: item.dosage,
      morning: item.morning,
      afternoon: item.afternoon,
      night: item.night,
      meal_timing: item.meal_timing,
      duration_days: item.duration_days,
      is_active: true,
    }));

    const { data: meds, error: medErr } = await supabase
      .from('medications')
      .insert(medRows)
      .select();

    if (medErr) throw medErr;
    return { prescription: rx, medications: meds };
  },

  async getMedicalRecords(patientProfileId = 'a0000000-0000-0000-0000-000000000001') {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientProfileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addMedicalRecord(record: {
    patient_id: string;
    title: string;
    type: string;
    kind: DocumentKind;
    doctor: string;
    note?: string;
  }) {
    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        ...record,
        record_date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ==============================================================================
// 3. DOCTOR SERVICE
// ==============================================================================
export const doctorService = {
  async getDashboardAppointments() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, profiles!appointments_patient_id_fkey(full_name, phone)')
      .order('appointment_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getPatientContext(patientCode = 'CT-2048') {
    const { data, error } = await supabase
      .from('patient_details')
      .select('*, profiles!patient_details_profile_id_fkey(*)')
      .eq('patient_code', patientCode)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getRxTemplates() {
    const { data, error } = await supabase
      .from('rx_templates')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async savePrescription(data: {
    patient_id: string;
    doctor_id?: string;
    title: string;
    notes?: string;
    next_follow_up_date?: string;
    medications: Array<{
      name: string;
      dosage: string;
      morning: boolean;
      afternoon: boolean;
      night: boolean;
      meal_timing: string;
    }>;
  }) {
    // 1. Insert prescription
    const { data: rx, error: rxErr } = await supabase
      .from('prescriptions')
      .insert({
        patient_id: data.patient_id,
        doctor_id: data.doctor_id,
        title: data.title,
        notes: data.notes,
        next_follow_up_date: data.next_follow_up_date,
      })
      .select()
      .single();

    if (rxErr) throw rxErr;

    // 2. Insert medications
    if (data.medications.length > 0) {
      const medRows = data.medications.map((m) => ({
        prescription_id: rx.id,
        patient_id: data.patient_id,
        name: m.name,
        dosage: m.dosage,
        morning: m.morning,
        afternoon: m.afternoon,
        night: m.night,
        meal_timing: m.meal_timing,
      }));

      const { error: medErr } = await supabase.from('medications').insert(medRows);
      if (medErr) throw medErr;
    }

    return rx;
  },
};

// ==============================================================================
// 4. ADMIN SERVICE
// ==============================================================================
export const adminService = {
  async getOverviewStats() {
    const [appointmentsRes, doctorsRes] = await Promise.all([
      supabase.from('appointments').select('status'),
      supabase.from('doctor_details').select('verification_status'),
    ]);

    const appointments = appointmentsRes.data || [];
    const doctors = doctorsRes.data || [];

    const totalScheduled = appointments.length;
    const confirmed = appointments.filter((a) => a.status === 'Confirmed').length;
    const reschedule = appointments.filter((a) => a.status === 'Reschedule Requested').length;
    const pendingDoctors = doctors.filter((d) => d.verification_status === 'Pending').length;

    return {
      scheduled: totalScheduled || 24,
      confirmed: confirmed || 18,
      reschedule: reschedule || 3,
      pendingDoctors: pendingDoctors || 2,
    };
  },

  async getFollowUpQueue() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patient:profiles!appointments_patient_id_fkey(full_name), doctor:profiles!appointments_doctor_id_fkey(full_name)')
      .order('appointment_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, patient_details!patient_details_profile_id_fkey(patient_code), doctor_details!doctor_details_profile_id_fkey(nmc_number)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async toggleUserAccountStatus(profileId: string, status: AccountStatus) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getDoctorVerifications() {
    const { data, error } = await supabase
      .from('doctor_details')
      .select('*, profile:profiles!doctor_details_profile_id_fkey(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateDoctorVerification(
    doctorDetailId: string,
    verification_status: VerificationStatus
  ) {
    const { data, error } = await supabase
      .from('doctor_details')
      .update({
        verification_status,
        verified_at: new Date().toISOString(),
      })
      .eq('id', doctorDetailId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
