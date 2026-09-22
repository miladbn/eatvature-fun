import { BEST_BUILDS, GEAR_ITEMS, GEAR_MAP } from "../data/gear";
import type { Account, BuildReco } from "../types";

function parseCityRange(range: string): { min: number; max: number } {
  const cleaned = range.replace("+", "–99999");
  const parts = cleaned.split("–").map((s) => parseInt(s.trim(), 10));
  return {
    min: Number.isFinite(parts[0]) ? parts[0] : 1,
    max: Number.isFinite(parts[1]) ? parts[1] : 99999,
  };
}

export function buildsForCity(city: number): BuildReco[] {
  return BEST_BUILDS.filter((b) => {
    const { min, max } = parseCityRange(b.cityRange);
    return city >= min && city <= max;
  });
}

function findGearByName(name: string): string | null {
  const clean = name.replace(/\s*\+\s*.*$/, "").trim().toLowerCase();
  const hit = GEAR_ITEMS.find((g) => g.name.toLowerCase() === clean);
  return hit?.id ?? null;
}

export interface GearMatchRow {
  slot: "head" | "body" | "hand1" | "hand2";
  needed: string;
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

export function evaluateGearMatch(account: Account): GearMatchReport {
  const city = account.city || 1;
  const candidates = buildsForCity(city);
  const build = candidates[0] ?? BEST_BUILDS[BEST_BUILDS.length - 1] ?? null;
  if (!build) {
    return {
      build: null,
      rows: [],
      matched: 0,
      total: 0,
      missing: [],
      summary: "No build recommendation available.",
    };
  }

  const handParts = build.hand.split(/\s*\+\s*/).map((s) => s.trim());
  const needed: { slot: GearMatchRow["slot"]; name: string }[] = [
    { slot: "head", name: build.head },
    { slot: "body", name: build.body },
    { slot: "hand1", name: handParts[0] ?? build.hand },
  ];
  if (handParts[1]) needed.push({ slot: "hand2", name: handParts[1] });

  const rows: GearMatchRow[] = needed.map(({ slot, name }) => {
    const equippedId = account.gear[slot] || "";
    const equippedName = equippedId ? GEAR_MAP[equippedId]?.name ?? equippedId : "—";
    const targetId = findGearByName(name);
    const match =
      !!equippedId &&
      (equippedName.toLowerCase() === name.toLowerCase() ||
        equippedId === targetId);
    return { slot, needed: name, equippedId, equippedName, match };
  });

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
