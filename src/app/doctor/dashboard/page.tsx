'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/common/Icon';
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

      <div className="mt-6 sm:mt-7 grid grid-cols-2 sm:grid-cols-4 border-y border-[#E2E8F0] py-4 gap-4 sm:gap-0">
        {stats.map(([value, label], index) => (
          <div
            key={label}
            className={`sm:px-6 sm:first:pl-0 ${index < 3 ? 'sm:border-r sm:border-[#E2E8F0]' : ''}`}
          >
            <p className="text-2xl sm:text-[27px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-[#0F172A]">
              {value}
            </p>
            <p className="mt-1.5 sm:mt-2 text-[10px] text-[#64748B]">{label}</p>
          </div>
        ))}
      </div>

        {/* Needs Attention Section */}
        <section className="mt-7">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-semibold text-[#0F172A]">Needs attention</h2>
              <p className="mt-0.5 text-[10px] text-[#94A3B8]">Clinical tasks ordered by urgency</p>
            </div>
            <Link
              href="/doctor/scan"
              className="flex h-8 sm:h-9 items-center gap-1.5 sm:gap-2 rounded-md border border-[#CBD5E1] px-2.5 sm:px-3 text-[10px] font-semibold text-[#475569] shadow-xs hover:bg-slate-50"
            >
              <Icon name="scan" size={14} />
              Scan patient QR
            </Link>
          </div>

          <div className="mt-3 border-y border-[#E2E8F0] overflow-x-auto">
            <div className="min-w-[500px]">
              {loading ? (
                <div className="border-t border-[#E2E8F0] px-3 py-4 text-[10px] text-[#94A3B8]">
                  Loading…
                </div>
              ) : attention.length === 0 ? (
                <div className="border-t border-[#E2E8F0] px-3 py-4 text-[10px] text-[#94A3B8]">
                  Nothing needs attention right now.
                </div>
              ) : (
                attention.map(({ title, patient, detail, icon, level, patientId }) => (
                  <Link
                    key={title}
                    href={patientId ? `/doctor/patient?id=${patientId}` : '/doctor/patient'}
                    className="grid h-[52px] w-full grid-cols-[36px_1.25fr_1fr_1.4fr_60px] items-center gap-3 border-t border-[#E2E8F0] px-3 text-left first:border-0 hover:bg-[#F8FAFC]"
                  >
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full ${
                        level === 'urgent'
                          ? 'bg-[#FEF2F2] text-[#DC2626]'
                          : level === 'warning'
                          ? 'bg-[#FFFBEB] text-[#D97706]'
                          : 'bg-[#F0FDFA] text-[#0D9488]'
                      }`}
                    >
                      <Icon name={icon as IconName} size={13} />
                    </span>
                    <strong className="text-[10px] font-semibold text-[#334155]">{title}</strong>
                    <span className="text-[10px] font-medium text-[#475569]">{patient}</span>
                    <span
                      className={`text-[9px] ${
                        level === 'urgent'
                          ? 'font-semibold text-[#DC2626]'
                          : level === 'warning'
                          ? 'font-medium text-[#B45309]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {detail}
                    </span>
                    <span className="flex items-center justify-end gap-1 text-[9px] font-semibold text-[#0D9488]">
                      Review <Icon name="arrow" size={12} />
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

      <div className="mt-7">
        {/* Appointments Section */}
        <div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#0F172A]">
                Today’s appointments
              </h2>
              <p className="mt-0.5 text-[10px] text-[#94A3B8]">
                {todayLabel}
                {usingMock && (
                  <span className="ml-2 text-[10px] text-amber-500 font-medium">(demo data)</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setScheduleOpen(true)}
              className="text-[10px] font-semibold text-[#0D9488] hover:underline"
            >
              View full schedule
            </button>
          </div>

          <div className="mt-3.5 sm:mt-4 border-y border-[#E2E8F0] overflow-x-auto">
            <div className="min-w-[500px]">
              <div className="grid grid-cols-[.65fr_1.2fr_1.7fr_1fr_70px] gap-3 bg-[#F8FAFC] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[.07em] text-[#94A3B8]">
                <span>Time</span>
                <span>Patient</span>
                <span>Visit</span>
                <span>Status</span>
                <span />
              </div>
              {loading ? (
                <div className="border-t border-[#E2E8F0] px-4 py-4 text-[10px] text-[#94A3B8]">
                  Loading appointments…
                </div>
              ) : (
                appointments.map((item, index) => (
                  <div
                    key={`${item[0]}-${index}`}
                    className="grid h-[52px] grid-cols-[.65fr_1.2fr_1.7fr_1fr_70px] items-center gap-3 border-t border-[#E2E8F0] px-4 text-[10px]"
                  >
                    <span className="font-semibold tabular-nums text-[#334155]">{item[0]}</span>
                    <span className="font-semibold text-[#0F172A]">{item[1]}</span>
                    <span className="text-[#64748B]">{item[2]}</span>
                    <span
                      className={
                        item[3] === 'Next'
                          ? 'font-semibold text-[#0D9488]'
                          : 'text-[#64748B]'
                      }
                    >
                      {item[3]}
                    </span>
                    <Link
                      href={item[5] ? `/doctor/patient?id=${item[5]}` : '/doctor/patient'}
                      className="font-semibold text-[#0D9488] hover:underline"
                    >
                      Open
                    </Link>
                  </div>
                ))
              )}
            </div>
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
            <div className="mt-4 border-y border-[#E2E8F0] overflow-x-auto">
              <div className="min-w-[520px]">
                <div className="grid grid-cols-[.65fr_1.2fr_1.7fr_1.1fr_1fr] gap-3 bg-[#F8FAFC] px-3 py-2.5 text-[9px] font-semibold uppercase tracking-[.07em] text-[#94A3B8]">
                  <span>Time</span>
                  <span>Patient</span>
                  <span>Visit</span>
                  <span>Department</span>
                  <span>Status</span>
                </div>
                {appointments.map((item, index) => (
                  <div
                    key={`${item[0]}-${index}`}
                    className="grid grid-cols-[.65fr_1.2fr_1.7fr_1.1fr_1fr] gap-3 border-t border-[#E2E8F0] px-3 py-2.5 text-[10px]"
                  >
                    <span className="font-semibold tabular-nums text-[#334155]">{item[0]}</span>
                    <span className="font-semibold text-[#0F172A]">{item[1]}</span>
                    <span className="text-[#64748B]">{item[2]}</span>
                    <span className="text-[#64748B]">{item[4]}</span>
                    <span className="text-[#64748B]">{item[3]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
