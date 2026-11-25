'use client';

import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatusPill } from '@/components/common/StatusPill';
import { adminService } from '@/lib/supabase/services';

type FollowUpRow = {
  id: string;
  time: string;
  patient: string;
  doctor: string;
  department: string;
  status: string;
};

// Fallback data shown when the DB is empty or unreachable
const MOCK_STATS: [string, string][] = [
  ['24', 'Scheduled today'],
  ['18', 'Confirmed'],
  ['3', 'Reschedule requests'],
  ['2', 'Pending doctors'],
];

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [headers, ...rows]
    .map((row) => row.map(escape).join(','))
    .join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const MOCK_FOLLOW_UPS: FollowUpRow[] = [
  { id: 'mock-0', time: '10:00 AM', patient: 'Maya Gurung', doctor: 'Dr. S. Adhikari', department: 'Cardiology', status: 'Confirmed' },
  { id: 'mock-1', time: '10:30 AM', patient: 'Ramesh Sharma', doctor: 'Dr. S. Adhikari', department: 'Cardiology', status: 'Confirmed' },
  { id: 'mock-2', time: '11:15 AM', patient: 'Bikash Thapa', doctor: 'Dr. A. Karki', department: 'General Medicine', status: 'Pending' },
  { id: 'mock-3', time: '12:00 PM', patient: 'Sita Rai', doctor: 'Dr. B. Shrestha', department: 'Endocrinology', status: 'Reschedule Requested' },
  { id: 'mock-4', time: '1:30 PM', patient: 'Kiran Lama', doctor: 'Dr. A. Karki', department: 'General Medicine', status: 'Confirmed' },
  { id: 'mock-5', time: '2:15 PM', patient: 'Anu Maharjan', doctor: 'Dr. R. Joshi', department: 'Orthopaedics', status: 'Pending' },
  { id: 'mock-6', time: '3:00 PM', patient: 'Nabin KC', doctor: 'Dr. B. Shrestha', department: 'Endocrinology', status: 'Confirmed' },
];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<[string, string][]>(MOCK_STATS);
  const [followUps, setFollowUps] = useState<FollowUpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('All departments');
  const [selected, setSelected] = useState<FollowUpRow | null>(null);

  useEffect(() => {
    Promise.all([
      adminService.getOverviewStats(),
      adminService.getFollowUpQueue(),
      adminService.getDoctorVerifications(),
    ])
      .then(([summary, appointments, verifications]) => {
        if (appointments.length === 0 || verifications.length === 0) {
          setStats(MOCK_STATS);
          setFollowUps(MOCK_FOLLOW_UPS);
          setUsingMock(true);
          return;
        }
        // getOverviewStats() substitutes hardcoded numbers for zero counts
        // (services.ts:369-372). Use the real row counts for those cases so
        // the substitutes are never presented as live values.
        const realCounts = [
          appointments.length,
          appointments.filter((a) => a.status === 'Confirmed').length,
          appointments.filter((a) => a.status === 'Reschedule Requested').length,
          verifications.filter((d) => d.verification_status === 'Pending').length,
        ];
        const values = [
          summary.scheduled,
          summary.confirmed,
          summary.reschedule,
          summary.pendingDoctors,
        ].map((n, i) => (realCounts[i] === 0 ? 0 : n));

        setStats([
          [String(values[0]), 'Scheduled today'],
          [String(values[1]), 'Confirmed'],
          [String(values[2]), 'Reschedule requests'],
          [String(values[3]), 'Pending doctors'],
        ]);
        setFollowUps(
          appointments.map((a) => ({
            id: a.id,
            time: a.appointment_time,
            patient: a.patient?.full_name ?? '—',
            doctor: a.doctor?.full_name ?? '—',
            department: a.department,
            status: a.status,
          }))
        );
        setUsingMock(false);
      })
      .catch(() => {
        setStats(MOCK_STATS);
        setFollowUps(MOCK_FOLLOW_UPS);
        setUsingMock(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const departments = Array.from(new Set(followUps.map((row) => row.department)));
  const visibleFollowUps = followUps.filter(
    (row) => departmentFilter === 'All departments' || row.department === departmentFilter
  );

  function handleExport() {
    downloadCsv(
      'today-follow-ups.csv',
      ['Time', 'Patient', 'Doctor', 'Department', 'Status'],
      visibleFollowUps.map((row) => [
        row.time,
        row.patient,
        row.doctor,
        row.department,
        row.status,
      ])
    );
  }

  return (
    <>
      <AdminHeader title="Clinic Overview" subtitle={todayLabel} />
      <main className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-9 py-6 sm:py-7">
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#E2E8F0] pb-5 sm:pb-6 gap-4 sm:gap-0">
          {stats.map(([value, label], i) => (
            <div
              key={label}
              className={`sm:px-6 sm:first:pl-0 ${i < 3 ? 'sm:border-r sm:border-[#E2E8F0]' : ''}`}
            >
              <p
                className={`text-2xl sm:text-[32px] lg:text-[34px] font-semibold tracking-[-0.045em] tabular-nums ${
                  i === 2 ? 'text-[#F59E0B]' : 'text-[#0F172A]'
                }`}
              >
                {loading ? '—' : value}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#64748B]">
                {label}
                {usingMock && i === 0 && (
                  <span className="ml-2 text-[10px] text-amber-500 font-medium">(demo data)</span>
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[17px] sm:text-[18px] font-semibold tracking-[-0.02em] text-[#0F172A]">
              Today’s Follow-Ups
            </h2>
            <p className="mt-0.5 text-[11px] text-[#64748B]">
              {loading ? (
                'Loading…'
              ) : (
                <>
                  Appointments across all departments
                  {usingMock && (
                    <span className="ml-2 text-[10px] text-amber-500 font-medium">(demo data)</span>
                  )}
                </>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="h-8 sm:h-9 rounded-md border border-[#CBD5E1] bg-white px-3 text-[10px] font-semibold text-[#475569] shadow-xs"
            >
              <option>All departments</option>
              {departments.map((department) => (
                <option key={department}>{department}</option>
              ))}
            </select>
            <button
              onClick={handleExport}
              className="h-8 sm:h-9 rounded-md border border-[#CBD5E1] px-3 text-[10px] font-semibold text-[#475569] shadow-xs hover:bg-slate-50"
            >
              Export list
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto border-y border-[#E2E8F0]">
          <div className="min-w-[650px]">
            <div className="grid grid-cols-[.65fr_1.15fr_1.2fr_1fr_1.25fr_70px] gap-4 bg-[#F8FAFC] px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
              <span>Time</span>
              <span>Patient</span>
              <span>Doctor</span>
              <span>Department</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {loading ? (
              <div className="border-t border-[#E2E8F0] px-4 py-6 text-center text-[11px] text-[#94A3B8]">
                Loading appointments…
              </div>
            ) : (
              visibleFollowUps.map((row) => (
                <div
                  key={row.id}
                  className="grid h-[62px] sm:h-[65px] grid-cols-[.65fr_1.15fr_1.2fr_1fr_1.25fr_70px] items-center gap-4 border-t border-[#E2E8F0] px-4 text-[11px] text-[#475569]"
                >
                  <span className="font-semibold tabular-nums text-[#334155]">{row.time}</span>
                  <span className="font-semibold text-[#0F172A]">{row.patient}</span>
                  <span>{row.doctor}</span>
                  <span className="text-[#64748B]">{row.department}</span>
                  <span>
                    <StatusPill status={row.status} />
                  </span>
                  <button
                    onClick={() => setSelected(row)}
                    className="text-[10px] font-semibold text-[#0D9488] hover:underline"
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#0F172A]/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Follow-up details"
            className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[14px] font-semibold text-[#0F172A]">Follow-up details</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-[10px] font-semibold text-[#64748B] hover:text-[#0F172A]"
              >
                Close
              </button>
            </div>
            <dl className="mt-4 grid grid-cols-[110px_1fr] gap-y-3 text-[11px]">
              <dt className="text-[#94A3B8]">Time</dt>
              <dd className="text-[#334155]">{selected.time}</dd>
              <dt className="text-[#94A3B8]">Patient</dt>
              <dd className="text-[#334155]">{selected.patient}</dd>
              <dt className="text-[#94A3B8]">Doctor</dt>
              <dd className="text-[#334155]">{selected.doctor}</dd>
              <dt className="text-[#94A3B8]">Department</dt>
              <dd className="text-[#334155]">{selected.department}</dd>
              <dt className="text-[#94A3B8]">Status</dt>
              <dd className="text-[#334155]">{selected.status}</dd>
              <dt className="text-[#94A3B8]">ID</dt>
              <dd className="break-all text-[#334155]">{selected.id}</dd>
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
