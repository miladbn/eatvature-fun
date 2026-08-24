import { DEFAULT_ACCOUNT, EMPTY_LEVELS, ITEM_IDS } from "../data/vault";
import { EMPTY_ARCANE } from "../data/arcane";
import type { Account, ArcaneVaultId, ItemId, OwnedPet, Playstyle } from "../types";

const KEY = "eatventure-vault-planner-v2";

const PLAYSTYLES: Playstyle[] = ["spectre", "speed", "ads", "complete"];

function isPlaystyle(value: unknown): value is Playstyle {
  return typeof value === "string" && PLAYSTYLES.includes(value as Playstyle);
}

function parseLevels(raw: unknown): Record<ItemId, number> {
  const levels = { ...EMPTY_LEVELS };
  if (raw && typeof raw === "object") {
    for (const id of ITEM_IDS) {
      const n = Number((raw as Record<string, number>)[id]);
      if (Number.isFinite(n)) levels[id] = Math.max(0, Math.floor(n));
    }
  }
  return levels;
}

function parseArcane(raw: unknown): Record<ArcaneVaultId, number> {
  const levels = { ...EMPTY_ARCANE };
  if (raw && typeof raw === "object") {
    for (const id of Object.keys(EMPTY_ARCANE) as ArcaneVaultId[]) {
      const n = Number((raw as Record<string, number>)[id]);
      if (Number.isFinite(n)) levels[id] = Math.max(0, Math.floor(n));
    }
  }
  return levels;
}

function parseGear(raw: unknown): Account["gear"] {
  const def = { head: "", body: "", hand1: "", hand2: "" };
  if (raw && typeof raw === "object") {
    return {
      head: typeof (raw as Record<string, unknown>).head === "string" ? (raw as Record<string, string>).head : "",
      body: typeof (raw as Record<string, unknown>).body === "string" ? (raw as Record<string, string>).body : "",
      hand1: typeof (raw as Record<string, unknown>).hand1 === "string" ? (raw as Record<string, string>).hand1 : "",
      hand2: typeof (raw as Record<string, unknown>).hand2 === "string" ? (raw as Record<string, string>).hand2 : "",
    };
  }
  return def;
}

function parsePets(raw: unknown): OwnedPet[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p) => p && typeof p === "object" && typeof p.petId === "string")
    .map((p) => ({
      petId: (p as Record<string, unknown>).petId as string,
      level: Number.isFinite((p as Record<string, unknown>).level)
        ? Math.max(0, Math.floor(Number((p as Record<string, unknown>).level)))
        : 0,
      rarity: typeof (p as Record<string, unknown>).rarity === "string"
        ? ((p as Record<string, unknown>).rarity as OwnedPet["rarity"])
        : "common",
    }));
}

export function loadAccount(): Account | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Account>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      city: Number.isFinite(parsed.city) ? Math.max(0, Number(parsed.city)) : 1,
      gems: Number.isFinite(parsed.gems) ? Math.max(0, Number(parsed.gems)) : 0,
      scrolls: Number.isFinite(parsed.scrolls) ? Math.max(0, Number(parsed.scrolls)) : 0,
      hasPanda: Boolean(parsed.hasPanda),
      playstyle: isPlaystyle(parsed.playstyle) ? parsed.playstyle : "spectre",
      levels: parseLevels(parsed.levels),
      arcaneLevels: parseArcane(parsed.arcaneLevels),
      gear: parseGear(parsed.gear),
      pets: parsePets(parsed.pets),
      clubLevel: Number.isFinite(parsed.clubLevel) ? Math.max(0, Number(parsed.clubLevel)) : 0,
      clubXp: Number.isFinite(parsed.clubXp) ? Math.max(0, Number(parsed.clubXp)) : 0,
      citiesCompleted: Number.isFinite(parsed.citiesCompleted) ? Math.max(0, Number(parsed.citiesCompleted)) : 0,
      totalGemsEarned: Number.isFinite(parsed.totalGemsEarned) ? Math.max(0, Number(parsed.totalGemsEarned)) : 0,
    };
  } catch {
    return null;
  }
}

export function saveAccount(account: Account) {
  try {
    localStorage.setItem(KEY, JSON.stringify(account));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearAccount() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function freshAccount(): Account {
  return {
    ...DEFAULT_ACCOUNT,
    levels: { ...EMPTY_LEVELS },
    arcaneLevels: { ...EMPTY_ARCANE },
    gear: { head: "", body: "", hand1: "", hand2: "" },
    pets: [],
  };
}
