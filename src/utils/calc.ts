import {
  ITEM_MAP,
  KEYCARD_COSTS,
  LEVEL_COSTS,
  VAULT_ITEMS,
} from "../data/vault";
import type { Account, ItemId } from "../types";

export function upgradeCost(itemId: ItemId, toLevel: number): number {
  if (toLevel <= 1) return ITEM_MAP[itemId].unlockCost;
  if (itemId === "keyCard") return KEYCARD_COSTS[toLevel] ?? 0;
  return LEVEL_COSTS[toLevel] ?? 0;
}

export function costToMax(itemId: ItemId, fromLevel: number): number {
  const item = ITEM_MAP[itemId];
  let total = 0;
  const start = Math.max(fromLevel, 0);
  for (let lvl = start + 1; lvl <= item.maxLevel; lvl++) {
    total += upgradeCost(itemId, lvl);
  }
  return total;
}

export function costBetween(
  itemId: ItemId,
  fromLevel: number,
  toLevel: number,
): number {
  if (toLevel <= fromLevel) return 0;
  let total = 0;
  for (let lvl = fromLevel + 1; lvl <= toLevel; lvl++) {
    total += upgradeCost(itemId, lvl);
  }
  return total;
}

export function isUnlocked(level: number): boolean {
  return level > 0;
}

export function nextUnlockable(levels: Record<ItemId, number>): ItemId | null {
  const ordered = [...VAULT_ITEMS].sort((a, b) => a.unlockOrder - b.unlockOrder);
  for (const item of ordered) {
    if (levels[item.id] === 0) return item.id;
  }
  return null;
}

export function canUnlock(
  itemId: ItemId,
  levels: Record<ItemId, number>,
): boolean {
  const item = ITEM_MAP[itemId];
  if (levels[itemId] > 0) return false;
  if (item.unlockOrder === 1) return true;
  const prev = VAULT_ITEMS.find((v) => v.unlockOrder === item.unlockOrder - 1);
  return !!prev && levels[prev.id] > 0;
}

export function effectAt(itemId: ItemId, level: number): number | null {
  if (level <= 0) return null;
  return ITEM_MAP[itemId].effects[level - 1] ?? null;
}

export function formatEffect(itemId: ItemId, level: number): string {
  const item = ITEM_MAP[itemId];
  const value = effectAt(itemId, level);
  if (value == null) return "Locked";
  if (item.effectKind === "percent") return `${value}%`;
  if (item.effectKind === "multiplier") return `×${trimNum(value)}`;
  return formatCash(value);
}

export function trimNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export function formatCash(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${trimNum(n / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `${trimNum(n / 1_000_000)}M`;
  if (abs >= 1_000) return `${trimNum(n / 1_000)}K`;
  return String(n);
}

export function formatGems(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function vaultProgress(levels: Record<ItemId, number>): {
  unlocked: number;
  totalItems: number;
  levelsOwned: number;
  levelsMax: number;
  percent: number;
} {
  let levelsOwned = 0;
  let levelsMax = 0;
  let unlocked = 0;
  for (const item of VAULT_ITEMS) {
    levelsOwned += levels[item.id];
    levelsMax += item.maxLevel;
    if (levels[item.id] > 0) unlocked += 1;
  }
  return {
    unlocked,
    totalItems: VAULT_ITEMS.length,
    levelsOwned,
    levelsMax,
    percent: levelsMax === 0 ? 0 : (levelsOwned / levelsMax) * 100,
  };
}

export function remainingUnlockCost(levels: Record<ItemId, number>): number {
  return VAULT_ITEMS.reduce((sum, item) => {
    return sum + (levels[item.id] > 0 ? 0 : item.unlockCost);
  }, 0);
}

export function remainingMaxCost(levels: Record<ItemId, number>): number {
  return VAULT_ITEMS.reduce((sum, item) => sum + costToMax(item.id, levels[item.id]), 0);
}

export function remainingPriorityCost(levels: Record<ItemId, number>): number {
  return VAULT_ITEMS.filter((item) => item.priority === "upgrade").reduce(
    (sum, item) => sum + costToMax(item.id, levels[item.id]),
    0,
  );
}

export function itemBreakdown(levels: Record<ItemId, number>) {
  return VAULT_ITEMS.map((item) => {
    const level = levels[item.id];
    const next = level < item.maxLevel ? upgradeCost(item.id, level + 1) : 0;
    const toMax = costToMax(item.id, level);
    return {
      item,
      level,
      next,
      toMax,
      currentEffect: formatEffect(item.id, level),
      nextEffect:
        level < item.maxLevel ? formatEffect(item.id, level + 1) : "MAX",
      maxed: level >= item.maxLevel,
      locked: level === 0,
    };
  });
}

export function spentSoFar(levels: Record<ItemId, number>): number {
  return VAULT_ITEMS.reduce((sum, item) => {
    const level = levels[item.id];
    if (level <= 0) return sum;
    return sum + costBetween(item.id, 0, level);
  }, 0);
}

export function recommendedCityPhase(city: number): string {
  if (city <= 30) return "foundation";
  if (city <= 80) return "core";
  if (city <= 120) return "mid";
  if (city <= 449) return "late";
  return "endgame";
}

export function cloneLevels(levels: Record<ItemId, number>): Record<ItemId, number> {
  return { ...levels };
}

export function applyStep(
  account: Account,
  itemId: ItemId,
  toLevel: number,
  spendGems: boolean,
): Account {
  const from = account.levels[itemId];
  const cost = costBetween(itemId, from, toLevel);
  return {
    ...account,
    gems: spendGems ? Math.max(0, account.gems - cost) : account.gems,
    levels: { ...account.levels, [itemId]: toLevel },
  };
}
