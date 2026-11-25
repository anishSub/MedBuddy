'use client';

import { useState } from 'react';
import { Icon } from '@/components/common/Icon';
import type { IconName } from '@/types';

type Message = {
  id: string;
  from: 'doctor' | 'patient';
  text: string;
  time: string;
};

type Conversation = {
  id: string;
  patient: string;
  patientCode: string;
  doctor: string;
  department: string;
  freeTime: string;
  messages: Message[];
};

const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    patient: 'Ramesh Sharma',
    patientCode: 'CT-2048',
    doctor: 'Dr. Adhikari',
    department: 'Cardiology',
    freeTime: 'Today · 04:30 PM',
    messages: [
      { id: 'm1', from: 'patient', text: 'I felt chest tightness while climbing stairs this morning.', time: '09:12 AM' },
      { id: 'm2', from: 'doctor', text: 'Noted. Keep resting and share your BP reading at the next visit.', time: '09:20 AM' },
      { id: 'm3', from: 'patient', text: 'The reading was 150/95.', time: '09:25 AM' },
      { id: 'm4', from: 'doctor', text: 'Thank you — I have added it to your record.', time: '09:27 AM' },
    ],
  },
  {
    id: 'c2',
    patient: 'Sita Rai',
    patientCode: 'CT-2049',
    doctor: 'Dr. Bimal',
    department: 'Endocrinology',
    freeTime: 'Tomorrow · 10:00 AM',
    messages: [
      { id: 'm5', from: 'patient', text: 'My sugar levels were high again this week.', time: '08:05 AM' },
      { id: 'm6', from: 'doctor', text: 'Please continue Metformin and monitor fasting glucose.', time: '08:14 AM' },
    ],
  },
];

const CALL_TYPES = [
  { id: 'video', label: 'Video call', icon: 'video' as IconName },
  { id: 'audio', label: 'Audio call', icon: 'audio' as IconName },
  { id: 'chat', label: 'Live chat', icon: 'chat' as IconName },
];

export default function DoctorMessagesPage() {
  const [selectedId, setSelectedId] = useState(CONVERSATIONS[0].id);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [booked, setBooked] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [callType, setCallType] = useState<'video' | 'audio' | 'chat'>('video');

  const selected = CONVERSATIONS.find((c) => c.id === selectedId) ?? CONVERSATIONS[0];
  const doctorAvatar = (
    <div className="grid h-11 w-11 place-items-center rounded-full bg-[#E6F4F2] text-[#0D9488]">
      <Icon name="stethoscope" size={20} />
    </div>
  );

  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-9 py-6 sm:py-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#0D9488]">
          Doctor panel
        </p>
        <h1 className="mt-1 text-xl sm:text-[23px] font-semibold tracking-[-0.03em] text-[#0F172A]">
          Messages
        </h1>
        <p className="mt-1 text-[11px] text-[#64748B]">
          Consultations and patient conversations.
        </p>
      </div>

      <div className="mt-6 sm:mt-7 grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-4">
        {/* Conversation list */}
        <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
          <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
              Conversations
            </p>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {CONVERSATIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full px-4 py-3 text-left transition hover:bg-[#F8FAFC] ${
                  c.id === selectedId ? 'bg-[#E6F4F2]' : ''
                }`}
              >
                <p className="text-[12px] font-semibold text-[#0F172A]">{c.patient}</p>
                <p className="mt-0.5 text-[10px] text-[#64748B]">{c.department}</p>
                <p className="mt-0.5 text-[10px] text-[#94A3B8]">Free: {c.freeTime}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[#E6F4F2] text-[#0D9488] shrink-0">
              <Icon name="stethoscope" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#0F172A]">{selected.doctor}</p>
              <p className="mt-0.5 text-[10px] text-[#64748B]">
                {selected.patient} · {selected.department} · Free: {selected.freeTime}
              </p>
            </div>
            <button
              onClick={() => setBookingOpen(true)}
              className="h-8 rounded-md bg-[#0D9488] px-3 text-[10px] font-semibold text-white transition hover:bg-[#0F766E]"
            >
              Book
            </button>
          </div>

          <div className="space-y-2 px-4 py-4">
            {selected.messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-[11px] leading-5 ${
                    m.from === 'doctor'
                      ? 'bg-[#E6F4F2] text-[#0F172A]'
                      : 'bg-[#F1F5F9] text-[#334155]'
                  }`}
                >
                  {m.text}
                  <span className="mt-1 block text-[9px] opacity-70">{m.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {bookingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
          onClick={() => setBookingOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-[#0F172A]">Book consultation</h2>
                <p className="mt-0.5 text-[10px] text-[#94A3B8]">
                  {selected.doctor} · {selected.patient}
                </p>
              </div>
              <button
                onClick={() => setBookingOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-md text-[#64748B] hover:bg-slate-100"
                aria-label="Close"
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <div className="mt-4 grid gap-3">
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
              <div className="grid gap-1 text-[10px] font-semibold text-[#64748B]">
                Call type
                <div className="flex gap-2">
                  {CALL_TYPES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCallType(c.id as 'video' | 'audio' | 'chat')}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-[11px] font-semibold transition ${
                        callType === c.id
                          ? 'border-[#0D9488] bg-[#E6F4F2] text-[#0F766E]'
                          : 'border-[#CBD5E1] text-[#64748B] hover:bg-slate-50'
                      }`}
                    >
                      <Icon name={c.icon} size={14} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setBooked(true);
                setBookingOpen(false);
              }}
              className="mt-4 h-9 w-full rounded-md bg-[#0D9488] text-[13px] font-semibold text-white transition hover:bg-[#0F766E]"
            >
              {booked ? 'Booked ✓' : 'Confirm booking'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
