'use client';

import Link from 'next/link';
import { Icon } from '@/components/common/Icon';
import type { IconName } from '@/types';

const appointments = [
  ['09:30 AM', 'Maya Gurung', 'Routine follow-up', 'Checked in'],
  ['10:30 AM', 'Ramesh Sharma', 'Cardiology review', 'Next'],
  ['11:15 AM', 'Bikash Thapa', 'New consultation', 'Confirmed'],
  ['12:00 PM', 'Sita Rai', 'Medication review', 'Confirmed'],
  ['02:15 PM', 'Anu Maharjan', 'Post-op review', 'Pending'],
];

export default function DoctorDashboardPage() {
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
        {[
          ['12', 'Appointments'],
          ['3', 'Waiting now'],
          ['7', 'Prescriptions issued'],
          ['2', 'Follow-ups due'],
        ].map(([value, label], index) => (
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

      <div className="mt-7">
        {/* Appointments Section */}
        <div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#0F172A]">
                Today’s appointments
              </h2>
              <p className="mt-0.5 text-[10px] text-[#94A3B8]">Monday, 24 June</p>
            </div>
            <button className="text-[10px] font-semibold text-[#0D9488] hover:underline">
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
              {appointments.map((item) => (
                <div
                  key={item[0]}
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
                    href="/doctor/patient"
                    className="font-semibold text-[#0D9488] hover:underline"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          </div>
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
              {[
                ['Follow-up overdue', 'Hari Prasad', 'Due 3 days ago', 'calendar', 'urgent'],
                ['Low adherence alert', 'Sunita Rai', '52% taken this week', 'bell', 'warning'],
                ['Lab result received', 'Ramesh Sharma', 'Lipid profile · Received today', 'file', 'normal'],
              ].map(([title, patient, detail, icon, level]) => (
                <Link
                  key={title}
                  href="/doctor/patient"
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
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
