'use client';

import Link from 'next/link';
import { Icon } from '@/components/common/Icon';

interface PatientHeaderProps {
  eyebrow?: string;
  title: string;
}

export function PatientHeader({ eyebrow, title }: PatientHeaderProps) {
  return (
    <header className="flex h-16 sm:h-20 lg:h-[84px] shrink-0 items-center justify-between border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 bg-white">
      <div className="min-w-0 pr-3">
        {eyebrow && (
          <p className="mb-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.13em] text-[#94A3B8]">
            {eyebrow}
          </p>
        )}
        <h1 className="truncate text-lg sm:text-xl lg:text-[22px] font-semibold tracking-[-0.025em] text-[#0F172A]">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button className="hidden sm:flex h-9 sm:h-10 items-center gap-1.5 sm:gap-2 rounded-lg border border-[#E2E8F0] bg-white px-2.5 sm:px-3.5 text-[12px] sm:text-[13px] font-medium text-[#334155] shadow-xs hover:bg-slate-50">
          <span className="text-[#94A3B8]">Viewing:</span> Ramesh Sharma{' '}
          <span className="hidden md:inline text-[#64748B]">(Dad)</span>
          <Icon name="chevron" size={14} />
        </button>
        <Link
          href="/health-pass"
          className="flex h-9 sm:h-10 items-center gap-1.5 sm:gap-2 rounded-lg border border-[#CBD5E1] bg-white px-2.5 sm:px-3.5 text-[12px] sm:text-[13px] font-semibold text-[#334155] shadow-xs hover:bg-slate-50"
        >
          <Icon name="qr" size={16} />
          <span className="hidden xs:inline sm:inline">My QR Card</span>
        </Link>
        <button
          aria-label="Notifications"
          className="relative grid h-9 sm:h-10 w-9 sm:w-10 place-items-center rounded-lg border border-[#E2E8F0] bg-white text-[#475569] shadow-xs hover:bg-slate-50"
        >
          <Icon name="bell" size={17} />
          <span className="absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#F59E0B] ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
