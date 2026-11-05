import type { ReactNode } from "react";
import { RARITY_COLORS, RARITY_ORDER } from "../data/gear";
import {
  BEST_PET_COMBOS,
  EGG_MERGE,
  PET_DISH_NOTES,
  PET_FOOD_CONVERSION,
  PET_FOOD_TO_MAX,
  PET_HATCH,
  PET_MAP,
  PET_MAX_LEVEL,
  PET_RARITIES,
  PET_TIPS,
  PETS,
  petFoodBetween,
  petLevelRow,
} from "../data/pets";
import type { Account, OwnedPet, PetRarity } from "../types";
import { formatGems } from "../utils/calc";
import { cn } from "../utils/cn";
import { ItemIcon, eggIconUrl, petIconUrl } from "./ItemIcon";

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export function PetsView({
  account,
  addPet,
  removePet,
  updatePet,
  emptyHint,
}: {
  account: Account;
  addPet: (id: string) => void;
  removePet: (id: string) => void;
  updatePet: (id: string, patch: Partial<Pick<OwnedPet, "level" | "rarity">>) => void;
  emptyHint?: ReactNode;
}) {
  const ownedIds = new Set(account.pets.map((p) => p.petId));
  return (
    <div className="space-y-6">
      {emptyHint}
      <div className="panel rounded-3xl p-5">
        <h2 className="font-display text-2xl">Your Pets</h2>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Add the pets you own and set their rarity and level. Merging raises a
          pet's rarity but never changes its ability.
        </p>
        {account.pets.length === 0 ? (
          <p className="mt-4 text-sm text-[#9bb5af]">No pets added yet. Add one below.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {account.pets.map((op) => {
              const pet = PET_MAP[op.petId];
              if (!pet) return null;
              const level = Math.max(1, op.level);
              const row = petLevelRow(op.rarity, level);
              const toMax = petFoodBetween(op.rarity, level, PET_MAX_LEVEL);
              return (
                <div
                  key={op.petId}
                  className="rounded-2xl border border-[#f0b429]/15 bg-black/20 p-4"
                >
                  <div className="flex items-start gap-3">
                    <ItemIcon src={petIconUrl(pet.id)} className="h-12 w-12" />
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-medium"
                        style={{ color: RARITY_COLORS[op.rarity] }}
                      >
                        {pet.name}
                      </div>
                      <div className="text-xs text-[#9bb5af]">{pet.ability}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePet(op.petId)}
                      className="text-xs text-rose-400"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor={`pet-rarity-${op.petId}`}>
                      Rarity
                    </label>
                    <select
                      id={`pet-rarity-${op.petId}`}
                      value={op.rarity}
                      onChange={(e) =>
                        updatePet(op.petId, { rarity: e.target.value as PetRarity })
                      }
                      className="field w-auto py-1 text-sm"
                    >
                      {PET_RARITIES.map((r) => (
                        <option key={r} value={r}>
                          {cap(r)}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-[#9bb5af]">Level</span>
                    <button
                      type="button"
                      aria-label="Decrease level"
                      onClick={() => updatePet(op.petId, { level: op.level - 1 })}
                      className="h-7 w-7 rounded border border-[#f0b429]/20 text-sm"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={PET_MAX_LEVEL}
                      value={op.level}
                      aria-label="Level"
                      onChange={(e) => updatePet(op.petId, { level: Number(e.target.value) })}
                      className="h-7 w-14 rounded border border-[#f0b429]/20 bg-black/30 text-center text-sm outline-none"
                    />
                    <button
                      type="button"
                      aria-label="Increase level"
                      onClick={() => updatePet(op.petId, { level: op.level + 1 })}
                      className="h-7 w-7 rounded border border-[#f0b429]/20 text-sm"
                    >
                      +
                    </button>
                    <span className="text-xs text-[#9bb5af]">/ {PET_MAX_LEVEL}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-lg bg-black/40">
                    <div
                      className="h-full rounded-lg bg-[#f0b429]"
                      style={{ width: `${(level / PET_MAX_LEVEL) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-[#9bb5af]">
                    <span>
                      All profit{" "}
                      <span className="text-[#f0b429]">+{row?.profitPct ?? 0}%</span>
                    </span>
                    <span>
                      {level >= PET_MAX_LEVEL ? (
                        "Maxed"
                      ) : (
                        <>
                          <span className="text-[#3ecfb3]">{formatGems(toMax)}</span> food to{" "}
                          {PET_MAX_LEVEL}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Add a Pet</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PETS.slice()
            .sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity))
            .map((pet) => (
              <button
                key={pet.id}
                type="button"
                onClick={() => addPet(pet.id)}
                disabled={ownedIds.has(pet.id)}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-3 text-left transition",
                  ownedIds.has(pet.id)
                    ? "border-[#f0b429]/10 opacity-40"
                    : "border-[#f0b429]/15 bg-black/20 hover:border-[#f0b429]/40",
                )}
              >
                <ItemIcon src={petIconUrl(pet.id)} className="h-10 w-10" />
                <span className="min-w-0">
                  <span
                    className="block font-medium"
                    style={{ color: RARITY_COLORS[pet.rarity] }}
                  >
                    {pet.name}
                  </span>
                  <span className="block text-xs text-[#9bb5af]">
                    {cap(pet.rarity)} egg · {pet.ability}
                  </span>
                  {ownedIds.has(pet.id) && (
                    <span className="mt-1 block text-[11px] text-[#f0b429]">Owned</span>
                  )}
                </span>
              </button>
            ))}
        </div>
      </div>

      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Best Pet Combos</h3>
        <div className="mt-3 space-y-3">
          {BEST_PET_COMBOS.map((c) => (
            <div
              key={c.stage}
              className="rounded-2xl border border-[#f0b429]/10 bg-black/20 p-3"
            >
              <div className="text-sm font-medium text-[#f0b429]">{c.stage}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {c.pets.map((combo) => (
                  <span
                    key={combo.join("+")}
                    className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/20 px-2 py-1 text-sm"
                  >
                    {combo.map((id, i) => (
                      <span key={`${id}-${i}`} className="flex items-center gap-1">
                        {i > 0 && <span className="text-[#9bb5af]">+</span>}
                        <ItemIcon src={petIconUrl(id)} className="h-6 w-6" />
                        {PET_MAP[id]?.name ?? id}
                      </span>
                    ))}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-xs text-[#9bb5af]">{c.notes}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Dish value by pet</h3>
        <p className="mt-1 text-sm text-[#9bb5af]">
          How much each dish is worth with the pet's ability active.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PET_DISH_NOTES.map((n) => (
            <div key={n.title} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="font-medium text-[#3ecfb3]">{n.title}</div>
              <ul className="mt-1 space-y-0.5 text-xs text-[#c5d5d0]">
                {n.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Pet food</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="data-table w-full min-w-[420px] text-left text-sm">
            <thead className="text-[#9bb5af]">
              <tr>
                <th className="px-2 py-1">Rarity</th>
                <th className="px-2 py-1 text-right">Hatch / merge</th>
                <th className="px-2 py-1 text-right">Food lv 1 → 50</th>
                <th className="px-2 py-1 text-right">All profit lv 1 → 50</th>
              </tr>
            </thead>
            <tbody>
              {PET_RARITIES.map((r) => (
                <tr key={r} className="border-t border-white/8">
                  <td className="px-2 py-1.5">
                    <span className="flex items-center gap-2" style={{ color: RARITY_COLORS[r] }}>
                      <ItemIcon src={eggIconUrl(r)} className="h-6 w-6" />
                      {cap(r)}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {formatGems(PET_HATCH[r].food)}
                    {r === "ultimate" && (
                      <span className="block text-[11px] text-[#9bb5af]">
                        {PET_HATCH[r].label}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-right text-[#3ecfb3]">
                    {formatGems(PET_FOOD_TO_MAX[r])}
                  </td>
                  <td className="px-2 py-1.5 text-right text-[#f0b429]">
                    +{petLevelRow(r, 1)?.profitPct}% → +{petLevelRow(r, PET_MAX_LEVEL)?.profitPct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold">Egg merging</h4>
            <ul className="mt-2 space-y-1.5 text-sm">
              {EGG_MERGE.map((m) => (
                <li key={m.from} className="flex items-center gap-2">
                  {m.count}×
                  <ItemIcon src={eggIconUrl(m.from)} className="h-6 w-6" />
                  {cap(m.from)} =
                  <ItemIcon src={eggIconUrl(m.to)} className="h-6 w-6" />
                  {cap(m.to)}
                </li>
              ))}
            </ul>
          </div>
          {PET_FOOD_CONVERSION.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold">Pet food conversion (average)</h4>
              <table className="data-table mt-2 w-full text-left text-sm">
                <thead className="text-[#9bb5af]">
                  <tr>
                    <th className="px-2 py-1">Pet food</th>
                    <th className="px-2 py-1 text-right">Boxes</th>
                    <th className="px-2 py-1 text-right">Cities needed</th>
                  </tr>
                </thead>
                <tbody>
                  {PET_FOOD_CONVERSION.map((c) => (
                    <tr key={c.food} className="border-t border-white/8">
                      <td className="px-2 py-1">{formatGems(c.food)}</td>
                      <td className="px-2 py-1 text-right">{formatGems(c.boxes)}</td>
                      <td className="px-2 py-1 text-right">{c.cities}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <ul className="mt-5 space-y-1 text-xs text-[#9bb5af]">
          {PET_TIPS.map((t) => (
            <li key={t}>• {t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
