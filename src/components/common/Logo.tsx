import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  href?: string;
  /** Extra classes for the image — use to override the default height (e.g. "h-14"). */
  className?: string;
}

export function Logo({ href = '/', className = '' }: LogoProps) {
  // Source is 2172x724 (3:1). "h-* w-auto object-contain" keeps that ratio
  // and never crops or stretches it inside the sidebar header.
  const image = (
    <Image
      src="/logo-robot.png"
      alt="MedBuddy"
      width={2172}
      height={724}
      className={`h-11 w-auto object-contain ${className}`}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center transition-opacity hover:opacity-90">
        {image}
      </Link>
    );
  }

  return image;
}
