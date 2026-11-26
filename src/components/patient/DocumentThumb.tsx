import Image from 'next/image';

interface DocumentThumbProps {
  kind: 'rx' | 'lab' | 'xray' | string;
  illustrated?: boolean;
}

const RX_IMAGE_SRC =
  'https://upload.wikimedia.org/wikipedia/commons/e/ea/Medical_prescription_issued_by_Bimaristan_Qalawun.jpg';
const LAB_IMAGE_SRC =
  'https://upload.wikimedia.org/wikipedia/commons/7/77/US_Navy_040616-N-4565G-004_Advanced_laboratory_technician_Hospital_Corpsman_2nd_Class_John_Zettlemoyer_views_a_blood_sample_through_a_forensics_microscope.jpg';
const XRAY_IMAGE_SRC = 'https://upload.wikimedia.org/wikipedia/commons/d/d4/A_chest_X-ray.jpg';

const THUMB_IMAGES: Record<string, { src: string; alt: string }> = {
  rx: { src: RX_IMAGE_SRC, alt: 'Medical prescription' },
  lab: { src: LAB_IMAGE_SRC, alt: 'Medical laboratory blood sample' },
  xray: { src: XRAY_IMAGE_SRC, alt: 'Chest X-ray' },
};

export function DocumentThumb({ kind, illustrated = false }: DocumentThumbProps) {
  const image = THUMB_IMAGES[kind];

  if (image) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-md">
        <Image src={image.src} alt={image.alt} fill sizes="270px" className="object-cover" />
      </div>
    );
  }

  // Fallback for unknown kinds — generic medical graphic
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
