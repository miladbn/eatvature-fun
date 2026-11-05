import { STAT_ORDER } from "../data/gear";
import type { GearItem, GearStats } from "../types";
import { cn } from "../utils/cn";

const STYLE: Record<keyof GearStats, { short: string; cls: string; plus: boolean }> = {
  instantFood: { short: "instant", cls: "bg-emerald-500/15 text-emerald-300", plus: false },
  perfectFood: { short: "perfect", cls: "bg-purple-500/15 text-purple-300", plus: false },
  doubleFood: { short: "double", cls: "bg-sky-500/15 text-sky-300", plus: false },
  divineFood: { short: "divine", cls: "bg-rose-500/15 text-rose-300", plus: false },
  anotherOrder: { short: "another order", cls: "bg-orange-500/15 text-orange-300", plus: false },
  fasterFood: { short: "food speed", cls: "bg-amber-500/15 text-amber-300", plus: true },
  fasterWalk: { short: "walk", cls: "bg-teal-500/15 text-teal-300", plus: true },
};

function Chips({ stats, aw }: { stats: GearStats; aw?: boolean }) {
  return (
    <>
      {STAT_ORDER.filter((k) => stats[k] > 0).map((k) => (
        <span
          key={k}
          className={cn(
            "rounded px-1.5 py-0.5",
            STYLE[k].cls,
            aw && "ring-1 ring-inset ring-current/40",
          )}
          title={aw ? "All workers (you included)" : "Your character only"}
        >
          {aw && <span className="mr-0.5 font-semibold">AW</span>}
          {STYLE[k].plus ? "+" : ""}
          {stats[k]}% {STYLE[k].short}
        </span>
      ))}
    </>
  );
}

/** Stat chips for an item: character-only first, then "AW" all-worker ones. */
export function GearStatChips({
  item,
  className,
}: {
  item: Pick<GearItem, "self" | "aw">;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1 text-[11px]", className)}>
      <Chips stats={item.self} />
      <Chips stats={item.aw} aw />
    </div>
  );
}
