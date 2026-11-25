'use client';

import { NotificationMenu } from '@/components/common/NotificationMenu';

interface AdminHeaderProps {
  title: string;
  subtitle: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="flex h-16 sm:h-20 lg:h-[84px] shrink-0 items-center justify-between border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 bg-white gap-3">
      <div className="min-w-0 pr-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#94A3B8]">
          {subtitle}
        </p>
        <h1 className="truncate mt-0.5 text-lg sm:text-xl lg:text-[22px] font-semibold tracking-[-0.025em] text-[#0F172A]">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <NotificationMenu />
        <div className="grid h-9 sm:h-10 w-9 sm:w-10 place-items-center rounded-full bg-[#DDEBE9] text-[11px] font-semibold text-[#0F766E]">
          NA
        </div>
      </div>
    </header>
  );
}
