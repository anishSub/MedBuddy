'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/common/Icon';
import { doctorService, patientService } from '@/lib/supabase/services';

type ScannedPatient = {
  profile_id: string;
  full_name: string;
  avatar_initials: string | null;
  patient_code: string;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  allergies: string[];
  weekly_adherence: number | null;
  active_meds_count?: number;
};

// Fallback mock data shown when DB has no matching patient yet
const MOCK_PATIENT: ScannedPatient = {
  profile_id: 'a0000000-0000-0000-0000-000000000001',
  full_name: 'Ramesh Sharma',
  avatar_initials: 'RS',
  patient_code: 'CT-2048',
  age: 64,
  gender: 'Male',
  blood_group: 'O+',
  allergies: ['Penicillin'],
  weekly_adherence: 88,
  active_meds_count: 4,
};

type PatientContextRow = {
  profile_id: string;
  patient_code: string;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  allergies: string[] | null;
  weekly_adherence: number | null;
  profiles: { full_name: string; avatar_initials: string | null } | null;
};

function mapPatient(r: PatientContextRow, medsCount?: number): ScannedPatient {
  return {
    profile_id: r.profile_id,
    full_name: r.profiles?.full_name ?? 'Unknown patient',
    avatar_initials: r.profiles?.avatar_initials ?? null,
    patient_code: r.patient_code,
    age: r.age,
    gender: r.gender,
    blood_group: r.blood_group,
    allergies: Array.isArray(r.allergies) ? r.allergies : [],
    weekly_adherence: r.weekly_adherence,
    active_meds_count: medsCount,
  };
}

const DEMO_PATIENTS = [
  { code: 'CT-2048', name: 'Ramesh Sharma' },
  { code: 'CT-1987', name: 'Maya Gurung' },
  { code: 'CT-2186', name: 'Bikash Thapa' },
  { code: 'CT-1934', name: 'Sita Rai' },
  { code: 'CT-2076', name: 'Anu Maharjan' },
];

export default function DoctorScanPage() {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usingMock, setUsingMock] = useState(false);
  const [patient, setPatient] = useState<ScannedPatient>(MOCK_PATIENT);
  const [inputCode, setInputCode] = useState('');

  async function lookup(code: string) {
    setLoading(true);
    try {
      const row = await doctorService.getPatientContext(code);
      if (row) {
        let medsCount = 0;
        try {
          const meds = await patientService.getMedications(row.profile_id);
          medsCount = meds.length;
        } catch {
          medsCount = 0;
        }
        setPatient(mapPatient(row, medsCount));
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
      <div className="flex w-full shrink-0 flex-col items-center justify-center border-b border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-6 xl:w-[57%] xl:overflow-y-auto xl:border-b-0 xl:border-r">
        <div className="patient-card flex w-full max-w-[560px] flex-col items-center p-5 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#0D9488]">
          Secure patient lookup
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#0F172A] text-center">
          Scan Patient QR
        </h1>
        <p className="mt-2 max-w-[390px] text-center text-sm leading-6 text-[#64748B]">
          Position the MedBuddy Health Pass inside the frame. Patient details are loaded live from the
          clinical database after verified consent.
        </p>

        {/* QR Scanner viewport */}
        <div className="relative mt-6 grid h-[240px] w-full max-w-[400px] place-items-center overflow-hidden rounded-xl border-2 border-[#B8D8D4] bg-[#F8FAFC] shadow-inner sm:mt-7 sm:h-[300px]">
          <div className="absolute inset-3 sm:inset-4 rounded-lg border border-dashed border-[#B8D8D4]" />
          <div className="absolute left-6 top-6 h-10 w-10 border-l-2 border-t-2 border-[#0D9488] sm:left-8 sm:top-8 sm:h-12 sm:w-12" />
          <div className="absolute right-6 top-6 h-10 w-10 border-r-2 border-t-2 border-[#0D9488] sm:right-8 sm:top-8 sm:h-12 sm:w-12" />
          <div className="absolute bottom-6 left-6 h-10 w-10 border-b-2 border-l-2 border-[#0D9488] sm:bottom-8 sm:left-8 sm:h-12 sm:w-12" />
          <div className="absolute bottom-6 right-6 h-10 w-10 border-b-2 border-r-2 border-[#0D9488] sm:bottom-8 sm:right-8 sm:h-12 sm:w-12" />

          {scanned ? (
            <div className="grid h-20 w-20 sm:h-24 sm:w-24 place-items-center rounded-full bg-[#ECFDF5] text-[#059669]">
              <Icon name="check" size={36} />
            </div>
          ) : (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-6">
              <Icon name="qr" size={64} className="text-[#0D9488]" />
            </div>
          )}

          {!scanned && (
            <div className="absolute inset-x-8 sm:inset-x-10 top-1/2 h-0.5 bg-[#0D9488] shadow-[0_0_8px_#0D9488]" />
          )}
        </div>

        {/* Camera scan button */}
        <button
          onClick={() => {
            if (scanned) {
              setScanned(false);
              return;
            }
            lookup('CT-2048');
          }}
          disabled={loading}
          className="mt-5 flex h-11 w-full max-w-[400px] items-center justify-center gap-2 rounded-lg bg-[#0D9488] px-5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0F766E]"
        >
          <Icon name="scan" size={16} />
          {loading ? 'Looking up…' : scanned ? 'Reset camera scan' : 'Scan Health Pass (Simulate)'}
        </button>

        {/* Manual lookup input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputCode.trim()) lookup(inputCode.trim());
          }}
          className="mt-5 flex w-full max-w-[400px] gap-2"
        >
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter Patient ID (e.g. CT-1987)"
            className="h-10 min-w-0 flex-1 rounded-md border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#0D9488] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !inputCode.trim()}
            className="h-10 shrink-0 rounded-lg bg-[#334155] px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1E293B] disabled:opacity-50"
          >
            {loading ? 'Searching…' : 'Look Up'}
          </button>
        </form>

        {/* Quick test chips */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 max-w-[420px]">
          <span className="text-xs text-[#64748B]">Quick patient codes:</span>
          {DEMO_PATIENTS.map((p) => (
            <button
              key={p.code}
              type="button"
              onClick={() => lookup(p.code)}
              className="rounded-md bg-white border border-[#CBD5E1] px-2.5 py-1 text-xs font-medium text-[#475569] transition hover:border-[#0D9488] hover:text-[#0D9488]"
            >
              {p.name.split(' ')[0]} ({p.code})
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Patient details column */}
      <aside className="flex w-full flex-col justify-center bg-[#F8FAFC] p-4 sm:p-6 xl:w-[43%] xl:overflow-y-auto">
        <div className="patient-card w-full p-5 sm:p-6">
        {!scanned ? (
          <div className="text-center py-8">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#E2E8F0] text-[#94A3B8]">
              <Icon name="shield" size={20} />
            </div>
            <h2 className="mt-4 text-[15px] font-semibold text-[#334155]">
              Waiting for a verified scan
            </h2>
            <p className="mx-auto mt-2 max-w-[280px] text-sm leading-6 text-[#64748B]">
              Patient identity, allergies, active medication, and emergency details will appear here.
            </p>
          </div>
        ) : (
          <div className="py-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[9px] font-semibold text-[#059669]">
              <Icon name="check" size={12} />
              Identity verified & loaded
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
                <p className="mt-0.5 text-sm text-[#64748B]">
                  #{patient.patient_code} · {patient.age ?? '—'} years · {patient.gender ?? '—'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-5 border-b border-[#E2E8F0] py-5">
              <div>
                <p className="text-[11px] uppercase tracking-[.08em] text-[#64748B]">Blood group</p>
                <p className="mt-1 text-sm font-semibold text-[#334155]">
                  {patient.blood_group ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[.08em] text-[#64748B]">Known allergy</p>
                <p className="mt-1 text-sm font-semibold text-[#B45309]">
                  {patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None known'}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-[#64748B]">
              {patient.active_meds_count ?? 4} active medications · {patient.weekly_adherence ?? '—'}% weekly adherence · Verified Clinical Record
            </p>

            <Link
              href={`/doctor/patient?code=${patient.patient_code}`}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0D9488] text-sm font-semibold text-white shadow-xs transition hover:bg-[#0F766E]"
            >
              Open Clinical Record
              <Icon name="arrow" size={15} />
            </Link>
          </div>
        )}
        </div>
      </aside>
    </main>
  );
}
