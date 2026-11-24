'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Icon } from '@/components/common/Icon';
import { QRCode } from './QRCode';

interface HealthPassModalProps {
  onClose?: () => void;
  /** Render as an in-page card instead of a fixed overlay. */
  inline?: boolean;
}

export function HealthPassModal({ onClose, inline = false }: HealthPassModalProps) {
  const router = useRouter();
  const { user, patientDetail } = useAuth();

  const name = user?.full_name || 'Patient';
  const patientCode = patientDetail?.patient_code || '—';
  const bloodGroup = patientDetail?.blood_group || 'Not recorded';
  const allergies = patientDetail?.allergies?.length
    ? patientDetail.allergies.join(', ')
    : 'None recorded';
  const emergencyName = patientDetail?.emergency_contact_name || 'Not recorded';
  const emergencyPhone = patientDetail?.emergency_contact_phone || 'Not recorded';

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/dashboard');
    }
  };

  const downloadPass = () => {
    const details = [
      'MedBuddy Health Pass',
      `Patient: ${name}`,
      `Patient ID: ${patientCode}`,
      `Blood Group: ${bloodGroup}`,
      `Allergy: ${allergies}`,
      `Emergency Contact: ${emergencyName}, ${emergencyPhone}`,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([details], { type: 'text/plain' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `medbuddy-health-pass-${patientCode}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const card = (
    <div
      className={`relative w-full max-w-[570px] overflow-hidden rounded-xl border border-[#CBD5E1] bg-white shadow-2xl ${
        inline ? '' : 'my-auto'
      }`}
    >
      <div className="flex items-start justify-between border-b border-[#E2E8F0] px-5 sm:px-7 py-4 sm:py-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#0D9488]">
            MedBuddy health pass
          </p>
          <h2
            id="health-pass-title"
            className="mt-1 text-xl sm:text-[22px] font-semibold tracking-[-0.03em] text-[#0F172A]"
          >
            QR Health Pass
          </h2>
        </div>
        {!inline && (
          <button
            onClick={handleClose}
            aria-label="Close health pass"
            className="grid h-8 w-8 rotate-45 place-items-center rounded-md border border-[#E2E8F0] text-[#64748B] hover:bg-slate-100"
          >
            <Icon name="plus" size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 px-5 sm:px-7 py-6 sm:py-7 items-center sm:items-start">
        <div className="shrink-0 text-center">
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-1">
            <QRCode seed={patientCode} />
          </div>
          <p className="mt-2 max-w-[210px] text-[9px] leading-snug text-[#94A3B8]">
            Illustrative QR — scanning is not enabled yet.
          </p>
        </div>
        <div className="min-w-0 flex-1 w-full text-center sm:text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
            Patient
          </p>
          <h3 className="mt-1 text-xl sm:text-[21px] font-semibold tracking-[-0.025em] text-[#0F172A]">
            {name}
          </h3>
          <p className="mt-0.5 text-[12px] font-medium tabular-nums text-[#64748B]">
            Patient ID <span className="text-[#334155]">#{patientCode}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="rounded-md border border-[#D7E7E5] bg-[#F0FDFA] px-2.5 py-1 text-[10px] font-semibold text-[#0F766E]">
              Blood Group: {bloodGroup}
            </span>
            <span className="rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 text-[10px] font-semibold text-[#92400E]">
              Allergy: {allergies}
            </span>
          </div>
          <div className="mt-5 border-t border-[#E2E8F0] pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">
              Emergency contact
            </p>
            <p className="mt-1.5 text-[12px] font-semibold text-[#334155]">{emergencyName}</p>
            <p className="mt-0.5 text-[11px] tabular-nums text-[#64748B]">{emergencyPhone}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 sm:px-7 py-4 gap-3">
        <p className="flex items-center gap-1.5 text-[10px] text-[#64748B]">
          <Icon name="shield" size={14} className="text-[#0D9488]" />
          For emergency identification
        </p>
        <button
          onClick={downloadPass}
          className="w-full sm:w-auto flex h-9 sm:h-10 items-center justify-center gap-2 rounded-md bg-[#0D9488] px-4 text-[11px] font-semibold text-white transition hover:bg-[#0F766E] shadow-xs"
        >
          <Icon name="upload" size={15} className="rotate-180" />
          Download Health Pass
        </button>
      </div>
    </div>
  );

  if (inline) {
    return card;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0F172A]/45 backdrop-blur-[1px] p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="health-pass-title"
    >
      {card}
    </div>
  );
}
