import type { ReactNode } from "react";
import type { ItemId } from "../types";

export function VaultIcon({ id, className = "" }: { id: ItemId; className?: string }) {
  return (
    <span className={className}>
      <svg viewBox="0 0 48 48" fill="none" aria-hidden className="h-full w-full">
        {ICONS[id]}
      </svg>
    </span>
  );
}

const ICONS: Record<ItemId, ReactNode> = {
  tipJar: (
    <>
      <path
        d="M16 14h16l-1.2 22.5a6 6 0 0 1-6 5.5h-1.6a6 6 0 0 1-6-5.5L16 14Z"
        fill="#f5b942"
        stroke="#f5d48a"
        strokeWidth="1.4"
      />
      <path d="M15 14h18c1 0 2-1.4 2-3h-22c0 1.6 1 3 2 3Z" fill="#e8c36a" />
      <circle cx="24" cy="28" r="4.5" fill="#fff4c2" opacity="0.85" />
    </>
  ),
  remote: (
    <>
      <rect x="16" y="6" width="16" height="36" rx="4" fill="#ff5a5a" stroke="#ffb4b4" strokeWidth="1.3" />
      <circle cx="24" cy="16" r="3.2" fill="#fff" />
      <rect x="20" y="23" width="3.2" height="3.2" rx="0.6" fill="#fff" opacity="0.85" />
      <rect x="24.8" y="23" width="3.2" height="3.2" rx="0.6" fill="#fff" opacity="0.55" />
      <rect x="20" y="28.5" width="3.2" height="3.2" rx="0.6" fill="#fff" opacity="0.55" />
      <rect x="24.8" y="28.5" width="3.2" height="3.2" rx="0.6" fill="#fff" opacity="0.85" />
    </>
  ),
  pickaxe: (
    <>
      <path d="M14 12c8-8 20-6 24 2-7 1-12 4-16 9-2-5-5-8-8-11Z" fill="#c9844a" stroke="#efd0a6" strokeWidth="1.2" />
      <path d="M20 20 34 38" stroke="#8b5a2b" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M20 20 34 38" stroke="#e8c36a" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  hourglass: (
    <>
      <path
        d="M16 8h16v4c0 5-5 8-8 10 3 2 8 5 8 10v4H16v-4c0-5 5-8 8-10-3-2-8-5-8-10V8Z"
        fill="#a78bfa"
        stroke="#ddd6fe"
        strokeWidth="1.3"
      />
      <path d="M19 11h10l-5 7-5-7Z" fill="#f5e9ff" opacity="0.85" />
      <path d="M24 26c3 2 6 4 6 8H18c0-4 3-6 6-8Z" fill="#f5e9ff" opacity="0.7" />
    </>
  ),
  register: (
    <>
      <rect x="10" y="16" width="28" height="22" rx="3" fill="#34d399" stroke="#bbf7d0" strokeWidth="1.3" />
      <rect x="14" y="10" width="20" height="8" rx="2" fill="#064e3b" />
      <rect x="16" y="12" width="16" height="4" rx="1" fill="#6ee7b7" />
      <circle cx="18" cy="28" r="2" fill="#ecfdf5" />
      <circle cx="24" cy="28" r="2" fill="#ecfdf5" opacity="0.7" />
      <circle cx="30" cy="28" r="2" fill="#ecfdf5" opacity="0.45" />
    </>
  ),
  tv: (
    <>
      <rect x="8" y="12" width="32" height="22" rx="3" fill="#60a5fa" stroke="#bfdbfe" strokeWidth="1.3" />
      <rect x="12" y="16" width="24" height="14" rx="1.5" fill="#0f172a" />
      <path d="M18 40h12M24 34v6" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15 20h8" stroke="#7dd3fc" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  piggy: (
    <>
      <ellipse cx="24" cy="26" rx="14" ry="11" fill="#f472b6" stroke="#fbcfe8" strokeWidth="1.3" />
      <circle cx="18" cy="24" r="1.6" fill="#3f1a2c" />
      <path d="M34 22c3 0 6 3 6 6h-5" stroke="#f9a8d4" strokeWidth="2" />
      <rect x="21" y="18" width="7" height="2" rx="1" fill="#3f1a2c" />
      <circle cx="12" cy="22" r="2.2" fill="#fb7185" />
    </>
  ),
  knife: (
    <>
      <path d="M18 40c2-12 6-22 18-32 1 8-2 18-10 26l-8 6Z" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="1.2" />
      <path d="M16 38c4-2 7-3 10-6" stroke="#fff" strokeWidth="1.2" opacity="0.5" />
      <rect x="12" y="36" width="10" height="6" rx="2" fill="#b45309" />
    </>
  ),
  mop: (
    <>
      <path d="M24 6v24" stroke="#e8c36a" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M14 32c2 8 6 11 10 11s8-3 10-11c-4 2-7 2-10 2s-6 0-10-2Z"
        fill="#2dd4bf"
        stroke="#99f6e4"
        strokeWidth="1.2"
      />
      <path d="M16 34c2 1 5 2 8 2s6-1 8-2" stroke="#134e4a" strokeWidth="1" opacity="0.5" />
    </>
  ),
  suitcase: (
    <>
      <rect x="10" y="16" width="28" height="20" rx="3" fill="#d6a36a" stroke="#fde68a" strokeWidth="1.3" />
      <path d="M18 16v-3a6 6 0 0 1 12 0v3" stroke="#fde68a" strokeWidth="1.8" />
      <rect x="21" y="23" width="6" height="5" rx="1" fill="#1c140c" />
    </>
  ),
  checkbook: (
    <>
      <rect x="9" y="14" width="30" height="20" rx="2.5" fill="#4ade80" stroke="#bbf7d0" strokeWidth="1.3" />
      <path d="M14 21h20M14 26h14" stroke="#064e3b" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M28 30l3 2 6-7" stroke="#064e3b" strokeWidth="1.7" strokeLinecap="round" />
    </>
  ),
  keyCard: (
    <>
      <rect x="8" y="14" width="32" height="20" rx="3" fill="#fbbf24" stroke="#fde68a" strokeWidth="1.3" />
      <rect x="12" y="18" width="10" height="8" rx="1.5" fill="#1c140c" />
      <path d="M26 20h10M26 25h7" stroke="#1c140c" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
};
