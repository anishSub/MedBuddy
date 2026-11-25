'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/common/Icon';
import { StatusPill } from '@/components/common/StatusPill';
import { doctorService } from '@/lib/supabase/services';
import type { IconName } from '@/types';

type AppointmentRow = [
  time: string,
  patient: string,
  visit: string,
  status: string,
  department: string,
  patientId?: string,
];

// Fallback mock data shown when DB has no appointments yet
const MOCK_APPOINTMENTS: AppointmentRow[] = [
  ['09:30 AM', 'Maya Gurung', 'Routine follow-up', 'Checked in', 'Cardiology', 'a0000000-0000-0000-0000-000000000002'],
  ['10:30 AM', 'Ramesh Sharma', 'Cardiology review', 'Next', 'Cardiology', 'a0000000-0000-0000-0000-000000000001'],
  ['11:15 AM', 'Bikash Thapa', 'New consultation', 'Confirmed', 'General Medicine', 'a0000000-0000-0000-0000-000000000003'],
  ['12:00 PM', 'Sita Rai', 'Medication review', 'Confirmed', 'Endocrinology', 'a0000000-0000-0000-0000-000000000004'],
  ['02:15 PM', 'Anu Maharjan', 'Post-op review', 'Pending', 'Orthopaedics', 'a0000000-0000-0000-0000-000000000006'],
];

type AppointmentRecord = {
  id: string;
  patient_id: string;
  appointment_time: string;
  visit_type: string;
  status: string;
  department: string;
  profiles: { full_name: string; phone: string } | null;
};

function mapAppointment(a: AppointmentRecord): AppointmentRow {
  return [
    a.appointment_time,
    a.profiles?.full_name ?? 'Unknown patient',
    a.visit_type,
    a.status,
    a.department,
    a.patient_id,
  ];
}

const ATTENTION_RULES = [
  {
    status: 'Reschedule Requested',
    title: 'Urgent follow-up',
    detail: 'Reschedule requested',
    icon: 'calendar',
    level: 'urgent',
  },
  {
    status: 'Pending',
    title: 'Waiting confirmation',
    detail: 'Awaiting patient confirmation',
    icon: 'bell',
    level: 'warning',
  },
  {
    status: 'Checked in',
    title: 'Checked in',
    detail: 'Patient checked in',
    icon: 'file',
    level: 'normal',
  },
] as const;

const STAT_ICONS: IconName[] = ['calendar', 'users', 'check', 'clock'];
const STAT_ICON_STYLES = [
  'bg-[#E6F4F2] text-[#0D9488]',
  'bg-[#EFF6FF] text-[#2563EB]',
  'bg-[#ECFDF5] text-[#059669]',
  'bg-[#FFFBEB] text-[#B45309]',
];

function getPatientInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function DoctorDashboardPage() {
  const [appointments, setAppointments] = useState<AppointmentRow[]>(MOCK_APPOINTMENTS);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    doctorService
      .getDashboardAppointments()
      .then((rows) => {
        if (rows.length > 0) {
          setAppointments(rows.map(mapAppointment));
          setUsingMock(false);
        } else {
          setAppointments(MOCK_APPOINTMENTS);
          setUsingMock(true);
        }
      })
      .catch(() => {
        setAppointments(MOCK_APPOINTMENTS);
        setUsingMock(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const showStats = !loading && !usingMock;
  const stats: [string, string][] = [
    [showStats ? String(appointments.length) : '—', 'Appointments'],
    [
      showStats ? String(appointments.filter((a) => a[3] === 'Checked in').length) : '—',
      'Waiting now',
    ],
    [
      showStats ? String(appointments.filter((a) => a[3] === 'Confirmed').length) : '—',
      'Confirmed',
    ],
    [
      showStats
        ? String(
            appointments.filter(
              (a) => a[3] === 'Pending' || a[3] === 'Reschedule Requested'
            ).length
          )
        : '—',
      'Follow-ups due',
    ],
  ];

  const attention = ATTENTION_RULES.map((rule) => {
    const row = appointments.find((a) => a[3] === rule.status);
    return row ? { ...rule, patient: row[1], patientId: row[5] } : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-9 py-6 sm:py-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#0D9488]">
          Doctor dashboard
        </p>
        <h1 className="mt-1 text-xl sm:text-[23px] font-semibold tracking-[-0.03em] text-[#0F172A]">
          Good morning, Dr. Adhikari
        </h1>
        <p className="mt-1 text-[11px] text-[#64748B]">Here’s what needs your attention today.</p>
      </div>

      <div className="mt-6 sm:mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([value, label], index) => (
          <div key={label} className="patient-card flex items-center gap-4 p-4 sm:p-5">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${STAT_ICON_STYLES[index]}`}>
              <Icon name={STAT_ICONS[index]} size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-semibold leading-none tracking-[-0.04em] tabular-nums text-[#0F172A] sm:text-[28px]">
                {value}
              </p>
              <p className="mt-1.5 text-sm text-[#64748B]">{label}</p>
            </div>
          </div>
        ))}
      </div>

        {/* Needs Attention Section */}
        <section className="mt-7">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A]">Needs attention</h2>
              <p className="mt-0.5 text-sm text-[#64748B]">Clinical tasks ordered by urgency</p>
            </div>
            <Link
              href="/doctor/scan"
              className="flex h-9 items-center gap-2 rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#475569] shadow-xs transition hover:bg-slate-50"
            >
              <Icon name="scan" size={14} />
              Scan patient QR
            </Link>
          </div>

          <div className="mt-4 flex flex-col gap-3">
              {loading ? (
                <div className="patient-card p-4 text-sm text-[#64748B]">
                  Loading…
                </div>
              ) : attention.length === 0 ? (
                <div className="patient-card p-4 text-sm text-[#64748B]">
                  Nothing needs attention right now.
                </div>
              ) : (
                attention.map(({ title, patient, detail, icon, level, patientId }) => (
                  <Link
                    key={title}
                    href={patientId ? `/doctor/patient?id=${patientId}` : '/doctor/patient'}
                    className="patient-card patient-card-interactive flex min-w-0 items-center gap-3 p-3 text-left sm:gap-4 sm:p-4"
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                        level === 'urgent'
                          ? 'bg-[#FEF2F2] text-[#DC2626]'
                          : level === 'warning'
                          ? 'bg-[#FFFBEB] text-[#D97706]'
                          : 'bg-[#F0FDFA] text-[#0D9488]'
                      }`}
                    >
                      <Icon name={icon as IconName} size={18} />
                    </span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#DDEBE9] text-xs font-semibold text-[#0F766E]">
                      {getPatientInitials(patient)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-semibold text-[#0F172A]">{title}</strong>
                      <span className="mt-0.5 block truncate text-sm text-[#475569]">{patient}</span>
                      <span className="mt-0.5 block text-xs text-[#64748B]">{detail}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0D9488]">
                      Review <Icon name="arrow" size={14} />
                    </span>
                  </Link>
                ))
              )}
          </div>
        </section>

      <div className="mt-7">
        {/* Appointments Section */}
        <div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A]">
                Today’s appointments
              </h2>
              <p className="mt-0.5 text-sm text-[#64748B]">
                {todayLabel}
                {usingMock && (
                  <span className="ml-2 text-[10px] text-amber-500 font-medium">(demo data)</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setScheduleOpen(true)}
              className="text-xs font-semibold text-[#0D9488] hover:underline"
            >
              View full schedule
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3">
              {loading ? (
                <div className="patient-card p-4 text-sm text-[#64748B]">
                  Loading appointments…
                </div>
              ) : (
                appointments.map((item, index) => (
                  <article
                    key={`${item[0]}-${index}`}
                    className="patient-card patient-card-interactive flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#DDEBE9] text-xs font-semibold text-[#0F766E]">
                      {getPatientInitials(item[1])}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#0F172A]">{item[1]}</p>
                      <p className="mt-0.5 text-sm text-[#64748B]">{item[2]}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:w-[160px]">
                      <span className="flex items-center gap-1.5 text-sm font-medium tabular-nums text-[#334155]">
                        <Icon name="clock" size={15} className="text-[#64748B]" />
                        {item[0]}
                      </span>
                      <StatusPill status={item[3]} />
                    </div>
                    <Link
                      href={item[5] ? `/doctor/patient?id=${item[5]}` : '/doctor/patient'}
                      className="flex h-9 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white px-3 text-xs font-semibold text-[#475569] transition hover:bg-slate-50 sm:ml-auto"
                    >
                      Open
                    </Link>
                  </article>
                ))
              )}
          </div>
        </div>


      </div>

      {scheduleOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
          onClick={() => setScheduleOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-[#0F172A]">Full schedule</h2>
                <p className="mt-0.5 text-[10px] text-[#94A3B8]">{todayLabel}</p>
              </div>
              <button
                onClick={() => setScheduleOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-md text-[#64748B] hover:bg-slate-100"
                aria-label="Close schedule"
              >
                <Icon name="plus" size={16} className="rotate-45" />
              </button>
            </div>
            <div className="mt-4 flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
                {appointments.map((item, index) => (
                  <article
                    key={`${item[0]}-${index}`}
                    className="patient-card grid gap-3 p-4 sm:grid-cols-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#DDEBE9] text-xs font-semibold text-[#0F766E]">
                        {getPatientInitials(item[1])}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0F172A]">{item[1]}</p>
                        <p className="text-sm text-[#64748B]">{item[2]}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#475569]">
                      <span>{item[0]}</span>
                      <span>{item[4]}</span>
                      <StatusPill status={item[3]} />
                    </div>
                  </article>
                ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
