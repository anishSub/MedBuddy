'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PatientShell } from '@/components/patient/PatientShell';
import { useAuth } from '@/context/AuthContext';
import { patientService } from '@/lib/supabase/services';
import type { AppointmentStatus } from '@/types';

interface AppointmentRow {
  id: string;
  appointment_time: string;
  appointment_date: string;
  department: string;
  visit_type: string;
  status: AppointmentStatus;
  doctor?: { full_name: string } | null;
}

interface FilterOption {
  label: string;
  status: AppointmentStatus | 'All';
}

const FILTERS: FilterOption[] = [
  { label: 'All', status: 'All' },
  { label: 'Confirmed', status: 'Confirmed' },
  { label: 'Pending', status: 'Pending' },
  { label: 'Reschedule Requested', status: 'Reschedule Requested' },
  { label: 'Checked in', status: 'Checked in' },
  { label: 'Completed', status: 'Completed' },
  { label: 'Next', status: 'Next' },
];

const STATUS_STYLES: Record<string, string> = {
  Confirmed: 'bg-[#E6F4F2] text-[#0D9488]',
  Pending: 'bg-[#FFFBEB] text-[#B45309]',
  'Reschedule Requested': 'bg-[#FEF3C7] text-[#92400E]',
  'Checked in': 'bg-[#EFF6FF] text-[#2563EB]',
  Completed: 'bg-[#F1F5F9] text-[#475569]',
  Next: 'bg-[#ECFDF5] text-[#059669]',
};

const DEFAULT_PATIENT_ID = 'a0000000-0000-0000-0000-000000000001';

function getProviderInitials(name: string) {
  return name
    .replace(/^(Dr\.|Doctor)\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AppointmentStatus | 'All'>('All');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await patientService.getAppointments(user?.id || DEFAULT_PATIENT_ID);
      setAppointments(rows as AppointmentRow[]);
    } catch (err) {
      console.warn('Could not load appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    appointments.forEach((a) => {
      map[a.status] = (map[a.status] || 0) + 1;
    });
    return map;
  }, [appointments]);

  const shown = useMemo(() => {
    const list =
      filter === 'All' ? appointments : appointments.filter((a) => a.status === filter);
    return [...list].sort((a, b) =>
      `${b.appointment_date} ${b.appointment_time}`.localeCompare(
        `${a.appointment_date} ${a.appointment_time}`
      )
    );
  }, [appointments, filter]);

  const requestReschedule = async (id: string) => {
    setBusyId(id);
    try {
      const updated = (await patientService.updateAppointmentStatus(
        id,
        'Reschedule Requested'
      )) as AppointmentRow;
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      console.error('Failed to request reschedule:', err);
      alert('Could not send the request. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PatientShell title="My Appointments" eyebrow="Past & upcoming visits" compact>
      <main className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-[#F8FAFC] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {/* Status filter tabs */}
        <div className="flex flex-wrap items-center gap-1 border-b border-[#E2E8F0] pb-4">
          {FILTERS.map((f) => {
            const active = filter === f.status;
            const count = f.status === 'All' ? appointments.length : counts[f.status] || 0;
            if (f.status !== 'All' && !count) return null;
            return (
              <button
                key={f.label}
                onClick={() => setFilter(f.status)}
                className={`relative h-10 text-[12px] font-semibold transition ${
                  active
                    ? 'text-[#0D9488] after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-[#0D9488]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {f.label}
                {f.status !== 'All' && ` (${count})`}
              </button>
            );
          })}
        </div>

        {/* Appointment list */}
        {loading ? (
          <p className="mt-10 text-center text-[13px] text-[#94A3B8]">
            Loading appointments…
          </p>
        ) : shown.length === 0 ? (
          <p className="mt-10 text-center text-[13px] text-[#94A3B8]">
            {filter === 'All'
              ? 'You have no appointments yet.'
              : `No appointments with status “${filter}” yet.`}
          </p>
        ) : (
          <ul className="mt-4 space-y-3 pb-6">
            {shown.map((app) => {
              const doctorName = app.doctor?.full_name || 'Dr.';
              const initials = getProviderInitials(doctorName);
              const dateLabel = formatDate(app.appointment_date);
              return (
                <li key={app.id}>
                  <article className="patient-card p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                          STATUS_STYLES[app.status] || 'bg-[#F1F5F9] text-[#475569]'
                        }`}
                      >
                        {app.status}
                      </span>
                      <span className="text-[10px] tabular-nums text-[#94A3B8]">
                        {dateLabel} · {app.appointment_time}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2.5">
                      <div
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E6F4F2] text-xs font-semibold text-[#0D9488]"
                        aria-hidden="true"
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[#0F172A]">
                          {doctorName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#64748B]">{app.department}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[13px] font-medium text-[#475569]">
                      {app.visit_type}
                    </p>
                    {app.status !== 'Reschedule Requested' && (
                      <button
                        onClick={() => requestReschedule(app.id)}
                        disabled={busyId === app.id}
                        className="mt-3 h-8 rounded-md border border-[#CBD5E1] bg-white px-3 text-[11px] font-semibold text-[#475569] transition hover:bg-slate-50 disabled:opacity-60"
                      >
                        {busyId === app.id ? 'Sending…' : 'Request reschedule'}
                      </button>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        )}

      </main>
    </PatientShell>
  );
}
