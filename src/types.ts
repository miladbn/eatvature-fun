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

export type GearSlot = "head" | "body" | "hand";
export type GearRarity = "common" | "rare" | "epic" | "legendary" | "ultimate" | "mythic";

export interface GearItem {
  id: string;
  name: string;
  slot: GearSlot;
  rarity: GearRarity;
  profitPct: number;
  walkSpeed: number;
  instantFood: number;
  perfectFood: number;
  allWorker: boolean;
  description: string;
}

export interface EquippedGear {
  head: string;
  body: string;
  hand1: string;
  hand2: string;
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
  | "alchemyScales"
  | "bottlingStation"
  | "elixirEngine";

export interface ArcaneVaultItem {
  id: ArcaneVaultId;
  name: string;
  maxLevel: number;
  description: string;
  effectLabel: string;
  scrollCosts: number[];
  effects: string[];
}

export interface BuildReco {
  cityRange: string;
  label: string;
  head: string;
  body: string;
  hand: string;
  notes: string;
}

export interface ClubLevel {
  level: number;
  xpRequired: number;
  cumulativeXp: number;
  rewards: string;
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
