import { useMemo, useState } from "react";
import { BLUEPRINT_RECIPES, RARITY_COLORS, SLOT_LABELS } from "../data/gear";
import type { GearRarity, GearSlot } from "../types";
import { cn } from "../utils/cn";
import { ItemIcon, itemIconUrl } from "./ItemIcon";

const RARITIES: GearRarity[] = ["legendary", "ultimate", "mythic"];
const SLOTS: GearSlot[] = ["head", "body", "tool", "ring", "necklace"];

export function BlueprintsView() {
  const [rarity, setRarity] = useState<GearRarity | "all">("all");
  const [slot, setSlot] = useState<GearSlot | "all">("all");
  const rows = useMemo(
    () =>
      BLUEPRINT_RECIPES.filter(
        (b) => (rarity === "all" || b.rarity === rarity) && (slot === "all" || b.slot === slot),
      ),
    [rarity, slot],
  );

  return (
    <div className="space-y-6">
      <div className="panel rounded-3xl p-5">
        <h2 className="font-display text-2xl">Blueprint Recipes</h2>
        <p className="mt-1 text-sm text-[#9bb5af]">
          All {BLUEPRINT_RECIPES.length} blueprints from the handbook. Keep 6
          rare and 4 epic of the same items so you can always forge a legendary
          or ultimate.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            aria-label="Rarity"
            value={rarity}
            onChange={(e) => setRarity(e.target.value as GearRarity | "all")}
            className="field w-auto"
          >
            <option value="all">All rarities</option>
            {RARITIES.map((r) => (
              <option key={r} value={r}>
                {r[0].toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
          <select
            aria-label="Slot"
            value={slot}
            onChange={(e) => setSlot(e.target.value as GearSlot | "all")}
            className="field w-auto"
          >
            <option value="all">All slots</option>
            {SLOTS.map((s) => (
              <option key={s} value={s}>
                {SLOT_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((bp) => (
          <div
            key={`${bp.rarity}-${bp.slot}-${bp.result}`}
            className={cn("panel rounded-3xl p-5", bp.legacy && "opacity-70")}
          >
            <div className="flex items-start gap-3">
              <ItemIcon src={itemIconUrl(bp.resultId)} className="h-12 w-12" />
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl">{bp.result}</h3>
                <p className="text-xs text-[#9bb5af]">
                  <span className="capitalize" style={{ color: RARITY_COLORS[bp.rarity] }}>
                    {bp.rarity}
                  </span>
                  {bp.slot && <> · {SLOT_LABELS[bp.slot]}</>}
                  {bp.source && bp.source !== "N/A" && <> · {bp.source}</>}
                </p>
              </div>
            </div>
            {bp.legacy ? (
              <p className="mt-3 text-sm text-rose-300">
                Legacy item — not currently obtainable.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {bp.ingredients.map((ing) => (
                  <span
                    key={ing.name}
                    className="flex items-center gap-1.5 rounded-lg border border-[#f0b429]/15 bg-black/20 px-2 py-1 text-xs text-[#c5d5d0]"
                  >
                    <ItemIcon src={itemIconUrl(ing.itemId)} className="h-6 w-6" />
                    {ing.count}× {ing.name}
                  </span>
                ))}
              </div>
            )}
            {bp.stats.length > 0 && (
              <ul className="mt-3 space-y-0.5 text-xs text-[#9bb5af]">
                {bp.stats.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Item tips</h3>
        <ul className="mt-2 space-y-1 text-sm text-[#9bb5af]">
          <li>• No XP loss when salvaging leveled items.</li>
          <li>• Forging leveled items does transfer XP.</li>
          <li>
            • Keeping 6 rare and 4 epic of the same items ensures you always have
            enough to forge a legendary or ultimate item.
          </li>
        </ul>
      </div>
    </div>
  );
}
