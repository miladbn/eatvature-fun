import type { Account, ItemId, PhaseInfo, Playstyle, VaultItem } from "../types";

export const LEVEL_COSTS: number[] = [
  0, 0, 10, 20, 40, 60, 90, 120, 160, 200, 250, 300, 360, 420, 490, 560, 640,
  720, 810, 900, 1000, 1110, 1210, 1320, 1440, 1560, 1690, 1820, 1960, 2100,
  2250, 2400, 2560, 2720, 2890, 3060, 3240, 3420, 3610, 3800, 4000, 4200, 4410,
  4620, 4840, 5060, 5290, 5520, 5760, 6000, 6250,
];

export const KEYCARD_COSTS: number[] = [
  0, 1000, 550, 600, 700, 800, 950, 1110, 1300, 1500, 1750, 2000, 2300, 2600,
  2950, 3300, 3700, 4100, 4550, 5000, 5500, 6000, 6550, 7100, 7700, 8310, 8950,
  9600, 10300, 11000, 11800,
];

export const GEMS_PER_CITY = 184;
export const TOTAL_VAULT_GEMS = 536310;

function seq(start: number, step: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) =>
    Number((start + step * i).toFixed(2)),
  );
}

export const VAULT_ITEMS: VaultItem[] = [
  {
    id: "tipJar",
    name: "Tip Jar",
    shortName: "Jar",
    unlockCost: 0,
    maxLevel: 20,
    priority: "asNeeded",
    effectKind: "percent",
    effectPrefix: "",
    effectSuffix: "% tip chance",
    effectLabel: "Customers leave a tip",
    description:
      "Chance customers leave a tip after ordering. Becomes worth it after city 450 when tips scale.",
    effects: seq(12, 2, 20),
    accent: "#f5b942",
    unlockOrder: 1,
  },
  {
    id: "remote",
    name: "Remote",
    shortName: "Remote",
    unlockCost: 30,
    maxLevel: 50,
    priority: "upgrade",
    effectKind: "multiplier",
    effectPrefix: "×",
    effectSuffix: " ad boost",
    effectLabel: "Ad boosts are worth more",
    description:
      "Best gem value in the game. Multiplies ad-boost income. Push this harder than anything else.",
    effects: seq(1.1, 0.1, 50),
    accent: "#ff5a5a",
    unlockOrder: 2,
  },
  {
    id: "pickaxe",
    name: "Pickaxe",
    shortName: "Pick",
    unlockCost: 60,
    maxLevel: 14,
    priority: "upgrade",
    effectKind: "percent",
    effectPrefix: "",
    effectSuffix: "% gem investor",
    effectLabel: "Investor offers gems",
    description:
      "Chance the investor offers gems instead of cash. Huge early ROI at level 2, useful to ~8, then it falls off.",
    effects: [10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 50],
    accent: "#c9844a",
    unlockOrder: 3,
  },
  {
    id: "hourglass",
    name: "Hourglass",
    shortName: "Hour",
    unlockCost: 90,
    maxLevel: 29,
    priority: "avoid",
    effectKind: "multiplier",
    effectPrefix: "×",
    effectSuffix: " offline time",
    effectLabel: "Max offline earnings last longer",
    description:
      "Extends offline earning time. Weak compared with active-play cards — leave it for last.",
    effects: Array.from({ length: 29 }, (_, i) => Math.floor(((4 + i) / 3) * 100) / 100),
    accent: "#a78bfa",
    unlockOrder: 4,
  },
  {
    id: "register",
    name: "Register",
    shortName: "Reg",
    unlockCost: 120,
    maxLevel: 10,
    priority: "upgrade",
    effectKind: "multiplier",
    effectPrefix: "×",
    effectSuffix: " order speed",
    effectLabel: "Customers order faster",
    description:
      "Customers order faster. Cheap to max. Skip upgrades if you own the Legendary Panda (instant orders).",
    effects: seq(2.4, 0.4, 10),
    accent: "#34d399",
    unlockOrder: 5,
  },
  {
    id: "tv",
    name: "TV",
    shortName: "TV",
    unlockCost: 150,
    maxLevel: 24,
    priority: "asNeeded",
    effectKind: "multiplier",
    effectPrefix: "×",
    effectSuffix: " ad duration",
    effectLabel: "Ad boost duration is longer",
    description:
      "Pairs with Remote. Longer boosts mean fewer ads for the same uptime. Upgrade as needed.",
    effects: seq(1.1, 0.3, 24),
    accent: "#60a5fa",
    unlockOrder: 6,
  },
  {
    id: "piggy",
    name: "Piggy Bank",
    shortName: "Piggy",
    unlockCost: 180,
    maxLevel: 45,
    priority: "asNeeded",
    effectKind: "multiplier",
    effectPrefix: "×",
    effectSuffix: " tip value",
    effectLabel: "Tips are worth more",
    description:
      "Multiplies tip value. Situational until late game when Tip Jar is also high.",
    effects: seq(1.2, 0.2, 45),
    accent: "#f472b6",
    unlockOrder: 7,
  },
  {
    id: "knife",
    name: "Knife",
    shortName: "Knife",
    unlockCost: 210,
    maxLevel: 45,
    priority: "avoid",
    effectKind: "multiplier",
    effectPrefix: "×",
    effectSuffix: " offline cash",
    effectLabel: "Offline earnings are worth more",
    description:
      "Boosts offline cash. Fine if you sleep a lot, otherwise a gem sink. Avoid until the vault is otherwise done.",
    effects: seq(1.2, 0.2, 45),
    accent: "#94a3b8",
    unlockOrder: 8,
  },
  {
    id: "mop",
    name: "Mop",
    shortName: "Mop",
    unlockCost: 240,
    maxLevel: 20,
    priority: "upgrade",
    effectKind: "multiplier",
    effectPrefix: "×",
    effectSuffix: " walk speed",
    effectLabel: "Customers walk faster",
    description:
      "Customers walk faster. Permanent speed for every restaurant. Cheap, high impact — max it.",
    effects: seq(1.05, 0.05, 20),
    accent: "#2dd4bf",
    unlockOrder: 9,
  },
  {
    id: "suitcase",
    name: "Suitcase",
    shortName: "Case",
    unlockCost: 270,
    maxLevel: 45,
    priority: "avoid",
    effectKind: "multiplier",
    effectPrefix: "×",
    effectSuffix: " investor cash",
    effectLabel: "Investor offers more cash",
    description:
      "Investor cash falls off hard after the early cities. Minimal investment until everything else is maxed.",
    effects: seq(1.2, 0.2, 45),
    accent: "#d6a36a",
    unlockOrder: 10,
  },
  {
    id: "checkbook",
    name: "Checkbook",
    shortName: "Check",
    unlockCost: 300,
    maxLevel: 20,
    priority: "upgrade",
    effectKind: "cash",
    effectPrefix: "",
    effectSuffix: " start cash",
    effectLabel: "Start each city with more money",
    description:
      "Starting cash when you renovate, fly, or start an event. Speeds every new city and adventure.",
    effects: [
      100, 250, 625, 1560, 3910, 9770, 24400, 61000, 153000, 381000, 954000,
      2830000, 5960000, 14900000, 37300000, 93100000, 233000000, 582000000,
      1460000000, 3640000000,
    ],
    accent: "#4ade80",
    unlockOrder: 11,
  },
  {
    id: "keyCard",
    name: "Key Card",
    shortName: "Key",
    unlockCost: 1000,
    maxLevel: 30,
    priority: "asNeeded",
    effectKind: "percent",
    effectPrefix: "",
    effectSuffix: "% key drop",
    effectLabel: "Chance to receive a key after an adventure",
    description:
      "Chance to get a key after finishing an adventure. Upgrade if you farm rings and necklaces.",
    effects: [
      5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
      25, 26, 27, 28, 29, 30, 31, 32, 33, 35,
    ],
    accent: "#fbbf24",
    unlockOrder: 12,
  },
];

export const ITEM_MAP: Record<ItemId, VaultItem> = VAULT_ITEMS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<ItemId, VaultItem>,
);

export const ITEM_IDS = VAULT_ITEMS.map((item) => item.id);

export const EMPTY_LEVELS: Record<ItemId, number> = {
  tipJar: 0,
  remote: 0,
  pickaxe: 0,
  hourglass: 0,
  register: 0,
  tv: 0,
  piggy: 0,
  knife: 0,
  mop: 0,
  suitcase: 0,
  checkbook: 0,
  keyCard: 0,
};

export const PHASES: PhaseInfo[] = [
  {
    id: "unlock",
    name: "Unlock the Vault",
    blurb: "Buy every card in order. Unlocking first is the best gem ROI.",
    cityRange: "City 1+",
  },
  {
    id: "foundation",
    name: "Foundation",
    blurb: "Cheap first levels on the cards that actually speed up cities.",
    cityRange: "City 1 – 30",
  },
  {
    id: "core",
    name: "Core Speed",
    blurb: "Max Register. Push Mop, Checkbook and Remote into double digits.",
    cityRange: "City 31 – 80",
  },
  {
    id: "mid",
    name: "Mid-Game Power",
    blurb: "Finish Mop and Checkbook. Remote to 15–20. Pickaxe done.",
    cityRange: "City 81 – 120",
  },
  {
    id: "late",
    name: "Late Game",
    blurb: "Remote is the only real sink left. TV and tips come online.",
    cityRange: "City 121 – 449",
  },
  {
    id: "endgame",
    name: "Endgame",
    blurb: "Remote toward 50. Tip Jar and Piggy Bank after city 450.",
    cityRange: "City 450+",
  },
  {
    id: "complete",
    name: "100% Vault",
    blurb: "The leftover cards — Hourglass, Knife and Suitcase.",
    cityRange: "Optional",
  },
];

export const PLAYSTYLE_META: Record<
  Playstyle,
  { name: string; tagline: string }
> = {
  spectre: {
    name: "Spectre Handbook",
    tagline: "Community standard — Remote, Mop, Register, Checkbook first.",
  },
  speed: {
    name: "Speed Clear",
    tagline: "Checkbook + Mop + Register to fly through cities.",
  },
  ads: {
    name: "Ad Boost",
    tagline: "Remote and TV first if you watch ads every run.",
  },
  complete: {
    name: "Max Everything",
    tagline: "Cheapest remaining upgrade until the vault is 100%.",
  },
};

export type WaveTarget = Partial<Record<ItemId, number>>;

export interface Wave {
  phaseId: string;
  targets: WaveTarget;
  order: ItemId[];
}

export function wavesFor(playstyle: Playstyle, hasPanda: boolean): Wave[] {
  const skipReg = (targets: WaveTarget): WaveTarget => {
    if (!hasPanda) return targets;
    const next = { ...targets };
    delete next.register;
    return next;
  };

  if (playstyle === "complete") {
    return [
      {
        phaseId: "unlock",
        targets: {},
        order: ITEM_IDS,
      },
      {
        phaseId: "complete",
        targets: {
          tipJar: 20,
          remote: 50,
          pickaxe: 14,
          hourglass: 29,
          register: 10,
          tv: 24,
          piggy: 45,
          knife: 45,
          mop: 20,
          suitcase: 45,
          checkbook: 20,
          keyCard: 30,
        },
        order: ITEM_IDS,
      },
    ];
  }

  if (playstyle === "speed") {
    return [
      { phaseId: "unlock", targets: {}, order: ITEM_IDS },
      {
        phaseId: "foundation",
        targets: skipReg({
          checkbook: 8,
          mop: 8,
          register: 8,
          remote: 5,
          pickaxe: 2,
        }),
        order: hasPanda
          ? ["checkbook", "mop", "remote", "pickaxe"]
          : ["checkbook", "mop", "register", "remote", "pickaxe"],
      },
      {
        phaseId: "core",
        targets: skipReg({
          register: 10,
          mop: 16,
          checkbook: 16,
          remote: 10,
          tv: 6,
        }),
        order: hasPanda
          ? ["mop", "checkbook", "remote", "tv"]
          : ["register", "mop", "checkbook", "remote", "tv"],
      },
      {
        phaseId: "mid",
        targets: { mop: 20, checkbook: 20, remote: 18, tv: 12, pickaxe: 14 },
        order: ["mop", "checkbook", "remote", "tv", "pickaxe"],
      },
      {
        phaseId: "late",
        targets: { remote: 30, tv: 24, tipJar: 15, keyCard: 10 },
        order: ["remote", "tv", "tipJar", "keyCard"],
      },
      {
        phaseId: "endgame",
        targets: { remote: 50, tipJar: 20, piggy: 45, keyCard: 30 },
        order: ["remote", "tipJar", "piggy", "keyCard"],
      },
      {
        phaseId: "complete",
        targets: { hourglass: 29, knife: 45, suitcase: 45 },
        order: ["hourglass", "knife", "suitcase"],
      },
    ];
  }

  if (playstyle === "ads") {
    return [
      { phaseId: "unlock", targets: {}, order: ITEM_IDS },
      {
        phaseId: "foundation",
        targets: skipReg({
          remote: 10,
          tv: 8,
          register: 5,
          mop: 5,
          checkbook: 5,
          pickaxe: 2,
        }),
        order: hasPanda
          ? ["remote", "tv", "mop", "checkbook", "pickaxe"]
          : ["remote", "tv", "register", "mop", "checkbook", "pickaxe"],
      },
      {
        phaseId: "core",
        targets: skipReg({
          remote: 18,
          tv: 15,
          register: 10,
          mop: 12,
          checkbook: 12,
        }),
        order: hasPanda
          ? ["remote", "tv", "mop", "checkbook"]
          : ["remote", "tv", "register", "mop", "checkbook"],
      },
      {
        phaseId: "mid",
        targets: { remote: 25, tv: 24, mop: 20, checkbook: 20, pickaxe: 14 },
        order: ["remote", "tv", "mop", "checkbook", "pickaxe"],
      },
      {
        phaseId: "late",
        targets: { remote: 35, tipJar: 15, piggy: 15, keyCard: 10 },
        order: ["remote", "tipJar", "piggy", "keyCard"],
      },
      {
        phaseId: "endgame",
        targets: { remote: 50, tipJar: 20, piggy: 45, keyCard: 30 },
        order: ["remote", "tipJar", "piggy", "keyCard"],
      },
      {
        phaseId: "complete",
        targets: { hourglass: 29, knife: 45, suitcase: 45 },
        order: ["hourglass", "knife", "suitcase"],
      },
    ];
  }

  return [
    { phaseId: "unlock", targets: {}, order: ITEM_IDS },
    {
      phaseId: "foundation",
      targets: skipReg({
        remote: 5,
        register: 5,
        mop: 5,
        checkbook: 5,
        tv: 5,
        pickaxe: 2,
        tipJar: 5,
      }),
      order: hasPanda
        ? ["remote", "mop", "checkbook", "tv", "pickaxe", "tipJar"]
        : ["remote", "register", "mop", "checkbook", "tv", "pickaxe", "tipJar"],
    },
    {
      phaseId: "core",
      targets: skipReg({
        register: 10,
        mop: 10,
        checkbook: 10,
        remote: 10,
        tv: 8,
        pickaxe: 8,
      }),
      order: hasPanda
        ? ["mop", "checkbook", "remote", "tv", "pickaxe"]
        : ["register", "mop", "checkbook", "remote", "tv", "pickaxe"],
    },
    {
      phaseId: "mid",
      targets: {
        mop: 20,
        checkbook: 20,
        remote: 15,
        tv: 15,
        pickaxe: 14,
        tipJar: 10,
      },
      order: ["mop", "checkbook", "remote", "tv", "pickaxe", "tipJar"],
    },
    {
      phaseId: "late",
      targets: { remote: 25, tv: 24, tipJar: 20, piggy: 10, keyCard: 10 },
      order: ["remote", "tv", "tipJar", "piggy", "keyCard"],
    },
    {
      phaseId: "endgame",
      targets: { remote: 50, piggy: 45, keyCard: 30 },
      order: ["remote", "piggy", "keyCard"],
    },
    {
      phaseId: "complete",
      targets: { hourglass: 29, knife: 45, suitcase: 45 },
      order: ["hourglass", "knife", "suitcase"],
    },
  ];
}

export const DEFAULT_ACCOUNT: Account = {
  name: "",
  city: 1,
  gems: 0,
  scrolls: 0,
  hasPanda: false,
  playstyle: "spectre",
  levels: { ...EMPTY_LEVELS },
  arcaneLevels: {
    potionBandolier: 0,
    distiller: 0,
    crystalCatalyst: 0,
    alchemyScales: 0,
    bottlingStation: 0,
    elixirEngine: 0,
  },
  gear: { head: "", body: "", hand1: "", hand2: "" },
  pets: [],
  clubLevel: 0,
  clubXp: 0,
  citiesCompleted: 0,
  totalGemsEarned: 0,
};
