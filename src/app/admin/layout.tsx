import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-white lg:h-screen lg:overflow-hidden">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
