'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/common/Icon';
import { doctorService } from '@/lib/supabase/services';

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

const DEFAULT_INSTRUCTIONS =
  'Take medicines after meals. Maintain hydration and return if symptoms persist beyond three days.';

// Fallback mock data shown when DB has no templates yet
const MOCK_TEMPLATES: RxTemplateItem[] = [
  [
    'Viral Fever 1-0-1',
    '3 medicines',
    'Paracetamol · Cetirizine · Pantoprazole',
    'General Medicine',
    DEFAULT_INSTRUCTIONS,
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
    DEFAULT_INSTRUCTIONS,
    GENERIC_MEDS,
  ],
  [
    'Post-Op Care',
    '4 medicines',
    'Antibiotic · Analgesic · PPI · Supplement',
    'Surgery',
    DEFAULT_INSTRUCTIONS,
    GENERIC_MEDS,
  ],
  [
    'Hypertension Review',
    '3 medicines',
    'Amlodipine · Losartan · Atorvastatin',
    'Cardiology',
    DEFAULT_INSTRUCTIONS,
    GENERIC_MEDS,
  ],
  [
    'Diabetes Follow-Up',
    '3 medicines',
    'Metformin · Sitagliptin · Calcium D3',
    'Endocrinology',
    DEFAULT_INSTRUCTIONS,
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

export default function RxTemplatesPage() {
  const [templates, setTemplates] = useState<RxTemplateItem[]>(MOCK_TEMPLATES);
  const [selected, setSelected] = useState<RxTemplateItem>(MOCK_TEMPLATES[0]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    doctorService
      .getRxTemplates()
      .then((rows) => {
        if (rows.length > 0) {
          const mapped = rows.map(mapTemplate);
          setTemplates(mapped);
          setSelected(mapped[0]);
          setUsingMock(false);
        } else {
          setTemplates(MOCK_TEMPLATES);
          setSelected(MOCK_TEMPLATES[0]);
          setUsingMock(true);
        }
      })
      .catch(() => {
        setTemplates(MOCK_TEMPLATES);
        setSelected(MOCK_TEMPLATES[0]);
        setUsingMock(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex flex-col xl:flex-row flex-1 min-h-0 overflow-y-auto xl:overflow-hidden">
      {/* Template list column */}
      <div className="w-full xl:w-[58%] border-b xl:border-b-0 xl:border-r border-[#E2E8F0] px-4 sm:px-6 lg:px-9 py-6 sm:py-7 shrink-0 xl:overflow-y-auto">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#0D9488]">
              Prescription library
            </p>
            <h1 className="mt-1 text-xl sm:text-[22px] font-semibold tracking-[-0.03em] text-[#0F172A]">
              Rx Templates
            </h1>
            <p className="mt-0.5 text-[10px] text-[#64748B]">
              Reusable medication plans for common clinical cases.
              {loading && <span className="ml-2">Loading templates…</span>}
              {usingMock && (
                <span className="ml-2 text-[10px] text-amber-500 font-medium">(demo data)</span>
              )}
            </p>
          </div>
          <button className="flex h-8 sm:h-9 items-center gap-1.5 sm:gap-2 rounded-md bg-[#0D9488] px-3 sm:px-3.5 text-[10px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E]">
            <Icon name="plus" size={14} />
            New template
          </button>
        </div>

        <div className="mt-6 sm:mt-7 border-y border-[#E2E8F0]">
          {templates.map((template) => (
            <button
              key={template[0]}
              onClick={() => setSelected(template)}
              className={`flex h-[88px] sm:h-[94px] w-full items-center border-t border-[#E2E8F0] px-3 sm:px-4 text-left first:border-0 transition ${
                selected[0] === template[0] ? 'bg-[#F0FDFA]' : 'hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-[12px] font-semibold text-[#0F172A] truncate">{template[0]}</h2>
                  <span className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[8px] font-semibold text-[#64748B] shrink-0">
                    {template[3]}
                  </span>
                </div>
                <p className="mt-1.5 text-[10px] text-[#64748B] truncate">{template[2]}</p>
                <p className="mt-1 text-[9px] text-[#94A3B8]">
                  {template[1]} · Updated 12 Jun 2024
                </p>
              </div>
              <Icon name="arrow" size={15} className="ml-auto text-[#94A3B8] shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Preview column */}
      <aside className="flex w-full xl:w-[42%] flex-col bg-[#FCFDFD] px-4 sm:px-6 lg:px-9 py-6 sm:py-7 xl:overflow-y-auto">
        <p className="text-[9px] font-semibold uppercase tracking-[.12em] text-[#94A3B8]">
          Template preview
        </p>
        <h2 className="mt-2 text-lg sm:text-[19px] font-semibold tracking-[-0.02em] text-[#0F172A]">
          {selected[0]}
        </h2>
        <p className="mt-0.5 text-[10px] text-[#64748B]">
          {selected[3]} · {selected[1]}
        </p>

        <div className="mt-5 sm:mt-6 border-y border-[#E2E8F0]">
          {selected[5].map((med) => (
            <div
              key={med[0]}
              className="grid h-[58px] sm:h-[64px] grid-cols-[1.3fr_.8fr_.7fr] items-center border-t border-[#E2E8F0] px-2 text-[10px] first:border-0"
            >
              <span className="font-semibold text-[#334155] truncate">{med[0]}</span>
              <span className="text-[#64748B]">{med[1]}</span>
              <span className="font-semibold tabular-nums text-[#0D9488]">{med[2]}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 sm:mt-6">
          <p className="text-[9px] font-semibold uppercase tracking-[.1em] text-[#94A3B8]">
            Default instructions
          </p>
          <p className="mt-1.5 text-[10px] leading-5 text-[#64748B]">{selected[4]}</p>
        </div>

        <div className="mt-6 sm:mt-auto grid grid-cols-2 gap-2 border-t border-[#E2E8F0] pt-5">
          <button className="h-9 sm:h-10 rounded-md border border-[#CBD5E1] text-[10px] font-semibold text-[#475569] shadow-xs hover:bg-slate-50">
            Edit template
          </button>
          <Link
            href="/doctor/patient"
            className="flex h-9 sm:h-10 items-center justify-center rounded-md bg-[#0D9488] text-[10px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E]"
          >
            Use for patient
          </Link>
        </div>
      </aside>
    </main>
  );
}
