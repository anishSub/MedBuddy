import type { ReactNode } from 'react';

export type IconName =
  | 'home'
  | 'scan'
  | 'records'
  | 'qr'
  | 'bell'
  | 'chevron'
  | 'check'
  | 'clock'
  | 'calendar'
  | 'upload'
  | 'plus'
  | 'zoomIn'
  | 'zoomOut'
  | 'edit'
  | 'file'
  | 'shield'
  | 'users'
  | 'lock'
  | 'eye'
  | 'eyeOff'
  | 'arrow'
  | 'x'
  | 'user'
  | 'stethoscope'
  | 'phone'
  | 'heart';

export type UserRole = 'Patient' | 'Doctor' | 'Admin';
export type AccountStatus = 'Active' | 'Pending' | 'Suspended';
export type AppointmentStatus =
  | 'Confirmed'
  | 'Pending'
  | 'Reschedule Requested'
  | 'Checked in'
  | 'Completed'
  | 'Next';

export interface MedicineScheduleItem {
  time: string;
  hour: string;
  icon: string;
  items: [name: string, dose: string, amount: string][];
}

export interface DocumentItem {
  type: 'Prescription' | 'Lab Report' | 'X-Ray';
  date: string;
  title: string;
  doctor: string;
  note: string;
  kind: 'rx' | 'lab' | 'xray';
}

export interface AppointmentItem {
  time: string;
  patient: string;
  visit: string;
  status: 'Checked in' | 'Next' | 'Confirmed' | 'Pending';
}

export interface FollowUpItem {
  time: string;
  patient: string;
  id: string;
  doctor: string;
  department: string;
  status: 'Confirmed' | 'Pending' | 'Reschedule Requested';
}

export interface DoctorRequestItem {
  name: string;
  department: string;
  nmc: string;
  licenseFile: string;
}

export interface UserAccountItem {
  name: string;
  role: 'Patient' | 'Doctor' | 'Admin';
  id: string;
  phone: string;
  lastActive: string;
  status: 'Active' | 'Pending' | 'Suspended';
}
