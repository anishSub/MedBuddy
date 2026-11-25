'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PatientShell } from '@/components/patient/PatientShell';
import { useAuth } from '@/context/AuthContext';
import { patientService } from '@/lib/supabase/services';

interface MedLogRow {
  medication_id: string;
  slot_time: string;
  log_date: string;
  is_taken: boolean;
}

interface MedInfo {
  id: string;
  name: string;
  dosage: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
}

const DEFAULT_PATIENT_ID = 'a0000000-0000-0000-0000-000000000001';

function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDaysIso(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return localYmd(d);
}

function monthStartOf(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return localYmd(new Date(d.getFullYear(), d.getMonth(), 1));
}

function monthEndOf(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return localYmd(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

function streakDays(takenDates: string[]): number {
  if (takenDates.length === 0) return 0;
  const sorted = [...takenDates].sort((a, b) => (a < b ? -1 : 1));
  let streak = 1;
  for (let i = sorted.length - 2; i >= 0; i--) {
    if (addDaysIso(sorted[i], 1) === sorted[i + 1]) streak++;
    else break;
  }
  return streak;
}

function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MedicinePage() {
  const { user } = useAuth();
  const [meds, setMeds] = useState<MedInfo[]>([]);
  const [logs, setLogs] = useState<MedLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMonth, setViewMonth] = useState<string>(() => localYmd(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const id = user?.id || DEFAULT_PATIENT_ID;
      const [medData, logData] = await Promise.all([
        patientService.getMedications(id),
        patientService.getMedicationLogs(id),
      ]);
      setMeds(medData as MedInfo[]);
      setLogs(logData as MedLogRow[]);
    } catch (err) {
      console.warn('Could not load medication data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  // ---------- Adherence tracker ----------
  const tracker = useMemo(() => {
    const takenByDate = new Map<string, Set<string>>();
    logs.forEach((log) => {
      if (!log.is_taken) return;
      const set = takenByDate.get(log.log_date) ?? new Set<string>();
      set.add(log.medication_id);
      takenByDate.set(log.log_date, set);
    });

    const start = monthStartOf(viewMonth);
    const end = monthEndOf(viewMonth);

    let expected = 0;
    let taken = 0;
    const dayStates: {
      date: string;
      expected: number;
      taken: number;
    }[] = [];
    for (let i = 0; i < 42; i++) {
      const date = addDaysIso(start, i);
      if (date > end) break;
      const takenSet = takenByDate.get(date);
      let exp = 0;
      let t = 0;
      meds.forEach((m) => {
        const slots = [m.morning, m.afternoon, m.night];
        slots.forEach((on) => {
          if (!on) return;
          exp++;
          if (takenSet?.has(m.id)) t++;
        });
      });
      expected += exp;
      taken += t;
      dayStates.push({ date, expected: exp, taken: t });
    }
    const adherence = expected > 0 ? Math.round((taken / expected) * 100) : 0;

    // Days so far this week (last 7 days ending today)
    const weekDates = new Set<string>();
    let cur = localYmd(new Date());
    for (let i = 0; i < 7; i++) {
      weekDates.add(cur);
      cur = addDaysIso(cur, -1);
    }

    const medStats = meds.map((m) => {
      const takenDates = logs
        .filter((l) => l.medication_id === m.id && l.is_taken)
        .map((l) => l.log_date);
      const daysThisWeek = [...weekDates].filter((d) => takenDates.includes(d)).length;
      return {
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        daysThisWeek,
        streak: streakDays(takenDates),
      };
    });

    return { start, adherence, expected, taken, dayStates, medStats };
  }, [logs, meds, viewMonth]);

  const dayDetail = useMemo(() => {
    if (!selectedDate || meds.length === 0) return null;
    return meds.map((m) => {
      const slots = (
        [
          ['Morning', m.morning],
          ['Afternoon', m.afternoon],
          ['Night', m.night],
        ] as const
      )
        .filter(([, scheduled]) => scheduled)
        .map(([slot]) => ({
          slot,
          taken: logs.some(
            (l) =>
              l.medication_id === m.id &&
              l.slot_time === slot &&
              l.log_date === selectedDate &&
              l.is_taken
          ),
        }));
      const scheduledCount = slots.length;
      return { name: m.name, dosage: m.dosage, slots, scheduledCount };
    });
  }, [selectedDate, meds, logs]);

  const monthLabel = useMemo(
    () =>
      new Date(`${viewMonth}T00:00:00`).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    [viewMonth]
  );

  return (
    <PatientShell title="Medicine Tracker" eyebrow="Adherence calendar" compact>
      <main className="flex-1 min-h-0 overflow-y-auto bg-[#F8FAFC] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {loading ? (
          <p className="text-[13px] text-[#94A3B8]">Loading medicine data…</p>
        ) : (
          <div className="patient-card p-4 sm:p-5">
            {/* Overall adherence */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[#94A3B8]">
                Overall adherence
              </p>
              <p className="mt-1.5 text-3xl font-semibold tracking-[-0.03em] text-[#0F172A] sm:text-[28px]">
                {tracker.adherence}%
              </p>
              <p className="mt-1 text-xs text-[#64748B]">
                {tracker.taken} of {tracker.expected} doses taken this month
              </p>
            </div>

            {/* Per-medicine streaks */}
            {tracker.medStats.length > 0 && (
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[#94A3B8]">
                  Per medicine
                </p>
                <div className="mt-2 space-y-2">
                  {tracker.medStats.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[#0F172A]">
                          {st.name}
                        </p>
                        {st.dosage && (
                          <p className="truncate text-[11px] text-[#64748B]">{st.dosage}</p>
                        )}
                      </div>
                      <p className="shrink-0 text-[11px] font-semibold text-[#059669]">
                        ✅ {st.daysThisWeek}/7 days this week
                        {st.streak > 0 && (
                          <span className="ml-2 font-normal text-[#94A3B8]">streak {st.streak}</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar */}
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewMonth(monthStartOf(addDaysIso(viewMonth, -1)))}
                    className="grid h-7 w-7 place-items-center rounded-md text-[#64748B] transition hover:bg-slate-100"
                    aria-label="Previous month"
                  >
                    ‹
                  </button>
                  <p className="text-[12px] font-semibold text-[#0F172A] tabular-nums">
                    {monthLabel}
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewMonth(monthStartOf(addDaysIso(viewMonth, 31)))}
                    className="grid h-7 w-7 place-items-center rounded-md text-[#64748B] transition hover:bg-slate-100"
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>
                <p className="text-[10px] text-[#94A3B8]">Tap a day for details</p>
              </div>

              <div className="mt-2.5 grid grid-cols-7 gap-1.5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((letter, i) => (
                  <span
                    key={`wd-${i}`}
                    className="text-center text-[9px] font-medium text-[#94A3B8]"
                  >
                    {letter}
                  </span>
                ))}
                {(() => {
                  const start = new Date(`${tracker.start}T00:00:00`);
                  const pad = (start.getDay() + 6) % 7; // 0 = Monday
                  const cells = [];
                  for (let i = 0; i < pad; i++) {
                    cells.push(
                      <span key={`pad-${i}`} className="h-8 rounded-md bg-transparent" />
                    );
                  }
                  for (const d of tracker.dayStates) {
                    const isToday = localYmd(new Date()) === d.date;
                    const isSelected = d.date === selectedDate;
                    const stateClass =
                      d.expected === 0
                        ? 'bg-[#E2E8F0]'
                        : d.taken === d.expected
                          ? 'bg-[#E6F4F2]'
                          : d.taken > 0
                            ? 'bg-[#FFFBEB]'
                            : 'bg-[#FEE2E2]';
                    cells.push(
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => setSelectedDate(d.date === selectedDate ? null : d.date)}
                        className={`grid h-8 place-items-center rounded-md transition ${stateClass} ${
                          isToday ? 'ring-2 ring-[#0D9488] ring-offset-1 ring-offset-white' : ''
                        } ${isSelected ? 'ring-2 ring-[#059669]' : ''}`}
                        aria-label={`${formatDate(d.date)} — ${d.taken}/${d.expected} doses taken`}
                        title={
                          d.expected === 0
                            ? `${formatDate(d.date)} — no doses scheduled`
                            : `${formatDate(d.date)} — ${d.taken}/${d.expected} taken`
                        }
                      >
                        <span className="text-[10px] font-semibold text-inherit">
                          {d.date.slice(8, 10)}
                        </span>
                      </button>
                    );
                  }
                  return cells;
                })()}
              </div>
            </div>

            {/* Day details — taken vs missed */}
            {dayDetail && selectedDate && (
              <div className="mt-4 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
                <p className="text-[12px] font-semibold text-[#0F172A] tabular-nums">
                  {formatDate(selectedDate)}
                </p>
                {dayDetail.map((m) => (
                  <p key={m.name} className="mt-0.5 text-[11px] text-[#475569]">
                    {m.name} ·{' '}
                    {m.scheduledCount > 0
                      ? m.slots
                          .map((s) => `${s.slot}: ${s.taken ? 'taken' : 'missed'}`)
                          .join(' · ')
                      : 'Not scheduled'}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </PatientShell>
  );
}
