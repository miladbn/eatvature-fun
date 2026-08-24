import type { ArcaneVaultItem, ArcaneVaultId } from "../types";

export const ARCANE_VAULT_ITEMS: ArcaneVaultItem[] = [
  {
    id: "potionBandolier",
    name: "Potion Bandolier",
    maxLevel: 5,
    description: "Unlocks additional potion slots for the event.",
    effectLabel: "Potion slots",
    scrollCosts: [0, 15, 150, 150, 150],
    effects: ["3 slots", "4 slots", "5 slots", "6 slots", "7 slots"],
  },
  {
    id: "distiller",
    name: "Distiller",
    maxLevel: 6,
    description: "Increases potion brewing speed.",
    effectLabel: "Brew speed",
    scrollCosts: [0, 15, 30, 60, 85, 85],
    effects: ["×1.0", "×1.2", "×1.4", "×1.6", "×1.8", "×2.0"],
  },
  {
    id: "crystalCatalyst",
    name: "Crystal Catalyst",
    maxLevel: 6,
    description: "Increases potion effect duration.",
    effectLabel: "Duration",
    scrollCosts: [0, 15, 30, 60, 85, 85],
    effects: ["×1.0", "×1.2", "×1.4", "×1.6", "×1.8", "×2.0"],
  },
  {
    id: "alchemyScales",
    name: "Alchemy Scales",
    maxLevel: 6,
    description: "Increases ingredient yield from customers.",
    effectLabel: "Ingredient yield",
    scrollCosts: [0, 15, 30, 60, 85, 85],
    effects: ["×1.0", "×1.2", "×1.4", "×1.6", "×1.8", "×2.0"],
  },
  {
    id: "bottlingStation",
    name: "Bottling Station",
    maxLevel: 6,
    description: "Bottled potions retain more effect in main game.",
    effectLabel: "Bottled effect %",
    scrollCosts: [0, 15, 30, 60, 85, 85],
    effects: ["23%", "30%", "37%", "44%", "51%", "58%"],
  },
  {
    id: "elixirEngine",
    name: "Elixir Engine",
    maxLevel: 6,
    description: "Increases potion potency in the event.",
    effectLabel: "Potion power",
    scrollCosts: [0, 15, 30, 60, 85, 85],
    effects: ["×1.0", "×1.15", "×1.3", "×1.45", "×1.6", "×1.75"],
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
  alchemyScales: 0,
  bottlingStation: 0,
  elixirEngine: 0,
};

export const TOTAL_SCROLLS_TO_MAX = ARCANE_VAULT_ITEMS.reduce(
  (sum, item) => sum + item.scrollCosts.reduce((a, b) => a + b, 0),
  0,
);

export const SCROLLS_PER_EVENT = 75;
export const SCROLLS_PER_EVENT_WITH_PASS = 150;

export const POTIONS: { name: string; effect: string; ingredients: string[] }[] = [
  { name: "Swift Serum", effect: "Walk speed +50%", ingredients: ["Moonpetal ×3", "Starbloom ×2"] },
  { name: "Instant Infusion", effect: "Instant food +30%", ingredients: ["Moonpetal ×2", "Shadowroot ×3"] },
  { name: "Double Draught", effect: "Double food +20%", ingredients: ["Starbloom ×3", "Shadowroot ×2"] },
  { name: "Golden Gulp", effect: "Golden customer +15%", ingredients: ["Moonpetal ×2", "Starbloom ×2", "Shadowroot ×1"] },
  { name: "Divine Decoction", effect: "Divine food +25%", ingredients: ["Moonpetal ×1", "Starbloom ×3", "Shadowroot ×2"] },
  { name: "Profit Potion", effect: "All profit +40%", ingredients: ["Moonpetal ×3", "Starbloom ×1", "Shadowroot ×3"] },
];
