'use client';

import { useState } from 'react';
import { Icon } from '@/components/common/Icon';

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

export default function DoctorAppointmentsPage() {
  const [appointments] = useState<AppointmentRow[]>(MOCK_BOOKED_APPOINTMENTS);

  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-9 py-6 sm:py-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#0D9488]">
          Doctor panel
        </p>
        <h1 className="mt-1 text-xl sm:text-[23px] font-semibold tracking-[-0.03em] text-[#0F172A]">
          Video Appointments
        </h1>
        <p className="mt-1 text-[11px] text-[#64748B]">
          Booked video consultations from the patient side.
        </p>
      </div>

      <div className="mt-6 sm:mt-7">
        <div className="mt-3 border-y border-[#E2E8F0] overflow-x-auto">
          <div className="min-w-[520px]">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-3 bg-[#F8FAFC] px-3 py-2.5 text-[9px] font-semibold uppercase tracking-[.07em] text-[#94A3B8]">
              <span>Patient</span>
              <span>Visit</span>
              <span>Department</span>
              <span>Status</span>
            </div>
            {appointments.map((item, index) => (
              <div
                key={`${item[0]}-${index}`}
                className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-3 border-t border-[#E2E8F0] px-3 py-2.5 text-[10px]"
              >
                <span className="font-semibold text-[#334155]">{item[1]}</span>
                <span className="text-[#64748B]">{item[2]}</span>
                <span className="text-[#64748B]">{item[4]}</span>
                <span className="text-[#64748B]">{item[3]}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[10px] text-[#94A3B8]">(demo data)</p>
      </div>
    </main>
  );
}
