'use client';

import { PatientShell } from '@/components/patient/PatientShell';
import { HealthPassModal } from '@/components/patient/HealthPassModal';

export default function HealthPassPage() {
  return (
    <PatientShell title="QR Health Pass" eyebrow="Emergency access">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#F8FAFC] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="mx-auto w-full max-w-[570px]">
          <p className="mb-5 text-sm leading-relaxed text-[#64748B]">
            Show this pass to clinic staff for quick identification and emergency details.
          </p>
          <HealthPassModal inline />
        </div>
      </main>
    </PatientShell>
  );
}
