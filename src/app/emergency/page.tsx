'use client';

import { PatientShell } from '@/components/patient/PatientShell';
import { Icon } from '@/components/common/Icon';
import type { IconName } from '@/types';

// Dummy numbers — edit these for your local numbers
const DUMMY = {
  ambulance: '+977 100-00000',
  hospitals: '+977 100-00001',
  emergencyLine: '+977 100-00002',
  careTakerOffice: '+977 100-00003',
};

interface NumberCard {
  title: string;
  number: string;
  icon: IconName;
  bg: string;
  text: string;
}

const NUMBER_CARDS: NumberCard[] = [
  {
    title: 'Ambulance',
    number: DUMMY.ambulance,
    icon: 'phone',
    bg: 'bg-[#ECFDF5]',
    text: 'text-[#059669]',
  },
  {
    title: 'Hospitals near you',
    number: DUMMY.hospitals,
    icon: 'heart',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#2563EB]',
  },
  {
    title: 'Emergency line',
    number: DUMMY.emergencyLine,
    icon: 'phone',
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#B91C1C]',
  },
  {
    title: 'Care taker office',
    number: DUMMY.careTakerOffice,
    icon: 'users',
    bg: 'bg-[#FFF7ED]',
    text: 'text-[#B45309]',
  },
];

const HOSPITALS = [
  { name: 'Pokhara Provincial Hospital', detail: 'Western Regional Hospital, Pokhara' },
  { name: 'Manipal Teaching Hospital', detail: 'Pokhara' },
];

function NumberCard({ title, number, icon, bg, text }: NumberCard) {
  return (
    <a
      href={`tel:${number}`}
      className="patient-card flex min-h-[84px] items-center gap-3 transition hover:bg-[#F8FAFC]"
    >
      <div
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${bg} ${text}`}
        aria-hidden="true"
      >
        <Icon name={icon} size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
          {title}
        </p>
        <p className="mt-0.5 text-[20px] font-bold leading-tight text-[#0F172A] tabular-nums">
          {number}
        </p>
      </div>
    </a>
  );
}

export default function EmergencyPage() {
  return (
    <PatientShell title="Emergency" eyebrow="Numbers & hospitals" compact>
      <main className="flex-1 min-h-0 overflow-y-auto bg-[#F8FAFC] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div>
          <p className="text-[13px] text-[#475569]">
            Call these numbers — they go to emergency services.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {NUMBER_CARDS.map((card) => (
              <NumberCard key={card.title} {...card} />
            ))}
          </div>
          <h3 className="mt-6 text-[12px] font-semibold text-[#0F172A]">
            Hospitals in Pokhara
          </h3>
          <ul className="mt-2 space-y-2">
            {HOSPITALS.map((h, i) => (
              <li key={i} className="patient-card flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#F1F5F9]">
                  <Icon name="stethoscope" size={16} className="text-[#0D9488]" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#0F172A]">{h.name}</p>
                  <p className="text-[11px] text-[#64748B]">{h.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </PatientShell>
  );
}
