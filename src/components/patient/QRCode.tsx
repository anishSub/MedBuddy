interface QRCodeProps {
  /** Used to vary the pattern per patient. This is decorative art, not an encoded QR. */
  seed?: string;
}

export function QRCode({ seed = 'CT-2048' }: QRCodeProps) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  const cells = Array.from({ length: 289 }, (_, index) => {
    const x = index % 17;
    const y = Math.floor(index / 17);
    const finder = (ox: number, oy: number) =>
      x >= ox &&
      x < ox + 5 &&
      y >= oy &&
      y < oy + 5 &&
      (x === ox ||
        x === ox + 4 ||
        y === oy ||
        y === oy + 4 ||
        (x >= ox + 2 && x <= ox + 2 && y >= oy + 2 && y <= oy + 2));
    return (
      finder(0, 0) ||
      finder(12, 0) ||
      finder(0, 12) ||
      ((x * 7 + y * 11 + x * y + hash) % 5 < 2 &&
        !(x < 6 && y < 6) &&
        !(x > 10 && y < 6) &&
        !(x < 6 && y > 10))
    );
  });

  return (
    <div
      className="grid h-[210px] w-[210px] gap-[2px] bg-white p-3"
      style={{ gridTemplateColumns: 'repeat(17, minmax(0, 1fr))' }}
      role="img"
      aria-label="Illustrative QR pattern for patient health pass"
    >
      {cells.map((dark, index) => (
        <span key={index} className={dark ? 'bg-[#0F172A]' : 'bg-white'} />
      ))}
    </div>
  );
}
