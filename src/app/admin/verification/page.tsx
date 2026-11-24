'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatusPill } from '@/components/common/StatusPill';
import { Icon } from '@/components/common/Icon';

const doctors = [
  ['Dr. Pratik Manandhar', 'Internal Medicine', 'NMC 24871', 'license-pratik.pdf'],
  ['Dr. Sneha Poudel', 'Dermatology', 'NMC 31209', 'license-sneha.pdf'],
  ['Dr. Aayush Shahi', 'Paediatrics', 'NMC 29714', 'license-aayush.pdf'],
  ['Dr. Rojina Tamang', 'Obstetrics & Gynaecology', 'NMC 26583', 'license-rojina.pdf'],
  ['Dr. Samir Khadka', 'General Practice', 'NMC 33410', 'license-samir.pdf'],
];

export default function DoctorVerificationPage() {
  const [decisions, setDecisions] = useState<Record<string, string>>({});

  return (
    <>
      <AdminHeader title="Doctor Verification" subtitle="Access & compliance" />
      <main className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-9 py-6 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[17px] sm:text-[18px] font-semibold tracking-[-0.02em] text-[#0F172A]">
              New Registration Requests
            </h2>
            <p className="mt-1 text-[11px] text-[#64748B]">
              Review NMC details and submitted license documents before granting access.
            </p>
          </div>
          <div className="flex h-8 sm:h-9 items-center gap-2 rounded-md border border-[#CBD5E1] px-3 text-[10px] text-[#64748B] bg-white shadow-xs">
            <Icon name="scan" size={14} />
            Search doctors
          </div>
        </div>

        <div className="mt-6 sm:mt-7 overflow-x-auto border-y border-[#E2E8F0]">
          <div className="min-w-[750px]">
            <div className="grid grid-cols-[1.25fr_1.15fr_1fr_1.2fr_.65fr_1fr] gap-4 bg-[#F8FAFC] px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
              <span>Doctor name</span>
              <span>Specialization</span>
              <span>NMC registration</span>
              <span>License document</span>
              <span>Status</span>
              <span className="text-right">Decision</span>
            </div>
            {doctors.map((doctor) => {
              const decision = decisions[doctor[0]];
              const initials = doctor[0]
                .split(' ')
                .slice(1)
                .map((x) => x[0])
                .join('');

              return (
                <div
                  key={doctor[0]}
                  className="grid h-[76px] sm:h-[82px] grid-cols-[1.25fr_1.15fr_1fr_1.2fr_.65fr_1fr] items-center gap-4 border-t border-[#E2E8F0] px-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-[#EEF4F4] text-[10px] font-semibold text-[#0F766E]">
                      {initials}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#0F172A]">{doctor[0]}</p>
                      <p className="mt-0.5 text-[9px] text-[#94A3B8]">Registered 23 Jun 2024</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#475569]">{doctor[1]}</span>
                  <span className="text-[10px] font-medium tabular-nums text-[#334155]">{doctor[2]}</span>
                  <button
                    onClick={() => alert(`Opening ${doctor[3]}`)}
                    className="flex items-center gap-1.5 text-left text-[10px] font-semibold text-[#0D9488] hover:underline"
                  >
                    <Icon name="file" size={14} />
                    {doctor[3]}
                    <Icon name="arrow" size={12} />
                  </button>
                  <span>
                    {decision ? (
                      <StatusPill status={decision} />
                    ) : (
                      <StatusPill status="Pending" />
                    )}
                  </span>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() =>
                        setDecisions({ ...decisions, [doctor[0]]: 'Rejected' })
                      }
                      className="h-8 rounded-md border border-[#CBD5E1] px-2.5 sm:px-3 text-[9px] font-semibold text-[#64748B] shadow-xs hover:bg-slate-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() =>
                        setDecisions({ ...decisions, [doctor[0]]: 'Confirmed' })
                      }
                      className="h-8 rounded-md bg-[#0D9488] px-2.5 sm:px-3 text-[9px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E]"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] text-[#94A3B8]">Showing 5 of 5 pending requests</p>
          <p className="flex items-center gap-1.5 text-[10px] text-[#64748B]">
            <Icon name="shield" size={13} className="text-[#0D9488]" />
            All decisions are recorded in the clinic audit log.
          </p>
        </div>
      </main>
    </>
  );
}
