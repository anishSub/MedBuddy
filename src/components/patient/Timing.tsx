interface TimingProps {
  value?: boolean[];
}

export function Timing({ value = [true, false, true] }: TimingProps) {
  return (
    <div className="flex items-center gap-1.5">
      {value.map((on, i) => (
        <span
          key={i}
          className={`grid h-7 w-7 place-items-center rounded-md border text-[11px] font-semibold tabular-nums ${
            on
              ? 'border-[#99D5CF] bg-[#E6F4F2] text-[#0D9488]'
              : 'border-[#E2E8F0] bg-white text-[#94A3B8]'
          }`}
        >
          {on ? '1' : '0'}
        </span>
      ))}
    </div>
  );
}
