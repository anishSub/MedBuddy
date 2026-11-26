"use client";

import { useState } from "react";
import { PatientShell } from "@/components/patient/PatientShell";
import { Icon } from "@/components/common/Icon";
import type { IconName } from "@/types";

type CallType = "video" | "audio" | "chat";

const CALL_TYPES: { id: CallType; label: string; icon: IconName }[] = [
  { id: "video", label: "Video", icon: "video" },
  { id: "audio", label: "Audio", icon: "audio" },
  { id: "chat", label: "Live Chat", icon: "chat" },
];

export default function BookAppointmentPage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [callType] = useState<CallType>("video");
  const [booked, setBooked] = useState(false);

  const confirmBooking = () => {
    setBooked(true);
  };

  const resetBooking = () => {
    setBooked(false);
    setDate("");
    setTime("");
  };

  const callTypeLabel =
    CALL_TYPES.find((c) => c.id === callType)?.label || "Video";

  return (
    <PatientShell title="Book Appointment" compact>
      <main className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-[#F8FAFC] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {/* Consultation booking */}
        <div className="mt-5">
          <div className="patient-card p-4 sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
              Consultation booking
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E6F4F2] text-[#0D9488]">
                <Icon name="stethoscope" size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-[#0F172A]">
                  Dr. S. Adhikari
                </p>
                <p className="mt-0.5 text-[10px] text-[#64748B]">
                  Free: Today · 04:30 PM
                </p>
              </div>
            </div>

            {booked ? (
              <div className="mt-5 rounded-md bg-[#ECFDF5] p-4 text-center">
                <p className="text-[13px] font-semibold text-[#059669]">
                  Booked ✓
                </p>
                <p className="mt-1 text-[11px] text-[#475569]">
                  {callTypeLabel} consultation with Dr. S. Adhikari confirmed.
                </p>
                <button
                  onClick={resetBooking}
                  className="mt-3 h-8 rounded-md border border-[#CBD5E1] bg-white px-3 text-[11px] font-semibold text-[#475569] transition hover:bg-slate-50"
                >
                  Book another
                </button>
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                <div className="grid gap-1 text-[10px] font-semibold text-[#64748B]">
                  <p>Call type</p>
                  <div className="flex gap-2">
                    {CALL_TYPES.map((c) => (
                      <span
                        key={c.id}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-[11px] font-semibold ${
                          callType === c.id
                            ? "border-[#0D9488] bg-[#E6F4F2] text-[#0F766E]"
                            : "border-[#CBD5E1] text-[#64748B]"
                        }`}
                      >
                        <Icon name={c.icon} size={14} />
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
                <label className="grid gap-1 text-[10px] font-semibold text-[#64748B]">
                  Date
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-9 rounded-md border border-[#CBD5E1] bg-white px-2 text-[12px] text-[#0F172A]"
                  />
                </label>
                <label className="grid gap-1 text-[10px] font-semibold text-[#64748B]">
                  Time
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-9 rounded-md border border-[#CBD5E1] bg-white px-2 text-[12px] text-[#0F172A]"
                  />
                </label>
                <button
                  onClick={confirmBooking}
                  className="mt-4 h-9 w-full rounded-md bg-[#0D9488] text-[13px] font-semibold text-white transition hover:bg-[#0F766E]"
                >
                  Confirm booking
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </PatientShell>
  );
}
