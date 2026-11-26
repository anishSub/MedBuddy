"use client";

import { Icon } from "@/components/common/Icon";
import { NotificationMenu } from "@/components/common/NotificationMenu";

export function DoctorTopBar() {
  return (
    <header className="flex h-16 sm:h-20 lg:h-[84px] shrink-0 items-center justify-between border-b border-white/20 px-4 sm:px-6 lg:px-8 bg-[#0D9488] gap-3">
      <div className="relative flex-1 max-w-[400px]">
        <Icon
          name="scan"
          size={16}
          className="absolute left-3 top-2.5 sm:top-3 text-white/80"
        />
        <input
          className="h-9 sm:h-11 w-full rounded-lg border border-white/30 bg-white/10 pl-9 pr-14 text-sm text-white placeholder:text-white/70 outline-none transition focus:border-white/60 focus:bg-white/15"
          placeholder="Search Patient ID or Scan QR"
        />
        <span className="hidden sm:inline-block absolute right-2.5 top-2.5 rounded border border-white/25 bg-white/10 px-1.5 py-0.5 text-[9px] text-white/75">
          ⌘ K
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <p className="hidden md:block text-right">
          <span className="block text-xs font-semibold text-white">
            Monday, 24 June
          </span>
          <span className="text-[11px] text-white/75">
            12 appointments today
          </span>
        </p>
        <NotificationMenu inverse />
      </div>
    </header>
  );
}
