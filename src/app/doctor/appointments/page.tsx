'use client';

import { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { StatusPill } from '@/components/common/StatusPill';

type AppointmentRow = [
  time: string,
  patient: string,
  visit: string,
  status: string,
  department: string,
  patientId?: string,
];

// Fallback mock data showing booked appointments
const MOCK_BOOKED_APPOINTMENTS: AppointmentRow[] = [
  ['04:30 PM', 'Ramesh Sharma', 'Cardiology follow-up', 'Confirmed', 'Cardiology', 'a0000000-0000-0000-0000-000000000001'],
  ['10:00 AM', 'Sita Rai', 'Endocrinology follow-up', 'Confirmed', 'Endocrinology', 'a0000000-0000-0000-0000-000000000002'],
];

function getPatientInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function DoctorAppointmentsPage() {
  const [appointments] = useState<AppointmentRow[]>(MOCK_BOOKED_APPOINTMENTS);

  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-9 py-6 sm:py-7">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#0D9488]">
          Doctor panel
        </p>
        <h1 className="mt-1 text-xl sm:text-[22px] font-semibold tracking-[-0.03em] text-[#0F172A]">
          Video Appointments
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Booked video consultations from the patient side.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:mt-7">
        {appointments.map((item, index) => (
          <article
            key={`${item[0]}-${index}`}
            className="patient-card patient-card-interactive flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#DDEBE9] text-xs font-semibold text-[#0F766E]">
                {getPatientInitials(item[1])}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-[#0F172A]">{item[1]}</p>
                <p className="mt-0.5 text-sm text-[#64748B]">{item[4]}</p>
              </div>
            </div>
            <div className="min-w-0 flex-[1.2]">
              <p className="text-sm font-medium text-[#334155]">{item[2]}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[#64748B]">
                <Icon name="clock" size={15} />
                {item[0]}
              </p>
            </div>
            <div className="flex items-center sm:justify-end">
              <StatusPill status={item[3]} />
            </div>
          </article>
        ))}
        <p className="mt-3 text-[10px] text-[#94A3B8]">(demo data)</p>
      </div>
    </main>
  );
}
