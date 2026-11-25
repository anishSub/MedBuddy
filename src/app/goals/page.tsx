'use client';

import { useEffect, useState, useMemo } from 'react';
import { PatientShell } from '@/components/patient/PatientShell';
import { useAuth } from '@/context/AuthContext';
import { patientService } from '@/lib/supabase/services';

interface GoalForm {
  blood_pressure_target_upper: string;
  blood_pressure_target_lower: string;
  weight_kg: string;
  daily_steps: string;
}

const EMPTY_FORM: GoalForm = {
  blood_pressure_target_upper: '',
  blood_pressure_target_lower: '',
  weight_kg: '',
  daily_steps: '',
};

const DEFAULT_SCREEN_LIMIT_MINUTES = 120; // default screen time limit before reminder

function toNumber(value: string): number | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : Number(trimmed);
}

export default function GoalsPage() {
  const { user, patientDetail } = useAuth();
  const [form, setForm] = useState<GoalForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [waterMl, setWaterMl] = useState(0);
  const [foodNote, setFoodNote] = useState('');
  const [logSaving, setLogSaving] = useState(false);
  const [logSaved, setLogSaved] = useState(false);
  const [waterTime, setWaterTime] = useState('');
  const [screenMinutes, setScreenMinutes] = useState(0);
  const [screenLimit, setScreenLimit] = useState(DEFAULT_SCREEN_LIMIT_MINUTES);
  const [sleepBedtime, setSleepBedtime] = useState('23:30');
  const [sleepWakeTime, setSleepWakeTime] = useState('07:00');

  const sleepHours = useMemo(() => {
    if (!sleepBedtime || !sleepWakeTime) return 0;
    const [bh, bm] = sleepBedtime.split(':').map(Number);
    const [wh, wm] = sleepWakeTime.split(':').map(Number);
    const bed = (bh || 0) * 60 + (bm || 0);
    const wake = (wh || 0) * 60 + (wm || 0);
    let mins = wake - bed;
    if (mins < 0) mins += 24 * 60;
    return Math.round((mins / 60) * 10) / 10;
  }, [sleepBedtime, sleepWakeTime]);

  useEffect(() => {
    if (!patientDetail) return;
    setForm({
      blood_pressure_target_upper: patientDetail.blood_pressure_target_upper
        ? String(patientDetail.blood_pressure_target_upper)
        : '',
      blood_pressure_target_lower: patientDetail.blood_pressure_target_lower
        ? String(patientDetail.blood_pressure_target_lower)
        : '',
      weight_kg: patientDetail.weight_kg ? String(patientDetail.weight_kg) : '',
      daily_steps: patientDetail.daily_steps ? String(patientDetail.daily_steps) : '',
    });
  }, [patientDetail]);

  useEffect(() => {
    if (!user?.id) return;
    patientService
      .getFoodWaterLog(user.id)
      .then((log) => {
        if (log) {
          setWaterMl(log.water_ml ?? 0);
          setFoodNote(log.food_note ?? '');
          setWaterTime(log.water_time ? String(log.water_time).slice(0, 5) : '');
        }
      })
      .catch(() => {
        // no log yet — start from 0
      });
  }, [user?.id]);

  const sendWaterNotification = async (amountMl: number) => {
    const message = `Time to drink water — ${amountMl} ml`;
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert(message);
      return;
    }
    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await Notification.requestPermission();
    }
    if (perm === 'granted') {
      try {
        new Notification('MedBuddy Water Reminder', {
          body: message,
          icon: '/logo-robot.png',
        });
      } catch (err) {
        console.error('Failed to show water reminder notification:', err);
        alert(message);
      }
    } else {
      alert(
        `${message} (Enable desktop notifications in your browser settings to see native banners)`
      );
    }
  };

  async function handleSaveFoodWater() {
    setLogSaving(true);
    setLogSaved(false);
    try {
      await patientService.upsertFoodWaterLog(user?.id || 'a0000000-0000-0000-0000-000000000001', {
        water_ml: waterMl,
        food_note: foodNote,
        water_time: waterTime || null,
      });
      // Schedule the water reminder notification at the logged time
      if (waterTime) {
        const [hh, mm] = waterTime.split(':').map(Number);
        const fireAt = new Date();
        fireAt.setHours(hh || 0, mm || 0, 0, 0);
        const delay = fireAt.getTime() - Date.now();
        if (delay > 0) {
          setTimeout(() => void sendWaterNotification(waterMl), delay);
        } else {
          void sendWaterNotification(waterMl);
        }
      }
      setLogSaved(true);
    } catch (err) {
      console.error('Failed to save food/water log:', err);
      alert('Could not save. Please try again.');
    } finally {
      setLogSaving(false);
    }
  }

  const sendScreenTimeNotification = (minutes: number, limit: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const limitLabel = limit >= 60 ? `${Math.floor(limit / 60)} hr` : `${limit} min`;
    const message =
      hrs > 0
        ? `You've used ${hrs} hr ${mins} min of screen time today — over your ${limitLabel} limit. Time to take a break!`
        : `You've used ${mins} min of screen time today — over your ${limitLabel} limit. Time to take a break!`;
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert(message);
      return;
    }
    let perm = Notification.permission;
    if (perm === 'default') {
      void Notification.requestPermission();
    }
    if (perm === 'granted') {
      try {
        new Notification('MedBuddy Screen Time Reminder', {
          body: message,
          icon: '/logo-robot.png',
        });
      } catch (err) {
        console.error('Failed to show screen time reminder notification:', err);
        alert(message);
      }
    } else {
      alert(
        `${message} (Enable desktop notifications in your browser settings to see native banners)`
      );
    }
  };

  const addScreenMinutes = (mins: number) => {
    const next = screenMinutes + mins;
    const crossedLimit = screenMinutes <= screenLimit && next > screenLimit;
    setScreenMinutes(next);
    if (crossedLimit) {
      sendScreenTimeNotification(next, screenLimit);
    }
  };

  const sendSleepNotification = async (hours: number) => {
    const message =
      hours > 0
        ? `You logged ${hours} hrs of sleep — aim for 7–9 hrs per night.`
        : 'Time to wind down for sleep — aim for 7–9 hrs per night.';
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert(message);
      return;
    }
    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await Notification.requestPermission();
    }
    if (perm === 'granted') {
      try {
        new Notification('MedBuddy Sleep Reminder', {
          body: message,
          icon: '/logo-robot.png',
        });
      } catch (err) {
        console.error('Failed to show sleep reminder notification:', err);
        alert(message);
      }
    } else {
      alert(
        `${message} (Enable desktop notifications in your browser settings to see native banners)`
      );
    }
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await patientService.updateGoals(user?.id || 'a0000000-0000-0000-0000-000000000001', {
        blood_pressure_target_upper: toNumber(form.blood_pressure_target_upper),
        blood_pressure_target_lower: toNumber(form.blood_pressure_target_lower),
        weight_kg: toNumber(form.weight_kg),
        daily_steps: toNumber(form.daily_steps),
      });
      setSaved(true);
    } catch (err) {
      console.error('Failed to save goals:', err);
      setError('Could not save your goals. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PatientShell title="Goals" eyebrow="Personal health targets" compact>
      <main className="flex-1 min-h-0 overflow-y-auto bg-[#F8FAFC] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="patient-card p-5 sm:p-6">
          <h2 className="text-base font-semibold tracking-[-0.01em] text-[#0F172A]">
            Health Goals
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Set your targets — they help your care team see how you&apos;re doing over time.
          </p>
          <form onSubmit={handleSave} className="mt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#64748B]">
                  Blood pressure target
                </span>
                <div className="flex gap-2">
                  <input
                    value={form.blood_pressure_target_upper}
                    onChange={(e) =>
                      setForm({ ...form, blood_pressure_target_upper: e.target.value })
                    }
                    placeholder="Systolic, e.g. 120"
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  />
                  <input
                    value={form.blood_pressure_target_lower}
                    onChange={(e) =>
                      setForm({ ...form, blood_pressure_target_lower: e.target.value })
                    }
                    placeholder="Diastolic, e.g. 80"
                    className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#64748B]">
                  Weight
                </span>
                <input
                  value={form.weight_kg}
                  onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                  placeholder="e.g. 69 kg"
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-[#64748B]">
                  Daily steps
                </span>
                <input
                  value={form.daily_steps}
                  onChange={(e) => setForm({ ...form, daily_steps: e.target.value })}
                  placeholder="e.g. 8000 steps per day"
                  className="w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </label>
            </div>
            {error && <p className="mt-3 text-sm text-[#B45309]">{error}</p>}
            {saved && <p className="mt-3 text-sm font-semibold text-[#059669]">Goals saved.</p>}
            <button
              type="submit"
              disabled={saving}
              className="mt-4 h-9 rounded-md bg-[#0D9488] px-4 text-[13px] font-semibold text-white transition hover:bg-[#0F766E] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save goals'}
            </button>
          </form>
        </div>

        {/* Daily intake — food & water tracker */}
        <div className="patient-card mt-4 px-4 py-3 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[#94A3B8]">
            Daily intake
          </p>
          <div className="mt-2.5 flex items-center gap-2.5">
            <button
              onClick={() => setWaterMl((w) => Math.max(0, w - 250))}
              className="grid h-7 w-7 place-items-center rounded-full bg-[#E6F4F2] font-semibold text-[#0D9488]"
            >
              −
            </button>
            <span className="text-[13px] font-semibold text-[#0F172A] tabular-nums">
              {waterMl} ml water
            </span>
            <button
              onClick={() => setWaterMl((w) => w + 250)}
              className="grid h-7 w-7 place-items-center rounded-full bg-[#E6F4F2] font-semibold text-[#0D9488]"
            >
              +
            </button>
            <button
              onClick={handleSaveFoodWater}
              disabled={logSaving}
              className="h-7 rounded-md bg-[#0D9488] px-2.5 text-[10px] font-semibold text-white transition hover:bg-[#0F766E] disabled:opacity-60"
            >
              {logSaved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#94A3B8]">Logged at</span>
            <input
              type="time"
              value={waterTime}
              onChange={(e) => setWaterTime(e.target.value)}
              className="h-8 rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px] font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
            />
          </div>
          <textarea
            value={foodNote}
            onChange={(e) => setFoodNote(e.target.value)}
            rows={2}
            placeholder="Note: dal, roti, apple, snacks…"
            className="mt-2 w-full rounded-md border border-[#E2E8F0] px-3 py-2 text-[12px] text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#0D9488] resize-none"
          />
        </div>

        {/* Screen time today */}
        <div className="patient-card mt-4 px-4 py-3 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[#94A3B8]">
            Screen time today
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold text-[#0F172A] tabular-nums">
              {screenMinutes} min used
            </span>
            <label className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#94A3B8]">Limit</span>
              <input
                type="number"
                min={1}
                value={screenLimit}
                onChange={(e) =>
                  setScreenLimit(Math.max(1, Number(e.target.value) || DEFAULT_SCREEN_LIMIT_MINUTES))
                }
                className="h-7 w-20 rounded-md border border-[#E2E8F0] bg-white px-2 text-[12px] font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
              <span className="text-[11px] font-semibold text-[#94A3B8]">min</span>
            </label>
            <button
              onClick={() => addScreenMinutes(15)}
              className="h-7 rounded-md bg-[#E6F4F2] px-2 text-[10px] font-semibold text-[#0D9488] transition hover:bg-[#D3EFEA]"
            >
              +15 min
            </button>
            <button
              onClick={() => addScreenMinutes(30)}
              className="h-7 rounded-md bg-[#E6F4F2] px-2 text-[10px] font-semibold text-[#0D9488] transition hover:bg-[#D3EFEA]"
            >
              +30 min
            </button>
            <button
              onClick={() => sendScreenTimeNotification(screenMinutes, screenLimit)}
              className="h-8 rounded-md bg-[#0D9488] px-3 text-[11px] font-semibold text-white transition hover:bg-[#0F766E]"
            >
              Notify me
            </button>
          </div>
          {screenMinutes > screenLimit && (
            <p className="mt-2 text-[11px] font-semibold text-[#B45309]">
              Over your {screenLimit} min limit — you&apos;ve been notified.
            </p>
          )}
        </div>

        {/* Sleep tracker */}
        <div className="patient-card mt-4 px-4 py-3 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[#94A3B8]">
            Sleep
          </p>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold text-[#94A3B8]">Bedtime</span>
              <input
                type="time"
                value={sleepBedtime}
                onChange={(e) => setSleepBedtime(e.target.value)}
                className="w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[12px] font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold text-[#94A3B8]">Wake time</span>
              <input
                type="time"
                value={sleepWakeTime}
                onChange={(e) => setSleepWakeTime(e.target.value)}
                className="w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-[12px] font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
            </label>
          </div>
          <div className="mt-2.5">
            <span className="text-[13px] font-semibold text-[#0F172A] tabular-nums">
              {sleepHours} hrs slept
            </span>
          </div>
          <button
            onClick={() => sendSleepNotification(sleepHours)}
            className="mt-2 h-8 w-full rounded-md bg-[#0D9488] px-3 text-[11px] font-semibold text-white transition hover:bg-[#0F766E]"
          >
            Notify me
          </button>
          <p className="mt-2 text-[11px] text-[#94A3B8]">
            Sleep reminders notify you — aim for 7–9 hrs of sleep per night.
          </p>
        </div>

        {/* Sleep guidance */}
        <div className="patient-card mt-4 px-4 py-3 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[#94A3B8]">
            Sleep guidance
          </p>
          <ul className="mt-2 space-y-1.5">
            <li className="text-[12px] text-[#475569]">
              Recommended: adults need about 7–9 hours of sleep per night.
            </li>
            <li className="text-[12px] text-[#475569]">
              Good sleep: 7–9 hrs · Short sleep: under 7 hrs · Very short: under 6 hrs.
            </li>
            <li className="text-[12px] text-[#475569]">
              Very low sleep (&lt; 6 hrs) can affect immunity and medication adherence — tell your
              care team.
            </li>
          </ul>
          {sleepHours > 0 && (
            <p className="mt-2 text-[12px] font-semibold text-[#0F172A]">
              You logged {sleepHours} hrs —{' '}
              {sleepHours >= 7 && sleepHours <= 9 ? (
                <span className="text-[#059669]">that’s within the recommended range ✅</span>
              ) : sleepHours < 7 ? (
                <span className="text-[#B45309]">that’s below the recommended range — worth discussing with your doctor.</span>
              ) : (
                <span className="text-[#059669]">that’s above the recommended range.</span>
              )}
            </p>
          )}
        </div>
      </main>
    </PatientShell>
  );
}
