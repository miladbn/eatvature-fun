import { BEST_BUILDS, GEAR_MAP, buildInRange } from "../data/gear";
import type { Account, BuildReco, EquippedGear } from "../types";

export function buildsForCity(city: number): BuildReco[] {
  return BEST_BUILDS.filter((b) => buildInRange(b, city));
}

export interface GearMatchRow {
  slot: keyof EquippedGear;
  label: string;
  needed: string;
  neededId: string | null;
  equippedId: string;
  equippedName: string;
  match: boolean;
}

export interface GearMatchReport {
  build: BuildReco | null;
  rows: GearMatchRow[];
  matched: number;
  total: number;
  missing: string[];
  summary: string;
}

const SLOT_KEYS: Record<string, (keyof EquippedGear)[]> = {
  head: ["head"],
  body: ["body"],
  tool: ["hand1", "hand2"],
  ring: ["ring"],
  necklace: ["necklace"],
};

/** Compare equipped gear against one build. Tools match in either tool slot. */
function compare(account: Account, build: BuildReco): GearMatchRow[] {
  const used = new Set<keyof EquippedGear>();
  const keysFor = (slot: string) => SLOT_KEYS[slot] ?? [];
  return build.slots.map((s) => {
    const keys = keysFor(s.slot);
    let key = keys.find((k) => !used.has(k) && s.itemId && account.gear[k] === s.itemId);
    const match = !!key;
    if (!key) key = keys.find((k) => !used.has(k)) ?? keys[0];
    if (key) used.add(key);
    const equippedId = key ? account.gear[key] : "";
    return {
      slot: key,
      label: s.label,
      needed: s.name,
      neededId: s.itemId,
      equippedId,
      equippedName: equippedId ? GEAR_MAP[equippedId]?.name ?? equippedId : "—",
      match,
    };
  });
}

/** Pick the recommended build for the player's city that they are closest to. */
export function evaluateGearMatch(account: Account): GearMatchReport {
  const city = account.city || 1;
  const candidates = buildsForCity(city);
  const pool = candidates.length ? candidates : BEST_BUILDS;
  let best: { build: BuildReco; rows: GearMatchRow[]; score: number } | null = null;
  for (const build of pool) {
    const rows = compare(account, build);
    const score = rows.filter((r) => r.match).length / Math.max(1, rows.length);
    if (!best || score > best.score) best = { build, rows, score };
  }
  if (!best) {
    return {
      build: null,
      rows: [],
      matched: 0,
      total: 0,
      missing: [],
      summary: "No build recommendation available.",
    };
  }
  const { build, rows } = best;
  const matched = rows.filter((r) => r.match).length;
  const missing = rows.filter((r) => !r.match).map((r) => r.needed);
  let summary: string;
  if (matched === rows.length) {
    summary = `You're wearing the full ${build.label} set.`;
  } else if (matched === 0) {
    summary = `Missing ${missing.join(", ")} for ${build.label}.`;
  } else {
    summary = `${matched}/${rows.length} slots match ${build.label}. Still need: ${missing.join(", ")}.`;
  }
  return { build, rows, matched, total: rows.length, missing, summary };
}
