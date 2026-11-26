# MedBuddy — Design

## Theme

- Font: Inter (Google Fonts import in `src/app/globals.css`), fallback to system sans.
- App background: `#F8FAFC`; content surfaces: white (`#FFFFFF`).
- Text: primary `#0F172A`; secondary `#64748B`; muted `#94A3B8`.
- Primary action color: teal-green `#0D9488`, hover `#0F766E`; soft background `#E6F4F2`, soft text `#0F766E`.
- Borders: `#E2E8F0`; hover border: `#B9D8D5`.
- Status tones: confirmed `#059669` / `#ECFDF5`; pending `#B45309` / `#FFFBEB`; info `#2563EB` / `#EFF6FF`; danger `#B91C1C` / `#FEE2E2`.

## Components

- `patient-card`: border `1px solid #E2E8F0`, radius `0.75rem`, white background, soft shadow; interactive variant adds hover border `#B9D8D5`, deeper shadow, slight lift.
- Primary buttons: background `#0D9488`, white text, hover `#0F766E`, radius `rounded-md`.
- Badges/pills: small rounded labels with status background + text pairs (e.g. confirmed / pending / info / danger).

## Layout

- App shell: sidebar + header + scrollable content area; patient pages use a compact variant of the shell.
- Content max width: full fluid; grids use responsive breakpoints (1 / 2 / 4 column patterns).

## Notes

- Design tokens are applied inline via Tailwind utility classes (e.g. `bg-[#0D9488]`, `text-[#0F172A]`).
- No separate design token file; colors are hardcoded in components per the existing style.
