"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/lib/supabase/services";

type DoctorRow = {
  id: string;
  profile_id: string;
  specialization: string;
  nmc_number: string;
  license_file_name: string | null;
  verification_status: string;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  profile?: { full_name?: string | null; phone?: string | null } | null;
};

// Fallback mock data shown when the doctor list cannot be loaded
const MOCK_DOCTORS: DoctorRow[] = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    profile_id: "b0000000-0000-0000-0000-000000000001",
    specialization: "Cardiology",
    nmc_number: "NMC 18422",
    license_file_name: "license-sushil.pdf",
    verification_status: "Confirmed",
    verified_at: null,
    verified_by: null,
    created_at: "2026-01-05T09:00:00Z",
    profile: { full_name: "Dr. Sushil", phone: "9800000001" },
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    profile_id: "b0000000-0000-0000-0000-000000000002",
    specialization: "General Medicine",
    nmc_number: "NMC 23091",
    license_file_name: "license-anjali.pdf",
    verification_status: "Confirmed",
    verified_at: null,
    verified_by: null,
    created_at: "2026-01-06T09:00:00Z",
    profile: { full_name: "Dr. Anjali", phone: "9800000002" },
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    profile_id: "b0000000-0000-0000-0000-000000000003",
    specialization: "Endocrinology",
    nmc_number: "NMC 19800",
    license_file_name: "license-bimal.pdf",
    verification_status: "Confirmed",
    verified_at: null,
    verified_by: null,
    created_at: "2026-01-07T09:00:00Z",
    profile: { full_name: "Dr. Bimal", phone: "9800000003" },
  },
  {
    id: "b0000000-0000-0000-0000-000000000004",
    profile_id: "b0000000-0000-0000-0000-000000000004",
    specialization: "Internal Medicine",
    nmc_number: "NMC 24871",
    license_file_name: "license-pratik.pdf",
    verification_status: "Pending",
    verified_at: null,
    verified_by: null,
    created_at: "2026-02-02T09:00:00Z",
    profile: { full_name: "Dr. Pratik", phone: "9800000004" },
  },
  {
    id: "b0000000-0000-0000-0000-000000000005",
    profile_id: "b0000000-0000-0000-0000-000000000005",
    specialization: "Dermatology",
    nmc_number: "NMC 31209",
    license_file_name: "license-sneha.pdf",
    verification_status: "Pending",
    verified_at: null,
    verified_by: null,
    created_at: "2026-02-09T09:00:00Z",
    profile: { full_name: "Dr. Sneha", phone: "9800000005" },
  },
  {
    id: "b0000000-0000-0000-0000-000000000006",
    profile_id: "b0000000-0000-0000-0000-000000000006",
    specialization: "Paediatrics",
    nmc_number: "NMC 29714",
    license_file_name: "license-aayush.pdf",
    verification_status: "Pending",
    verified_at: null,
    verified_by: null,
    created_at: "2026-02-16T09:00:00Z",
    profile: { full_name: "Dr. Aayush", phone: "9800000006" },
  },
  {
    id: "b0000000-0000-0000-0000-000000000007",
    profile_id: "b0000000-0000-0000-0000-000000000007",
    specialization: "Obstetrics & Gynaecology",
    nmc_number: "NMC 26583",
    license_file_name: "license-rojina.pdf",
    verification_status: "Pending",
    verified_at: null,
    verified_by: null,
    created_at: "2026-02-23T09:00:00Z",
    profile: { full_name: "Dr. Rokina", phone: "9800000007" },
  },
  {
    id: "b0000000-0000-0000-0000-000000000008",
    profile_id: "b0000000-0000-0000-0000-000000000008",
    specialization: "General Practice",
    nmc_number: "NMC 33410",
    license_file_name: "license-samir.pdf",
    verification_status: "Pending",
    verified_at: null,
    verified_by: null,
    created_at: "2026-03-02T09:00:00Z",
    profile: { full_name: "Dr. Samir", phone: "9800000008" },
  },
];

export default function DoctorAnalyticsPage() {
  const [doctors, setDoctors] = useState<DoctorRow[]>(MOCK_DOCTORS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    adminService
      .getDoctorVerifications()
      .then((rows) => {
        if (!cancelled && rows.length > 0) setDoctors(rows);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingDoctors = doctors.filter(
    (d) => d.verification_status === "Pending"
  );
  const confirmedDoctors = doctors.filter(
    (d) => d.verification_status === "Confirmed"
  );
  const specializations = Array.from(
    new Set(doctors.map((d) => d.specialization))
  );

  const stats: [string, string][] = [
    [String(doctors.length), "Doctors"],
    [String(pendingDoctors.length), "Pending verification"],
    [String(confirmedDoctors.length), "Verified"],
    [String(specializations.length), "Specializations"],
  ];

  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 lg:px-9 py-6 sm:py-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#0D9488]">
          Doctor analytics
        </p>
        <h1 className="mt-1 text-xl sm:text-[23px] font-semibold tracking-[-0.03em] text-[#0F172A]">
          Doctor insights
        </h1>
        <p className="mt-1 text-[11px] text-[#64748B]">
          Verification and specialty distribution across the care team.
        </p>
      </div>

      <div className="mt-6 sm:mt-7 grid grid-cols-2 sm:grid-cols-4 border-y border-[#E2E8F0] py-4 gap-4 sm:gap-0">
        {stats.map(([value, label], index) => (
          <div
            key={label}
            className={`sm:px-6 sm:first:pl-0 ${index < 3 ? "sm:border-r sm:border-[#E2E8F0]" : ""}`}
          >
            <p className="text-2xl sm:text-[27px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-[#0F172A]">
              {value}
            </p>
            <p className="mt-1.5 sm:mt-2 text-[10px] text-[#64748B]">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-7">
        <div>
          <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#0F172A]">
            Verification pipeline
          </h2>
          <p className="mt-0.5 text-[10px] text-[#94A3B8]">
            {loading ? "Loading…" : "Doctors awaiting review or cleared."}
          </p>
        </div>

        <div className="mt-3 border-y border-[#E2E8F0] overflow-x-auto">
          <div className="min-w-[520px]">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-3 bg-[#F8FAFC] px-3 py-2.5 text-[9px] font-semibold uppercase tracking-[.07em] text-[#94A3B8]">
              <span>Doctor</span>
              <span>Specialization</span>
              <span>NMC</span>
              <span>Status</span>
            </div>
            {loading ? (
              <div className="border-t border-[#E2E8F0] px-3 py-4 text-[10px] text-[#94A3B8]">
                Loading doctors…
              </div>
            ) : pendingDoctors.length === 0 ? (
              <div className="border-t border-[#E2E8F0] px-3 py-4 text-[10px] text-[#94A3B8]">
                No doctors waiting for verification.
              </div>
            ) : (
              pendingDoctors.map((d, i) => (
                <div
                  key={`${d.id}-${i}`}
                  className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-3 border-t border-[#E2E8F0] px-3 py-2.5 text-[10px]"
                >
                  <span className="font-semibold text-[#334155]">
                    {d.profile?.full_name ?? "Doctor"}
                  </span>
                  <span className="text-[#64748B]">{d.specialization}</span>
                  <span className="text-[#64748B] tabular-nums">
                    {d.nmc_number}
                  </span>
                  <span className="font-semibold text-[#B45309]">
                    {d.verification_status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-7">
        <h2 className="text-[15px] sm:text-[16px] font-semibold text-[#0F172A]">
          Specialties
        </h2>
        <p className="mt-0.5 text-[10px] text-[#94A3B8]">
          Doctors grouped by medical specialty.
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {specializations.map((spec) => (
            <div
              key={spec}
              className="flex items-center justify-between rounded-lg border border-[#E2E8F0] px-4 py-3"
            >
              <span className="text-[12px] font-semibold text-[#334155]">
                {spec}
              </span>
              <span className="text-[12px] font-semibold tabular-nums text-[#0D9488]">
                {doctors.filter((d) => d.specialization === spec).length}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
