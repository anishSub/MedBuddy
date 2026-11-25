'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/common/Icon';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';
import type { IconName } from '@/types';

interface AdminNavItem {
  href: string;
  label: string;
  icon: IconName;
}

const adminNavItems: AdminNavItem[] = [
  { href: '/admin/overview', label: 'Clinic Overview', icon: 'home' },
  { href: '/admin/follow-ups', label: 'Follow-Up Queue', icon: 'calendar' },
  { href: '/admin/verification', label: 'Doctor Verification', icon: 'shield' },
  { href: '/admin/users', label: 'All Users', icon: 'users' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const name = user?.full_name || 'Nisha Aryal';
  const initials = user?.avatar_initials || 'NA';

  const navContent = (
    <>
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <Logo href="/" />
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-md text-[#64748B] hover:bg-slate-200"
          aria-label="Close menu"
        >
          <Icon name="plus" size={20} className="rotate-45" />
        </button>
      </div>
      <p className="px-6 pb-6 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
        Clinic administration
      </p>

      <nav className="space-y-1 px-3 flex-1">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex h-11 w-full items-center gap-3 rounded-lg px-3.5 text-[14px] font-medium transition-colors ${
                isActive
                  ? 'bg-[#E6F4F2] text-[#0D9488]'
                  : 'text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]'
              }`}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#E2E8F0] p-4">
        <button
          onClick={logout}
          title="Click to logout or switch account"
          className="w-full flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-slate-100 text-left"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#DDEBE9] text-[11px] font-semibold text-[#0F766E]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-[#0F172A]">{name}</p>
            <p className="text-[10px] text-[#64748B]">Clinic administrator</p>
          </div>
          <Icon name="chevron" size={15} className="ml-auto text-[#94A3B8]" />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 shrink-0">
        <Logo href="/" />
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg border border-[#CBD5E1] bg-white text-[#475569] shadow-xs"
          aria-label="Open navigation menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-xs flex"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="w-72 max-w-[85vw] h-full bg-[#F8FAFC] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex h-full w-56 xl:w-60 shrink-0 flex-col border-r border-[#E2E8F0] bg-[#F8FAFC]">
        {navContent}
      </aside>
    </>
  );
}
