import type { GearItem } from "../types";
import { SHEET_ITEMS } from "./sheet/items";

export type CatalogItem = GearItem;

/** Full gear/accessory catalog from the Spectre Handbook Items tab. */
export const CATALOG_ITEMS: CatalogItem[] = SHEET_ITEMS;

export const CATALOG_EVENTS = Array.from(new Set(CATALOG_ITEMS.map((i) => i.event))).sort();
export const CATALOG_SLOTS = Array.from(new Set(CATALOG_ITEMS.map((i) => i.slot))).sort();
export const CATALOG_RARITIES = ["common", "rare", "epic", "legendary", "ultimate", "mythic"];
