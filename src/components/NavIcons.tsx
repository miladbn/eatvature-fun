import type { ReactNode } from "react";

/** Simple 24×24 stroke icons for navigation, colour comes from currentColor. */
const PATHS: Record<string, ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  vault: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 8.5V7M12 17v-1.5M15.5 12H17M7 12h1.5" />
    </>
  ),
  plan: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6l1 1 2-2M4 12l1 1 2-2" />
      <circle cx="5" cy="18" r="1" />
    </>
  ),
  totals: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  cities: (
    <>
      <path d="M3 21V9l5-3v15M8 21V4l7 3v14M15 21V11l6 2v8M2 21h20" />
    </>
  ),
  gear: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
    </>
  ),
  pets: (
    <>
      <circle cx="6" cy="10" r="1.8" />
      <circle cx="10" cy="5.5" r="1.8" />
      <circle cx="14" cy="5.5" r="1.8" />
      <circle cx="18" cy="10" r="1.8" />
      <path d="M12 11c-3 0-5.5 4-5.5 6.5 0 2 1.5 3 3 3 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c1.5 0 3-1 3-3C17.5 15 15 11 12 11z" />
    </>
  ),
  builds: (
    <>
      <path d="M14.5 4.5l5 5-10 10H4.5v-5z" />
      <path d="M12 7l5 5" />
    </>
  ),
  forge: (
    <>
      <path d="M4 10h12l4-3v3c0 2-2 3-4 3h-1l1 5H8l1-5H4z" />
      <path d="M6 21h12" />
    </>
  ),
  blueprints: (
    <>
      <path d="M4 5a2 2 0 012-2h12v16H6a2 2 0 00-2 2z" />
      <path d="M4 21V5M8 7h6M8 11h4" />
    </>
  ),
  catalog: (
    <>
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </>
  ),
  matrix: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </>
  ),
  club: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M16 14.2c2.9.3 5 2.6 5 5.8" />
    </>
  ),
  arcane: (
    <>
      <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" />
    </>
  ),
  events: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  guide: (
    <>
      <path d="M2 5c3-1.5 7-1.5 10 1 3-2.5 7-2.5 10-1v14c-3-1.5-7-1.5-10 1-3-2.5-7-2.5-10-1z" />
      <path d="M12 6v14" />
    </>
  ),
  tools: (
    <>
      <path d="M14.7 6.3a4 4 0 00-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 005.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1.3" />
      <circle cx="12" cy="12" r="1.3" />
      <circle cx="19" cy="12" r="1.3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </>
  ),
  github: (
    <>
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
    </>
  ),
  chevron: <path d="M6 9l6 6 6-6" />,
};

export function NavIcon({
  id,
  className = "h-[18px] w-[18px]",
}: {
  id: string;
  className?: string;
}) {
  const p = PATHS[id];
  if (!p) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {p}
    </svg>
  );
}
