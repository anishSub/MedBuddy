'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PatientShell } from '@/components/patient/PatientShell';
import { Icon } from '@/components/common/Icon';
import { useAuth } from '@/context/AuthContext';
import { patientService } from '@/lib/supabase/services';
import type { AppointmentStatus } from '@/types';

interface MedicationRow {
  id: string;
  name: string;
  dosage: string;
  form: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  meal_timing: string;
  duration_days: string | null;
}

interface AppointmentRow {
  id: string;
  appointment_time: string;
  appointment_date: string;
  department: string;
  visit_type: string;
  status: AppointmentStatus;
  doctor?: { full_name: string } | null;
}

export default function DashboardPage() {
  const { user, patientDetail } = useAuth();
  const patientProfileId = user?.id || 'a0000000-0000-0000-0000-000000000001';

  const [medications, setMedications] = useState<MedicationRow[]>([]);
  const [takenKeys, setTakenKeys] = useState<Set<string>>(new Set(['e0000000-0000-0000-0000-000000000001_Morning']));
  const [appointment, setAppointment] = useState<AppointmentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingAppt, setUpdatingAppt] = useState(false);

  // Today's formatted date string
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, []);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [medsData, logsData, apptData] = await Promise.all([
        patientService.getMedications(patientProfileId),
        patientService.getTodayLogs(patientProfileId),
        patientService.getUpcomingAppointment(patientProfileId),
      ]);

      if (medsData && medsData.length > 0) {
        setMedications(medsData as MedicationRow[]);
      } else {
        // Fallback default medications
        setMedications([
          {
            id: 'e0000000-0000-0000-0000-000000000001',
            name: 'Metformin',
            dosage: '500 mg',
            form: 'Tablet',
            morning: true,
            afternoon: false,
            night: true,
            meal_timing: 'After meal',
            duration_days: '30 days',
          },
          {
            id: 'e0000000-0000-0000-0000-000000000002',
            name: 'Amlodipine',
            dosage: '5 mg',
            form: 'Tablet',
            morning: true,
            afternoon: false,
            night: false,
            meal_timing: 'After meal',
            duration_days: '30 days',
          },
          {
            id: 'e0000000-0000-0000-0000-000000000003',
            name: 'Calcium + D3',
            dosage: '500 mg',
            form: 'Tablet',
            morning: false,
            afternoon: true,
            night: false,
            meal_timing: 'After meal',
            duration_days: '5 days',
          },
          {
            id: 'e0000000-0000-0000-0000-000000000004',
            name: 'Atorvastatin',
            dosage: '10 mg',
            form: 'Tablet',
            morning: false,
            afternoon: false,
            night: true,
            meal_timing: 'After meal',
            duration_days: '30 days',
          },
        ]);
      }

      // Map today's taken doses
      const activeTaken = new Set<string>();
      if (logsData && logsData.length > 0) {
        logsData.forEach((log) => {
          if (log.is_taken) {
            activeTaken.add(`${log.medication_id}_${log.slot_time}`);
          }
        });
      } else {
        // default first dose taken
        activeTaken.add('e0000000-0000-0000-0000-000000000001_Morning');
      }
      setTakenKeys(activeTaken);

      if (apptData) {
        setAppointment(apptData as unknown as AppointmentRow);
      }
    } catch (err) {
      console.warn('Could not load Supabase dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [patientProfileId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Group medications into schedule groups
  const scheduleGroups = useMemo(() => {
    const morningMeds = medications.filter((m) => m.morning);
    const afternoonMeds = medications.filter((m) => m.afternoon);
    const nightMeds = medications.filter((m) => m.night);

    return [
      {
        time: 'Morning',
        hour: '8:00 AM',
        icon: '07:45',
        slot: 'Morning',
        items: morningMeds,
      },
      {
        time: 'Afternoon',
        hour: '1:30 PM',
        icon: '13:15',
        slot: 'Afternoon',
        items: afternoonMeds,
      },
      {
        time: 'Night',
        hour: '8:30 PM',
        icon: '20:15',
        slot: 'Night',
        items: nightMeds,
      },
    ].filter((g) => g.items.length > 0);
  }, [medications]);

  const totalDoses = useMemo(() => {
    return scheduleGroups.reduce((acc, g) => acc + g.items.length, 0);
  }, [scheduleGroups]);

  const takenCount = useMemo(() => {
    let count = 0;
    scheduleGroups.forEach((g) => {
      g.items.forEach((m) => {
        if (takenKeys.has(`${m.id}_${g.slot}`)) {
          count++;
        }
      });
    });
    return count;
  }, [scheduleGroups, takenKeys]);

  const toggleTaken = async (medicationId: string, slotTime: string) => {
    const key = `${medicationId}_${slotTime}`;
    const nextTaken = !takenKeys.has(key);

    // Optimistic UI update
    setTakenKeys((prev) => {
      const updated = new Set(prev);
      if (nextTaken) {
        updated.add(key);
      } else {
        updated.delete(key);
      }
      return updated;
    });

    // Persist to Supabase medication_logs table
    try {
      await patientService.toggleLog(patientProfileId, medicationId, slotTime, nextTaken);
    } catch (err) {
      console.error('Failed to update medication log in Supabase:', err);
    }
  };

  const handleUpdateAppointment = async (newStatus: AppointmentStatus) => {
    if (!appointment) return;
    setUpdatingAppt(true);
    try {
      await patientService.updateAppointmentStatus(appointment.id, newStatus);
      setAppointment({ ...appointment, status: newStatus });
    } catch (err) {
      console.error('Failed to update appointment:', err);
    } finally {
      setUpdatingAppt(false);
    }
  };

  const adherenceRate = patientDetail?.weekly_adherence || 88;
  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Ramesh';

  return (
    <PatientShell title={`Good morning, ${firstName}`} eyebrow={todayFormatted}>
      <main className="flex flex-col xl:flex-row flex-1 min-h-0 overflow-y-auto xl:overflow-hidden">
        {/* Schedule List Column */}
        <div className="flex-1 w-full xl:w-[63%] xl:overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-wrap items-end justify-between border-b border-[#E2E8F0] pb-5 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-[20px] font-semibold tracking-[-0.025em] text-[#0F172A]">
                  Today’s Medicine Schedule
                </h2>
                {loading && (
                  <span className="text-[10px] text-[#0D9488] bg-[#E6F4F2] px-2 py-0.5 rounded-full font-medium">
                    Syncing with Supabase...
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] text-[#64748B]">
                {totalDoses} doses scheduled for today
              </p>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              {takenCount} of {totalDoses} taken
            </div>
          </div>

          <div className="relative mt-2">
            <div className="hidden sm:block absolute bottom-7 left-[21px] top-7 w-px bg-[#E2E8F0]" />
            {scheduleGroups.map((group) => (
              <div
                key={group.time}
                className="relative flex flex-col sm:flex-row border-b border-[#E2E8F0] py-5 last:border-b-0 gap-3 sm:gap-0"
              >
                <div className="relative z-10 sm:mr-5 mt-0.5 grid h-[40px] w-[40px] sm:h-[43px] sm:w-[43px] shrink-0 place-items-center rounded-full border border-[#D5E2E0] bg-white text-[9px] font-bold tabular-nums text-[#0F766E] shadow-xs">
                  {group.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-baseline gap-2">
                    <h3 className="text-[14px] font-semibold text-[#0F172A]">{group.time}</h3>
                    <span className="text-[12px] tabular-nums text-[#94A3B8]">{group.hour}</span>
                  </div>
                  {group.items.map((med) => {
                    const isTaken = takenKeys.has(`${med.id}_${group.slot}`);
                    return (
                      <div
                        key={med.id}
                        className="flex flex-wrap sm:flex-nowrap items-center border-t border-[#F1F5F9] first:border-t-0 py-3 sm:py-0 sm:h-[57px] gap-2 sm:gap-4"
                      >
                        <div className="flex-1 min-w-[160px]">
                          <p className="text-[14px] font-semibold text-[#0F172A]">{med.name}</p>
                          <p className="mt-0.5 text-[11px] tabular-nums text-[#64748B]">
                            {med.dosage} · 1 {med.form.toLowerCase()}
                          </p>
                        </div>
                        <span className="rounded-md bg-[#F1F5F9] px-2.5 py-1 text-[10px] font-semibold text-[#64748B] shrink-0">
                          {med.meal_timing}
                        </span>
                        <button
                          onClick={() => toggleTaken(med.id, group.slot)}
                          className={`ml-auto sm:ml-0 flex h-8 items-center gap-1.5 rounded-md border px-3 text-[11px] font-semibold transition shrink-0 ${
                            isTaken
                              ? 'border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]'
                              : 'border-[#CBD5E1] bg-white text-[#475569] hover:bg-slate-50'
                          }`}
                        >
                          <Icon name="check" size={14} />
                          {isTaken ? 'Taken' : 'Mark taken'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Adherence and upcoming appointments aside */}
        <aside className="w-full xl:w-[37%] xl:overflow-y-auto border-t xl:border-t-0 xl:border-l border-[#E2E8F0] bg-[#FCFDFD] px-4 sm:px-6 lg:px-7 py-6 sm:py-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#94A3B8]">
            Weekly adherence
          </p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl sm:text-[40px] xl:text-[44px] font-semibold leading-none tracking-[-0.05em] tabular-nums text-[#0F172A]">
              {adherenceRate}%
            </span>
            <span className="pb-1 text-[13px] text-[#64748B]">taken this week</span>
          </div>

          {/* Bar Chart */}
          <div className="mt-6 flex h-[54px] items-end gap-2">
            {[78, 92, 86, 100, 70, 62, 24].map((v, i) => (
              <div className="flex h-full flex-1 flex-col justify-end gap-1.5" key={i}>
                <div className="rounded-xs bg-[#D7ECE9]" style={{ height: `${v}%` }}>
                  <div
                    className="h-full rounded-xs bg-[#0D9488]"
                    style={{ opacity: i === 6 ? 0.35 : 1 }}
                  />
                </div>
                <span className="text-center text-[9px] text-[#94A3B8]">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </div>
            ))}
          </div>

          {/* Upcoming follow-up card */}
          <div className="mt-8 border-t border-[#E2E8F0] pt-6 sm:pt-8">
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#F59E0B]">
                  <Icon name="calendar" size={17} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.11em]">
                    Upcoming follow-up
                  </p>
                </div>
                <span
                  className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                    appointment?.status === 'Confirmed'
                      ? 'bg-[#ECFDF5] text-[#059669]'
                      : 'bg-[#FFFBEB] text-[#B45309]'
                  }`}
                >
                  {appointment?.status || 'Confirmed'}
                </span>
              </div>
              <h3 className="mt-4 text-[17px] sm:text-[18px] font-semibold tracking-[-0.02em] text-[#0F172A]">
                {appointment?.doctor?.full_name || 'Dr. Sushil Adhikari'}
              </h3>
              <p className="mt-1 text-[13px] font-medium text-[#475569]">
                {appointment?.appointment_time || '10:30 AM'} · {appointment?.visit_type || 'Cardiology review'}
              </p>
              <p className="mt-1 text-[12px] text-[#94A3B8]">
                {appointment?.department || 'Cardiology'} · Norvic Clinic, Thapathali
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  disabled={updatingAppt}
                  onClick={() => handleUpdateAppointment('Confirmed')}
                  className="h-9 flex-1 rounded-md bg-[#0D9488] text-[12px] font-semibold text-white transition hover:bg-[#0F766E] disabled:opacity-60"
                >
                  {appointment?.status === 'Confirmed' ? 'Visit confirmed' : 'Confirm visit'}
                </button>
                <button
                  disabled={updatingAppt}
                  onClick={() => handleUpdateAppointment('Reschedule Requested')}
                  className="h-9 flex-1 rounded-md border border-[#CBD5E1] text-[12px] font-semibold text-[#475569] transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>

          {/* Care team */}
          <div className="mt-7 flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <p className="text-[13px] font-semibold text-[#334155]">Care team</p>
            <button className="text-[11px] font-semibold text-[#0D9488] hover:underline">View all</button>
          </div>
          <div className="flex items-center gap-3 py-3.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#E6F4F2] text-[11px] font-semibold text-[#0D9488]">
              SA
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#334155]">
                {appointment?.doctor?.full_name || 'Dr. Sushil Adhikari'}
              </p>
              <p className="text-[11px] text-[#94A3B8]">Primary physician · Cardiology</p>
            </div>
          </div>
        </aside>
      </main>
    </PatientShell>
  );
}
