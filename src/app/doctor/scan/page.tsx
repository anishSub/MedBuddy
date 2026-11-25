'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/common/Icon';
import { doctorService } from '@/lib/supabase/services';

type ScannedPatient = {
  full_name: string;
  avatar_initials: string | null;
  patient_code: string;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  allergies: string[];
  weekly_adherence: number | null;
};

// Fallback mock data shown when DB has no matching patient yet
const MOCK_PATIENT: ScannedPatient = {
  full_name: 'Ramesh Sharma',
  avatar_initials: 'RS',
  patient_code: 'CT-2048',
  age: 64,
  gender: 'Male',
  blood_group: 'O+',
  allergies: ['Penicillin'],
  weekly_adherence: 88,
};

type PatientContextRow = {
  patient_code: string;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  allergies: string[] | null;
  weekly_adherence: number | null;
  profiles: { full_name: string; avatar_initials: string | null } | null;
};

function mapPatient(r: PatientContextRow): ScannedPatient {
  return {
    full_name: r.profiles?.full_name ?? 'Unknown patient',
    avatar_initials: r.profiles?.avatar_initials ?? null,
    patient_code: r.patient_code,
    age: r.age,
    gender: r.gender,
    blood_group: r.blood_group,
    allergies: Array.isArray(r.allergies) ? r.allergies : [],
    weekly_adherence: r.weekly_adherence,
  };
}

export default function DoctorScanPage() {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usingMock, setUsingMock] = useState(false);
  const [patient, setPatient] = useState<ScannedPatient>(MOCK_PATIENT);

  async function lookup(code: string) {
    setLoading(true);
    try {
      const row = await doctorService.getPatientContext(code);
      if (row) {
        setPatient(mapPatient(row));
        setUsingMock(false);
      } else {
        setPatient(MOCK_PATIENT);
        setUsingMock(true);
      }
      setScanned(true);
    } catch {
      setPatient(MOCK_PATIENT);
      setUsingMock(true);
      setScanned(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col xl:flex-row flex-1 min-h-0 overflow-y-auto xl:overflow-hidden">
      {/* Scanner column */}
      <div className="flex w-full xl:w-[57%] flex-col items-center justify-center border-b xl:border-b-0 xl:border-r border-[#E2E8F0] bg-[#F8FAFC] p-6 sm:p-10 lg:p-16 shrink-0 xl:overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#0D9488]">
          Secure patient lookup
        </p>
        <h1 className="mt-1 text-2xl sm:text-[24px] font-semibold tracking-[-0.03em] text-[#0F172A] text-center">
          Scan Patient QR
        </h1>
        <p className="mt-2 max-w-[390px] text-center text-[11px] leading-5 text-[#64748B]">
          Position the MedBuddy Health Pass inside the frame. Patient details are only displayed
          after verified consent.
        </p>

        <div className="relative mt-6 sm:mt-8 grid h-[280px] sm:h-[320px] w-full max-w-[400px] place-items-center overflow-hidden rounded-xl border border-[#CBD5E1] bg-white shadow-xs">
          <div className="absolute inset-3 sm:inset-4 rounded-lg border border-dashed border-[#E2E8F0]" />
          <div className="absolute left-6 sm:left-8 top-6 sm:top-8 h-10 w-10 sm:h-12 sm:w-12 border-l-2 border-t-2 border-[#94A3B8]" />
          <div className="absolute right-6 sm:right-8 top-6 sm:top-8 h-10 w-10 sm:h-12 sm:w-12 border-r-2 border-t-2 border-[#94A3B8]" />
          <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-l-2 border-[#94A3B8]" />
          <div className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-r-2 border-[#94A3B8]" />

          {scanned ? (
            <div className="grid h-20 w-20 sm:h-24 sm:w-24 place-items-center rounded-full bg-[#ECFDF5] text-[#059669]">
              <Icon name="check" size={36} />
            </div>
          ) : (
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-6">
              <Icon name="qr" size={64} className="text-[#0F172A]" />
            </div>
          )}

          {!scanned && (
            <div className="absolute inset-x-8 sm:inset-x-10 top-1/2 h-0.5 bg-[#0D9488] shadow-[0_0_8px_#0D9488]" />
          )}
        </div>

        <button
          onClick={() => {
            if (scanned) {
              setScanned(false);
              return;
            }
            lookup('CT-2048');
          }}
          disabled={loading}
          className="mt-6 flex h-10 sm:h-11 items-center gap-2 rounded-md bg-[#0D9488] px-5 text-[11px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E]"
        >
          <Icon name="scan" size={16} />
          {loading ? 'Looking up…' : scanned ? 'Reset camera scan' : 'Start camera scan'}
        </button>
        <p className="mt-4 text-[9px] text-[#94A3B8]">
          No camera available?{' '}
          <button
            onClick={() => {
              const code = window.prompt('Enter patient ID', 'CT-2048');
              if (code && code.trim()) lookup(code.trim());
            }}
            className="font-semibold text-[#0D9488] hover:underline"
          >
            Enter patient ID manually
          </button>
        </p>
      </div>

      {/* Patient details column */}
      <aside className="flex w-full xl:w-[43%] flex-col justify-center p-6 sm:p-10 lg:p-12 xl:overflow-y-auto">
        {!scanned ? (
          <div className="text-center py-8">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#E2E8F0] text-[#94A3B8]">
              <Icon name="shield" size={20} />
            </div>
            <h2 className="mt-4 text-[15px] font-semibold text-[#334155]">
              Waiting for a verified scan
            </h2>
            <p className="mx-auto mt-2 max-w-[280px] text-[10px] leading-5 text-[#94A3B8]">
              Patient identity, allergies, active medication, and emergency details will appear here.
            </p>
          </div>
        ) : (
          <div className="py-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[9px] font-semibold text-[#059669]">
              <Icon name="check" size={12} />
              Identity verified
            </span>
            {usingMock && (
              <span className="ml-2 text-[9px] text-amber-500 font-medium">(demo data)</span>
            )}

            <div className="mt-5 flex items-center border-b border-[#E2E8F0] pb-5">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#DDEBE9] text-[12px] font-semibold text-[#0F766E]">
                {patient.avatar_initials ?? '??'}
              </div>
              <div className="ml-3">
                <h2 className="text-[17px] sm:text-[18px] font-semibold text-[#0F172A]">
                  {patient.full_name}
                </h2>
                <p className="mt-0.5 text-[10px] text-[#64748B]">
                  #{patient.patient_code} · {patient.age ?? '—'} years · {patient.gender ?? '—'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-5 border-b border-[#E2E8F0] py-5">
              <div>
                <p className="text-[9px] uppercase tracking-[.08em] text-[#94A3B8]">Blood group</p>
                <p className="mt-1 text-[13px] font-semibold text-[#334155]">
                  {patient.blood_group ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[.08em] text-[#94A3B8]">Known allergy</p>
                <p className="mt-1 text-[13px] font-semibold text-[#B45309]">
                  {patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None known'}
                </p>
              </div>
            </div>

            <p className="mt-5 text-[10px] leading-5 text-[#64748B]">
              4 active medications · {patient.weekly_adherence ?? '—'}% weekly adherence · Last visit
              06 May 2024
            </p>

            <Link
              href="/doctor/patient"
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0D9488] text-[11px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E]"
            >
              Open Clinical Record
              <Icon name="arrow" size={15} />
            </Link>
          </div>
        )}
      </aside>
    </main>
  );
}
