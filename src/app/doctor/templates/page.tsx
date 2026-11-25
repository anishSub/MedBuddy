'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/common/Icon';
import { doctorService } from '@/lib/supabase/services';
import { useAuth } from '@/context/AuthContext';

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
    'Viral Fever Care Plan',
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
    'Gastritis & Acidity Plan',
    '2 medicines',
    'Pantoprazole · Antacid suspension',
    'Gastroenterology',
    DEFAULT_INSTRUCTIONS,
    GENERIC_MEDS,
  ],
  [
    'Post-Op Healing Plan',
    '4 medicines',
    'Antibiotic · Analgesic · PPI · Supplement',
    'Surgery',
    DEFAULT_INSTRUCTIONS,
    GENERIC_MEDS,
  ],
  [
    'Hypertension Routine',
    '3 medicines',
    'Amlodipine · Losartan · Atorvastatin',
    'Cardiology',
    DEFAULT_INSTRUCTIONS,
    GENERIC_MEDS,
  ],
  [
    'Diabetes Maintenance Plan',
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
  const { user } = useAuth();
  const [templates, setTemplates] = useState<RxTemplateItem[]>(MOCK_TEMPLATES);
  const [selected, setSelected] = useState<RxTemplateItem>(MOCK_TEMPLATES[0]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  // New template modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    department: 'General Medicine',
    instructions: 'Take medicines after meals with warm water. Rest well.',
    med1Name: '',
    med1Dose: '',
    med1Timing: '1 - 0 - 1',
    med2Name: '',
    med2Dose: '',
    med2Timing: '0 - 0 - 1',
  });

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

  async function handleCreateTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.med1Name.trim()) return;

    setSaving(true);
    try {
      const medsList: Array<{ name: string; dosage: string; timing: string }> = [
        { name: form.med1Name.trim(), dosage: form.med1Dose.trim() || 'Standard', timing: form.med1Timing },
      ];
      if (form.med2Name.trim()) {
        medsList.push({
          name: form.med2Name.trim(),
          dosage: form.med2Dose.trim() || 'Standard',
          timing: form.med2Timing,
        });
      }

      const count = `${medsList.length} medicines`;
      const summary = medsList.map((m) => m.name).join(' · ');

      const newRow = await doctorService.createRxTemplate({
        title: form.title.trim(),
        department: form.department,
        medicines_count: count,
        medication_summary: summary,
        instructions: form.instructions.trim(),
        medications_json: medsList,
        doctor_id: user?.id,
      });

      const mapped = mapTemplate(newRow as TemplateRow);
      setTemplates((prev) => [mapped, ...prev]);
      setSelected(mapped);
      setUsingMock(false);
      setShowModal(false);
      setForm({
        title: '',
        department: 'General Medicine',
        instructions: 'Take medicines after meals with warm water. Rest well.',
        med1Name: '',
        med1Dose: '',
        med1Timing: '1 - 0 - 1',
        med2Name: '',
        med2Dose: '',
        med2Timing: '0 - 0 - 1',
      });
    } catch {
      alert('Could not save template. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex flex-col xl:flex-row flex-1 min-h-0 overflow-y-auto xl:overflow-hidden">
      {/* Template list column */}
      <div className="w-full xl:w-[58%] border-b xl:border-b-0 xl:border-r border-[#E2E8F0] px-4 sm:px-6 lg:px-9 py-6 sm:py-7 shrink-0 xl:overflow-y-auto">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#0D9488]">
              Prescription Library
            </p>
            <h1 className="mt-1 text-xl sm:text-[22px] font-semibold tracking-[-0.03em] text-[#0F172A]">
              Prescription Templates
            </h1>
            <p className="mt-0.5 text-sm text-[#64748B]">
              Standardized treatment plans and medicine regimens for clinical cases.
              {loading && <span className="ml-2">Loading templates…</span>}
              {usingMock && (
                <span className="ml-2 text-[10px] text-amber-500 font-medium">(demo data)</span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex h-8 sm:h-9 items-center gap-1.5 sm:gap-2 rounded-md bg-[#0D9488] px-3 sm:px-3.5 text-[10px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E]"
          >
            <Icon name="plus" size={14} />
            New Treatment Plan
          </button>
        </div>

        <div className="mt-6 sm:mt-7 flex flex-col gap-3">
          {templates.map((template) => (
            <button
              key={template[0]}
              onClick={() => setSelected(template)}
              style={
                selected[0] === template[0]
                  ? { borderColor: '#B9D8D5', backgroundColor: '#F0FDFA' }
                  : undefined
              }
              className="patient-card flex min-h-[88px] w-full items-center gap-3 px-4 py-3 text-left transition hover:border-[#B9D8D5]"
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[#0F172A] truncate">{template[0]}</h2>
                  <span className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[8px] font-semibold text-[#64748B] shrink-0">
                    {template[3]}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-[#64748B] truncate">{template[2]}</p>
                <p className="mt-1 text-[11px] text-[#64748B]">
                  {template[1]} · Ready for prescribing
                </p>
              </div>
              <Icon name="arrow" size={15} className="ml-auto text-[#94A3B8] shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Preview column */}
      <aside className="flex w-full xl:w-[42%] flex-col bg-[#F8FAFC] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:overflow-y-auto">
        <div className="patient-card p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-[#64748B]">
          Treatment plan preview
        </p>
        <h2 className="mt-2 text-lg sm:text-[19px] font-semibold tracking-[-0.02em] text-[#0F172A]">
          {selected[0]}
        </h2>
        <p className="mt-0.5 text-sm text-[#64748B]">
          {selected[3]} · {selected[1]}
        </p>

        <div className="mt-5 flex flex-col gap-2">
          {selected[5].map((med) => (
            <div
              key={med[0]}
              className="patient-card grid min-h-[58px] grid-cols-[1.3fr_.8fr_.7fr] items-center gap-2 px-3 py-2 text-xs"
            >
              <span className="font-semibold text-[#334155] truncate">{med[0]}</span>
              <span className="text-[#64748B]">{med[1]}</span>
              <span className="font-semibold tabular-nums text-[#0D9488]">{med[2]}</span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-[#64748B]">
            Patient instructions
          </p>
          <p className="mt-1.5 text-sm leading-6 text-[#64748B]">{selected[4]}</p>
        </div>

        <div className="mt-6 sm:mt-auto grid grid-cols-2 gap-2 border-t border-[#E2E8F0] pt-5">
          <button
            onClick={() => setShowModal(true)}
            className="h-10 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#475569] shadow-xs transition hover:bg-slate-50"
          >
            New plan
          </button>
          <Link
            href={`/doctor/patient?template=${encodeURIComponent(selected[0])}`}
            className="flex h-10 items-center justify-center rounded-lg bg-[#0D9488] text-xs font-semibold text-white shadow-xs transition hover:bg-[#0F766E]"
          >
            Apply to Patient
          </Link>
        </div>
        </div>
      </aside>

      {/* New Template Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
              <h2 className="text-[15px] font-semibold text-[#0F172A]">Create Prescription Template</h2>
              <button onClick={() => setShowModal(false)} className="text-[#94A3B8] hover:text-[#0F172A]">
                <Icon name="x" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Plan / Template Title
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Acute Bronchitis Regimen"
                  className="w-full rounded-md border border-[#CBD5E1] px-3 py-2 text-[12px] text-[#0F172A] focus:border-[#0D9488] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Department / Speciality
                </label>
                <select
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  className="w-full rounded-md border border-[#CBD5E1] px-3 py-2 text-[12px] text-[#0F172A] focus:border-[#0D9488] focus:outline-none"
                >
                  <option>General Medicine</option>
                  <option>Cardiology</option>
                  <option>Gastroenterology</option>
                  <option>Endocrinology</option>
                  <option>Pulmonology</option>
                  <option>Orthopaedics</option>
                  <option>Paediatrics</option>
                </select>
              </div>

              <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <p className="text-[11px] font-semibold text-[#334155] mb-2">Medicine 1 (Primary)</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    value={form.med1Name}
                    onChange={(e) => setForm((f) => ({ ...f, med1Name: e.target.value }))}
                    placeholder="Medicine name (e.g. Amoxicillin)"
                    className="rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-[11px] text-[#0F172A]"
                  />
                  <input
                    value={form.med1Dose}
                    onChange={(e) => setForm((f) => ({ ...f, med1Dose: e.target.value }))}
                    placeholder="Dose (e.g. 500 mg)"
                    className="rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-[11px] text-[#0F172A]"
                  />
                </div>
                <div className="mt-2">
                  <label className="block text-[10px] text-[#64748B] mb-0.5">Timing (Morning - Afternoon - Night)</label>
                  <select
                    value={form.med1Timing}
                    onChange={(e) => setForm((f) => ({ ...f, med1Timing: e.target.value }))}
                    className="w-full rounded border border-[#CBD5E1] bg-white px-2 py-1 text-[11px] text-[#0F172A]"
                  >
                    <option value="1 - 0 - 1">1 - 0 - 1 (Morning & Night)</option>
                    <option value="1 - 1 - 1">1 - 1 - 1 (Thrice daily)</option>
                    <option value="1 - 0 - 0">1 - 0 - 0 (Morning only)</option>
                    <option value="0 - 0 - 1">0 - 0 - 1 (Night only)</option>
                  </select>
                </div>
              </div>

              <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <p className="text-[11px] font-semibold text-[#334155] mb-2">Medicine 2 (Optional)</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={form.med2Name}
                    onChange={(e) => setForm((f) => ({ ...f, med2Name: e.target.value }))}
                    placeholder="Medicine name (e.g. Paracetamol)"
                    className="rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-[11px] text-[#0F172A]"
                  />
                  <input
                    value={form.med2Dose}
                    onChange={(e) => setForm((f) => ({ ...f, med2Dose: e.target.value }))}
                    placeholder="Dose (e.g. 650 mg)"
                    className="rounded border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-[11px] text-[#0F172A]"
                  />
                </div>
                <div className="mt-2">
                  <label className="block text-[10px] text-[#64748B] mb-0.5">Timing</label>
                  <select
                    value={form.med2Timing}
                    onChange={(e) => setForm((f) => ({ ...f, med2Timing: e.target.value }))}
                    className="w-full rounded border border-[#CBD5E1] bg-white px-2 py-1 text-[11px] text-[#0F172A]"
                  >
                    <option value="0 - 0 - 1">0 - 0 - 1 (Night only)</option>
                    <option value="1 - 0 - 1">1 - 0 - 1 (Morning & Night)</option>
                    <option value="1 - 1 - 1">1 - 1 - 1 (Thrice daily)</option>
                    <option value="1 - 0 - 0">1 - 0 - 0 (Morning only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Instructions for Patient
                </label>
                <textarea
                  rows={2}
                  value={form.instructions}
                  onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                  className="w-full rounded-md border border-[#CBD5E1] px-3 py-2 text-[12px] text-[#0F172A] focus:border-[#0D9488] focus:outline-none resize-none"
                />
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-md border border-[#CBD5E1] py-2 text-[12px] font-medium text-[#475569] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-md bg-[#0D9488] py-2 text-[12px] font-semibold text-white hover:bg-[#0F766E] disabled:opacity-60 transition"
                >
                  {saving ? 'Saving to Database…' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
