import type {
  Blueprint,
  BuildReco,
  ClubLevel,
  EquippedGear,
  GearItem,
  GearRarity,
  GearSlot,
  GearStats,
} from "../types";
import { SHEET_ITEMS } from "./sheet/items";
import { SHEET_BUILDS } from "./sheet/builds";
import { SHEET_BLUEPRINTS } from "./sheet/blueprints";
import {
  SHEET_CLUB_INFO,
  SHEET_CLUB_LEVELS,
  SHEET_CLUB_SALVAGE,
  SHEET_CLUB_TOTAL_REWARDS,
  SHEET_CLUB_XP_PER_PLAYER,
} from "./sheet/club";

export const RARITY_ORDER: GearRarity[] = [
  "common",
  "rare",
  "epic",
  "legendary",
  "ultimate",
  "mythic",
];

export const RARITY_COLORS: Record<GearRarity, string> = {
  common: "#9ca3af",
  rare: "#22c55e",
  epic: "#a855f7",
  legendary: "#f59e0b",
  ultimate: "#ef4444",
  mythic: "#3b82f6",
};

export const SLOT_LABELS: Record<GearSlot, string> = {
  head: "Head",
  body: "Body",
  tool: "Tool",
  ring: "Ring",
  necklace: "Necklace",
};

/** Every equippable item from the handbook's Items tab. */
export const GEAR_ITEMS: GearItem[] = SHEET_ITEMS;

export const GEAR_MAP: Record<string, GearItem> = Object.fromEntries(
  GEAR_ITEMS.map((g) => [g.id, g]),
);

/** Equipment slots in the Gear tab, mapped to the item slot they accept. */
export const EQUIP_SLOTS: { key: keyof EquippedGear; label: string; slot: GearSlot }[] = [
  { key: "head", label: "Head", slot: "head" },
  { key: "body", label: "Body", slot: "body" },
  { key: "hand1", label: "Tool 1", slot: "tool" },
  { key: "hand2", label: "Tool 2", slot: "tool" },
  { key: "ring", label: "Ring", slot: "ring" },
  { key: "necklace", label: "Necklace", slot: "necklace" },
];

export const EMPTY_GEAR: EquippedGear = {
  head: "",
  body: "",
  hand1: "",
  hand2: "",
  ring: "",
  necklace: "",
};

/** Gear ids saved by earlier versions of the app → current catalog ids. */
export const LEGACY_GEAR_IDS: Record<string, string> = {
  purpleCap: "purpleCapHead",
  irishHat: "irishHatHead",
  tallBlackHat: "tallBlackHatHead",
  elderBeard: "elderBeardHead",
  robotHead: "robotHeadHead",
  sharkHead: "sharkHead",
  royalCrown: "royalCrownHead",
  torchHelmet: "torchHelmetHead",
  chefsHelmet: "chefSHelmetHead",
  kimonoBlackBelt: "kimonoBlackBeltBody",
  italianChef: "italianChefBody",
  blackApron: "blackApronBody",
  tankTop: "tankTopBody",
  robotSuit: "robotSuitBody",
  sharkBody: "sharkBody",
  royalRobe: "royalRobeBody",
  toolBelt: "toolBeltBody",
  armouredApron: "armouredApronBody",
  pepperMill: "pepperMillTool",
  chopsticks: "chopsticksTool",
  mixer: "mixerTool",
  cookBook: "cookBookTool",
  laserGun: "laserGunTool",
  royalSceptre: "royalSceptreTool",
  anchor: "anchorTool",
  pickaxeHand: "pickaxeTool",
  warriorsCleaver: "warriorSCleaverTool",
  warriorsTenderiser: "warriorSTenderiserTool",
};

export const STAT_LABELS: Record<keyof GearStats, string> = {
  instantFood: "Instant food",
  perfectFood: "Perfect food",
  doubleFood: "Double food",
  divineFood: "Divine food",
  anotherOrder: "Another order",
  fasterFood: "Faster food",
  fasterWalk: "Faster walk",
};

/** Display order: the handbook's stat priority (instant → perfect → …). */
export const STAT_ORDER: (keyof GearStats)[] = [
  "instantFood",
  "perfectFood",
  "doubleFood",
  "divineFood",
  "anotherOrder",
  "fasterFood",
  "fasterWalk",
];

export const EMPTY_STATS: GearStats = {
  fasterFood: 0,
  fasterWalk: 0,
  perfectFood: 0,
  instantFood: 0,
  doubleFood: 0,
  anotherOrder: 0,
  divineFood: 0,
};

/** Sum the character-only and all-worker bonuses of the equipped items. */
export function gearTotals(gear: EquippedGear): {
  self: GearStats;
  aw: GearStats;
  apMin: number;
  apMax: number;
} {
  const self = { ...EMPTY_STATS };
  const aw = { ...EMPTY_STATS };
  let apMin = 0;
  let apMax = 0;
  for (const { key } of EQUIP_SLOTS) {
    const item = GEAR_MAP[gear[key]];
    if (!item) continue;
    apMin += item.apMin;
    apMax += item.apMax;
    for (const k of STAT_ORDER) {
      self[k] += item.self[k];
      aw[k] += item.aw[k];
    }
  }
  return { self, aw, apMin, apMax };
}

/** City range each handbook build section applies to. */
export const PHASE_RANGES: Record<string, { min: number; max: number; label: string }> = {
  "Before City 60": { min: 1, max: 59, label: "Cities 1 – 59" },
  "After City 60": { min: 60, max: Infinity, label: "City 60+" },
  "Solo Builds": { min: 60, max: Infinity, label: "City 60+ · solo" },
  "Mythic Builds": { min: 60, max: Infinity, label: "Endgame · mythic gear" },
};

export const BEST_BUILDS: BuildReco[] = SHEET_BUILDS;

export function buildInRange(build: BuildReco, city: number): boolean {
  const r = PHASE_RANGES[build.phase];
  return !!r && city >= r.min && city <= r.max;
}

export const CLUB_LEVELS: ClubLevel[] = SHEET_CLUB_LEVELS;
export const CLUB_TOTAL_REWARDS = SHEET_CLUB_TOTAL_REWARDS;
export const CLUB_INFO = SHEET_CLUB_INFO;
export const CLUB_SALVAGE = SHEET_CLUB_SALVAGE;
export const CLUB_XP_PER_PLAYER = SHEET_CLUB_XP_PER_PLAYER;
export const CLUB_MAX_XP = CLUB_LEVELS[CLUB_LEVELS.length - 1]?.totalXp ?? 0;

/** Salvage XP per item / egg (handbook Clothing & Accessories legend). */
export const SALVAGE_XP: { name: string; xp: number; rarity: GearRarity }[] = [
  { name: "Common", xp: 4, rarity: "common" },
  { name: "Rare", xp: 9, rarity: "rare" },
  { name: "Epic", xp: 22, rarity: "epic" },
  { name: "Legendary BP", xp: 26, rarity: "legendary" },
  { name: "Legendary", xp: 52, rarity: "legendary" },
  { name: "Ultimate BP", xp: 61, rarity: "ultimate" },
  { name: "Ultimate", xp: 122, rarity: "ultimate" },
  { name: "Mythic BP", xp: 144, rarity: "mythic" },
  { name: "Mythic", xp: 287, rarity: "mythic" },
  { name: "Common Egg", xp: 25, rarity: "common" },
  { name: "Rare Egg", xp: 50, rarity: "rare" },
  { name: "Epic Egg", xp: 150, rarity: "epic" },
  { name: "Legendary Egg", xp: 425, rarity: "legendary" },
  { name: "Ultimate Egg", xp: 1000, rarity: "ultimate" },
];

export const BLUEPRINT_RECIPES: Blueprint[] = SHEET_BLUEPRINTS;
