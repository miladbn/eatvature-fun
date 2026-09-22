import { CITIES, LOOP_GEMS, AVG_GEMS_PER_CITY, cityForNumber } from "../data/cities";
import type { Account, ItemId, Playstyle, UpgradeStep } from "../types";
import type { MilestoneId } from "../data/meta";
import { ITEM_MAP, VAULT_ITEMS } from "../data/vault";
import { CLOTHING_XP, type ClothingRarity } from "../data/clothing";
import { PET_FOOD_PER_LEVEL } from "../data/pets";
import { citiesNeededForGems } from "./calc";

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

/** Handbook-expected vault levels for a given city (Spectre path). */
export function expectedLevelsForCity(
  city: number,
  hasPanda: boolean,
): Partial<Record<ItemId, number>> {
  const c = Math.max(1, Math.floor(city) || 1);
  const base: Partial<Record<ItemId, number>> =
    c <= 30
      ? {
          remote: 5,
          register: 5,
          mop: 5,
          checkbook: 5,
          tv: 5,
          pickaxe: 2,
          tipJar: 5,
        }
      : c <= 80
        ? {
            remote: 10,
            register: 10,
            mop: 10,
            checkbook: 10,
            tv: 8,
            pickaxe: 8,
          }
        : c <= 120
          ? {
              remote: 15,
              mop: 20,
              checkbook: 20,
              tv: 15,
              pickaxe: 14,
              tipJar: 10,
              register: 10,
            }
          : c <= 449
            ? {
                remote: 25,
                mop: 20,
                checkbook: 20,
                tv: 24,
                tipJar: 20,
                pickaxe: 14,
                piggy: 10,
                keyCard: 10,
                register: 10,
              }
            : {
                remote: 50,
                mop: 20,
                checkbook: 20,
                tv: 24,
                tipJar: 20,
                piggy: 45,
                keyCard: 30,
                pickaxe: 14,
                register: 10,
              };

  if (hasPanda) {
    const next = { ...base };
    delete next.register;
    return next;
  }
  return base;
}

export type ProgressGrade =
  | "ahead"
  | "onTrack"
  | "behind"
  | "farBehind"
  | "fresh";

export interface CityProgressReport {
  grade: ProgressGrade;
  label: string;
  summary: string;
  scorePct: number;
  met: number;
  total: number;
  aheadCount: number;
  behind: { id: ItemId; name: string; have: number; need: number; gap: number }[];
  ahead: { id: ItemId; name: string; have: number; need: number }[];
  unlockedExpected: boolean;
  lockedCount: number;
}

export function evaluateCityProgress(account: Account): CityProgressReport {
  const city = account.city || 1;
  const expected = expectedLevelsForCity(city, account.hasPanda);
  const keys = Object.keys(expected) as ItemId[];
  const behind: CityProgressReport["behind"] = [];
  const ahead: CityProgressReport["ahead"] = [];
  let met = 0;
  let scoreSum = 0;

  for (const id of keys) {
    const need = expected[id] ?? 0;
    const have = account.levels[id] ?? 0;
    scoreSum += Math.min(1, have / Math.max(1, need));
    if (have >= need) {
      met += 1;
      if (have > need) ahead.push({ id, name: ITEM_MAP[id].name, have, need });
    } else {
      behind.push({
        id,
        name: ITEM_MAP[id].name,
        have,
        need,
        gap: need - have,
      });
    }
  }

  behind.sort((a, b) => b.gap - a.gap);
  const total = keys.length || 1;
  const scorePct = Math.round((scoreSum / total) * 100);
  const lockedCount = VAULT_ITEMS.filter((i) => (account.levels[i.id] ?? 0) === 0)
    .length;
  const unlockedExpected = lockedCount === 0 || city < 15;

  let grade: ProgressGrade;
  let label: string;
  let summary: string;

  if (city <= 5 && met === 0 && lockedCount >= 10) {
    grade = "fresh";
    label = "Just starting";
    summary =
      "Too early to judge. Unlock vault cards first, then match Foundation targets.";
  } else if (scorePct >= 110 || (met === total && ahead.length >= 2)) {
    grade = "ahead";
    label = "Ahead of pace";
    summary = `For city ${city}, your vault is stronger than the Spectre handbook benchmarks. Keep gems on Remote / priority cards.`;
  } else if (scorePct >= 85 && behind.length <= 2) {
    grade = "onTrack";
    label = "On track";
    summary = `City ${city} progress looks healthy. Close the small gaps and stay on your plan.`;
  } else if (scorePct >= 55) {
    grade = "behind";
    label = "A bit behind";
    summary = `At city ${city} you are missing some expected levels. Catch up on the gaps below before pushing cities hard.`;
  } else {
    grade = "farBehind";
    label = "Behind for your city";
    summary = `City ${city} usually expects higher vault levels. Spend gems on unlocks and priority upgrades instead of racing cities.`;
  }

  if (!unlockedExpected && city >= 20 && lockedCount > 0) {
    if (grade === "ahead" || grade === "onTrack") grade = "behind";
    label = "Vault unlocks incomplete";
    summary = `You still have ${lockedCount} locked cards at city ${city}. Unlocking is usually better ROI than skipping ahead.`;
  }

  return {
    grade,
    label,
    summary,
    scorePct: Math.min(125, scorePct),
    met,
    total,
    aheadCount: ahead.length,
    behind: behind.slice(0, 6),
    ahead: ahead.slice(0, 4),
    unlockedExpected,
    lockedCount,
  };
}

export interface GemBudgetReport {
  stepsAffordable: number;
  gemsSpentOnThem: number;
  leftover: number;
  totalSteps: number;
  planCost: number;
  shortfall: number;
  citiesBehindPlan: number;
  pctCovered: number;
}

/** How far current gems go on the active plan vs remaining path. */
export function gemBudgetVsPlan(
  account: Account,
  plan: UpgradeStep[],
): GemBudgetReport {
  const gems = Math.max(0, account.gems);
  let spent = 0;
  let count = 0;
  for (const step of plan) {
    if (spent + step.cost > gems) break;
    spent += step.cost;
    count += 1;
  }
  const planCost = plan.reduce((s, step) => s + step.cost, 0);
  const shortfall = Math.max(0, planCost - gems);
  return {
    stepsAffordable: count,
    gemsSpentOnThem: spent,
    leftover: gems - spent,
    totalSteps: plan.length,
    planCost,
    shortfall,
    citiesBehindPlan: citiesNeededForGems(shortfall, AVG_GEMS_PER_CITY),
    pctCovered: planCost <= 0 ? 100 : Math.min(100, Math.round((gems / planCost) * 100)),
  };
}

export type { Playstyle };
