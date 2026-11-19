import { useState } from "react";
import {
  CLOTHING_TIPS,
  CLOTHING_XP,
  type ClothingRarity,
} from "../data/clothing";
import { BEST_PET_COMBOS, PET_FOOD_TO_MAX, PET_MAP, PETS } from "../data/pets";
import { RARITY_COLORS } from "../data/gear";
import type { GearRarity } from "../types";
import { formatGems } from "../utils/calc";
import { cn } from "../utils/cn";
import { ItemIcon, petIconUrl } from "./ItemIcon";

const RARITIES = Object.keys(CLOTHING_XP) as ClothingRarity[];

export function GuideView() {
  const [rarity, setRarity] = useState<ClothingRarity>("common");
  const levels = CLOTHING_XP[rarity] ?? [];
  const milestones = levels.filter(
    (l) => l.level === 1 || l.level % 5 === 0 || l.level === levels[levels.length - 1]?.level,
  );

  return (
    <div className="space-y-6">
      <section className="page-head">
        <p className="text-sm font-medium text-muted">From the Spectre handbook</p>
        <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink">
          Field guide
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Clothing XP curves, pet food totals, and the combos that actually matter.
          Patch reference 1.33.2 · handbook 1.16.2.
        </p>
      </section>

      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">Clothing XP / AP</h3>
        <p className="mt-1 text-sm text-muted">
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
                  ? "bg-action font-semibold text-on-action"
                  : "border border-line bg-sunken text-muted",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="data-table w-full min-w-[520px] text-left text-sm">
            <thead className="text-muted">
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
                <tr key={l.level} className="border-t border-line">
                  <td className="px-2 py-2">{l.level}</td>
                  <td className="px-2 py-2 text-gold">+{l.profitPct}%</td>
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
        <ul className="mt-4 space-y-1.5 text-sm text-muted">
          {CLOTHING_TIPS.map((tip) => (
            <li key={tip}>· {tip}</li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel rounded-2xl p-5">
          <h3 className="font-display text-xl font-bold">Pet food to max</h3>
          <p className="mt-1 text-sm text-muted">
            Feed Legendary Panda first. A legendary pet from level 1 to 50
            costs{" "}
            <span className="gold-text font-semibold">
              {formatGems(PET_FOOD_TO_MAX.legendary)}
            </span>{" "}
            pet food (ultimate: {formatGems(PET_FOOD_TO_MAX.ultimate)}).
          </p>
          <div className="mt-4 space-y-2">
            {BEST_PET_COMBOS.map((c) => (
              <div
                key={c.stage}
                className="rounded-xl border border-line bg-sunken p-3"
              >
                <div className="text-xs text-muted">{c.stage}</div>
                <div className="mt-1 font-medium">
                  {c.pets
                    .map((combo) => combo.map((id) => PET_MAP[id]?.name ?? id).join(" + "))
                    .join(" · ")}
                </div>
                <p className="mt-1 text-xs text-muted">{c.notes}</p>
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
                className="rounded-xl border border-line bg-sunken p-3"
              >
                <div
                  className="flex items-center gap-2 font-medium"
                  style={{ color: RARITY_COLORS[pet.rarity as GearRarity] }}
                >
                  <ItemIcon src={petIconUrl(pet.id)} className="h-8 w-8" />
                  {pet.name}
                </div>
                <div className="text-xs capitalize text-muted">
                  {pet.rarity}
                </div>
                <p className="mt-1 text-xs text-soft">{pet.ability}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className="text-xs text-muted">
        Data adapted from the{" "}
        <a
          className="text-gold underline-offset-2 hover:underline"
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
