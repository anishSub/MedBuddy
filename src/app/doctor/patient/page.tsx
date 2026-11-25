'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/common/Icon';
import { DocumentThumb } from '@/components/patient/DocumentThumb';
import { useAuth } from '@/context/AuthContext';
import { doctorService, patientService } from '@/lib/supabase/services';

type PatientView = {
  profile_id: string;
  full_name: string;
  patient_code: string;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  weekly_adherence: number | null;
  avatar_initials: string | null;
};

// Fallback mock data shown when DB has no matching patient yet
const MOCK_PATIENT: PatientView = {
  profile_id: 'a0000000-0000-0000-0000-000000000001',
  full_name: 'Ramesh Sharma',
  patient_code: 'CT-2048',
  age: 64,
  gender: 'Male',
  blood_group: 'O+',
  weekly_adherence: 88,
  avatar_initials: 'RS',
};

type PatientContextRow = {
  profile_id: string;
  patient_code: string;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  weekly_adherence: number | null;
  profiles: { full_name: string; avatar_initials: string | null } | null;
};

function mapPatient(r: PatientContextRow): PatientView {
  return {
    profile_id: r.profile_id,
    full_name: r.profiles?.full_name ?? 'Unknown patient',
    patient_code: r.patient_code,
    age: r.age,
    gender: r.gender,
    blood_group: r.blood_group,
    weekly_adherence: r.weekly_adherence,
    avatar_initials: r.profiles?.avatar_initials ?? null,
  };
}

type PatientMed = [name: string, dose: string];
type PatientUpload = [type: string, title: string, date: string, kind: string];

type MedicationRow = {
  id: string;
  name: string;
  dosage: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
};

type MedicalRecordRow = {
  id: string;
  title: string;
  type: string;
  kind: string;
  record_date: string;
};

function mapMedication(m: MedicationRow): PatientMed {
  const slots = [
    m.morning ? 'Morning' : null,
    m.afternoon ? 'Afternoon' : null,
    m.night ? 'Night' : null,
  ]
    .filter(Boolean)
    .join(', ');
  return [m.name, slots ? `${m.dosage} · ${slots}` : m.dosage];
}

function mapRecord(r: MedicalRecordRow): PatientUpload {
  return [r.type, r.title, r.record_date, r.kind];
}

// Fallback mock data shown when medication/record queries fail or return empty
const MOCK_ACTIVE_MEDS: PatientMed[] = [
  ['Metformin', '500 mg · Morning, Night'],
  ['Amlodipine', '5 mg · Morning'],
  ['Atorvastatin', '10 mg · Night'],
  ['Calcium + D3', '500 mg · Afternoon'],
];

const MOCK_UPLOADS: PatientUpload[] = [
  ['Lab Report', 'HbA1c & Glucose Panel', '21 Jun 2024', 'lab'],
  ['X-Ray', 'Chest X-Ray — PA View', '18 Apr 2024', 'xray'],
];

type PreviewMed = [name: string, dosage: string, timing: string];
type RxTemplateItem = [
  title: string,
  count: string,
  summary: string,
  department: string,
  instructions: string,
  meds: PreviewMed[],
];

const GENERIC_MEDS: PreviewMed[] = [
  ['Primary medicine', 'Standard dose', '1 - 0 - 1'],
  ['Supportive medicine', 'Standard dose', '0 - 0 - 1'],
];

// Fallback mock data shown when DB has no templates yet
const MOCK_TEMPLATES: RxTemplateItem[] = [
  [
    'Viral Fever 1-0-1',
    '3 medicines',
    'Paracetamol · Cetirizine · Pantoprazole',
    'General Medicine',
    'Take medicines after meals. Maintain hydration and return if symptoms persist beyond three days.',
    [
      ['Paracetamol', '500 mg', '1 - 0 - 1'],
      ['Cetirizine', '10 mg', '0 - 0 - 1'],
      ['Pantoprazole', '40 mg', '1 - 0 - 0'],
    ],
  ],
  [
    'Gastritis Regimen',
    '2 medicines',
    'Pantoprazole · Antacid suspension',
    'Gastroenterology',
    'Take medicines after meals. Maintain hydration and return if symptoms persist beyond three days.',
    GENERIC_MEDS,
  ],
  [
    'Post-Op Care',
    '4 medicines',
    'Antibiotic · Analgesic · PPI · Supplement',
    'Surgery',
    'Take medicines after meals. Maintain hydration and return if symptoms persist beyond three days.',
    GENERIC_MEDS,
  ],
  [
    'Hypertension Review',
    '3 medicines',
    'Amlodipine · Losartan · Atorvastatin',
    'Cardiology',
    'Take medicines after meals. Maintain hydration and return if symptoms persist beyond three days.',
    GENERIC_MEDS,
  ],
  [
    'Diabetes Follow-Up',
    '3 medicines',
    'Metformin · Sitagliptin · Calcium D3',
    'Endocrinology',
    'Take medicines after meals. Maintain hydration and return if symptoms persist beyond three days.',
    GENERIC_MEDS,
  ],
];

type TemplateRow = {
  title: string;
  medicines_count: string;
  medication_summary: string;
  department: string;
  instructions: string;
  medications_json: unknown;
};

function mapTemplate(r: TemplateRow): RxTemplateItem {
  const json = Array.isArray(r.medications_json) ? r.medications_json : [];
  const meds: PreviewMed[] = json
    .filter((m): m is Record<string, unknown> => typeof m === 'object' && m !== null)
    .map((m) => [String(m.name ?? ''), String(m.dosage ?? ''), String(m.timing ?? '')]);
  return [
    r.title,
    r.medicines_count,
    r.medication_summary,
    r.department,
    r.instructions,
    meds.length > 0 ? meds : GENERIC_MEDS,
  ];
}

type BuilderMed = {
  id: number;
  name: string;
  dose: string;
  times: boolean[];
  meal: string;
};

export default function DoctorPatientPage() {
  const { user } = useAuth();
  const [patient, setPatient] = useState<PatientView>(MOCK_PATIENT);
  const [templates, setTemplates] = useState<RxTemplateItem[]>(MOCK_TEMPLATES);
  const [templateChoice, setTemplateChoice] = useState('');
  const [loading, setLoading] = useState(true);
  const [usingMockPatient, setUsingMockPatient] = useState(false);
  const [usingMockTemplates, setUsingMockTemplates] = useState(false);
  const [medications, setMedications] = useState<PatientMed[]>(MOCK_ACTIVE_MEDS);
  const [records, setRecords] = useState<PatientUpload[]>(MOCK_UPLOADS);
  const [medsLoading, setMedsLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [medsError, setMedsError] = useState(false);
  const [recordsError, setRecordsError] = useState(false);
  const [usingMockMeds, setUsingMockMeds] = useState(false);
  const [usingMockRecords, setUsingMockRecords] = useState(false);
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState(
    'Continue Metformin with food. Increase water intake and monitor fasting glucose weekly.'
  );
  const [followUp, setFollowUp] = useState('2024-07-22');
  const [meds, setMeds] = useState<BuilderMed[]>([
    { id: 1, name: 'Paracetamol', dose: '500 mg', times: [true, false, true], meal: 'After meal' },
    { id: 2, name: 'Pantoprazole', dose: '40 mg', times: [true, false, false], meal: 'Before meal' },
    { id: 3, name: 'Azithromycin', dose: '250 mg', times: [true, false, true], meal: 'After meal' },
  ]);

  useEffect(() => {
    doctorService
      .getPatientContext('CT-2048')
      .then((row) => {
        if (row) {
          setPatient(mapPatient(row));
          setUsingMockPatient(false);
        } else {
          setPatient(MOCK_PATIENT);
          setUsingMockPatient(true);
        }
      })
      .catch(() => {
        setPatient(MOCK_PATIENT);
        setUsingMockPatient(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const profileId = patient.profile_id;

    setMedsLoading(true);
    setMedsError(false);
    patientService
      .getMedications(profileId)
      .then((rows) => {
        const mapped = rows.map(mapMedication);
        if (mapped.length > 0) {
          setMedications(mapped);
          setUsingMockMeds(false);
        } else {
          setMedications(MOCK_ACTIVE_MEDS);
          setUsingMockMeds(true);
        }
      })
      .catch(() => {
        setMedications(MOCK_ACTIVE_MEDS);
        setUsingMockMeds(true);
        setMedsError(true);
      })
      .finally(() => setMedsLoading(false));

    setRecordsLoading(true);
    setRecordsError(false);
    patientService
      .getMedicalRecords(profileId)
      .then((rows) => {
        const mapped = rows.map(mapRecord);
        if (mapped.length > 0) {
          setRecords(mapped);
          setUsingMockRecords(false);
        } else {
          setRecords(MOCK_UPLOADS);
          setUsingMockRecords(true);
        }
      })
      .catch(() => {
        setRecords(MOCK_UPLOADS);
        setUsingMockRecords(true);
        setRecordsError(true);
      })
      .finally(() => setRecordsLoading(false));
  }, [loading, patient.profile_id]);

  useEffect(() => {
    doctorService
      .getRxTemplates()
      .then((rows) => {
        if (rows.length > 0) {
          setTemplates(rows.map(mapTemplate));
          setUsingMockTemplates(false);
        } else {
          setTemplates(MOCK_TEMPLATES);
          setUsingMockTemplates(true);
        }
      })
      .catch(() => {
        setTemplates(MOCK_TEMPLATES);
        setUsingMockTemplates(true);
      });
  }, []);

  const removeMed = (id: number) => {
    setMeds((prev) => prev.filter((m) => m.id !== id));
  };

  const addMed = () => {
    setMeds((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: 'New Medicine',
        dose: '100 mg',
        times: [true, false, false],
        meal: 'After meal',
      },
    ]);
  };

  const updateMed = (id: number, patch: Partial<BuilderMed>) => {
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const toggleTime = (id: number, index: number) => {
    setMeds((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, times: m.times.map((v, i) => (i === index ? !v : v)) }
          : m
      )
    );
  };

  const applyTemplate = (title: string) => {
    setTemplateChoice(title);
    const template = templates.find((t) => t[0] === title);
    if (!template) return;
    setMeds(
      template[5].map(([name, dosage, timing], i) => {
        const parts = timing.split('-');
        return {
          id: Date.now() + i,
          name,
          dose: dosage,
          times: [0, 1, 2].map((pos) => parts[pos]?.trim() === '1'),
          meal: 'After meal',
        };
      })
    );
  };

  async function handlePublish() {
    if (!user) return;
    setSaving(true);
    try {
      await doctorService.savePrescription({
        patient_id: patient.profile_id,
        doctor_id: user.id,
        title: 'New Prescription',
        notes,
        next_follow_up_date: followUp || undefined,
        medications: meds.map((m) => ({
          name: m.name,
          dosage: m.dose,
          morning: m.times[0],
          afternoon: m.times[1],
          night: m.times[2],
          meal_timing: m.meal,
        })),
      });
      setPublished(true);
    } catch {
      alert('Could not save prescription. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex flex-col xl:flex-row flex-1 min-h-0 overflow-y-auto xl:overflow-hidden">
      {/* Left Context Column */}
      <aside className="w-full xl:w-[38%] border-b xl:border-b-0 xl:border-r border-[#E2E8F0] bg-[#FCFDFD] px-4 sm:px-6 lg:px-8 py-6 sm:py-7 shrink-0 xl:overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#94A3B8]">
          Clinical context
          {loading && <span className="ml-2 normal-case tracking-normal">Loading…</span>}
          {usingMockPatient && (
            <span className="ml-2 text-[10px] normal-case tracking-normal text-amber-500 font-medium">
              (demo data)
            </span>
          )}
        </p>

        {/* Patient header */}
        <div className="mt-4 flex items-center border-b border-[#E2E8F0] pb-5 sm:pb-6">
          <div className="grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-full bg-[#DDEBE9] text-[13px] font-semibold text-[#0F766E] shrink-0">
            {patient.avatar_initials ?? '??'}
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <h1 className="text-base sm:text-[18px] font-semibold tracking-[-0.02em] text-[#0F172A] truncate">
              {patient.full_name}
            </h1>
            <p className="mt-0.5 text-[10px] text-[#64748B]">
              #{patient.patient_code} · {patient.age ?? '—'} years · {patient.gender ?? '—'} ·{' '}
              {patient.blood_group ?? '—'}
            </p>
          </div>
          <div className="ml-auto text-right shrink-0">
            <p className="text-xl sm:text-[22px] font-semibold tracking-[-0.04em] tabular-nums text-[#0D9488]">
              {patient.weekly_adherence ?? '—'}%
            </p>
            <p className="text-[9px] text-[#94A3B8]">Adherence</p>
          </div>
        </div>

        {/* Active meds */}
        <div className="border-b border-[#E2E8F0] py-4 sm:py-5">
          <div className="mb-3 flex justify-between">
            <h2 className="text-[12px] font-semibold text-[#334155]">Active medications</h2>
            <span className="text-[10px] text-[#94A3B8]">
              {medsLoading ? (
                'Loading…'
              ) : (
                <>
                  {medsError ? 'Unavailable' : `${medications.length} current`}{' '}
                  {usingMockMeds && (
                    <span className="text-amber-500 font-medium">(demo data)</span>
                  )}
                </>
              )}
            </span>
          </div>
          {!medsLoading &&
            medications.map(([name, dose]) => (
              <div
                key={name}
                className="flex items-center border-t border-[#F1F5F9] py-2.5 sm:py-3 first:border-0"
              >
                <span className="mr-3 h-1.5 w-1.5 rounded-full bg-[#10B981] shrink-0" />
                <p className="text-[11px] font-semibold text-[#334155]">{name}</p>
                <p className="ml-auto text-[10px] tabular-nums text-[#64748B]">{dose}</p>
              </div>
            ))}
        </div>

        {/* Recent uploads */}
        <div className="pt-4 sm:pt-5">
          <div className="mb-3 sm:mb-4 flex justify-between">
            <h2 className="text-[12px] font-semibold text-[#334155]">Recent uploads</h2>
            <Link
              href="/records"
              className="text-[10px] font-semibold text-[#0D9488] hover:underline"
            >
              View all records
            </Link>
          </div>
          {recordsLoading ? (
            <p className="border-t border-[#E2E8F0] py-3 text-[10px] text-[#94A3B8]">Loading…</p>
          ) : (
            records.map(([type, title, date, kind]) => (
              <div
                key={title}
                className="flex w-full items-center gap-3 border-t border-[#E2E8F0] py-3 text-left"
              >
                <div className="h-12 w-14 sm:h-14 sm:w-16 shrink-0 overflow-hidden rounded border border-[#E2E8F0]">
                  <DocumentThumb kind={kind} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#0D9488]">
                    {type}
                  </span>
                  <p className="mt-0.5 text-[11px] font-semibold text-[#334155] truncate">{title}</p>
                  <p className="mt-0.5 text-[9px] text-[#94A3B8]">{date}</p>
                </div>
                <Icon name="arrow" size={14} className="ml-auto text-[#94A3B8] shrink-0" />
              </div>
            ))
          )}
          {recordsError && (
            <p className="mt-2 text-[9px] text-[#94A3B8]">Could not load records.</p>
          )}
          {usingMockRecords && (
            <p className="mt-2 text-[9px] text-amber-500 font-medium">(demo data)</p>
          )}
        </div>
      </aside>

      {/* Right Rx Builder Column */}
      <div className="flex w-full xl:w-[62%] flex-col px-4 sm:px-6 lg:px-9 py-6 sm:py-7 xl:overflow-y-auto">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#0D9488]">
              New prescription
              {usingMockTemplates && (
                <span className="ml-2 text-[10px] normal-case tracking-normal text-amber-500 font-medium">
                  (demo data)
                </span>
              )}
            </p>
            <h2 className="mt-0.5 text-xl sm:text-[21px] font-semibold tracking-[-0.025em] text-[#0F172A]">
              Prescription Builder
            </h2>
          </div>
          <label className="grid gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            Load preset template
            <select
              value={templateChoice}
              onChange={(e) => applyTemplate(e.target.value)}
              className="h-9 w-full sm:w-[210px] rounded-md border border-[#CBD5E1] bg-white px-3 text-[11px] font-medium normal-case tracking-normal text-[#475569] shadow-xs"
            >
              <option value="">Choose a template</option>
              {templates.map((t) => (
                <option key={t[0]} value={t[0]}>
                  {t[0]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 sm:mt-6 border-y border-[#E2E8F0] overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[1.5fr_.65fr_1.2fr_.85fr_28px] gap-3 bg-[#F8FAFC] px-3 py-2.5 text-[9px] font-semibold uppercase tracking-[0.07em] text-[#94A3B8]">
              <span>Medicine</span>
              <span>Dosage</span>
              <span>Morning / Noon / Night</span>
              <span>Meal timing</span>
              <span />
            </div>
            {meds.map((med) => (
              <div
                key={med.id}
                className="grid h-[64px] sm:h-[68px] grid-cols-[1.5fr_.65fr_1.2fr_.85fr_28px] items-center gap-3 border-t border-[#E2E8F0] px-3"
              >
                <input
                  value={med.name}
                  onChange={(e) => updateMed(med.id, { name: e.target.value })}
                  className="min-w-0 border-b border-transparent bg-transparent text-[12px] font-semibold text-[#0F172A] outline-none focus:border-[#0D9488]"
                />
                <input
                  value={med.dose}
                  onChange={(e) => updateMed(med.id, { dose: e.target.value })}
                  className="min-w-0 border-b border-transparent bg-transparent text-[11px] tabular-nums text-[#475569] outline-none focus:border-[#0D9488]"
                />
                <div className="flex gap-2 sm:gap-3">
                  {med.times.map((checked, i) => (
                    <label key={i} className="grid gap-0.5 text-center text-[8px] text-[#94A3B8]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTime(med.id, i)}
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 accent-[#0D9488]"
                      />
                      {['M', 'A', 'N'][i]}
                    </label>
                  ))}
                </div>
                <select
                  value={med.meal}
                  onChange={(e) => updateMed(med.id, { meal: e.target.value })}
                  className="h-8 min-w-0 rounded-md border border-[#E2E8F0] bg-white px-2 text-[10px] text-[#475569]"
                >
                  <option>After meal</option>
                  <option>Before meal</option>
                </select>
                <button
                  onClick={() => removeMed(med.id)}
                  className="grid h-7 w-7 place-items-center text-[#94A3B8] hover:text-[#DC2626]"
                  aria-label="Remove medicine"
                >
                  <Icon name="plus" size={15} className="rotate-45" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={addMed}
          className="mt-3 flex items-center gap-1.5 self-start text-[10px] font-semibold text-[#0D9488] hover:underline"
        >
          <Icon name="plus" size={14} />
          Add medicine
        </button>

        <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 border-t border-[#E2E8F0] pt-5">
          <label className="grid gap-2 text-[10px] font-semibold text-[#64748B]">
            Prescription notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-20 resize-none rounded-md border border-[#CBD5E1] p-3 text-[11px] font-normal outline-none focus:border-[#0D9488]"
              placeholder="Advice and clinical notes..."
            />
          </label>
          <label className="grid content-start gap-2 text-[10px] font-semibold text-[#64748B]">
            Next follow-up date
            <input
              type="date"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              className="h-10 rounded-md border border-[#CBD5E1] px-3 text-[11px] font-normal text-[#475569] outline-none focus:border-[#0D9488]"
            />
          </label>
        </div>

        <div className="mt-6 sm:mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-[#E2E8F0] pt-5 gap-3">
          <p className="flex items-center gap-2 text-[10px] text-[#64748B]">
            <Icon name="bell" size={14} className="text-[#0D9488] shrink-0" />
            Patient reminders begin after publishing.
          </p>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="w-full sm:w-auto flex h-10 sm:h-11 items-center justify-center gap-2 rounded-md bg-[#0D9488] px-5 text-[11px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E]"
          >
            <Icon name="check" size={15} />
            {saving
              ? 'Saving…'
              : published
              ? 'Prescription published!'
              : 'Publish Prescription & Trigger Reminders'}
          </button>
        </div>
      </div>
    </main>
  );
}
