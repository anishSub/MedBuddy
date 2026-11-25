'use client';

import Link from 'next/link';
import { Icon } from '@/components/common/Icon';
import { NotificationMenu } from '@/components/common/NotificationMenu';

interface PatientHeaderProps {
  eyebrow?: string;
  title: string;
  compact?: boolean;
}

export function PatientHeader({ eyebrow, title, compact = false }: PatientHeaderProps) {
  return (
    <header
      className={`flex h-16 shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:h-20 sm:px-6 ${
        compact ? 'md:h-16 md:px-5' : 'lg:h-[84px] lg:px-8'
      }`}
    >
      <div className="min-w-0 pr-3">
        {eyebrow && (
          <p
            className={`mb-0.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#94A3B8] sm:text-[11px] ${
              compact ? 'md:text-[10px]' : ''
            }`}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className={`truncate text-lg font-semibold tracking-[-0.025em] text-[#0F172A] sm:text-xl ${
            compact ? 'md:text-[18px]' : 'lg:text-[22px]'
          }`}
        >
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          className={`hidden h-9 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-[12px] font-medium text-[#334155] shadow-xs transition hover:bg-slate-50 sm:flex sm:h-10 sm:gap-2 sm:px-3.5 sm:text-[13px] ${
            compact ? 'md:h-9 md:gap-1.5 md:px-2.5 md:text-[12px]' : ''
          }`}
        >
          <span className="text-[#94A3B8]">Viewing:</span> Ramesh Sharma{' '}
          <span className="hidden md:inline text-[#64748B]">(Dad)</span>
          <Icon name="chevron" size={14} />
        </button>
        <Link
          href="/health-pass"
          className={`flex h-9 items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-[12px] font-semibold text-[#334155] shadow-xs transition hover:bg-slate-50 sm:h-10 sm:gap-2 sm:px-3.5 sm:text-[13px] ${
            compact ? 'md:h-9 md:gap-1.5 md:px-2.5 md:text-[12px]' : ''
          }`}
        >
          <Icon name="qr" size={16} />
          <span className="hidden xs:inline sm:inline">My QR Card</span>
        </Link>
        <NotificationMenu className={compact ? 'md:h-9 md:w-9' : ''} />
      </div>
    </header>
  );
}
