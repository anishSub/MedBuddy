interface StatusPillProps {
  status: string;
}

export function StatusPill({ status }: StatusPillProps) {
  let style = 'bg-[#F1F5F9] text-[#475569]';

  if (status === 'Confirmed' || status === 'Active' || status === 'Approved') {
    style = 'bg-[#ECFDF5] text-[#059669]';
  } else if (status === 'Pending') {
    style = 'bg-[#FFFBEB] text-[#B45309]';
  } else if (status === 'Reschedule Requested' || status === 'Suspended' || status === 'Rejected') {
    style = 'bg-[#FFF7ED] text-[#C2410C]';
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold ${style}`}>
      {status}
    </span>
  );
}
