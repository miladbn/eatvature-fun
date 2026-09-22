import { VAULT_ITEMS } from "../data/vault";
import type { Account } from "../types";

const KEY = "eatventure-history-v1";
const MAX_POINTS = 48;

export interface HistoryPoint {
  t: number;
  city: number;
  gems: number;
  levelsOwned: number;
  citiesCompleted: number;
  investedApprox: number;
}

function levelsOwned(account: Account): number {
  return VAULT_ITEMS.reduce((s, i) => s + (account.levels[i.id] ?? 0), 0);
}

export function loadHistory(): HistoryPoint[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryPoint[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(points: HistoryPoint[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(points.slice(-MAX_POINTS)));
  } catch {
    /* ignore */
  }
}

/** Append a snapshot if city/levels/gems changed meaningfully (throttle 30m). */
export function recordHistory(account: Account): HistoryPoint[] {
  const points = loadHistory();
  const next: HistoryPoint = {
    t: Date.now(),
    city: account.city || 1,
    gems: account.gems || 0,
    levelsOwned: levelsOwned(account),
    citiesCompleted: account.citiesCompleted || 0,
    investedApprox: 0,
  };
  const last = points[points.length - 1];
  if (last) {
    const same =
      last.city === next.city &&
      last.levelsOwned === next.levelsOwned &&
      Math.abs(last.gems - next.gems) < 50 &&
      last.citiesCompleted === next.citiesCompleted;
    if (same) return points;
    if (Date.now() - last.t < 30 * 60 * 1000 && last.city === next.city) {
      const updated = [...points.slice(0, -1), next];
      saveHistory(updated);
      return updated;
    }
  }
  const updated = [...points, next];
  saveHistory(updated);
  return updated;
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
