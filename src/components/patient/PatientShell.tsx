import type { ReactNode } from 'react';
import { PatientSidebar } from './PatientSidebar';
import { PatientHeader } from './PatientHeader';

interface PatientShellProps {
  title: string;
  eyebrow?: string;
  active?: string;
  compact?: boolean;
  wideSidebar?: boolean;
  children: ReactNode;
}

export function PatientShell({
  title,
  eyebrow,
  compact = false,
  wideSidebar = false,
  children,
}: PatientShellProps) {
  return (
    <div
      className={`w-full min-h-screen flex flex-col bg-white ${
        compact ? 'md:flex-row md:h-screen md:overflow-hidden' : 'lg:flex-row lg:h-screen lg:overflow-hidden'
      }`}
    >
      <PatientSidebar compact={compact} wide={wideSidebar} />
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <PatientHeader title={title} eyebrow={eyebrow} compact={compact} />
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
