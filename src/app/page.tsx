'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/common/Logo';
import { Icon } from '@/components/common/Icon';
import { useAuth } from '@/context/AuthContext';
import type { IconName, UserRole } from '@/types';

const FEATURES: { icon: IconName; title: string; copy: string }[] = [
  {
    icon: 'shield',
    title: 'Your health, protected',
    copy: 'Your medical information stays private and secure.',
  },
  {
    icon: 'users',
    title: 'Care for your family',
    copy: "Keep your loved ones' health organized in one place.",
  },
  {
    icon: 'calendar',
    title: 'Stay connected',
    copy: 'Stay on top of medicines and doctor appointments.',
  },
];

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
    <section className="flex min-h-screen w-full flex-col bg-white lg:flex-row">
      {/* Left marketing panel */}
      <div className="hidden shrink-0 flex-col overflow-y-auto border-r border-[#E8EDF0] bg-[#FBFCFC] px-8 pt-0 pb-8 lg:flex lg:w-[52%] xl:px-12 xl:pt-0 xl:pb-10 2xl:px-16">
        <Logo className="h-8" />

        <div className="max-w-[540px] pb-10">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-[#0D9488]">
            Connected care, every day.
          </p>
          <h1 className="mt-3 text-[30px] font-semibold leading-[1.12] tracking-[-0.035em] text-[#0F172A] xl:text-[34px] 2xl:text-[36px]">
            Your health, all in one place.
          </h1>
          <p className="mt-4 max-w-[400px] text-[14px] leading-relaxed text-[#64748B]">
            Manage medicines, medical records, and doctor visits — simply and together.
          </p>

          {/* Illustration card */}
          <div className="relative mt-7 h-[232px] overflow-hidden rounded-2xl border border-[#DCEBE8] bg-[#F1FAF8]">
            <div className="pointer-events-none absolute -left-12 -top-14 h-44 w-44 rounded-full bg-[#DDF2ED]" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-[#E3F5F1]" />
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                backgroundImage: 'radial-gradient(#CDE7E1 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />
            <Image
              src="/mascot-robot.png"
              alt="MedBuddy health robot"
              width={600}
              height={700}
              priority
              className="absolute left-1/2 top-1/2 h-[264px] w-auto -translate-x-1/2 -translate-y-1/2 mix-blend-multiply"
            />
            <div className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-white/80 bg-white/85 text-[#0D9488] shadow-[0_2px_6px_rgba(15,23,42,0.06)]">
              <Icon name="records" size={15} />
            </div>
            <div className="absolute right-4 top-5 grid h-9 w-9 place-items-center rounded-xl border border-white/80 bg-white/85 text-[#0D9488] shadow-[0_2px_6px_rgba(15,23,42,0.06)]">
              <Icon name="calendar" size={15} />
            </div>
            <div className="absolute bottom-5 left-5 grid h-9 w-9 place-items-center rounded-xl border border-white/80 bg-white/85 text-[#0D9488] shadow-[0_2px_6px_rgba(15,23,42,0.06)]">
              <Icon name="heart" size={15} />
            </div>
            <div className="absolute bottom-4 right-5 grid h-9 w-9 place-items-center rounded-xl border border-white/80 bg-white/85 text-[#0D9488] shadow-[0_2px_6px_rgba(15,23,42,0.06)]">
              <Icon name="shield" size={15} />
            </div>
          </div>

          {/* Feature list */}
          <div className="mt-7 grid gap-5">
            {FEATURES.map((feature) => (
              <div className="flex items-start gap-3.5" key={feature.title}>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EAF6F3] text-[#0D9488]">
                  <Icon name={feature.icon} size={16} />
                </div>
                <div>
                  <h3 className="text-[12.5px] font-semibold text-[#0F172A]">{feature.title}</h3>
                  <p className="mt-0.5 text-[11.5px] leading-5 text-[#64748B]">{feature.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-auto pt-10 text-[10px] text-[#94A3B8]">
          Designed for care teams and families across Nepal.
        </p>
      </div>

      {/* Right authentication panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 pt-0 pb-10 sm:px-10 lg:px-12">
        {/* Wave decoration */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40" aria-hidden="true">
          <svg viewBox="0 0 400 160" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0 92c58-30 118 18 196-6 62-19 132 14 204-8v82H0Z" fill="#E8F5F2" />
            <path d="M0 118c64-24 126 22 206 2 60-15 130 10 194-6v46H0Z" fill="#DCF0EB" />
          </svg>
        </div>
        <div
          className="pointer-events-none absolute bottom-7 left-8 flex gap-1.5"
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((dot) => (
            <span key={dot} className="h-1 w-1 rounded-full bg-[#BEDFD8]" />
          ))}
        </div>
        <div
          className="pointer-events-none absolute bottom-5 right-8 text-[15px] font-light text-[#A9D3CB]"
          aria-hidden="true"
        >
          +
        </div>

        {/* Mobile branding */}
        <div className="relative z-10 mb-8 self-start lg:hidden">
          <Logo className="h-9" />
        </div>

        <div className="relative z-10 w-full max-w-[460px] rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.07)] sm:p-8">
          <div className="mb-7">
            <p className="text-xs font-semibold text-[#0D9488]">Welcome to MedBuddy</p>
            <h2 className="mt-1.5 text-[24px] font-semibold tracking-[-0.03em] text-[#0F172A] sm:text-[26px]">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </h2>
            <p className="mt-2 text-sm text-[#64748B]">
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
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-[#F1F5F9] p-1">
            {(['Patient', 'Doctor'] as UserRole[]).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => handleRoleChange(item)}
                className={`flex h-9 items-center justify-center gap-1.5 rounded-lg text-[12.5px] font-semibold transition ${
                  role === item
                    ? 'bg-white text-[#0B5F57] shadow-[0_1px_2px_rgba(15,23,42,0.08)]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Icon name={item === 'Patient' ? 'user' : 'stethoscope'} size={14} />
                {item}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-[12px] text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4">
            {isSignUp && (
              <label className="grid gap-1.5 text-sm font-semibold text-[#334155]">
                Full name
                <div className="relative">
                  <Icon
                    name="user"
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  />
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 w-full rounded-lg border border-[#DDE5EA] bg-white pl-10 pr-3.5 text-sm font-normal text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0D9488] focus:ring-2 focus:ring-[#CCFBF1]"
                    placeholder="Enter your full name"
                  />
                </div>
              </label>
            )}

            <label className="grid gap-1.5 text-sm font-semibold text-[#334155]">
              Mobile number
              <div className="relative">
                <Icon
                  name="phone"
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#DDE5EA] bg-white pl-10 pr-3.5 text-sm font-normal text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0D9488] focus:ring-2 focus:ring-[#CCFBF1]"
                  placeholder="+977 98XXXXXXXX"
                />
              </div>
            </label>

            <label className="grid gap-1.5 text-sm font-semibold text-[#334155]">
              Password
              <div className="relative">
                <Icon
                  name="lock"
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#DDE5EA] bg-white pl-10 pr-11 text-sm font-normal text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0D9488] focus:ring-2 focus:ring-[#CCFBF1]"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-[#94A3B8] transition hover:text-[#475569]"
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={17} />
                </button>
              </div>
            </label>

            <p className="-mt-1 text-[11px] text-[#94A3B8]">
              Demo password: first name + @123 (e.g. Ramesh@123, Sushil@123).
            </p>

            <label className="mt-1 flex items-start gap-2.5 text-[11px] leading-5 text-[#64748B]">
              <input type="checkbox" defaultChecked className="mt-1 accent-[#0B5F57]" />
              <span>
                I agree to the{' '}
                <span className="font-semibold text-[#0D9488]">Terms of Service</span> and
                acknowledge the{' '}
                <span className="font-semibold text-[#0D9488]">Privacy Policy</span>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0B5F57] text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#094E48] disabled:opacity-60"
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

          <p className="mt-4 text-center text-[10px] leading-relaxed text-[#94A3B8]">
            By continuing, you consent to secure health data processing in accordance with
            applicable Nepal regulations.
          </p>

          {/* Quick demo switcher */}
          <div className="mt-7 border-t border-[#E8EDF0] pt-5">
            <p className="mb-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">
              Quick 1-Click Demo Profiles (Supabase Live)
            </p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => switchDemoUser('Patient')}
                className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-[11px] font-medium text-[#334155] transition hover:bg-[#F8FAFC]"
              >
                <span>
                  👤 <strong>Ramesh Sharma</strong> (Patient)
                </span>
                <span className="font-semibold text-[#0D9488]">Enter →</span>
              </button>
              <button
                type="button"
                onClick={() => switchDemoUser('Doctor')}
                className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-[11px] font-medium text-[#334155] transition hover:bg-[#F8FAFC]"
              >
                <span>
                  🩺 <strong>Dr. Sushil Adhikari</strong> (Doctor)
                </span>
                <span className="font-semibold text-[#0D9488]">Enter →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
