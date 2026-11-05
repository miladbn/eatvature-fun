import type { Pet, PetLevelRow, PetRarity } from "../types";
import {
  SHEET_PET_DISH_NOTES,
  SHEET_PET_FOOD_CONVERSION,
  SHEET_PET_HATCH,
  SHEET_PET_LEVELS,
  SHEET_PET_TIPS,
} from "./sheet/pets";

export const PETS: Pet[] = [
  {
    id: "chicken",
    name: "Chicken",
    rarity: "common",
    ability: "No special ability",
    deliveryProfit: 0,
    orderInstant: false,
    tipCollect: false,
    goldenChance: 0,
    perfectBonus: 0,
    divineBonus: 0,
    greedyChance: 0,
    allProfitPerWorker: 0,
  },
  {
    id: "cat",
    name: "Cat",
    rarity: "rare",
    ability: "Collects tips every 30 seconds",
    deliveryProfit: 0,
    orderInstant: false,
    tipCollect: true,
    goldenChance: 0,
    perfectBonus: 0,
    divineBonus: 0,
    greedyChance: 0,
    allProfitPerWorker: 0,
  },
  {
    id: "dog",
    name: "Dog",
    rarity: "rare",
    ability: "Collects tips every 30 seconds",
    deliveryProfit: 0,
    orderInstant: false,
    tipCollect: true,
    goldenChance: 0,
    perfectBonus: 0,
    divineBonus: 0,
    greedyChance: 0,
    allProfitPerWorker: 0,
  },
  {
    id: "darkHorse",
    name: "Dark Horse",
    rarity: "epic",
    ability: "Perfect Food worth +100% more",
    deliveryProfit: 0,
    orderInstant: false,
    tipCollect: false,
    goldenChance: 0,
    perfectBonus: 100,
    divineBonus: 0,
    greedyChance: 0,
    allProfitPerWorker: 0,
  },
  {
    id: "tortoise",
    name: "Tortoise",
    rarity: "epic",
    ability: "Perfect Food worth +100% more",
    deliveryProfit: 0,
    orderInstant: false,
    tipCollect: false,
    goldenChance: 0,
    perfectBonus: 100,
    divineBonus: 0,
    greedyChance: 0,
    allProfitPerWorker: 0,
  },
  {
    id: "penguin",
    name: "Penguin",
    rarity: "epic",
    ability: "Delivers food (+700% profit)",
    deliveryProfit: 700,
    orderInstant: false,
    tipCollect: false,
    goldenChance: 0,
    perfectBonus: 0,
    divineBonus: 0,
    greedyChance: 0,
    allProfitPerWorker: 0,
  },
  {
    id: "turtle",
    name: "Turtle",
    rarity: "epic",
    ability: "Delivers food (+700% profit)",
    deliveryProfit: 700,
    orderInstant: false,
    tipCollect: false,
    goldenChance: 0,
    perfectBonus: 0,
    divineBonus: 0,
    greedyChance: 0,
    allProfitPerWorker: 0,
  },
  {
    id: "pony",
    name: "Pony",
    rarity: "epic",
    ability: "Delivers food (+700% profit)",
    deliveryProfit: 700,
    orderInstant: false,
    tipCollect: false,
    goldenChance: 0,
    perfectBonus: 0,
    divineBonus: 0,
    greedyChance: 0,
    allProfitPerWorker: 0,
  },
  {
    id: "panda",
    name: "Panda",
    rarity: "legendary",
    ability: "Instant orders + delivers food (+1000% profit)",
    deliveryProfit: 1000,
    orderInstant: true,
    tipCollect: false,
    goldenChance: 0,
    perfectBonus: 0,
    divineBonus: 0,
    greedyChance: 0,
    allProfitPerWorker: 0,
  },
  {
    id: "vroomba",
    name: "Vroomba",
    rarity: "legendary",
    ability: "+5% All Profit per hired worker + tips every 15s",
    deliveryProfit: 0,
    orderInstant: false,
    tipCollect: true,
    goldenChance: 0,
    perfectBonus: 0,
    divineBonus: 0,
    greedyChance: 0,
    allProfitPerWorker: 5,
  },
  {
    id: "babyKraken",
    name: "Baby Kraken",
    rarity: "ultimate",
    ability: "+15% golden customer + Divine Food +40%",
    deliveryProfit: 0,
    orderInstant: false,
    tipCollect: false,
    goldenChance: 15,
    perfectBonus: 0,
    divineBonus: 40,
    greedyChance: 0,
    allProfitPerWorker: 0,
  },
  {
    id: "redPanda",
    name: "Red Panda",
    rarity: "ultimate",
    ability: "Delivers food (+1600% profit) + Divine Food +20%",
    deliveryProfit: 1600,
    orderInstant: false,
    tipCollect: false,
    goldenChance: 0,
    perfectBonus: 0,
    divineBonus: 20,
    greedyChance: 0,
    allProfitPerWorker: 0,
  },
  {
    id: "mole",
    name: "Mole",
    rarity: "ultimate",
    ability: "+20% golden customer + tips every 15s",
    deliveryProfit: 0,
    orderInstant: false,
    tipCollect: true,
    goldenChance: 20,
    perfectBonus: 0,
    divineBonus: 0,
    greedyChance: 0,
    allProfitPerWorker: 0,
  },
  {
    id: "babyDragon",
    name: "Baby Dragon",
    rarity: "ultimate",
    ability: "Instant orders + +20% greedy customer",
    deliveryProfit: 0,
    orderInstant: true,
    tipCollect: false,
    goldenChance: 0,
    perfectBonus: 0,
    divineBonus: 0,
    greedyChance: 20,
    allProfitPerWorker: 0,
  },
];


export const PET_MAP: Record<string, Pet> = Object.fromEntries(
  PETS.map((p) => [p.id, p]),
);

export const PET_RARITIES: PetRarity[] = ["common", "rare", "epic", "legendary", "ultimate"];

/** Level curve per pet rarity (All Profit %, pet food per level), levels 1–50. */
export const PET_LEVELS: Record<PetRarity, PetLevelRow[]> = SHEET_PET_LEVELS;
export const PET_MAX_LEVEL = 50;

/** Pet food to hatch / merge into each rarity (egg cost). */
export const PET_HATCH = SHEET_PET_HATCH;
export const PET_TIPS = SHEET_PET_TIPS;
/** Average boxes / cities needed to collect a given amount of pet food. */
export const PET_FOOD_CONVERSION = SHEET_PET_FOOD_CONVERSION;
/** Dish value multipliers per pet type (handbook Pets Guide). */
export const PET_DISH_NOTES = SHEET_PET_DISH_NOTES;

export function petLevelRow(rarity: PetRarity, level: number): PetLevelRow | undefined {
  return PET_LEVELS[rarity]?.find((r) => r.level === level);
}

/** Pet food to level a pet of this rarity from `from` to `to` (1–50). */
export function petFoodBetween(rarity: PetRarity, from: number, to: number): number {
  const a = petLevelRow(rarity, Math.max(1, Math.min(PET_MAX_LEVEL, Math.floor(from))));
  const b = petLevelRow(rarity, Math.max(1, Math.min(PET_MAX_LEVEL, Math.floor(to))));
  if (!a || !b) return 0;
  return Math.max(0, b.total - a.total);
}

/** Pet food to take a pet of each rarity from level 1 to 50. */
export const PET_FOOD_TO_MAX: Record<PetRarity, number> = Object.fromEntries(
  PET_RARITIES.map((r) => [r, petFoodBetween(r, 1, PET_MAX_LEVEL)]),
) as Record<PetRarity, number>;

/** Pet pairings from the handbook's Pets Guide. */
export const BEST_PET_COMBOS: { stage: string; pets: string[][]; notes: string }[] = [
  {
    stage: "Before city 60 · 1 slot",
    pets: [["panda"], ["penguin"], ["pony"], ["turtle"]],
    notes: "Delivery pet is best to have.",
  },
  {
    stage: "Before mythic gear",
    pets: [
      ["panda", "darkHorse"],
      ["panda", "tortoise"],
    ],
    notes: "Delivery pet + perfect pet are best to have. Either combo works.",
  },
  {
    stage: "Mythic meta",
    pets: [
      ["redPanda", "babyKraken"],
      ["redPanda", "panda"],
      ["panda", "panda"],
    ],
    notes:
      "Any combo listed here works well with double cleaver or mixed mythic tools.",
  },
];

/** Egg merging ratios (Pets Guide). */
export const EGG_MERGE: { from: PetRarity; count: number; to: PetRarity }[] = [
  { from: "common", count: 6, to: "rare" },
  { from: "rare", count: 6, to: "epic" },
  { from: "epic", count: 10, to: "legendary" },
  { from: "legendary", count: 5, to: "ultimate" },
];
