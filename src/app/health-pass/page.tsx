'use client';

import { PatientShell } from '@/components/patient/PatientShell';
import { HealthPassModal } from '@/components/patient/HealthPassModal';

export default function HealthPassPage() {
  return (
    <PatientShell title="QR Health Pass" eyebrow="Emergency access">
      <main className="flex-1 min-h-0 flex flex-col px-4 sm:px-6 lg:px-10 py-6 sm:py-8 overflow-y-auto">
        <div className="mx-auto w-full max-w-[570px]">
          <p className="mb-5 text-[13px] leading-relaxed text-[#64748B]">
            Show this pass to clinic staff for quick identification and emergency details.
          </p>
          <HealthPassModal inline />
        </div>
      </main>
    </PatientShell>
  );
}
