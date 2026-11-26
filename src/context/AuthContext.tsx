"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string;
  status: "Active" | "Pending" | "Suspended";
  avatar_initials: string | null;
}

export interface PatientDetail {
  patient_code: string;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  allergies: string[] | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  weekly_adherence: number | null;
  blood_pressure_target_upper: number | null;
  blood_pressure_target_lower: number | null;
  weight_kg: number | null;
  daily_steps: number | null;
}

export interface DoctorDetail {
  specialization: string;
  nmc_number: string;
  verification_status: "Pending" | "Confirmed" | "Rejected";
}

interface AuthContextType {
  user: Profile | null;
  patientDetail: PatientDetail | null;
  doctorDetail: DoctorDetail | null;
  loading: boolean;
  login: (phone: string, role: UserRole, password: string) => Promise<Profile>;
  signUp: (
    fullName: string,
    phone: string,
    role: UserRole,
    password: string
  ) => Promise<Profile>;
  logout: () => void;
  switchDemoUser: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, { phone: string; name: string }> = {
  Patient: { phone: "+977 981-234-5678", name: "Ramesh Sharma" },
  Doctor: { phone: "+977 980-112-4482", name: "Dr. Sushil Adhikari" },
  Admin: { phone: "+977 980-887-1265", name: "Nisha Aryal" },
};

// Demo password rule: first name of the profile + "@123" (e.g. Ramesh@123, Sushil@123).
function expectedPassword(fullName: string): string {
  const first = fullName
    .trim()
    .split(/\s+/)
    .filter((part) => part !== "Dr." && part !== "Dr")[0];
  return `${first || "User"}@123`;
}

// Copying a phone from chat/messages can add zero-width spaces or NBSP.
// .trim() does NOT remove those, so strip them explicitly.
function normalizePhone(value: string): string {
  return value.replace(/[\u200B-\u200F\uFEFF\u00A0\u202F]/g, "").trim();
}

// Last resort: match by digits only, so formatting differences don't break login.
function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [patientDetail, setPatientDetail] = useState<PatientDetail | null>(
    null
  );
  const [doctorDetail, setDoctorDetail] = useState<DoctorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUserDetails = async (profile: Profile) => {
    try {
      if (profile.role === "Patient") {
        const { data } = await supabase
          .from("patient_details")
          .select("*")
          .eq("profile_id", profile.id)
          .maybeSingle();

        if (data) {
          setPatientDetail(data);
        } else {
          setPatientDetail({
            patient_code: "CT-2048",
            age: 64,
            gender: "Male",
            blood_group: "O+",
            allergies: ["Penicillin"],
            emergency_contact_name: "Maya Sharma",
            emergency_contact_phone: "+977 981-234-5678",
            weekly_adherence: 88,
            blood_pressure_target_upper: null,
            blood_pressure_target_lower: null,
            weight_kg: null,
            daily_steps: null,
          });
        }
      } else if (profile.role === "Doctor") {
        const { data } = await supabase
          .from("doctor_details")
          .select("*")
          .eq("profile_id", profile.id)
          .maybeSingle();

        if (data) {
          setDoctorDetail(data);
        } else {
          setDoctorDetail({
            specialization: "Cardiology",
            nmc_number: "NMC 18422",
            verification_status: "Confirmed",
          });
        }
      }
    } catch (err) {
      console.warn("Error loading user details from Supabase:", err);
    }
  };

  useEffect(() => {
    // Restore session from localStorage or default to Ramesh Sharma demo
    const stored = localStorage.getItem("medbuddy_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Profile;
        setUser(parsed);
        loadUserDetails(parsed).finally(() => setLoading(false));
        return;
      } catch {
        // invalid JSON
      }
    }

    // Default to Patient session
    const defaultProfile: Profile = {
      id: "a0000000-0000-0000-0000-000000000001",
      role: "Patient",
      full_name: "Ramesh Sharma",
      phone: "+977 981-234-5678",
      status: "Active",
      avatar_initials: "RS",
    };
    setUser(defaultProfile);
    loadUserDetails(defaultProfile).finally(() => setLoading(false));
  }, []);

  const login = async (
    phone: string,
    role: UserRole,
    password: string
  ): Promise<Profile> => {
    setLoading(true);
    try {
      // Find profile by phone, tolerating pasted hidden characters
      const cleanPhone = normalizePhone(phone);

      // Handle static admin login directly from patient login form
      const isAdminLogin =
        cleanPhone.toLowerCase() === "admin" ||
        phoneDigits(cleanPhone) === "9808871265" ||
        phoneDigits(cleanPhone) === phoneDigits(DEMO_USERS.Admin.phone);

      if (isAdminLogin) {
        const trimmedPass = password.trim();
        if (
          trimmedPass !== "Nisha@123" &&
          trimmedPass !== "Admin@123" &&
          trimmedPass !== "admin123" &&
          trimmedPass !== expectedPassword("Nisha Aryal")
        ) {
          throw new Error(
            "Incorrect password for Admin (try Nisha@123 or Admin@123)"
          );
        }

        let adminProfile: Profile | null = null;
        try {
          const { data: dbAdmin } = await supabase
            .from("profiles")
            .select("*")
            .eq("role", "Admin")
            .maybeSingle();
          if (dbAdmin) adminProfile = dbAdmin as Profile;
        } catch {
          // ignore error, fall back to static
        }

        if (!adminProfile) {
          adminProfile = {
            id: "c0000000-0000-0000-0000-000000000001",
            role: "Admin",
            full_name: "Nisha Aryal",
            phone: DEMO_USERS.Admin.phone,
            status: "Active",
            avatar_initials: "NA",
          };
        }

        setUser(adminProfile);
        localStorage.setItem("medbuddy_user", JSON.stringify(adminProfile));
        await loadUserDetails(adminProfile);
        return adminProfile;
      }

      const { data: match, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (error) throw error;

      let data = match;
      if (!data) {
        const { data: allProfiles } = await supabase
          .from("profiles")
          .select("*");
        data =
          (allProfiles || []).find(
            (p) => phoneDigits(p.phone) === phoneDigits(cleanPhone)
          ) || null;
      }

      let currentProfile: Profile;

      if (data) {
        if (password.trim() !== expectedPassword(data.full_name)) {
          throw new Error("Incorrect password");
        }
        currentProfile = data as Profile;
      } else {
        // Fallback demo user creation
        const demo = DEMO_USERS[role];
        if (password.trim() !== expectedPassword(demo.name)) {
          throw new Error("Incorrect password");
        }
        const initials = (demo.name || "User")
          .split(" ")
          .filter((w) => w !== "Dr.")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            full_name: demo.name,
            phone: cleanPhone,
            role,
            avatar_initials: initials,
            status: "Active",
          })
          .select()
          .single();

        if (insertError) throw insertError;
        currentProfile = newProfile as Profile;
      }

      setUser(currentProfile);
      localStorage.setItem("medbuddy_user", JSON.stringify(currentProfile));
      await loadUserDetails(currentProfile);
      return currentProfile;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    fullName: string,
    phone: string,
    role: UserRole,
    password: string
  ): Promise<Profile> => {
    setLoading(true);
    try {
      if (password.trim() !== expectedPassword(fullName)) {
        throw new Error("Incorrect password");
      }
      const cleanPhone = normalizePhone(phone);
      // Check existing
      const { data: existing } = await supabase
        .from("profiles")
        .select("*")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (existing) {
        setUser(existing as Profile);
        localStorage.setItem("medbuddy_user", JSON.stringify(existing));
        await loadUserDetails(existing as Profile);
        return existing as Profile;
      }

      const initials = fullName
        .split(" ")
        .filter((w) => w !== "Dr.")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert({
          full_name: fullName,
          phone: cleanPhone,
          role,
          avatar_initials: initials || "MB",
          status: "Active",
        })
        .select()
        .single();

      if (error) throw error;

      const profile = newProfile as Profile;

      if (role === "Patient") {
        const code = `CT-${Math.floor(1000 + Math.random() * 9000)}`;
        await supabase.from("patient_details").insert({
          profile_id: profile.id,
          patient_code: code,
          age: 45,
          blood_group: "O+",
          allergies: [],
          weekly_adherence: 85,
        });
      } else if (role === "Doctor") {
        const nmc = `NMC ${Math.floor(10000 + Math.random() * 90000)}`;
        await supabase.from("doctor_details").insert({
          profile_id: profile.id,
          specialization: "General Practice",
          nmc_number: nmc,
          verification_status: "Pending",
        });
      }

      setUser(profile);
      localStorage.setItem("medbuddy_user", JSON.stringify(profile));
      await loadUserDetails(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("medbuddy_user");
    setUser(null);
    setPatientDetail(null);
    setDoctorDetail(null);
    router.push("/login");
  };

  const switchDemoUser = async (role: UserRole) => {
    const demo = DEMO_USERS[role];
    const profile = await login(demo.phone, role, expectedPassword(demo.name));
    if (role === "Doctor") {
      router.push("/doctor/dashboard");
    } else if (role === "Admin") {
      router.push("/admin/overview");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patientDetail,
        doctorDetail,
        loading,
        login,
        signUp,
        logout,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
