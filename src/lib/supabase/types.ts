export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'Patient' | 'Doctor' | 'Admin';
export type AccountStatus = 'Active' | 'Pending' | 'Suspended';
export type VerificationStatus = 'Pending' | 'Confirmed' | 'Rejected';
export type AppointmentStatus =
  | 'Confirmed'
  | 'Pending'
  | 'Reschedule Requested'
  | 'Checked in'
  | 'Completed'
  | 'Next';
export type DocumentKind = 'rx' | 'lab' | 'xray';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string;
          status: AccountStatus;
          avatar_initials: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          role?: UserRole;
          full_name: string;
          phone: string;
          status?: AccountStatus;
          avatar_initials?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          phone?: string;
          status?: AccountStatus;
          avatar_initials?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      patient_details: {
        Row: {
          id: string;
          profile_id: string;
          patient_code: string;
          age: number | null;
          gender: string | null;
          blood_group: string | null;
          allergies: string[] | null;
          emergency_contact_name: string | null;
          emergency_contact_relation: string | null;
          emergency_contact_phone: string | null;
          primary_doctor_id: string | null;
          weekly_adherence: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          patient_code: string;
          age?: number | null;
          gender?: string | null;
          blood_group?: string | null;
          allergies?: string[] | null;
          emergency_contact_name?: string | null;
          emergency_contact_relation?: string | null;
          emergency_contact_phone?: string | null;
          primary_doctor_id?: string | null;
          weekly_adherence?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          patient_code?: string;
          age?: number | null;
          gender?: string | null;
          blood_group?: string | null;
          allergies?: string[] | null;
          emergency_contact_name?: string | null;
          emergency_contact_relation?: string | null;
          emergency_contact_phone?: string | null;
          primary_doctor_id?: string | null;
          weekly_adherence?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      doctor_details: {
        Row: {
          id: string;
          profile_id: string;
          specialization: string;
          nmc_number: string;
          license_file_name: string | null;
          verification_status: VerificationStatus;
          verified_at: string | null;
          verified_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          specialization: string;
          nmc_number: string;
          license_file_name?: string | null;
          verification_status?: VerificationStatus;
          verified_at?: string | null;
          verified_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          specialization?: string;
          nmc_number?: string;
          license_file_name?: string | null;
          verification_status?: VerificationStatus;
          verified_at?: string | null;
          verified_by?: string | null;
          created_at?: string;
        };
      };
      prescriptions: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string | null;
          title: string;
          notes: string | null;
          image_url: string | null;
          next_follow_up_date: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id?: string | null;
          title: string;
          notes?: string | null;
          image_url?: string | null;
          next_follow_up_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string | null;
          title?: string;
          notes?: string | null;
          image_url?: string | null;
          next_follow_up_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      medications: {
        Row: {
          id: string;
          prescription_id: string | null;
          patient_id: string;
          name: string;
          dosage: string;
          form: string;
          morning: boolean;
          afternoon: boolean;
          night: boolean;
          meal_timing: string;
          duration_days: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          prescription_id?: string | null;
          patient_id: string;
          name: string;
          dosage: string;
          form?: string;
          morning?: boolean;
          afternoon?: boolean;
          night?: boolean;
          meal_timing?: string;
          duration_days?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          prescription_id?: string | null;
          patient_id?: string;
          name?: string;
          dosage?: string;
          form?: string;
          morning?: boolean;
          afternoon?: boolean;
          night?: boolean;
          meal_timing?: string;
          duration_days?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      medication_logs: {
        Row: {
          id: string;
          patient_id: string;
          medication_id: string;
          slot_time: string;
          log_date: string;
          is_taken: boolean;
          taken_at: string | null;
        };
        Insert: {
          id?: string;
          patient_id: string;
          medication_id: string;
          slot_time: string;
          log_date?: string;
          is_taken?: boolean;
          taken_at?: string | null;
        };
        Update: {
          id?: string;
          patient_id?: string;
          medication_id?: string;
          slot_time?: string;
          log_date?: string;
          is_taken?: boolean;
          taken_at?: string | null;
        };
      };
      medical_records: {
        Row: {
          id: string;
          patient_id: string;
          title: string;
          type: string;
          kind: DocumentKind;
          doctor: string;
          note: string | null;
          file_url: string | null;
          record_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          title: string;
          type: string;
          kind?: DocumentKind;
          doctor: string;
          note?: string | null;
          file_url?: string | null;
          record_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          title?: string;
          type?: string;
          kind?: DocumentKind;
          doctor?: string;
          note?: string | null;
          file_url?: string | null;
          record_date?: string;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string | null;
          appointment_time: string;
          appointment_date: string;
          department: string;
          visit_type: string;
          status: AppointmentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id?: string | null;
          appointment_time: string;
          appointment_date?: string;
          department: string;
          visit_type?: string;
          status?: AppointmentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string | null;
          appointment_time?: string;
          appointment_date?: string;
          department?: string;
          visit_type?: string;
          status?: AppointmentStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      rx_templates: {
        Row: {
          id: string;
          doctor_id: string | null;
          title: string;
          department: string;
          medicines_count: string;
          medication_summary: string;
          instructions: string;
          medications_json: Json;
          updated_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          doctor_id?: string | null;
          title: string;
          department: string;
          medicines_count?: string;
          medication_summary: string;
          instructions: string;
          medications_json?: Json;
          updated_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string | null;
          title?: string;
          department?: string;
          medicines_count?: string;
          medication_summary?: string;
          instructions?: string;
          medications_json?: Json;
          updated_date?: string;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          target_type?: string | null;
          target_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
      };
    };
  };
}
