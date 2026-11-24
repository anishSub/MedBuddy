'use client';

import { Icon } from '@/components/common/Icon';

export function DoctorTopBar() {
  return (
    <header className="flex h-16 sm:h-20 lg:h-[84px] shrink-0 items-center justify-between border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 bg-white gap-3">
      <div className="relative flex-1 max-w-[400px]">
        <Icon name="scan" size={16} className="absolute left-3 top-2.5 sm:top-3 text-[#94A3B8]" />
        <input
          className="h-9 sm:h-11 w-full rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] pl-9 pr-14 text-[12px] outline-none transition focus:border-[#0D9488] focus:bg-white"
          placeholder="Search Patient ID or Scan QR"
        />
        <span className="hidden sm:inline-block absolute right-2.5 top-2.5 rounded border border-[#E2E8F0] bg-white px-1.5 py-0.5 text-[9px] text-[#94A3B8]">
          ⌘ K
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <p className="hidden md:block text-right">
          <span className="block text-[11px] font-semibold text-[#334155]">Monday, 24 June</span>
          <span className="text-[10px] text-[#94A3B8]">12 appointments today</span>
        </p>
        <button
          aria-label="Notifications"
          className="relative grid h-9 sm:h-10 w-9 sm:w-10 place-items-center rounded-lg border border-[#E2E8F0] bg-white text-[#475569] shadow-xs hover:bg-slate-50"
        >
          <Icon name="bell" size={17} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
        </button>
      </div>
    </header>
  );
}
