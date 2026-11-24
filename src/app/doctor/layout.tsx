import type { ReactNode } from 'react';
import { DoctorSidebar } from '@/components/doctor/DoctorSidebar';
import { DoctorTopBar } from '@/components/doctor/DoctorTopBar';

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-white lg:h-screen lg:overflow-hidden">
      <DoctorSidebar />
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <DoctorTopBar />
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
