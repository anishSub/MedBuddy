'use client';

import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatusPill } from '@/components/common/StatusPill';
import { Icon } from '@/components/common/Icon';
import { adminService } from '@/lib/supabase/services';
import type { AppointmentStatus } from '@/lib/supabase/types';

type QueueRow = {
  id: string;
  time: string;
  date: string;
  patient: string;
  code: string;
  doctor: string;
  department: string;
  visitType: string;
  status: AppointmentStatus;
};

function formatDate(value: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

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

// Fallback data shown when the DB is empty or unreachable
const MOCK_QUEUE: QueueRow[] = [
  { id: '#CT-1987', time: '09:30 AM', date: '', patient: 'Maya Gurung', code: '#CT-1987', doctor: 'Dr. S. Adhikari', department: 'Cardiology', visitType: '—', status: 'Confirmed' },
  { id: '#CT-2048', time: '10:30 AM', date: '', patient: 'Ramesh Sharma', code: '#CT-2048', doctor: 'Dr. S. Adhikari', department: 'Cardiology', visitType: '—', status: 'Confirmed' },
  { id: '#CT-2186', time: '11:15 AM', date: '', patient: 'Bikash Thapa', code: '#CT-2186', doctor: 'Dr. A. Karki', department: 'General Medicine', visitType: '—', status: 'Pending' },
  { id: '#CT-1934', time: '12:00 PM', date: '', patient: 'Sita Rai', code: '#CT-1934', doctor: 'Dr. B. Shrestha', department: 'Endocrinology', visitType: '—', status: 'Reschedule Requested' },
  { id: '#CT-2231', time: '01:30 PM', date: '', patient: 'Kiran Lama', code: '#CT-2231', doctor: 'Dr. A. Karki', department: 'General Medicine', visitType: '—', status: 'Confirmed' },
  { id: '#CT-2076', time: '02:15 PM', date: '', patient: 'Anu Maharjan', code: '#CT-2076', doctor: 'Dr. R. Joshi', department: 'Orthopaedics', visitType: '—', status: 'Pending' },
  { id: '#CT-1812', time: '03:00 PM', date: '', patient: 'Nabin KC', code: '#CT-1812', doctor: 'Dr. B. Shrestha', department: 'Endocrinology', visitType: '—', status: 'Confirmed' },
];

export default function AdminFollowUpsPage() {
  const [filter, setFilter] = useState('All');
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AppointmentStatus>>({});
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('All dates');
  const [doctorFilter, setDoctorFilter] = useState('All doctors');
  const [selected, setSelected] = useState<QueueRow | null>(null);

  useEffect(() => {
    adminService
      .getFollowUpQueue()
      .then((rows) => {
        if (rows.length === 0) {
          setQueue(MOCK_QUEUE);
          setUsingMock(true);
          return;
        }
        setQueue(
          rows.map((a) => ({
            id: a.id,
            time: a.appointment_time,
            date: a.appointment_date ?? '',
            patient: a.patient?.full_name ?? '—',
            code: `#${a.id.slice(0, 8)}`,
            doctor: a.doctor?.full_name ?? '—',
            department: a.department,
            visitType: a.visit_type ?? '—',
            status: a.status as AppointmentStatus,
          }))
        );
        setUsingMock(false);
      })
      .catch(() => {
        setQueue(MOCK_QUEUE);
        setUsingMock(true);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleStatus(row: QueueRow, next: AppointmentStatus) {
    if (usingMock) {
      alert('Demo data — connect to the database to update appointments.');
      return;
    }
    setSavingId(row.id);
    try {
      await adminService.updateAppointmentStatus(row.id, next);
      setStatuses((prev) => ({ ...prev, [row.id]: next }));
    } catch {
      alert('Could not update appointment status. Please try again.');
    } finally {
      setSavingId(null);
    }
  }

  const dates = Array.from(new Set(queue.map((row) => row.date).filter(Boolean)));
  const doctors = Array.from(new Set(queue.map((row) => row.doctor).filter(Boolean)));
  const visible = queue.filter((row) => {
    const matchesStatus = filter === 'All' || (statuses[row.id] || row.status) === filter;
    const matchesDate =
      dateFilter === 'All dates' || row.date === '' || row.date === dateFilter;
    const matchesDoctor = doctorFilter === 'All doctors' || row.doctor === doctorFilter;
    return matchesStatus && matchesDate && matchesDoctor;
  });

  function handleExport() {
    downloadCsv(
      'follow-up-queue.csv',
      ['ID', 'Date', 'Time', 'Patient', 'Doctor', 'Department', 'Visit type', 'Status'],
      visible.map((row) => [
        row.id,
        row.date,
        row.time,
        row.patient,
        row.doctor,
        row.department,
        row.visitType,
        statuses[row.id] || row.status,
      ])
    );
  }

  return (
    <>
      <AdminHeader
        title="Follow-Up Queue"
        subtitle="Appointments & patient coordination"
      />
      <main className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-9 py-6 sm:py-7">
        <div className="flex flex-wrap items-end justify-between border-b border-[#E2E8F0] gap-3">
          <div className="flex gap-4 sm:gap-7 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Confirmed', 'Pending', 'Reschedule Requested'].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`relative h-10 sm:h-11 text-[11px] font-semibold shrink-0 transition ${
                  filter === item
                    ? 'text-[#0D9488] after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-[#0D9488]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mb-2 sm:mb-3 flex gap-2">
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="h-8 sm:h-9 rounded-md border border-[#CBD5E1] bg-white px-3 text-[10px] font-semibold text-[#475569] shadow-xs"
            >
              <option value="All dates">All dates</option>
              {dates.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
            <select
              value={doctorFilter}
              onChange={(event) => setDoctorFilter(event.target.value)}
              className="h-8 sm:h-9 rounded-md border border-[#CBD5E1] bg-white px-3 text-[10px] font-semibold text-[#475569] shadow-xs"
            >
              <option>All doctors</option>
              {doctors.map((doctor) => (
                <option key={doctor}>{doctor}</option>
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

        <div className="mt-5 sm:mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[16px] sm:text-[17px] font-semibold tracking-[-0.02em] text-[#0F172A]">
              Today’s patient queue
            </h2>
            <p className="mt-0.5 text-[10px] text-[#64748B]">
              {loading ? (
                'Loading…'
              ) : (
                <>
                  {visible.length} appointments shown · Last synced just now
                  {usingMock && (
                    <span className="ml-2 text-[10px] text-amber-500 font-medium">(demo data)</span>
                  )}
                </>
              )}
            </p>
          </div>
          <button className="flex h-8 sm:h-9 items-center gap-1.5 sm:gap-2 rounded-md bg-[#0D9488] px-3 sm:px-3.5 text-[10px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E]">
            <Icon name="plus" size={14} />
            Add follow-up
          </button>
        </div>

        <div className="mt-5 overflow-x-auto border-y border-[#E2E8F0]">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[.65fr_1.2fr_.85fr_1.2fr_1fr_1.2fr_1.15fr] gap-3 bg-[#F8FAFC] px-4 py-3 text-[9px] font-semibold uppercase tracking-[.07em] text-[#94A3B8]">
              <span>Time</span>
              <span>Patient</span>
              <span>ID</span>
              <span>Doctor</span>
              <span>Department</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>
            {loading ? (
              <div className="border-t border-[#E2E8F0] px-4 py-6 text-center text-[10px] text-[#94A3B8]">
                Loading appointments…
              </div>
            ) : (
              visible.map((row) => {
                const status = statuses[row.id] || row.status;
                return (
                  <div
                    key={row.id}
                    className="grid h-[64px] sm:h-[68px] grid-cols-[.65fr_1.2fr_.85fr_1.2fr_1fr_1.2fr_1.15fr] items-center gap-3 border-t border-[#E2E8F0] px-4 text-[10px]"
                  >
                    <span className="font-semibold tabular-nums text-[#334155]">{row.time}</span>
                    <span className="font-semibold text-[#0F172A]">{row.patient}</span>
                    <span className="tabular-nums text-[#94A3B8]">{row.code}</span>
                    <span className="text-[#475569]">{row.doctor}</span>
                    <span className="text-[#64748B]">{row.department}</span>
                    <span>
                      <StatusPill status={status} />
                    </span>
                    <div className="flex justify-end gap-2">
                      {status === 'Pending' && (
                        <button
                          onClick={() => handleStatus(row, 'Confirmed')}
                          disabled={savingId === row.id}
                          className="h-8 rounded-md bg-[#0D9488] px-2.5 text-[9px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E]"
                        >
                          Confirm
                        </button>
                      )}
                      {status === 'Reschedule Requested' && (
                        <button
                          onClick={() => handleStatus(row, 'Confirmed')}
                          disabled={savingId === row.id}
                          className="h-8 rounded-md border border-[#CBD5E1] px-2 text-[9px] font-semibold text-[#475569] shadow-xs hover:bg-slate-50"
                        >
                          Review
                        </button>
                      )}
                      <button
                        onClick={() => setSelected(row)}
                        className="h-8 px-1 text-[9px] font-semibold text-[#0D9488] hover:underline"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {!loading && visible.length === 0 && (
          <div className="grid h-48 place-items-center border-b border-[#E2E8F0] text-[11px] text-[#94A3B8]">
            No appointments match this filter.
          </div>
        )}
      </main>

      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#0F172A]/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Appointment details"
            className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[14px] font-semibold text-[#0F172A]">Appointment details</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-[10px] font-semibold text-[#64748B] hover:text-[#0F172A]"
              >
                Close
              </button>
            </div>
            <dl className="mt-4 grid grid-cols-[110px_1fr] gap-y-3 text-[11px]">
              <dt className="text-[#94A3B8]">ID</dt>
              <dd className="break-all text-[#334155]">{selected.id}</dd>
              <dt className="text-[#94A3B8]">Time</dt>
              <dd className="text-[#334155]">{selected.time}</dd>
              <dt className="text-[#94A3B8]">Date</dt>
              <dd className="text-[#334155]">{selected.date ? formatDate(selected.date) : '—'}</dd>
              <dt className="text-[#94A3B8]">Patient</dt>
              <dd className="text-[#334155]">{selected.patient}</dd>
              <dt className="text-[#94A3B8]">Doctor</dt>
              <dd className="text-[#334155]">{selected.doctor}</dd>
              <dt className="text-[#94A3B8]">Department</dt>
              <dd className="text-[#334155]">{selected.department}</dd>
              <dt className="text-[#94A3B8]">Visit type</dt>
              <dd className="text-[#334155]">{selected.visitType}</dd>
              <dt className="text-[#94A3B8]">Status</dt>
              <dd className="text-[#334155]">{statuses[selected.id] || selected.status}</dd>
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
