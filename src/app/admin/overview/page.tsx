'use client';

import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatusPill } from '@/components/common/StatusPill';

const followUps = [
  ['10:00 AM', 'Maya Gurung', 'Dr. S. Adhikari', 'Cardiology', 'Confirmed'],
  ['10:30 AM', 'Ramesh Sharma', 'Dr. S. Adhikari', 'Cardiology', 'Confirmed'],
  ['11:15 AM', 'Bikash Thapa', 'Dr. A. Karki', 'General Medicine', 'Pending'],
  ['12:00 PM', 'Sita Rai', 'Dr. B. Shrestha', 'Endocrinology', 'Reschedule Requested'],
  ['1:30 PM', 'Kiran Lama', 'Dr. A. Karki', 'General Medicine', 'Confirmed'],
  ['2:15 PM', 'Anu Maharjan', 'Dr. R. Joshi', 'Orthopaedics', 'Pending'],
  ['3:00 PM', 'Nabin KC', 'Dr. B. Shrestha', 'Endocrinology', 'Confirmed'],
];

export default function AdminOverviewPage() {
  return (
    <>
      <AdminHeader title="Clinic Overview" subtitle="Monday, 24 June" />
      <main className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-9 py-6 sm:py-7">
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#E2E8F0] pb-5 sm:pb-6 gap-4 sm:gap-0">
          {[
            ['24', 'Scheduled today'],
            ['18', 'Confirmed'],
            ['3', 'Reschedule requests'],
            ['2', 'Pending doctors'],
          ].map(([value, label], i) => (
            <div
              key={label}
              className={`sm:px-6 sm:first:pl-0 ${i < 3 ? 'sm:border-r sm:border-[#E2E8F0]' : ''}`}
            >
              <p
                className={`text-2xl sm:text-[32px] lg:text-[34px] font-semibold tracking-[-0.045em] tabular-nums ${
                  i === 2 ? 'text-[#F59E0B]' : 'text-[#0F172A]'
                }`}
              >
                {value}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#64748B]">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[17px] sm:text-[18px] font-semibold tracking-[-0.02em] text-[#0F172A]">
              Today’s Follow-Ups
            </h2>
            <p className="mt-0.5 text-[11px] text-[#64748B]">Appointments across all departments</p>
          </div>
          <div className="flex gap-2">
            <button className="h-8 sm:h-9 rounded-md border border-[#CBD5E1] px-3 text-[10px] font-semibold text-[#475569] shadow-xs hover:bg-slate-50">
              All departments
            </button>
            <button className="h-8 sm:h-9 rounded-md border border-[#CBD5E1] px-3 text-[10px] font-semibold text-[#475569] shadow-xs hover:bg-slate-50">
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
            {followUps.map((row) => (
              <div
                key={row[0]}
                className="grid h-[62px] sm:h-[65px] grid-cols-[.65fr_1.15fr_1.2fr_1fr_1.25fr_70px] items-center gap-4 border-t border-[#E2E8F0] px-4 text-[11px] text-[#475569]"
              >
                <span className="font-semibold tabular-nums text-[#334155]">{row[0]}</span>
                <span className="font-semibold text-[#0F172A]">{row[1]}</span>
                <span>{row[2]}</span>
                <span className="text-[#64748B]">{row[3]}</span>
                <span>
                  <StatusPill status={row[4]} />
                </span>
                <Link
                  href="/admin/follow-ups"
                  className="text-[10px] font-semibold text-[#0D9488] hover:underline"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
