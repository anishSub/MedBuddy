'use client';

import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatusPill } from '@/components/common/StatusPill';
import { Icon } from '@/components/common/Icon';
import { adminService } from '@/lib/supabase/services';
import type { VerificationStatus } from '@/lib/supabase/types';

type DoctorRow = {
  id: string;
  name: string;
  specialization: string;
  nmc: string;
  licenseFile: string;
  registered: string;
  status: VerificationStatus;
};

// Fallback data shown when the DB is empty or unreachable
const MOCK_DOCTORS: DoctorRow[] = [
  { id: 'mock-1', name: 'Dr. Pratik Manandhar', specialization: 'Internal Medicine', nmc: 'NMC 24871', licenseFile: 'license-pratik.pdf', registered: '23 Jun 2024', status: 'Pending' },
  { id: 'mock-2', name: 'Dr. Sneha Poudel', specialization: 'Dermatology', nmc: 'NMC 31209', licenseFile: 'license-sneha.pdf', registered: '23 Jun 2024', status: 'Pending' },
  { id: 'mock-3', name: 'Dr. Aayush Shahi', specialization: 'Paediatrics', nmc: 'NMC 29714', licenseFile: 'license-aayush.pdf', registered: '23 Jun 2024', status: 'Pending' },
  { id: 'mock-4', name: 'Dr. Rojina Tamang', specialization: 'Obstetrics & Gynaecology', nmc: 'NMC 26583', licenseFile: 'license-rojina.pdf', registered: '23 Jun 2024', status: 'Pending' },
  { id: 'mock-5', name: 'Dr. Samir Khadka', specialization: 'General Practice', nmc: 'NMC 33410', licenseFile: 'license-samir.pdf', registered: '23 Jun 2024', status: 'Pending' },
];

function formatDate(value: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function DoctorVerificationPage() {
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [decisions, setDecisions] = useState<Record<string, VerificationStatus>>({});
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DoctorRow | null>(null);

  useEffect(() => {
    adminService
      .getDoctorVerifications()
      .then((rows) => {
        if (rows.length === 0) {
          setDoctors(MOCK_DOCTORS);
          setUsingMock(true);
          return;
        }
        setDoctors(
          rows
            .filter((d) => d.verification_status === 'Pending')
            .map((d) => ({
              id: d.id,
              name: d.profile?.full_name ?? '—',
              specialization: d.specialization,
              nmc: d.nmc_number,
              licenseFile: d.license_file_name ?? '—',
              registered: formatDate(d.created_at),
              status: d.verification_status as VerificationStatus,
            }))
        );
        setUsingMock(false);
      })
      .catch(() => {
        setDoctors(MOCK_DOCTORS);
        setUsingMock(true);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDecision(row: DoctorRow, next: VerificationStatus) {
    if (usingMock) {
      alert('Demo data — connect to the database to record verification decisions.');
      return;
    }
    setSavingId(row.id);
    try {
      await adminService.updateDoctorVerification(row.id, next);
      setDecisions((prev) => ({ ...prev, [row.id]: next }));
    } catch {
      alert('Could not save verification decision. Please try again.');
    } finally {
      setSavingId(null);
    }
  }

  const query = search.trim().toLowerCase();
  const visibleDoctors = doctors.filter(
    (doctor) =>
      query === '' ||
      doctor.name.toLowerCase().includes(query) ||
      doctor.nmc.toLowerCase().includes(query) ||
      doctor.specialization.toLowerCase().includes(query)
  );

  return (
    <>
      <AdminHeader title="Doctor Verification" subtitle="Access & compliance" />
      <main className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-9 py-6 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[17px] sm:text-[18px] font-semibold tracking-[-0.02em] text-[#0F172A]">
              New Registration Requests
            </h2>
            <p className="mt-1 text-[11px] text-[#64748B]">
              Review NMC details and submitted license documents before granting access.
            </p>
          </div>
          <div className="flex h-8 sm:h-9 items-center gap-2 rounded-md border border-[#CBD5E1] px-3 text-[10px] text-[#64748B] bg-white shadow-xs">
            <Icon name="scan" size={14} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search doctors"
              className="w-[150px] bg-transparent outline-none placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        <div className="mt-6 sm:mt-7 overflow-x-auto border-y border-[#E2E8F0]">
          <div className="min-w-[750px]">
            <div className="grid grid-cols-[1.25fr_1.15fr_1fr_1.2fr_.65fr_1fr] gap-4 bg-[#F8FAFC] px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
              <span>Doctor name</span>
              <span>Specialization</span>
              <span>NMC registration</span>
              <span>License document</span>
              <span>Status</span>
              <span className="text-right">Decision</span>
            </div>
            {loading ? (
              <div className="border-t border-[#E2E8F0] px-4 py-6 text-center text-[10px] text-[#94A3B8]">
                Loading verification requests…
              </div>
            ) : (
              visibleDoctors.map((doctor) => {
                const decision = decisions[doctor.id];
                const initials = doctor.name
                  .split(' ')
                  .slice(1)
                  .map((x) => x[0])
                  .join('');

                return (
                  <div
                    key={doctor.id}
                    className="grid h-[76px] sm:h-[82px] grid-cols-[1.25fr_1.15fr_1fr_1.2fr_.65fr_1fr] items-center gap-4 border-t border-[#E2E8F0] px-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-[#EEF4F4] text-[10px] font-semibold text-[#0F766E]">
                        {initials}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-[#0F172A]">{doctor.name}</p>
                        <p className="mt-0.5 text-[9px] text-[#94A3B8]">
                          Registered {doctor.registered}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#475569]">{doctor.specialization}</span>
                    <span className="text-[10px] font-medium tabular-nums text-[#334155]">
                      {doctor.nmc}
                    </span>
                    <button
                      onClick={() => setSelected(doctor)}
                      className="flex items-center gap-1.5 text-left text-[10px] font-semibold text-[#0D9488] hover:underline"
                    >
                      <Icon name="file" size={14} />
                      {doctor.licenseFile}
                      <Icon name="arrow" size={12} />
                    </button>
                    <span>
                      {decision ? (
                        <StatusPill status={decision} />
                      ) : (
                        <StatusPill status={doctor.status} />
                      )}
                    </span>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDecision(doctor, 'Rejected')}
                        disabled={savingId === doctor.id}
                        className="h-8 rounded-md border border-[#CBD5E1] px-2.5 sm:px-3 text-[9px] font-semibold text-[#64748B] shadow-xs hover:bg-slate-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleDecision(doctor, 'Confirmed')}
                        disabled={savingId === doctor.id}
                        className="h-8 rounded-md bg-[#0D9488] px-2.5 sm:px-3 text-[9px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E]"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] text-[#94A3B8]">
            {loading ? (
              'Loading…'
            ) : (
              <>
                Showing {visibleDoctors.length} pending request{visibleDoctors.length === 1 ? '' : 's'}
                {usingMock && (
                  <span className="ml-2 text-[10px] text-amber-500 font-medium">(demo data)</span>
                )}
              </>
            )}
          </p>
          <p className="flex items-center gap-1.5 text-[10px] text-[#64748B]">
            <Icon name="shield" size={13} className="text-[#0D9488]" />
            All decisions are recorded in the clinic audit log.
          </p>
        </div>
      </main>

      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#0F172A]/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Doctor details"
            className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[14px] font-semibold text-[#0F172A]">Doctor details</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-[10px] font-semibold text-[#64748B] hover:text-[#0F172A]"
              >
                Close
              </button>
            </div>
            <dl className="mt-4 grid grid-cols-[110px_1fr] gap-y-3 text-[11px]">
              <dt className="text-[#94A3B8]">Name</dt>
              <dd className="text-[#334155]">{selected.name}</dd>
              <dt className="text-[#94A3B8]">Specialization</dt>
              <dd className="text-[#334155]">{selected.specialization}</dd>
              <dt className="text-[#94A3B8]">NMC registration</dt>
              <dd className="text-[#334155]">{selected.nmc}</dd>
              <dt className="text-[#94A3B8]">License document</dt>
              <dd className="text-[#334155]">{selected.licenseFile}</dd>
              <dt className="text-[#94A3B8]">Registered</dt>
              <dd className="text-[#334155]">{selected.registered}</dd>
              <dt className="text-[#94A3B8]">Status</dt>
              <dd className="text-[#334155]">{decisions[selected.id] || selected.status}</dd>
              <dt className="text-[#94A3B8]">ID</dt>
              <dd className="break-all text-[#334155]">{selected.id}</dd>
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
