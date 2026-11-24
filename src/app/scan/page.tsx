'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { PatientShell } from '@/components/patient/PatientShell';
import { Icon } from '@/components/common/Icon';
import { Timing } from '@/components/patient/Timing';
import { useAuth } from '@/context/AuthContext';
import { patientService } from '@/lib/supabase/services';

interface ExtractedMedicine {
  id: string;
  name: string;
  dosage: string;
  times: [boolean, boolean, boolean]; // morning, afternoon, night
  meal: string;
  duration: string;
}

const initialRows: ExtractedMedicine[] = [
  {
    id: '1',
    name: 'Metformin',
    dosage: '500 mg',
    times: [true, false, true],
    meal: 'After meal',
    duration: '30 days',
  },
  {
    id: '2',
    name: 'Amlodipine',
    dosage: '5 mg',
    times: [true, false, false],
    meal: 'After meal',
    duration: '30 days',
  },
  {
    id: '3',
    name: 'Calcium + D3',
    dosage: '500 mg',
    times: [false, true, false],
    meal: 'After meal',
    duration: '5 days',
  },
  {
    id: '4',
    name: 'Atorvastatin',
    dosage: '10 mg',
    times: [false, false, true],
    meal: 'After meal',
    duration: '30 days',
  },
];

export default function ScanPage() {
  const { user } = useAuth();
  const patientProfileId = user?.id || 'a0000000-0000-0000-0000-000000000001';

  const [zoom, setZoom] = useState(84);
  const [imageSrc, setImageSrc] = useState('/prescription-nepal.png');
  const [fileName, setFileName] = useState('ramesh_prescription_june.jpg');
  const [fileSize, setFileSize] = useState('1.8 MB');
  const [meds, setMeds] = useState<ExtractedMedicine[]>(initialRows);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageSrc(URL.createObjectURL(file));
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      setSavedSuccess(false);
    }
  };

  const addMedicineRow = () => {
    const newMed: ExtractedMedicine = {
      id: String(Date.now()),
      name: 'New Medicine',
      dosage: '100 mg',
      times: [true, false, false],
      meal: 'After meal',
      duration: '15 days',
    };
    setMeds([...meds, newMed]);
    setEditingId(newMed.id);
  };

  const removeMedicine = (id: string) => {
    setMeds(meds.filter((m) => m.id !== id));
  };

  const updateMedicine = (id: string, field: keyof ExtractedMedicine, value: unknown) => {
    setMeds(
      meds.map((m) => {
        if (m.id === id) {
          return { ...m, [field]: value };
        }
        return m;
      })
    );
  };

  const toggleTiming = (id: string, index: 0 | 1 | 2) => {
    setMeds(
      meds.map((m) => {
        if (m.id === id) {
          const nextTimes = [...m.times] as [boolean, boolean, boolean];
          nextTimes[index] = !nextTimes[index];
          return { ...m, times: nextTimes };
        }
        return m;
      })
    );
  };

  const handleActivateReminders = async () => {
    if (meds.length === 0) return;
    setSaving(true);
    try {
      const itemsToSave = meds.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        morning: m.times[0],
        afternoon: m.times[1],
        night: m.times[2],
        meal_timing: m.meal,
        duration_days: m.duration,
      }));

      await patientService.saveScannedPrescription(patientProfileId, itemsToSave);
      setSavedSuccess(true);
    } catch (err) {
      console.error('Failed to save scanned prescription to Supabase:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PatientShell title="Scan Prescription" eyebrow="Snap-to-schedule">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <main className="flex flex-col xl:flex-row flex-1 min-h-0 overflow-y-auto xl:overflow-hidden">
        {/* Left column: Prescription preview */}
        <div className="flex w-full xl:w-1/2 flex-col border-b xl:border-b-0 xl:border-r border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 shrink-0 min-h-[460px] xl:min-h-0 xl:overflow-y-auto">
          <div className="mb-4 sm:mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-[17px] sm:text-[18px] font-semibold tracking-[-0.02em] text-[#0F172A]">
                Prescription preview
              </h2>
              <p className="mt-0.5 text-[12px] text-[#64748B]">
                {fileName} · {fileSize}
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-8 sm:h-9 items-center gap-1.5 sm:gap-2 rounded-md border border-[#CBD5E1] bg-white px-2.5 sm:px-3 text-[11px] font-semibold text-[#475569] shadow-xs hover:bg-slate-50 transition"
            >
              <Icon name="upload" size={14} />
              Replace image
            </button>
          </div>

          <div className="relative flex min-h-[350px] flex-1 items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#B8C7D4] bg-[#EDF2F4] p-4">
            <div className="absolute left-3 sm:left-4 top-3 sm:top-4 z-10 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#64748B] shadow-xs">
              Page 1 of 1 · OCR Extracted
            </div>

            {/* Preview image */}
            <div
              className="relative max-h-[480px] xl:max-h-[540px] max-w-full transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <img
                src={imageSrc}
                alt="Uploaded handwritten prescription"
                className="max-h-[480px] xl:max-h-[540px] w-auto object-contain shadow-[0_10px_30px_rgba(15,23,42,0.16)] rounded"
              />
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 flex -translate-x-1/2 items-center overflow-hidden rounded-lg border border-[#D5DEE7] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
              <button
                onClick={() => setZoom(Math.max(65, zoom - 10))}
                className="grid h-8 sm:h-9 w-9 sm:w-10 place-items-center border-r border-[#E2E8F0] text-[#475569] hover:bg-slate-50"
                aria-label="Zoom out"
              >
                <Icon name="zoomOut" size={16} />
              </button>
              <span className="w-12 text-center text-[10px] font-semibold tabular-nums text-[#64748B]">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(115, zoom + 10))}
                className="grid h-8 sm:h-9 w-9 sm:w-10 place-items-center border-l border-[#E2E8F0] text-[#475569] hover:bg-slate-50"
                aria-label="Zoom in"
              >
                <Icon name="zoomIn" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Extracted Schedule */}
        <div className="flex w-full xl:w-1/2 flex-col p-4 sm:p-6 lg:p-8 xl:overflow-y-auto">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-[17px] sm:text-[18px] font-semibold tracking-[-0.02em] text-[#0F172A]">
                Extracted Medication Schedule
              </h2>
              <p className="mt-1 text-[12px] text-[#64748B]">
                Review each detail before activating reminders into Supabase.
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[10px] font-semibold text-[#059669]">
              <Icon name="check" size={12} />
              Scan verified
            </span>
          </div>

          {savedSuccess && (
            <div className="mt-4 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] p-4 text-[13px] text-[#065F46] flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold">
                <Icon name="check" size={16} />
                <span>Reminders activated! {meds.length} medications synced to Supabase database.</span>
              </div>
              <p className="text-[11px] text-[#047857]">
                Your daily medication schedule and notifications have been initialized.
              </p>
              <Link
                href="/dashboard"
                className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-[#0D9488] hover:underline"
              >
                Go to Dashboard to view today’s doses →
              </Link>
            </div>
          )}

          <div className="mt-5 sm:mt-6 overflow-x-auto border-y border-[#E2E8F0]">
            <div className="min-w-[500px]">
              <div className="grid grid-cols-[1.3fr_.7fr_1.1fr_.9fr_.7fr_40px] gap-2 bg-[#F8FAFC] px-3 py-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
                <span>Medicine</span>
                <span>Dosage</span>
                <span>Timing (M / A / N)</span>
                <span>Meal</span>
                <span>Duration</span>
                <span />
              </div>
              {meds.map((row) => {
                const isEditing = editingId === row.id;
                return (
                  <div
                    key={row.id}
                    className="grid min-h-[66px] grid-cols-[1.3fr_.7fr_1.1fr_.9fr_.7fr_40px] items-center gap-2 border-t border-[#E2E8F0] px-3 text-[12px] text-[#334155]"
                  >
                    <div>
                      {isEditing ? (
                        <input
                          value={row.name}
                          onChange={(e) => updateMedicine(row.id, 'name', e.target.value)}
                          className="w-full border-b border-[#0D9488] bg-transparent font-semibold text-[#0F172A] outline-none text-[12px]"
                        />
                      ) : (
                        <>
                          <p className="font-semibold text-[#0F172A]">{row.name}</p>
                          <p className="mt-0.5 text-[9px] text-[#94A3B8]">Tablet</p>
                        </>
                      )}
                    </div>

                    <div>
                      {isEditing ? (
                        <input
                          value={row.dosage}
                          onChange={(e) => updateMedicine(row.id, 'dosage', e.target.value)}
                          className="w-full border-b border-[#0D9488] bg-transparent text-[11px] outline-none"
                        />
                      ) : (
                        <span className="tabular-nums">{row.dosage}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isEditing ? (
                        <div className="flex gap-2">
                          {row.times.map((on, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => toggleTiming(row.id, i as 0 | 1 | 2)}
                              className={`h-6 w-6 rounded text-[10px] font-bold border ${
                                on
                                  ? 'bg-[#0D9488] text-white border-[#0D9488]'
                                  : 'bg-white text-[#94A3B8] border-[#CBD5E1]'
                              }`}
                            >
                              {['M', 'A', 'N'][i]}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <Timing value={[...row.times]} />
                      )}
                    </div>

                    <div>
                      {isEditing ? (
                        <select
                          value={row.meal}
                          onChange={(e) => updateMedicine(row.id, 'meal', e.target.value)}
                          className="rounded border border-[#CBD5E1] bg-white p-1 text-[10px]"
                        >
                          <option>After meal</option>
                          <option>Before meal</option>
                        </select>
                      ) : (
                        <span className="text-[11px]">{row.meal}</span>
                      )}
                    </div>

                    <div>
                      {isEditing ? (
                        <input
                          value={row.duration}
                          onChange={(e) => updateMedicine(row.id, 'duration', e.target.value)}
                          className="w-16 border-b border-[#0D9488] bg-transparent text-[11px] outline-none"
                        />
                      ) : (
                        <span className="text-[11px] tabular-nums">{row.duration}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingId(isEditing ? null : row.id)}
                        aria-label={`Edit ${row.name}`}
                        className="grid h-7 w-7 place-items-center rounded-md text-[#94A3B8] hover:bg-[#F1F5F9]"
                      >
                        <Icon name={isEditing ? 'check' : 'edit'} size={14} />
                      </button>
                      {isEditing && (
                        <button
                          onClick={() => removeMedicine(row.id)}
                          aria-label="Remove medicine"
                          className="grid h-7 w-7 place-items-center rounded-md text-[#DC2626] hover:bg-red-50"
                        >
                          <Icon name="plus" size={14} className="rotate-45" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={addMedicineRow}
            className="mt-4 flex h-9 items-center gap-2 self-start text-[11px] font-semibold text-[#0D9488] hover:underline"
          >
            <Icon name="plus" size={14} />
            Add medicine row
          </button>

          <div className="mt-6 sm:mt-auto border-t border-[#E2E8F0] pt-5">
            <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-[#FFFBEB] px-3.5 py-3 text-[11px] leading-4 text-[#92400E]">
              <Icon name="clock" size={15} className="mt-0.5 shrink-0 text-[#F59E0B]" />
              <span>
                MedBuddy extracted {meds.length} medicines. Please verify dosage and timing before activating.
              </span>
            </div>
            <button
              disabled={saving}
              onClick={handleActivateReminders}
              className="flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#0D9488] text-[13px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E] disabled:opacity-60"
            >
              <Icon name="check" size={16} />
              {saving ? 'Activating in Supabase...' : 'Activate patient reminders'}
            </button>
          </div>
        </div>
      </main>
    </PatientShell>
  );
}
