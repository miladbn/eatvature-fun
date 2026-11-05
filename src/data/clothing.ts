import { SHEET_CLOTHING_XP } from "./sheet/clothing";

export type ClothingRarity =
  | "common"
  | "rare"
  | "epic"
  | "legendary"
  | "ultimate"
  | "mythic";

export interface ClothingLevel {
  level: number;
  profitPct: number;
  apPct: number | null;
  xpToNext: number;
  totalXp: number;
}

/** Clothing / accessory XP and AP curves (levels 1–50) from the Spectre Handbook. */
export const CLOTHING_XP: Record<ClothingRarity, ClothingLevel[]> = SHEET_CLOTHING_XP;

export const CLOTHING_TIPS = [
  "Commons are the cheapest XP source for leveling higher rarity gear.",
  "Salvaging a leveled item refunds XP with no loss — forging transfers XP.",
  "Rings and necklaces use the AP% column; head, body, and tools use All Profit %.",
  "Keep 6 rare and 4 epic of the same items ready for legendary forging.",
];

