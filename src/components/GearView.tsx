import { useMemo, useState, type ReactNode } from "react";
import {
  EQUIP_SLOTS,
  GEAR_ITEMS,
  GEAR_MAP,
  RARITY_COLORS,
  RARITY_ORDER,
  SLOT_LABELS,
  STAT_LABELS,
  STAT_ORDER,
  gearTotals,
} from "../data/gear";
import type { Account, EquippedGear, GearSlot } from "../types";
import { formatGems } from "../utils/calc";
import { cn } from "../utils/cn";
import { GearStatChips } from "./GearStatChips";
import { ItemIcon, gearIconUrl } from "./ItemIcon";

const byRarity = (slot: GearSlot) =>
  GEAR_ITEMS.filter((g) => g.slot === slot).sort(
    (a, b) =>
      RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity) ||
      a.name.localeCompare(b.name),
  );

export function GearView({
  account,
  setGear,
  emptyHint,
}: {
  account: Account;
  setGear: (slot: keyof EquippedGear, id: string) => void;
  emptyHint?: ReactNode;
}) {
  const totals = useMemo(() => gearTotals(account.gear), [account.gear]);
  const youInstant = totals.self.instantFood + totals.aw.instantFood;
  const youPerfect = totals.self.perfectFood + totals.aw.perfectFood;
  const [listSlot, setListSlot] = useState<GearSlot | "all">("all");

  return (
    <div className="space-y-6">
      {emptyHint}
      <div className="panel rounded-3xl p-5">
        <h2 className="font-display text-2xl">Equipped Gear</h2>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Pick what you wear. Stats come straight from the handbook's Items tab.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EQUIP_SLOTS.map(({ key, label, slot }) => {
            const item = GEAR_MAP[account.gear[key]];
            return (
              <div key={key}>
                <label
                  htmlFor={`gear-${key}`}
                  className="mb-1 block text-xs uppercase tracking-wide text-[#9bb5af]"
                >
                  {label}
                </label>
                <select
                  id={`gear-${key}`}
                  value={account.gear[key]}
                  onChange={(e) => setGear(key, e.target.value)}
                  className="field text-sm"
                >
                  <option value="">None</option>
                  {RARITY_ORDER.slice()
                    .reverse()
                    .map((r) => {
                      const opts = byRarity(slot).filter((g) => g.rarity === r);
                      if (!opts.length) return null;
                      return (
                        <optgroup key={r} label={r[0].toUpperCase() + r.slice(1)}>
                          {opts.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                </select>
                {item && (
                  <div className="mt-2 rounded-xl border border-[#f0b429]/10 bg-black/20 p-2 text-xs">
                    <div className="flex items-center gap-2">
                      <ItemIcon src={gearIconUrl(item)} className="h-10 w-10" />
                      <div className="min-w-0">
                        <div
                          className="font-medium"
                          style={{ color: RARITY_COLORS[item.rarity] }}
                        >
                          {item.name}
                        </div>
                        <div className="text-[#9bb5af] capitalize">
                          {item.rarity} · {item.event} · AP {formatGems(item.apMin)}–
                          {formatGems(item.apMax)}
                        </div>
                      </div>
                    </div>
                    <GearStatChips item={item} className="mt-2" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Equipped totals</h3>
        <p className="mt-1 text-sm text-[#9bb5af]">
          "All workers" bonuses apply to every worker, your character included,
          so your character gets both columns.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="data-table w-full min-w-[420px] text-left text-sm">
            <thead className="text-[#9bb5af]">
              <tr>
                <th className="px-2 py-1">Stat</th>
                <th className="px-2 py-1 text-right">Character only</th>
                <th className="px-2 py-1 text-right">All workers</th>
                <th className="px-2 py-1 text-right">Your character</th>
              </tr>
            </thead>
            <tbody>
              {STAT_ORDER.map((k) => (
                <tr key={k} className="border-t border-white/8">
                  <td className="px-2 py-1.5">{STAT_LABELS[k]}</td>
                  <td className="px-2 py-1.5 text-right">{totals.self[k]}%</td>
                  <td className="px-2 py-1.5 text-right text-[#3ecfb3]">
                    {totals.aw[k]}%
                  </td>
                  <td className="px-2 py-1.5 text-right font-medium text-[#f0b429]">
                    {totals.self[k] + totals.aw[k]}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-[#9bb5af]">
          Item AP at level 1–max: {formatGems(totals.apMin)} – {formatGems(totals.apMax)}
        </p>
      </div>

      <div className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">Build checker</h3>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Handbook priority: 100% instant food, then perfect, then double and
          divine food, then walk speed.
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          <li>
            Instant (your character):{" "}
            <span className={youInstant >= 100 ? "text-[#3ecfb3]" : "text-[#f0b429]"}>
              {youInstant}%
            </span>{" "}
            {youInstant >= 100 ? "— capped" : `— need ${100 - youInstant}% more`}
          </li>
          <li>
            Perfect (your character):{" "}
            <span className={youPerfect >= 100 ? "text-[#3ecfb3]" : "text-[#9bb5af]"}>
              {youPerfect}%
            </span>
          </li>
          <li>
            Other workers: {totals.aw.instantFood}% instant ·{" "}
            {totals.aw.perfectFood}% perfect · +{totals.aw.fasterWalk}% walk
          </li>
        </ul>
        <p className="mt-3 text-xs text-[#9bb5af]">
          City {account.city}: see the Builds tab for the recommended set in your
          range.
        </p>
      </div>

      <div className="panel rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-xl">All gear items</h3>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by slot">
            {(["all", "head", "body", "tool", "ring", "necklace"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setListSlot(s)}
                aria-pressed={listSlot === s}
                className={cn(
                  "rounded-lg border px-2 py-1 text-xs",
                  listSlot === s
                    ? "border-[#f0b429] text-[#f0b429]"
                    : "border-white/10 text-[#9bb5af]",
                )}
              >
                {s === "all" ? "All" : SLOT_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {GEAR_ITEMS.filter((g) => listSlot === "all" || g.slot === listSlot)
            .slice()
            .sort(
              (a, b) =>
                RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity) ||
                a.slot.localeCompare(b.slot),
            )
            .map((g) => (
              <div
                key={g.id}
                className="rounded-2xl border border-[#f0b429]/10 bg-black/20 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <ItemIcon src={gearIconUrl(g)} className="h-9 w-9" />
                    <span
                      className="font-medium"
                      style={{ color: RARITY_COLORS[g.rarity] }}
                    >
                      {g.name}
                    </span>
                  </span>
                  <span
                    className="text-[11px] uppercase"
                    style={{ color: RARITY_COLORS[g.rarity] }}
                  >
                    {g.rarity}
                  </span>
                </div>
                <div className="text-xs text-[#9bb5af]">
                  {SLOT_LABELS[g.slot]} · {g.event}
                </div>
                <GearStatChips item={g} className="mt-1" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
