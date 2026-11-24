import type { ReactNode } from 'react';
import { PatientSidebar } from './PatientSidebar';
import { PatientHeader } from './PatientHeader';

interface PatientShellProps {
  title: string;
  eyebrow?: string;
  active?: string;
  children: ReactNode;
}

export function PatientShell({ title, eyebrow, children }: PatientShellProps) {
  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-white lg:h-screen lg:overflow-hidden">
      <PatientSidebar />
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <PatientHeader title={title} eyebrow={eyebrow} />
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
