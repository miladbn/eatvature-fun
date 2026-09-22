export const HANDBOOK_META = {
  gamePatch: "1.33.2",
  handbookVersion: "1.16.2",
  lastUpdate: "Mar 24, 2025",
  author: "Spectre",
  sheetUrl:
    "https://docs.google.com/spreadsheets/d/1xcVOTizpCp8oQFAalfHUrB91F_Mr-mFZmP1HoHU8xQo",
  discordUrl: "https://discord.gg/eatventure",
  redditUrl: "https://www.reddit.com/r/eatventureofficial",
  calculatorNote:
    "EV Multi-purpose Calculator by BladedCross (Discord: bladedcross)",
  githubUrl: "https://github.com/miladbn/eatvature-fun",
};

export const EVENTS = [
  {
    id: "moon",
    name: "Moon",
    box: "Moon Event Box",
    highlights: ["Robot Head", "Robot Suit", "Laser Gun"],
    tip: "Best ultimate set for all-worker instant / perfect.",
  },
  {
    id: "mine",
    name: "Mine",
    box: "Mine Event Box",
    highlights: ["Torch Helmet", "Tool Belt", "Pickaxe"],
    tip: "Walk and food speed ultimates; Pickaxe hand for perfect.",
  },
  {
    id: "seaport",
    name: "SeaPort",
    box: "Seaport Event Box",
    highlights: ["Shark Head", "Shark Body", "Anchor"],
    tip: "Shark body is a strong AW instant option.",
  },
  {
    id: "middleAges",
    name: "Middle Ages",
    box: "Middle Ages Event Box",
    highlights: ["Royal Crown", "Royal Robe", "Royal Sceptre"],
    tip: "Royal Crown is a top ultimate head for AW food + instant.",
  },
  {
    id: "potion",
    name: "Potion Shop",
    box: "Alchemical Chest",
    highlights: [
      "Alchemist Goggles",
      "Alchemist Bandolier",
      "Potion Flask",
      "Arcane Vault",
    ],
    tip: "Farm scrolls for Arcane Vault; potions carry into main game.",
  },
  {
    id: "space",
    name: "Space",
    box: "Space Event Box",
    highlights: ["Robot-adjacent gear"],
    tip: "Check Items catalog for Space-tagged pieces.",
  },
  {
    id: "adventure",
    name: "Adventure",
    box: "Adventure / Zeus rewards",
    highlights: ["Rings", "Necklaces", "Trident"],
    tip: "Mythic rings/necklaces come from adventure content.",
  },
  {
    id: "club",
    name: "Club",
    box: "Club Box",
    highlights: ["Chef's Helmet", "Armoured Apron", "Warrior's Cleaver"],
    tip: "Mythics are club-box exclusive. Push equal XP contribution.",
  },
] as const;

export type MilestoneId =
  | "unlockAll"
  | "registerMax"
  | "remote10"
  | "remote20"
  | "remote50"
  | "mop20"
  | "checkbook20"
  | "city60"
  | "city120"
  | "city450"
  | "ownPanda"
  | "vault100";

export const MILESTONES: { id: MilestoneId; label: string }[] = [
  { id: "unlockAll", label: "Unlock every vault card" },
  { id: "registerMax", label: "Max Register (or own Panda)" },
  { id: "remote10", label: "Remote level 10" },
  { id: "remote20", label: "Remote level 20" },
  { id: "remote50", label: "Remote maxed" },
  { id: "mop20", label: "Mop maxed" },
  { id: "checkbook20", label: "Checkbook maxed" },
  { id: "city60", label: "Reach city 60" },
  { id: "city120", label: "Reach city 120" },
  { id: "city450", label: "Reach city 450" },
  { id: "ownPanda", label: "Own Legendary Panda" },
  { id: "vault100", label: "100% vault" },
];
