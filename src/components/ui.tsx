import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs tracking-wide text-[#9bb5af]">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Stat({
  label,
  value,
  hint,
  gem,
}: {
  label: string;
  value: string;
  hint: string;
  gem?: boolean;
}) {
  return (
    <div className="stat-tile">
      <div className="text-xs text-[#9bb5af]">{label}</div>
      <div
        className={cn(
          "mt-1 text-2xl font-semibold",
          gem ? "gem-text" : "gold-text",
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-[#9bb5af]">{hint}</div>
    </div>
  );
}
