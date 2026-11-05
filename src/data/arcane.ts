import type { ArcaneVaultItem, ArcaneVaultId, Potion } from "../types";
import { SHEET_POTIONS } from "./sheet/potions";

/**
 * Potion Shop Arcane Vault — Spectre Handbook (patch 1.33.2).
 * Total scrolls to max: 2,685 (~17.9 events with pass).
 */
export const ARCANE_VAULT_ITEMS: ArcaneVaultItem[] = [
  {
    id: "potionBandolier",
    name: "Potion Bandolier",
    maxLevel: 3,
    description: "Adds potion slots.",
    effectLabel: "Potion slots",
    scrollCosts: [0, 0, 150, 150],
    effects: ["—", "3 slots", "4 slots", "5 slots"],
  },
  {
    id: "distiller",
    name: "Distiller",
    maxLevel: 30,
    description: "Potions last longer (minutes).",
    effectLabel: "Duration (min)",
    scrollCosts: [
      0, 5, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
      15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    ],
    effects: Array.from({ length: 31 }, (_, i) =>
      i === 0 ? "—" : `${(5 + i * 0.5).toFixed(1)} min`,
    ),
  },
  {
    id: "crystalCatalyst",
    name: "Crystal Catalyst",
    maxLevel: 5,
    description: "Increase max potion level.",
    effectLabel: "Max potion level",
    scrollCosts: [0, 15, 85, 85, 85, 85],
    effects: ["—", "6", "7", "8", "9", "10"],
  },
  {
    id: "arcaneLadle",
    name: "Arcane Ladle",
    maxLevel: 10,
    description: "Cooks more ingredients offline.",
    effectLabel: "Offline ingredients",
    scrollCosts: [0, 25, 40, 40, 40, 40, 40, 40, 40, 40, 40],
    effects: [
      "—",
      "×1.15",
      "×1.30",
      "×1.45",
      "×1.60",
      "×1.75",
      "×1.90",
      "×2.05",
      "×2.20",
      "×2.35",
      "×2.50",
    ],
  },
  {
    id: "alchemyScales",
    name: "Alchemy Scales",
    maxLevel: 15,
    description: "Requires fewer ingredients to brew.",
    effectLabel: "Ingredient discount",
    scrollCosts: [
      0, 35, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25,
    ],
    effects: [
      "—",
      "5%",
      "7%",
      "10%",
      "12%",
      "15%",
      "17%",
      "20%",
      "22%",
      "25%",
      "27%",
      "30%",
      "32%",
      "35%",
      "37%",
      "40%",
    ],
  },
  {
    id: "oakSapling",
    name: "Oak Sapling",
    maxLevel: 10,
    description: "More corks from rewards.",
    effectLabel: "Cork multiplier",
    scrollCosts: [0, 45, 40, 40, 40, 40, 40, 40, 40, 40, 40],
    effects: [
      "—",
      "×1.15",
      "×1.30",
      "×1.45",
      "×1.60",
      "×1.75",
      "×1.90",
      "×2.05",
      "×2.20",
      "×2.35",
      "×2.50",
    ],
  },
  {
    id: "funnel",
    name: "Funnel",
    maxLevel: 10,
    description: "Better effects for bottled potions.",
    effectLabel: "Bottled effect",
    scrollCosts: [0, 55, 40, 40, 40, 40, 40, 40, 40, 40, 40],
    effects: [
      "—",
      "23%",
      "26%",
      "29%",
      "32%",
      "35%",
      "38%",
      "41%",
      "44%",
      "47%",
      "50%",
    ],
  },
];

export const ARCANE_MAP = ARCANE_VAULT_ITEMS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<ArcaneVaultId, ArcaneVaultItem>,
);

export const EMPTY_ARCANE: Record<ArcaneVaultId, number> = {
  potionBandolier: 0,
  distiller: 0,
  crystalCatalyst: 0,
  arcaneLadle: 0,
  alchemyScales: 0,
  oakSapling: 0,
  funnel: 0,
};

export const TOTAL_SCROLLS_TO_MAX = ARCANE_VAULT_ITEMS.reduce(
  (sum, item) => sum + item.scrollCosts.reduce((a, b) => a + b, 0),
  0,
);

export const SCROLLS_PER_EVENT = 75;
export const SCROLLS_PER_EVENT_WITH_PASS = 150;

/** All potions with per-level effect and ingredient costs (Potions tab). */
export const POTIONS: Potion[] = SHEET_POTIONS;
