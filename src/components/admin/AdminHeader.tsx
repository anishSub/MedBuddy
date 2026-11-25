'use client';

import { NotificationMenu } from '@/components/common/NotificationMenu';
import { useAuth } from '@/context/AuthContext';

interface AdminHeaderProps {
  title: string;
  subtitle: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex h-16 sm:h-20 lg:h-[84px] shrink-0 items-center justify-between border-b border-white/20 px-4 sm:px-6 lg:px-8 bg-[#0D9488] gap-3">
      <div className="min-w-0 pr-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/75">
          {subtitle}
        </p>
        <h1 className="truncate mt-0.5 text-lg sm:text-xl lg:text-[22px] font-semibold tracking-[-0.025em] text-white">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <NotificationMenu inverse />
        <div className="grid h-9 sm:h-10 w-9 sm:w-10 place-items-center rounded-full bg-white/15 text-xs font-semibold text-white">
          {user?.avatar_initials || 'NA'}
        </div>
      </div>
    </header>
  );
}
