'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatusPill } from '@/components/common/StatusPill';
import { Icon } from '@/components/common/Icon';

const queue = [
  ['09:30 AM', 'Maya Gurung', '#CT-1987', 'Dr. S. Adhikari', 'Cardiology', 'Confirmed'],
  ['10:30 AM', 'Ramesh Sharma', '#CT-2048', 'Dr. S. Adhikari', 'Cardiology', 'Confirmed'],
  ['11:15 AM', 'Bikash Thapa', '#CT-2186', 'Dr. A. Karki', 'General Medicine', 'Pending'],
  ['12:00 PM', 'Sita Rai', '#CT-1934', 'Dr. B. Shrestha', 'Endocrinology', 'Reschedule Requested'],
  ['01:30 PM', 'Kiran Lama', '#CT-2231', 'Dr. A. Karki', 'General Medicine', 'Confirmed'],
  ['02:15 PM', 'Anu Maharjan', '#CT-2076', 'Dr. R. Joshi', 'Orthopaedics', 'Pending'],
  ['03:00 PM', 'Nabin KC', '#CT-1812', 'Dr. B. Shrestha', 'Endocrinology', 'Confirmed'],
];

export default function AdminFollowUpsPage() {
  const [filter, setFilter] = useState('All');
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  const visible = queue.filter(
    (row) => filter === 'All' || (statuses[row[2]] || row[5]) === filter
  );

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
            <button className="h-8 sm:h-9 rounded-md border border-[#CBD5E1] px-3 text-[10px] font-semibold text-[#475569] shadow-xs hover:bg-slate-50">
              24 June 2024
            </button>
            <button className="h-8 sm:h-9 rounded-md border border-[#CBD5E1] px-3 text-[10px] font-semibold text-[#475569] shadow-xs hover:bg-slate-50">
              All doctors
            </button>
          </div>
        </div>

        <div className="mt-5 sm:mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[16px] sm:text-[17px] font-semibold tracking-[-0.02em] text-[#0F172A]">
              Today’s patient queue
            </h2>
            <p className="mt-0.5 text-[10px] text-[#64748B]">
              {visible.length} appointments shown · Last synced just now
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
            {visible.map((row) => {
              const status = statuses[row[2]] || row[5];
              return (
                <div
                  key={row[2]}
                  className="grid h-[64px] sm:h-[68px] grid-cols-[.65fr_1.2fr_.85fr_1.2fr_1fr_1.2fr_1.15fr] items-center gap-3 border-t border-[#E2E8F0] px-4 text-[10px]"
                >
                  <span className="font-semibold tabular-nums text-[#334155]">{row[0]}</span>
                  <span className="font-semibold text-[#0F172A]">{row[1]}</span>
                  <span className="tabular-nums text-[#94A3B8]">{row[2]}</span>
                  <span className="text-[#475569]">{row[3]}</span>
                  <span className="text-[#64748B]">{row[4]}</span>
                  <span>
                    <StatusPill status={status} />
                  </span>
                  <div className="flex justify-end gap-2">
                    {status === 'Pending' && (
                      <button
                        onClick={() => setStatuses({ ...statuses, [row[2]]: 'Confirmed' })}
                        className="h-8 rounded-md bg-[#0D9488] px-2.5 text-[9px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E]"
                      >
                        Confirm
                      </button>
                    )}
                    {status === 'Reschedule Requested' && (
                      <button
                        onClick={() => setStatuses({ ...statuses, [row[2]]: 'Confirmed' })}
                        className="h-8 rounded-md border border-[#CBD5E1] px-2 text-[9px] font-semibold text-[#475569] shadow-xs hover:bg-slate-50"
                      >
                        Review
                      </button>
                    )}
                    <button className="h-8 px-1 text-[9px] font-semibold text-[#0D9488] hover:underline">
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {visible.length === 0 && (
          <div className="grid h-48 place-items-center border-b border-[#E2E8F0] text-[11px] text-[#94A3B8]">
            No appointments match this filter.
          </div>
        )}
      </main>
    </>
  );
}
