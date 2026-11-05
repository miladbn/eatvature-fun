import { useMemo, useState } from "react";
import {
  CATALOG_EVENTS,
  CATALOG_ITEMS,
  CATALOG_RARITIES,
  CATALOG_SLOTS,
} from "../data/catalog";
import { RARITY_COLORS } from "../data/gear";
import type { GearRarity } from "../types";
import { ItemIcon, catalogIconUrl } from "./ItemIcon";
import { GearStatChips } from "./GearStatChips";
import { formatGems } from "../utils/calc";

export function CatalogView() {
  const [q, setQ] = useState("");
  const [rarity, setRarity] = useState("all");
  const [slot, setSlot] = useState("all");
  const [event, setEvent] = useState("all");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return CATALOG_ITEMS.filter((i) => {
      if (rarity !== "all" && i.rarity !== rarity) return false;
      if (slot !== "all" && i.slot !== slot) return false;
      if (event !== "all" && i.event !== event) return false;
      if (!query) return true;
      return (
        i.name.toLowerCase().includes(query) ||
        i.event.toLowerCase().includes(query) ||
        i.slot.toLowerCase().includes(query)
      );
    });
  }, [q, rarity, slot, event]);

  return (
    <div className="space-y-5">
      <section className="ticket rounded-2xl p-5">
        <h2 className="font-display text-3xl font-bold text-[#14201c]">
          Item catalog
        </h2>
        <p className="mt-1 text-sm text-[#5c6f69]">
          {CATALOG_ITEMS.length} items from the Spectre handbook — filter by
          rarity, slot, and event. Chips marked <strong>AW</strong> apply to
          all workers, you included.
        </p>
      </section>

      <div className="panel rounded-2xl p-4">
        <div className="flex flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search items…"
            className="field max-w-xs"
          />
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
            className="field max-w-[140px]"
          >
            <option value="all">All rarities</option>
            {CATALOG_RARITIES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className="field max-w-[140px]"
          >
            <option value="all">All slots</option>
            {CATALOG_SLOTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            className="field max-w-[180px]"
          >
            <option value="all">All events</option>
            {CATALOG_EVENTS.map((ev) => (
              <option key={ev} value={ev}>
                {ev}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-xs text-[#9bb5af]">{rows.length} matches</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((i) => (
          <article
            key={i.id}
            className="rounded-2xl border border-white/10 bg-black/20 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <ItemIcon
                src={catalogIconUrl(i.id)}
                alt=""
                className="h-11 w-11"
              />
              <h3
                className="mr-auto self-center font-medium"
                style={{
                  color:
                    RARITY_COLORS[i.rarity as GearRarity] || "#f2f5f3",
                }}
              >
                {i.name}
              </h3>
              <span className="text-[11px] capitalize text-[#9bb5af]">
                {i.rarity}
              </span>
            </div>
            <p className="text-xs text-[#9bb5af]">
              {i.slot} · {i.event}
            </p>
            <p className="mt-1 text-xs text-[#c5d5d0]">
              AP {formatGems(i.apMin)}–{formatGems(i.apMax)}
            </p>
            <GearStatChips item={i} className="mt-2" />
          </article>
        ))}
      </div>
    </div>
  );
}
