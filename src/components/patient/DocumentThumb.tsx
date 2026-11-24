interface DocumentThumbProps {
  kind: 'rx' | 'lab' | 'xray' | string;
}

export function DocumentThumb({ kind }: DocumentThumbProps) {
  if (kind === 'xray') {
    return (
      <div className="relative h-full w-full bg-[#22303C]">
        <div className="absolute inset-x-[31%] top-[12%] h-[76%] rounded-[44%] border border-slate-400/40 bg-[radial-gradient(ellipse_at_center,#8493a0_0%,#3a4b59_50%,#263641_72%)]" />
        <div className="absolute left-1/2 top-[18%] h-[62%] w-px bg-slate-300/30" />
      </div>
    );
  }

  if (kind === 'lab') {
    return (
      <div className="h-full w-full bg-[#F7F7F4] p-5">
        <div className="h-2 w-20 rounded bg-[#94A3B8]/40" />
        <div className="mt-3 h-px bg-[#CBD5E1]" />
        <div className="mt-4 grid grid-cols-3 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded ${i % 5 === 0 ? 'bg-[#F59E0B]/40' : 'bg-[#CBD5E1]'}`}
            />
          ))}
        </div>
        <div className="mt-5 h-10 border border-[#CBD5E1]">
          <div className="mt-5 h-px -rotate-6 bg-[#0D9488]/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full rotate-[-1deg] bg-[#FFFEFA] p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#8CCBC4] pb-2">
        <span className="grid h-5 w-5 place-items-center rounded bg-[#0D9488] text-[8px] text-white">
          +
        </span>
        <span className="h-1.5 w-24 rounded bg-[#0D9488]/35" />
      </div>
      <div className="mt-5 space-y-3">
        {[70, 88, 55, 76].map((w, i) => (
          <div
            key={i}
            className="h-px bg-[#47637D]/45"
            style={{ width: `${w}%`, transform: `rotate(${i % 2 ? -1 : 1}deg)` }}
          />
        ))}
      </div>
      <div className="mt-7 ml-auto h-4 w-16 border-b border-[#47637D]/40" />
    </div>
  );
}
