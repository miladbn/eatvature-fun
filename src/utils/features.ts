import { CITIES, LOOP_GEMS, AVG_GEMS_PER_CITY, cityForNumber } from "../data/cities";
import type { Account } from "../types";
import type { MilestoneId } from "../data/meta";
import { VAULT_ITEMS } from "../data/vault";
import { CLOTHING_XP, type ClothingRarity } from "../data/clothing";
import { PET_FOOD_PER_LEVEL } from "../data/pets";

/** Project gem income for the next N cities starting from a city number. */
export function projectGemIncome(fromCity: number, count: number): {
  gems: number;
  cities: { id: number; name: string; gems: number }[];
} {
  const cities: { id: number; name: string; gems: number }[] = [];
  let gems = 0;
  const start = Math.max(1, Math.floor(fromCity) || 1);
  for (let i = 0; i < Math.max(0, count); i++) {
    const c = cityForNumber(start + i);
    cities.push({ id: ((start + i - 1) % 60) + 1, name: c.name, gems: c.gems });
    gems += c.gems;
  }
  return { gems, cities };
}

export function clothingXpToLevel(
  rarity: ClothingRarity,
  from: number,
  to: number,
): number {
  const curve = CLOTHING_XP[rarity] ?? [];
  let total = 0;
  for (const row of curve) {
    if (row.level >= from && row.level < to) total += row.xpToNext;
  }
  return total;
}

export function clothingAtLevel(rarity: ClothingRarity, level: number) {
  const curve = CLOTHING_XP[rarity] ?? [];
  return curve.find((r) => r.level === level) ?? null;
}

/** Pet food from current level to target (exclusive of hatch cost). */
export function petFoodBetween(fromLevel: number, toLevel: number): number {
  let total = 0;
  const from = Math.max(0, Math.floor(fromLevel));
  const to = Math.max(from, Math.floor(toLevel));
  for (let lvl = from; lvl < to && lvl < PET_FOOD_PER_LEVEL.length; lvl++) {
    total += PET_FOOD_PER_LEVEL[lvl + 1] ?? 0;
  }
  return total;
}

export const EGG_COSTS = {
  common: 100,
  rare: 300,
  epic: 900,
  legendary: 2700,
  ultimate: 8100,
} as const;

export const EGG_MERGE = {
  commonToRare: 6,
  rareToEpic: 6,
  epicToLegendary: 10,
  legendaryToUltimate: 5,
} as const;

export const CLUB_EQUAL_SHARE_XP = 24195;
export const CLUB_XP_PER_CITY = 236;

export function clubCitiesToTarget(currentXp: number, target = CLUB_EQUAL_SHARE_XP) {
  const need = Math.max(0, target - currentXp);
  return Math.ceil(need / CLUB_XP_PER_CITY);
}

export function evaluateMilestones(account: Account): Record<MilestoneId, boolean> {
  const allUnlocked = VAULT_ITEMS.every((i) => account.levels[i.id] > 0);
  const registerMax =
    account.hasPanda || (account.levels.register ?? 0) >= 10;
  const remote = account.levels.remote ?? 0;
  const mop = account.levels.mop ?? 0;
  const checkbook = account.levels.checkbook ?? 0;
  const levelsOwned = VAULT_ITEMS.reduce((s, i) => s + account.levels[i.id], 0);
  const levelsMax = VAULT_ITEMS.reduce((s, i) => s + i.maxLevel, 0);
  return {
    unlockAll: allUnlocked,
    registerMax,
    remote10: remote >= 10,
    remote20: remote >= 20,
    remote50: remote >= 50,
    mop20: mop >= 20,
    checkbook20: checkbook >= 20,
    city60: account.city >= 60,
    city120: account.city >= 120,
    city450: account.city >= 450,
    ownPanda: account.hasPanda,
    vault100: levelsOwned >= levelsMax,
  };
}

export function comparePlaystylesBase() {
  return {
    avgGems: AVG_GEMS_PER_CITY,
    loopGems: LOOP_GEMS,
    cityCount: CITIES.length,
  };
}
