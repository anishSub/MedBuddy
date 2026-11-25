'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/common/Logo';
import { Icon } from '@/components/common/Icon';
import { useAuth } from '@/context/AuthContext';
import type { IconName, UserRole } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, signUp, switchDemoUser } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<UserRole>('Patient');
  const [fullName, setFullName] = useState('Ramesh Sharma');
  const [phone, setPhone] = useState('+977 981-234-5678');
  const [password, setPassword] = useState('Ramesh@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (!isSignUp) {
      if (newRole === 'Patient') {
        setFullName('Ramesh Sharma');
        setPhone('+977 981-234-5678');
        setPassword('Ramesh@123');
      } else if (newRole === 'Doctor') {
        setFullName('Dr. Sushil Adhikari');
        setPhone('+977 980-112-4482');
        setPassword('Sushil@123');
      } else {
        setFullName('Nisha Aryal');
        setPhone('+977 980-887-1265');
        setPassword('Nisha@123');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name');
        }
        if (!phone.trim()) {
          throw new Error('Please enter your mobile number');
        }
        await signUp(fullName.trim(), phone.trim(), role, password);
      } else {
        if (!phone.trim()) {
          throw new Error('Please enter your mobile number');
        }
        await login(phone.trim(), role, password);
      }

      // Route based on role
      if (role === 'Doctor') {
        router.push('/doctor/dashboard');
      } else if (role === 'Admin') {
        router.push('/admin/overview');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left marketing panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] shrink-0 flex-col justify-between border-r border-[#E2E8F0] bg-[#F8FAFC] p-8 xl:p-12 2xl:p-14 overflow-y-auto">
        <Logo />
        <div className="my-auto py-8 max-w-[480px]">
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#0D9488]">
            Connected care, every day
          </p>
          <h1 className="text-3xl xl:text-4xl 2xl:text-[48px] font-semibold leading-[1.12] tracking-[-0.04em] text-[#0F172A]">
            From paper prescription to daily care.
          </h1>
          <p className="mt-5 text-[15px] xl:text-[16px] leading-relaxed text-[#64748B]">
            A clearer way for Nepali families and clinics to manage medicines, records, and follow-ups
            together.
          </p>
          <div className="mt-10 grid gap-5">
            {[
              [
                'shield',
                'Private by design',
                'Your health records stay protected and accessible only to people you trust.',
              ],
              [
                'users',
                'Built for family care',
                'Switch profiles and help loved ones stay on track from one place.',
              ],
              [
                'lock',
                'Secure clinic connection',
                'Share accurate records with your doctor when it matters.',
              ],
            ].map(([icon, label, copy]) => (
              <div className="flex gap-4 items-start" key={label}>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#CFE7E4] text-[#0D9488] bg-white">
                  <Icon name={icon as IconName} size={17} />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-[#0F172A]">{label}</h3>
                  <p className="mt-0.5 text-[12px] xl:text-[13px] leading-5 text-[#64748B]">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-[#94A3B8]">
          Connected to Supabase PostgreSQL Database
        </p>
      </div>

      {/* Right authentication form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        {/* Mobile branding */}
        <div className="lg:hidden mb-8 self-start">
          <Logo />
        </div>

        <div className="w-full max-w-[430px]">
          <div className="mb-6">
            <p className="text-[13px] font-medium text-[#0D9488]">Welcome to MedBuddy</p>
            <h2 className="mt-1.5 text-2xl sm:text-[30px] font-semibold tracking-[-0.035em] text-[#0F172A]">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </h2>
            <p className="mt-2 text-[14px] text-[#64748B]">
              {isSignUp ? 'Already registered? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg(null);
                }}
                className="font-semibold text-[#0D9488] hover:underline"
              >
                {isSignUp ? 'Sign in' : 'Create account'}
              </button>
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-3 rounded-lg bg-[#F1F5F9] p-1 mb-5">
            {(['Patient', 'Doctor', 'Admin'] as UserRole[]).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => handleRoleChange(item)}
                className={`h-9 rounded-md text-[13px] font-semibold transition ${
                  role === item
                    ? 'bg-white text-[#0F172A] shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-[12px] text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4">
            {isSignUp && (
              <label className="grid gap-1.5 text-[13px] font-semibold text-[#334155]">
                Full name
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 sm:h-12 rounded-lg border border-[#CBD5E1] px-3.5 text-[14px] font-normal outline-none transition focus:border-[#0D9488] focus:ring-2 focus:ring-[#CCFBF1]"
                  placeholder="Enter your full name"
                />
              </label>
            )}

            <label className="grid gap-1.5 text-[13px] font-semibold text-[#334155]">
              Mobile number
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 sm:h-12 rounded-lg border border-[#CBD5E1] px-3.5 text-[14px] font-normal outline-none transition focus:border-[#0D9488] focus:ring-2 focus:ring-[#CCFBF1]"
                placeholder="+977 98XXXXXXXX"
              />
            </label>

            <label className="grid gap-1.5 text-[13px] font-semibold text-[#334155]">
              Password
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 sm:h-12 w-full rounded-lg border border-[#CBD5E1] px-3.5 pr-11 text-[14px] font-normal outline-none transition focus:border-[#0D9488] focus:ring-2 focus:ring-[#CCFBF1]"
                  placeholder="First name@123 (e.g. Ramesh@123)"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[#94A3B8] transition hover:bg-slate-100 hover:text-[#475569]"
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={17} />
                </button>
              </div>
            </label>

            <p className="-mt-1 text-[11px] text-[#94A3B8]">
              Demo password: first name + @123 (e.g. Ramesh@123, Sushil@123).
            </p>

            <label className="mt-1 flex items-start gap-2.5 text-[12px] leading-5 text-[#64748B]">
              <input
                type="checkbox"
                defaultChecked
                className="mt-1 accent-[#0D9488]"
              />
              <span>I agree to the Terms of Service and acknowledge the Privacy Policy.</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#0D9488] text-[14px] font-semibold text-white transition hover:bg-[#0F766E] shadow-sm disabled:opacity-60"
            >
              {loading ? (
                <span>Connecting to Supabase...</span>
              ) : (
                <>
                  {isSignUp ? `Create ${role} account` : `Sign in as ${role}`}
                  <Icon name="arrow" size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-7 pt-5 border-t border-[#E2E8F0]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8] text-center mb-2.5">
              Quick 1-Click Demo Profiles (Supabase Live)
            </p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => switchDemoUser('Patient')}
                className="flex items-center justify-between px-3 py-2 rounded-md border border-[#E2E8F0] bg-white text-[11px] font-medium text-[#334155] hover:bg-slate-50 transition"
              >
                <span>👤 <strong>Ramesh Sharma</strong> (Patient)</span>
                <span className="text-[#0D9488] font-semibold">Enter →</span>
              </button>
              <button
                type="button"
                onClick={() => switchDemoUser('Doctor')}
                className="flex items-center justify-between px-3 py-2 rounded-md border border-[#E2E8F0] bg-white text-[11px] font-medium text-[#334155] hover:bg-slate-50 transition"
              >
                <span>🩺 <strong>Dr. Sushil Adhikari</strong> (Doctor)</span>
                <span className="text-[#0D9488] font-semibold">Enter →</span>
              </button>
              <button
                type="button"
                onClick={() => switchDemoUser('Admin')}
                className="flex items-center justify-between px-3 py-2 rounded-md border border-[#E2E8F0] bg-white text-[11px] font-medium text-[#334155] hover:bg-slate-50 transition"
              >
                <span>⚙️ <strong>Nisha Aryal</strong> (Clinic Admin)</span>
                <span className="text-[#0D9488] font-semibold">Enter →</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] leading-5 text-[#94A3B8]">
            Secured by Supabase PostgreSQL Database & RLS policies
          </p>
        </div>
      </div>
    </section>
  );
}
