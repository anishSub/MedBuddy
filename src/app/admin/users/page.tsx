"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Icon } from "@/components/common/Icon";
import { adminService } from "@/lib/supabase/services";
import type { AccountStatus } from "@/lib/supabase/types";

type UserRow = {
  id: string;
  name: string;
  role: string;
  code: string;
  phone: string;
  lastActive: string;
  status: AccountStatus;
};

// Fallback data shown when the DB is empty or unreachable
const MOCK_USERS: UserRow[] = [
  {
    id: "mock-1",
    name: "Ramesh Sharma",
    role: "Patient",
    code: "#CT-2048",
    phone: "+977 981-234-5678",
    lastActive: "24 Jun 2024",
    status: "Active",
  },
  {
    id: "mock-2",
    name: "Dr. Sushil Adhikari",
    role: "Doctor",
    code: "NMC 18422",
    phone: "+977 980-112-4482",
    lastActive: "24 Jun 2024",
    status: "Active",
  },
  {
    id: "mock-3",
    name: "Maya Gurung",
    role: "Patient",
    code: "#CT-1987",
    phone: "+977 984-625-0198",
    lastActive: "23 Jun 2024",
    status: "Active",
  },
  {
    id: "mock-4",
    name: "Dr. Anjali Karki",
    role: "Doctor",
    code: "NMC 23091",
    phone: "+977 985-018-4431",
    lastActive: "22 Jun 2024",
    status: "Active",
  },
  {
    id: "mock-5",
    name: "Nisha Aryal",
    role: "Admin",
    code: "ADM-004",
    phone: "+977 980-887-1265",
    lastActive: "21 Jun 2024",
    status: "Active",
  },
  {
    id: "mock-6",
    name: "Bikash Thapa",
    role: "Patient",
    code: "#CT-2186",
    phone: "+977 986-315-7610",
    lastActive: "20 Jun 2024",
    status: "Suspended",
  },
  {
    id: "mock-7",
    name: "Dr. Pratik Manandhar",
    role: "Doctor",
    code: "NMC 24871",
    phone: "+977 981-776-8304",
    lastActive: "19 Jun 2024",
    status: "Pending",
  },
];

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function AdminUsersPage() {
  const [role, setRole] = useState("All roles");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [accounts, setAccounts] = useState<Record<string, AccountStatus>>({});
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<UserRow | null>(null);

  useEffect(() => {
    adminService
      .getAllUsers()
      .then((rows) => {
        if (rows.length === 0) {
          setUsers(MOCK_USERS);
          setUsingMock(true);
          return;
        }
        setUsers(
          rows.map((u) => {
            const patient = Array.isArray(u.patient_details)
              ? u.patient_details[0]
              : u.patient_details;
            const doctor = Array.isArray(u.doctor_details)
              ? u.doctor_details[0]
              : u.doctor_details;
            const code = patient?.patient_code
              ? `#${patient.patient_code}`
              : (doctor?.nmc_number ?? u.id.slice(0, 8));
            return {
              id: u.id,
              name: u.full_name,
              role: u.role as string,
              code,
              phone: u.phone,
              lastActive: formatDate(u.updated_at),
              status: u.status as AccountStatus,
            };
          })
        );
        setUsingMock(false);
      })
      .catch(() => {
        setUsers(MOCK_USERS);
        setUsingMock(true);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(user: UserRow) {
    if (usingMock) {
      alert("Demo data — connect to the database to change account status.");
      return;
    }
    const current = accounts[user.id] || user.status;
    const next: AccountStatus =
      current === "Suspended" ? "Active" : "Suspended";
    setSavingId(user.id);
    try {
      await adminService.toggleUserAccountStatus(user.id, next);
      setAccounts((prev) => ({ ...prev, [user.id]: next }));
    } catch {
      alert("Could not update account status. Please try again.");
    } finally {
      setSavingId(null);
    }
  }

  const visible = users.filter((user) => {
    const currentStatus = accounts[user.id] || user.status;
    const matchesRole = role === "All roles" || user.role === role;
    const matchesStatus =
      statusFilter === "All statuses" || currentStatus === statusFilter;
    const matchesSearch =
      search === "" ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.code.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search);
    return matchesRole && matchesStatus && matchesSearch;
  });

  function handleExport() {
    downloadCsv(
      "users.csv",
      ["Name", "Role", "User ID", "Mobile", "Last active", "Status"],
      visible.map((user) => [
        user.name,
        user.role,
        user.code,
        user.phone,
        user.lastActive,
        accounts[user.id] || user.status,
      ])
    );
  }

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
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="h-8 sm:h-9 rounded-md border border-[#CBD5E1] px-3 text-[10px] font-semibold text-[#475569] shadow-xs hover:bg-slate-50"
            >
              Export list
            </button>
            <button className="flex h-8 sm:h-9 items-center gap-1.5 sm:gap-2 rounded-md bg-[#0D9488] px-3 sm:px-3.5 text-[10px] font-semibold text-white shadow-xs transition hover:bg-[#0F766E]">
              <Icon name="plus" size={14} />
              Invite user
            </button>
          </div>
        </div>

        <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3 border-y border-[#E2E8F0] py-3">
          <div className="relative w-full sm:w-[280px] lg:w-[310px]">
            <Icon
              name="scan"
              size={14}
              className="absolute left-3 top-2.5 text-[#94A3B8]"
            />
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
          <p className="ml-auto text-[10px] text-[#94A3B8]">
            {loading ? (
              "Loading…"
            ) : (
              <>
                {visible.length} users
                {usingMock && (
                  <span className="ml-2 text-[10px] text-amber-500 font-medium">
                    (demo data)
                  </span>
                )}
              </>
            )}
          </p>
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
            {loading ? (
              <div className="border-t border-[#E2E8F0] px-4 py-6 text-center text-[10px] text-[#94A3B8]">
                Loading users…
              </div>
            ) : (
              visible.map((user) => {
                const status = accounts[user.id] || user.status;
                const initials = user.name
                  .split(" ")
                  .filter((x) => x !== "Dr.")
                  .map((x) => x[0])
                  .slice(0, 2)
                  .join("");

                return (
                  <div
                    key={user.id}
                    className="grid h-[66px] sm:h-[70px] grid-cols-[1.4fr_.75fr_.9fr_1.15fr_.9fr_.75fr_1fr] items-center gap-3 border-t border-[#E2E8F0] px-4 text-[10px]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EEF4F4] text-[9px] font-semibold text-[#0F766E]">
                        {initials}
                      </span>
                      <span className="font-semibold text-[#0F172A]">
                        {user.name}
                      </span>
                    </div>
                    <span className="text-[#475569]">{user.role}</span>
                    <span className="font-medium tabular-nums text-[#64748B]">
                      {user.code}
                    </span>
                    <span className="tabular-nums text-[#64748B]">
                      {user.phone}
                    </span>
                    <span className="text-[#94A3B8]">{user.lastActive}</span>
                    <span
                      className={`text-[9px] font-semibold ${
                        status === "Active"
                          ? "text-[#059669]"
                          : status === "Suspended"
                            ? "text-[#DC2626]"
                            : "text-[#B45309]"
                      }`}
                    >
                      {status}
                    </span>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelected(user)}
                        className="text-[9px] font-semibold text-[#0D9488] hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleToggle(user)}
                        disabled={savingId === user.id}
                        className="h-8 rounded-md border border-[#CBD5E1] px-2 text-[9px] font-semibold text-[#64748B] shadow-xs hover:bg-slate-50"
                      >
                        {status === "Suspended" ? "Restore" : "Suspend"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
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
            aria-label="User details"
            className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[14px] font-semibold text-[#0F172A]">
                User details
              </h3>
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
              <dt className="text-[#94A3B8]">Role</dt>
              <dd className="text-[#334155]">{selected.role}</dd>
              <dt className="text-[#94A3B8]">User ID</dt>
              <dd className="text-[#334155]">{selected.code}</dd>
              <dt className="text-[#94A3B8]">Mobile</dt>
              <dd className="text-[#334155]">{selected.phone}</dd>
              <dt className="text-[#94A3B8]">Last active</dt>
              <dd className="text-[#334155]">{selected.lastActive}</dd>
              <dt className="text-[#94A3B8]">Status</dt>
              <dd className="text-[#334155]">
                {accounts[selected.id] || selected.status}
              </dd>
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
