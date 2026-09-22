import { VAULT_ITEMS } from "../data/vault";
import type { ItemId } from "../types";

const ALIASES: Record<string, ItemId> = {
  tipjar: "tipJar",
  tip: "tipJar",
  remote: "remote",
  pickaxe: "pickaxe",
  hourglass: "hourglass",
  register: "register",
  tv: "tv",
  piggy: "piggy",
  piggybank: "piggy",
  knife: "knife",
  mop: "mop",
  suitcase: "suitcase",
  checkbook: "checkbook",
  chequebook: "checkbook",
  keycard: "keyCard",
  key: "keyCard",
};

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Parse pasted OCR / notes text into vault level guesses. */
export function parseVaultLevelsFromText(
  text: string,
): Partial<Record<ItemId, number>> {
  const out: Partial<Record<ItemId, number>> = {};
  const lines = text.split(/\r?\n/);

  for (const item of VAULT_ITEMS) {
    const names = [item.name, item.shortName, item.id].map(norm);
    for (const line of lines) {
      const nline = norm(line);
      if (!names.some((n) => n && nline.includes(n))) continue;
      const nums = line.match(/\d+/g);
      if (!nums) continue;
      const level = Math.min(item.maxLevel, Math.max(0, Number(nums[nums.length - 1])));
      if (Number.isFinite(level)) out[item.id] = level;
    }
  }

  // fallback: "remote 12" patterns anywhere
  const re = /([a-zA-Z][a-zA-Z\s']{1,20}?)\s*[:=]?\s*(\d{1,2})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const key = norm(m[1]);
    const id = ALIASES[key];
    if (!id) continue;
    const item = VAULT_ITEMS.find((i) => i.id === id);
    if (!item) continue;
    out[id] = Math.min(item.maxLevel, Math.max(0, Number(m[2])));
  }

  return out;
}
