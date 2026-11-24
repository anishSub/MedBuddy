'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/common/Icon';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';
import type { IconName } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

interface PatientSidebarProps {
  compact?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: 'home' },
  { href: '/scan', label: 'Scan Prescription', icon: 'scan' },
  { href: '/records', label: 'Medical Records', icon: 'records' },
  { href: '/health-pass', label: 'QR Health Pass', icon: 'qr' },
];

export function PatientSidebar({ compact = false }: PatientSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, patientDetail, logout } = useAuth();

  const name = user?.full_name || 'Ramesh Sharma';
  const initials = user?.avatar_initials || 'RS';
  const code = patientDetail?.patient_code || 'CT-2048';

  const navContent = (
    <>
      <div className="px-6 pt-6 pb-6 lg:pb-9 flex items-center justify-between">
        <Logo href="/dashboard" />
        <button
          onClick={() => setMobileOpen(false)}
          className={`p-1.5 rounded-md text-[#64748B] hover:bg-slate-200 ${
            compact ? 'md:hidden' : 'lg:hidden'
          }`}
          aria-label="Close menu"
        >
          <Icon name="plus" size={20} className="rotate-45" />
        </button>
      </div>

      <nav className="space-y-1 px-3 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex h-11 w-full items-center gap-3 rounded-lg px-3.5 text-[14px] font-medium transition-colors ${
                compact ? 'md:h-9 md:gap-2 md:px-2.5 md:text-[11px]' : ''
              } ${
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
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#DDEBE9] text-[12px] font-semibold text-[#0F766E]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-[#0F172A]">{name}</p>
            <p className="text-[11px] text-[#64748B]">Patient ID {code}</p>
          </div>
          <Icon name="chevron" size={15} className="text-[#94A3B8]" />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header Bar with Hamburger */}
      <div
        className={`flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 shrink-0 ${
          compact ? 'md:hidden' : 'lg:hidden'
        }`}
      >
        <Logo href="/dashboard" />
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

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className={`fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-xs flex ${
            compact ? 'md:hidden' : 'lg:hidden'
          }`}
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

      {/* Desktop/Laptop Sidebar */}
      <aside
        className={`hidden h-full shrink-0 flex-col border-r border-[#E2E8F0] bg-[#F8FAFC] ${
          compact ? 'md:flex md:w-40' : 'lg:flex lg:w-56 xl:w-60'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
