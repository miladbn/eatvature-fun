export type ItemId =
  | "tipJar"
  | "remote"
  | "pickaxe"
  | "hourglass"
  | "register"
  | "tv"
  | "piggy"
  | "knife"
  | "mop"
  | "suitcase"
  | "checkbook"
  | "keyCard";

export type Priority = "upgrade" | "asNeeded" | "avoid";
export type Playstyle = "spectre" | "speed" | "ads" | "complete";
export type EffectKind = "percent" | "multiplier" | "cash";

export interface VaultItem {
  id: ItemId;
  name: string;
  shortName: string;
  unlockCost: number;
  maxLevel: number;
  priority: Priority;
  effectKind: EffectKind;
  effectPrefix: string;
  effectSuffix: string;
  effectLabel: string;
  description: string;
  effects: number[];
  accent: string;
  unlockOrder: number;
}

/** Item slots as named in the handbook's Items tab. */
export type GearSlot = "head" | "body" | "tool" | "ring" | "necklace";
export type GearRarity = "common" | "rare" | "epic" | "legendary" | "ultimate" | "mythic";

/** Percentage bonuses an item gives (e.g. instantFood 65 = +65% chance). */
export interface GearStats {
  fasterFood: number;
  fasterWalk: number;
  perfectFood: number;
  instantFood: number;
  doubleFood: number;
  anotherOrder: number;
  divineFood: number;
}

export interface GearItem {
  id: string;
  name: string;
  slot: GearSlot;
  rarity: GearRarity;
  event: string;
  apMin: number;
  apMax: number;
  /** Bonuses for your character only. */
  self: GearStats;
  /** Bonuses for all workers (your character included). */
  aw: GearStats;
}

export interface EquippedGear {
  head: string;
  body: string;
  /** Tool slots keep their original storage keys. */
  hand1: string;
  hand2: string;
  ring: string;
  necklace: string;
}

export interface BlueprintIngredient {
  count: number;
  name: string;
  itemId: string | null;
}

export interface Blueprint {
  result: string;
  resultId: string | null;
  rarity: GearRarity;
  slot: GearSlot | "";
  ingredients: BlueprintIngredient[];
  /** Stat lines as written in the handbook. */
  stats: string[];
  /** Where the blueprint drops. */
  source: string;
  /** Legacy items can no longer be forged. */
  legacy: boolean;
}

export interface Potion {
  id: string;
  name: string;
  effect: string;
  ingredients: string[];
  levels: {
    level: number;
    /** % gained at this level */
    gain: number;
    /** cumulative % */
    total: number;
    /** ingredient cost with Alchemy Scales maxed */
    cost: number[];
    /** ingredient cost without Alchemy Scales */
    costNoScales?: number[];
  }[];
  totalCost?: number[];
  totalCostNoScales?: number[];
}

export interface PetLevelRow {
  level: number;
  profitPct: number;
  foodToNext: number;
  /** Total pet food including hatching / merging into this rarity. */
  totalWithHatch: number;
  /** Pet food spent from level 1. */
  total: number;
}

export type PetRarity = "common" | "rare" | "epic" | "legendary" | "ultimate";

export interface Pet {
  id: string;
  name: string;
  rarity: PetRarity;
  ability: string;
  deliveryProfit: number;
  orderInstant: boolean;
  tipCollect: boolean;
  goldenChance: number;
  perfectBonus: number;
  divineBonus: number;
  greedyChance: number;
  allProfitPerWorker: number;
}

export interface OwnedPet {
  petId: string;
  level: number;
  rarity: PetRarity;
}

export type ArcaneVaultId =
  | "potionBandolier"
  | "distiller"
  | "crystalCatalyst"
  | "arcaneLadle"
  | "alchemyScales"
  | "oakSapling"
  | "funnel";

export interface ArcaneVaultItem {
  id: ArcaneVaultId;
  name: string;
  maxLevel: number;
  description: string;
  effectLabel: string;
  scrollCosts: number[];
  effects: string[];
}

export interface BuildSlot {
  /** Column label from the handbook: Head, Body, Tool 1, Ring, ... */
  label: string;
  slot: GearSlot;
  name: string;
  itemId: string | null;
  /** Event the item comes from, if any. */
  source: string;
  stats: string[];
}

export interface BuildReco {
  id: string;
  label: string;
  kind: string;
  /** Handbook section: Before City 60, After City 60, Solo Builds, Mythic Builds */
  phase: string;
  slots: BuildSlot[];
  totals: { solo: string[]; aw: string[] };
}

export interface ClubLevel {
  level: number;
  xpNeeded: number;
  totalXp: number;
  reward: string;
}

export interface Account {
  name: string;
  city: number;
  gems: number;
  scrolls: number;
  hasPanda: boolean;
  playstyle: Playstyle;
  levels: Record<ItemId, number>;
  arcaneLevels: Record<ArcaneVaultId, number>;
  gear: EquippedGear;
  pets: OwnedPet[];
  clubLevel: number;
  clubXp: number;
  citiesCompleted: number;
  totalGemsEarned: number;
  /** Free-form player notes */
  notes: string;
  /** Blueprint piece counts keyed by ingredient/item name */
  inventory: Record<string, number>;
}

export interface UpgradeStep {
  id: string;
  kind: "unlock" | "upgrade";
  itemId: ItemId;
  from: number;
  to: number;
  cost: number;
  phaseId: string;
  phaseName: string;
  reason: string;
  newEffect: number;
}

export interface PhaseInfo {
  id: string;
  name: string;
  blurb: string;
  cityRange: string;
}
