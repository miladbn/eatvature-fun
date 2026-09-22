import { useState } from "react";
import {
  CLOTHING_TIPS,
  CLOTHING_XP,
  type ClothingRarity,
} from "../data/clothing";
import { BEST_PET_COMBOS, PET_FOOD_TO_MAX, PETS } from "../data/pets";
import { RARITY_COLORS } from "../data/gear";
import type { GearRarity } from "../types";
import { formatGems } from "../utils/calc";
import { cn } from "../utils/cn";

const RARITIES = Object.keys(CLOTHING_XP) as ClothingRarity[];

export function GuideView() {
  const [rarity, setRarity] = useState<ClothingRarity>("common");
  const levels = CLOTHING_XP[rarity] ?? [];
  const milestones = levels.filter(
    (l) => l.level === 1 || l.level % 5 === 0 || l.level === levels[levels.length - 1]?.level,
  );

  return (
    <div className="space-y-6">
      <section className="ticket rounded-2xl p-5 sm:p-6">
        <p className="text-sm font-medium text-[#5c6f69]">From the Spectre handbook</p>
        <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-[#14201c]">
          Field guide
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[#5c6f69]">
          Clothing XP curves, pet food totals, and the combos that actually matter.
          Patch reference 1.33.2 · handbook 1.16.2.
        </p>
      </section>

      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">Clothing XP / AP</h3>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Profit % for head, body, and hand. Rings and necklaces use the AP column.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {RARITIES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRarity(r)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm capitalize",
                rarity === r
                  ? "bg-[#f0b429] font-semibold text-[#0b2422]"
                  : "border border-white/10 bg-black/20 text-[#9bb5af]",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-[#9bb5af]">
              <tr>
                <th className="px-2 py-2 font-medium">Level</th>
                <th className="px-2 py-2 font-medium">All profit</th>
                <th className="px-2 py-2 font-medium">Ring / necklace AP</th>
                <th className="px-2 py-2 font-medium">XP to next</th>
                <th className="px-2 py-2 font-medium">Total XP</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((l) => (
                <tr key={l.level} className="border-t border-white/8">
                  <td className="px-2 py-2">{l.level}</td>
                  <td className="px-2 py-2 text-[#f0b429]">+{l.profitPct}%</td>
                  <td className="px-2 py-2">
                    {l.apPct != null ? `+${l.apPct}%` : "—"}
                  </td>
                  <td className="px-2 py-2">{l.xpToNext || "—"}</td>
                  <td className="px-2 py-2">{formatGems(l.totalXp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 space-y-1.5 text-sm text-[#9bb5af]">
          {CLOTHING_TIPS.map((tip) => (
            <li key={tip}>· {tip}</li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel rounded-2xl p-5">
          <h3 className="font-display text-xl font-bold">Pet food to max</h3>
          <p className="mt-1 text-sm text-[#9bb5af]">
            Feed Legendary Panda first. One pet from hatch to 50 costs about{" "}
            <span className="gold-text font-semibold">
              {formatGems(PET_FOOD_TO_MAX)}
            </span>{" "}
            pet food (level curve only).
          </p>
          <div className="mt-4 space-y-2">
            {BEST_PET_COMBOS.map((c) => (
              <div
                key={`${c.city}-${c.combo}`}
                className="rounded-xl border border-white/8 bg-black/20 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium">{c.combo}</span>
                  <span className="shrink-0 text-xs text-[#f0b429]">{c.city}</span>
                </div>
                <p className="mt-1 text-xs text-[#9bb5af]">{c.notes}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel rounded-2xl p-5">
          <h3 className="font-display text-xl font-bold">Pet roster</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PETS.map((pet) => (
              <div
                key={pet.id}
                className="rounded-xl border border-white/8 bg-black/20 p-3"
              >
                <div
                  className="font-medium"
                  style={{ color: RARITY_COLORS[pet.rarity as GearRarity] }}
                >
                  {pet.name}
                </div>
                <div className="text-[11px] capitalize text-[#9bb5af]">
                  {pet.rarity}
                </div>
                <p className="mt-1 text-xs text-[#c5d5d0]">{pet.ability}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className="text-xs text-[#9bb5af]">
        Data adapted from the{" "}
        <a
          className="text-[#f0b429] underline-offset-2 hover:underline"
          href="https://docs.google.com/spreadsheets/d/1xcVOTizpCp8oQFAalfHUrB91F_Mr-mFZmP1HoHU8xQo"
          target="_blank"
          rel="noreferrer"
        >
          Eatventure Handbook
        </a>{" "}
        by Spectre. Unofficial — make a copy if you want to edit the sheet.
      </p>
    </div>
  );
}
