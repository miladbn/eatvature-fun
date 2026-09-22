import type { Account, UpgradeStep } from "../types";
import { VAULT_ITEMS } from "../data/vault";
import { canUnlock } from "./calc";

const KEY = "eatventure-daily-checklist-v1";

export interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
  done: boolean;
  auto: boolean;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function loadCheckedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { day: string; ids: string[] };
    if (parsed.day !== todayKey()) return new Set();
    return new Set(parsed.ids ?? []);
  } catch {
    return new Set();
  }
}

export function saveCheckedIds(ids: Set<string>) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ day: todayKey(), ids: [...ids] }),
    );
  } catch {
    /* ignore */
  }
}

export function toggleChecked(id: string): Set<string> {
  const set = loadCheckedIds();
  if (set.has(id)) set.delete(id);
  else set.add(id);
  saveCheckedIds(set);
  return set;
}

/** Build today's suggested actions from account state. */
export function buildDailyChecklist(
  account: Account,
  nextStep: UpgradeStep | null,
): ChecklistItem[] {
  const checked = loadCheckedIds();
  const locked = VAULT_ITEMS.filter((i) => (account.levels[i.id] ?? 0) === 0);
  const unlockable = locked.find((i) => canUnlock(i.id, account.levels));
  const items: ChecklistItem[] = [];

  if (unlockable) {
    const id = `unlock-${unlockable.id}`;
    items.push({
      id,
      label: `Unlock ${unlockable.name}`,
      detail: `${unlockable.unlockCost} gems · better ROI than skipping`,
      done: checked.has(id),
      auto: false,
    });
  }

  if (nextStep) {
    const id = `step-${nextStep.id}`;
    items.push({
      id,
      label:
        nextStep.kind === "unlock"
          ? `Buy unlock: ${nextStep.itemId}`
          : `Upgrade to lv ${nextStep.to}`,
      detail: `${nextStep.cost} gems · ${nextStep.reason}`,
      done: checked.has(id) || account.gems < nextStep.cost,
      auto: account.gems < nextStep.cost,
    });
  }

  const clearId = "clear-city";
  items.push({
    id: clearId,
    label: "Clear / advance a city",
    detail: "Bank gems toward the plan, then spend on the ticket above.",
    done: checked.has(clearId),
    auto: false,
  });

  const clubId = "club-xp";
  items.push({
    id: clubId,
    label: "Contribute club XP",
    detail: `Current club xp ${account.clubXp || 0} · equal share target ~24k`,
    done: checked.has(clubId),
    auto: false,
  });

  if (!account.gear.head || !account.gear.body) {
    const gearId = "equip-gear";
    items.push({
      id: gearId,
      label: "Equip a recommended build",
      detail: "Open Builds and mark your current set.",
      done: checked.has(gearId),
      auto: false,
    });
  }

  return items;
}
