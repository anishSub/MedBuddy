'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Icon } from '@/components/common/Icon';

const initialUsers = [
  ['Ramesh Sharma', 'Patient', '#CT-2048', '+977 981-234-5678', '24 Jun 2024', 'Active'],
  ['Dr. Sushil Adhikari', 'Doctor', 'NMC 18422', '+977 980-112-4482', '24 Jun 2024', 'Active'],
  ['Maya Gurung', 'Patient', '#CT-1987', '+977 984-625-0198', '23 Jun 2024', 'Active'],
  ['Dr. Anjali Karki', 'Doctor', 'NMC 23091', '+977 985-018-4431', '22 Jun 2024', 'Active'],
  ['Nisha Aryal', 'Admin', 'ADM-004', '+977 980-887-1265', '21 Jun 2024', 'Active'],
  ['Bikash Thapa', 'Patient', '#CT-2186', '+977 986-315-7610', '20 Jun 2024', 'Suspended'],
  ['Dr. Pratik Manandhar', 'Doctor', 'NMC 24871', '+977 981-776-8304', '19 Jun 2024', 'Pending'],
];

export default function AdminUsersPage() {
  const [role, setRole] = useState('All roles');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [search, setSearch] = useState('');
  const [accounts, setAccounts] = useState<Record<string, string>>({});

  const visible = initialUsers.filter((user) => {
    const currentStatus = accounts[user[2]] || user[5];
    const matchesRole = role === 'All roles' || user[1] === role;
    const matchesStatus = statusFilter === 'All statuses' || currentStatus === statusFilter;
    const matchesSearch =
      search === '' ||
      user[0].toLowerCase().includes(search.toLowerCase()) ||
      user[2].toLowerCase().includes(search.toLowerCase()) ||
      user[3].includes(search);
    return matchesRole && matchesStatus && matchesSearch;
  });

  return (
    <>
      <AdminHeader title="All Users" subtitle="People & access management" />
      <main className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-9 py-6 sm:py-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[16px] sm:text-[17px] font-semibold tracking-[-0.02em] text-[#0F172A]">
              User directory
            </h2>
            <p className="mt-0.5 text-[10px] text-[#64748B]">
              Manage patients, doctors, and clinic administrators.
            </p>
          </div>
          <button className="flex h-8 sm:h-9 items-center gap-1.5 sm:gap-2 rounded-md bg-[#0D9488] px-3 sm:px-3.5 text-[10px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E]">
            <Icon name="plus" size={14} />
            Invite user
          </button>
        </div>

        <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3 border-y border-[#E2E8F0] py-3">
          <div className="relative w-full sm:w-[280px] lg:w-[310px]">
            <Icon name="scan" size={14} className="absolute left-3 top-2.5 text-[#94A3B8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-[#CBD5E1] pl-9 pr-3 text-[10px] outline-none transition focus:border-[#0D9488]"
              placeholder="Search name, ID, phone or NMC number"
            />
          </div>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="h-9 rounded-md border border-[#CBD5E1] bg-white px-3 text-[10px] font-medium text-[#475569] shadow-xs"
          >
            <option>All roles</option>
            <option>Patient</option>
            <option>Doctor</option>
            <option>Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-9 rounded-md border border-[#CBD5E1] bg-white px-3 text-[10px] font-medium text-[#475569] shadow-xs"
          >
            <option>All statuses</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Suspended</option>
          </select>
          <p className="ml-auto text-[10px] text-[#94A3B8]">{visible.length} users</p>
        </div>

        <div className="overflow-x-auto border-b border-[#E2E8F0]">
          <div className="min-w-[750px]">
            <div className="grid grid-cols-[1.4fr_.75fr_.9fr_1.15fr_.9fr_.75fr_1fr] gap-3 bg-[#F8FAFC] px-4 py-3 text-[9px] font-semibold uppercase tracking-[.07em] text-[#94A3B8]">
              <span>Name</span>
              <span>Role</span>
              <span>User ID</span>
              <span>Mobile</span>
              <span>Last active</span>
              <span>Status</span>
              <span className="text-right">Account</span>
            </div>
            {visible.map((user) => {
              const status = accounts[user[2]] || user[5];
              const initials = user[0]
                .split(' ')
                .filter((x) => x !== 'Dr.')
                .map((x) => x[0])
                .slice(0, 2)
                .join('');

              return (
                <div
                  key={user[2]}
                  className="grid h-[66px] sm:h-[70px] grid-cols-[1.4fr_.75fr_.9fr_1.15fr_.9fr_.75fr_1fr] items-center gap-3 border-t border-[#E2E8F0] px-4 text-[10px]"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EEF4F4] text-[9px] font-semibold text-[#0F766E]">
                      {initials}
                    </span>
                    <span className="font-semibold text-[#0F172A]">{user[0]}</span>
                  </div>
                  <span className="text-[#475569]">{user[1]}</span>
                  <span className="font-medium tabular-nums text-[#64748B]">{user[2]}</span>
                  <span className="tabular-nums text-[#64748B]">{user[3]}</span>
                  <span className="text-[#94A3B8]">{user[4]}</span>
                  <span
                    className={`text-[9px] font-semibold ${
                      status === 'Active'
                        ? 'text-[#059669]'
                        : status === 'Suspended'
                        ? 'text-[#DC2626]'
                        : 'text-[#B45309]'
                    }`}
                  >
                    {status}
                  </span>
                  <div className="flex justify-end gap-2">
                    <button className="text-[9px] font-semibold text-[#0D9488] hover:underline">
                      View
                    </button>
                    <button
                      onClick={() =>
                        setAccounts({
                          ...accounts,
                          [user[2]]: status === 'Suspended' ? 'Active' : 'Suspended',
                        })
                      }
                      className="h-8 rounded-md border border-[#CBD5E1] px-2 text-[9px] font-semibold text-[#64748B] shadow-xs hover:bg-slate-50"
                    >
                      {status === 'Suspended' ? 'Restore' : 'Suspend'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
