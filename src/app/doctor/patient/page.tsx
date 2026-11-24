'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/common/Icon';
import { DocumentThumb } from '@/components/patient/DocumentThumb';

export default function DoctorPatientPage() {
  const [published, setPublished] = useState(false);
  const [meds, setMeds] = useState([
    { id: 1, name: 'Paracetamol', dose: '500 mg', times: [true, false, true], meal: 'After meal' },
    { id: 2, name: 'Pantoprazole', dose: '40 mg', times: [true, false, false], meal: 'Before meal' },
    { id: 3, name: 'Azithromycin', dose: '250 mg', times: [true, false, true], meal: 'After meal' },
  ]);

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

  return (
    <main className="flex flex-col xl:flex-row flex-1 min-h-0 overflow-y-auto xl:overflow-hidden">
      {/* Left Context Column */}
      <aside className="w-full xl:w-[38%] border-b xl:border-b-0 xl:border-r border-[#E2E8F0] bg-[#FCFDFD] px-4 sm:px-6 lg:px-8 py-6 sm:py-7 shrink-0 xl:overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#94A3B8]">
          Clinical context
        </p>

        {/* Patient header */}
        <div className="mt-4 flex items-center border-b border-[#E2E8F0] pb-5 sm:pb-6">
          <div className="grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-full bg-[#DDEBE9] text-[13px] font-semibold text-[#0F766E] shrink-0">
            RS
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <h1 className="text-base sm:text-[18px] font-semibold tracking-[-0.02em] text-[#0F172A] truncate">
              Ramesh Sharma
            </h1>
            <p className="mt-0.5 text-[10px] text-[#64748B]">#CT-2048 · 64 years · Male · O+</p>
          </div>
          <div className="ml-auto text-right shrink-0">
            <p className="text-xl sm:text-[22px] font-semibold tracking-[-0.04em] tabular-nums text-[#0D9488]">
              88%
            </p>
            <p className="text-[9px] text-[#94A3B8]">Adherence</p>
          </div>
        </div>

        {/* Active meds */}
        <div className="border-b border-[#E2E8F0] py-4 sm:py-5">
          <div className="mb-3 flex justify-between">
            <h2 className="text-[12px] font-semibold text-[#334155]">Active medications</h2>
            <span className="text-[10px] text-[#94A3B8]">4 current</span>
          </div>
          {[
            ['Metformin', '500 mg · Morning, Night'],
            ['Amlodipine', '5 mg · Morning'],
            ['Atorvastatin', '10 mg · Night'],
            ['Calcium + D3', '500 mg · Afternoon'],
          ].map(([name, dose]) => (
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
            <Link href="/records" className="text-[10px] font-semibold text-[#0D9488] hover:underline">
              View all records
            </Link>
          </div>
          {[
            ['Lab Report', 'HbA1c & Glucose Panel', '21 Jun 2024', 'lab'],
            ['X-Ray', 'Chest X-Ray — PA View', '18 Apr 2024', 'xray'],
          ].map(([type, title, date, kind]) => (
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
          ))}
        </div>
      </aside>

      {/* Right Rx Builder Column */}
      <div className="flex w-full xl:w-[62%] flex-col px-4 sm:px-6 lg:px-9 py-6 sm:py-7 xl:overflow-y-auto">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#0D9488]">
              New prescription
            </p>
            <h2 className="mt-0.5 text-xl sm:text-[21px] font-semibold tracking-[-0.025em] text-[#0F172A]">
              Prescription Builder
            </h2>
          </div>
          <label className="grid gap-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            Load preset template
            <select className="h-9 w-full sm:w-[210px] rounded-md border border-[#CBD5E1] bg-white px-3 text-[11px] font-medium normal-case tracking-normal text-[#475569] shadow-xs">
              <option>Choose a template</option>
              <option>Viral Fever 1-0-1</option>
              <option>Gastritis Regimen</option>
              <option>Post-Op Care</option>
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
                  defaultValue={med.name}
                  className="min-w-0 border-b border-transparent bg-transparent text-[12px] font-semibold text-[#0F172A] outline-none focus:border-[#0D9488]"
                />
                <input
                  defaultValue={med.dose}
                  className="min-w-0 border-b border-transparent bg-transparent text-[11px] tabular-nums text-[#475569] outline-none focus:border-[#0D9488]"
                />
                <div className="flex gap-2 sm:gap-3">
                  {med.times.map((checked, i) => (
                    <label key={i} className="grid gap-0.5 text-center text-[8px] text-[#94A3B8]">
                      <input
                        type="checkbox"
                        defaultChecked={checked}
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 accent-[#0D9488]"
                      />
                      {['M', 'A', 'N'][i]}
                    </label>
                  ))}
                </div>
                <select
                  defaultValue={med.meal}
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
              className="h-20 resize-none rounded-md border border-[#CBD5E1] p-3 text-[11px] font-normal outline-none focus:border-[#0D9488]"
              placeholder="Advice and clinical notes..."
              defaultValue="Continue Metformin with food. Increase water intake and monitor fasting glucose weekly."
            />
          </label>
          <label className="grid content-start gap-2 text-[10px] font-semibold text-[#64748B]">
            Next follow-up date
            <input
              type="date"
              defaultValue="2024-07-22"
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
            onClick={() => setPublished(true)}
            className="w-full sm:w-auto flex h-10 sm:h-11 items-center justify-center gap-2 rounded-md bg-[#0D9488] px-5 text-[11px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E]"
          >
            <Icon name="check" size={15} />
            {published ? 'Prescription published!' : 'Publish Prescription & Trigger Reminders'}
          </button>
        </div>
      </div>
    </main>
  );
}
