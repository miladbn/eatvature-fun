import { ITEM_MAP, PHASES, VAULT_ITEMS, wavesFor } from "../data/vault";
import type { Account, ItemId, UpgradeStep } from "../types";
import { upgradeCost } from "./calc";

export function buildPlan(account: Account): UpgradeStep[] {
  const levels: Record<ItemId, number> = { ...account.levels };
  const waves = wavesFor(account.playstyle, account.hasPanda);
  const steps: UpgradeStep[] = [];

  for (const wave of waves) {
    const phase = PHASES.find((p) => p.id === wave.phaseId);
    const phaseName = phase?.name ?? wave.phaseId;
    const phaseId = wave.phaseId;

    if (phaseId === "unlock") {
      for (const item of [...VAULT_ITEMS].sort((a, b) => a.unlockOrder - b.unlockOrder)) {
        if (levels[item.id] === 0) {
          steps.push({
            id: `unlock-${item.id}`,
            kind: "unlock",
            itemId: item.id,
            from: 0,
            to: 1,
            cost: item.unlockCost,
            phaseId,
            phaseName,
            reason:
              item.unlockCost === 0
                ? "Free unlock — grab it immediately."
                : `Unlock ${item.name} to open the next vault slot.`,
            newEffect: item.effects[0],
          });
          levels[item.id] = 1;
        }
      }
      continue;
    }

    const working = true;
    while (working) {
      const candidates = wave.order.filter((id) => {
        const target = wave.targets[id] ?? 0;
        const cap = Math.min(target, ITEM_MAP[id].maxLevel);
        return levels[id] > 0 && levels[id] < cap;
      });

      if (candidates.length === 0) break;

      candidates.sort((a, b) => {
        if (levels[a] !== levels[b]) return levels[a] - levels[b];
        return wave.order.indexOf(a) - wave.order.indexOf(b);
      });

      const id = candidates[0];
      const from = levels[id];
      const to = from + 1;
      const item = ITEM_MAP[id];
      steps.push({
        id: `${id}-${to}`,
        kind: "upgrade",
        itemId: id,
        from,
        to,
        cost: upgradeCost(id, to),
        phaseId,
        phaseName,
        reason: reasonFor(id, to, phaseId, account),
        newEffect: item.effects[to - 1],
      });
      levels[id] = to;
    }
  }

  return steps;
}

function reasonFor(
  id: ItemId,
  to: number,
  phaseId: string,
  account: Account,
): string {
  if (id === "remote") {
    if (to <= 10) return "Remote is the single best gem spend. Keep it moving.";
    if (to <= 25) return "Still the highest-leverage card. Protect this upgrade.";
    return "Endgame Remote grind — every level multiplies ad income.";
  }
  if (id === "register") {
    if (account.hasPanda) return "You have Panda — Register is optional.";
    return to >= 10
      ? "Register is maxed after this — cheapest full clear in the vault."
      : "Order speed is cheap and helps every restaurant.";
  }
  if (id === "mop") return "Walk speed compounds on every customer, every city.";
  if (id === "checkbook")
    return "Starting cash makes the next city and every event open faster.";
  if (id === "tv") return "Longer ad boosts pair with Remote and cut ad fatigue.";
  if (id === "pickaxe") {
    if (to <= 2) return "Level 2 Pickaxe is the best gem-per-gem unlock in the vault.";
    if (to <= 8) return "Still a solid gem-income bump. Fine to keep going.";
    return "Last Pickaxe levels — finish it since the cap is only 14.";
  }
  if (id === "tipJar")
    return phaseId === "endgame" || phaseId === "late"
      ? "Tips start mattering after the mid game. Time to invest."
      : "A cheap early rank so tips exist at all.";
  if (id === "piggy") return "Tip value only shines once Tip Jar is online. Late-game card.";
  if (id === "keyCard") return "For adventure farmers. Skip if you rarely run dungeons.";
  if (id === "hourglass") return "Offline time. Only after the real cards are done.";
  if (id === "knife") return "Offline cash. Last-priority completion upgrade.";
  return "Investor cash. Leave it for the 100% vault sweep.";
}

export function planTotals(steps: UpgradeStep[]) {
  const byPhase: Record<string, { cost: number; count: number; name: string }> = {};
  let cost = 0;
  for (const step of steps) {
    cost += step.cost;
    if (!byPhase[step.phaseId]) {
      byPhase[step.phaseId] = { cost: 0, count: 0, name: step.phaseName };
    }
    byPhase[step.phaseId].cost += step.cost;
    byPhase[step.phaseId].count += 1;
  }
  return { cost, count: steps.length, byPhase };
}

export function affordablePrefix(steps: UpgradeStep[], gems: number) {
  let spent = 0;
  let count = 0;
  for (const step of steps) {
    if (spent + step.cost > gems) break;
    spent += step.cost;
    count += 1;
  }
  return { spent, count, leftover: gems - spent };
}

export function groupSteps(steps: UpgradeStep[]) {
  const groups: { phaseId: string; phaseName: string; steps: UpgradeStep[] }[] = [];
  for (const step of steps) {
    const last = groups[groups.length - 1];
    if (!last || last.phaseId !== step.phaseId) {
      groups.push({ phaseId: step.phaseId, phaseName: step.phaseName, steps: [step] });
    } else {
      last.steps.push(step);
    }
  }
  return groups;
}
