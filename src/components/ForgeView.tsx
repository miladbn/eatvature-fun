import { useMemo, useState } from "react";
import { BLUEPRINT_RECIPES } from "../data/gear";
import type { Account } from "../types";
import { cn } from "../utils/cn";
import { EmptyHint } from "./OverviewExtras";
import { useI18n } from "../utils/i18n";

function parseIngredient(raw: string): { count: number; name: string } {
  const m = raw.match(/^(\d+)\s*[×xX]\s*(.+)$/);
  if (m) return { count: Number(m[1]), name: m[2].trim() };
  return { count: 1, name: raw.trim() };
}

export function ForgeView({
  account,
  setInventory,
}: {
  account: Account;
  setInventory: (inv: Record<string, number>) => void;
}) {
  const { t } = useI18n();
  const [filter, setFilter] = useState("");
  const recipes = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return BLUEPRINT_RECIPES;
    return BLUEPRINT_RECIPES.filter(
      (r) =>
        r.result.toLowerCase().includes(q) ||
        r.rarity.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.toLowerCase().includes(q)),
    );
  }, [filter]);

  function setCount(name: string, value: number) {
    const next = { ...account.inventory };
    if (value <= 0) delete next[name];
    else next[name] = value;
    setInventory(next);
  }

  const invEmpty = Object.keys(account.inventory).length === 0;

  return (
    <div className="space-y-5">
      <section className="ticket rounded-2xl p-5">
        <h2 className="font-display text-3xl font-bold text-[#14201c]">
          Blueprint forge
        </h2>
        <p className="mt-1 text-sm text-[#5c6f69]">
          Track pieces you own. Green means you can forge that recipe.
        </p>
      </section>

      {invEmpty && <EmptyHint>{t("emptyForge")}</EmptyHint>}

      <div className="panel rounded-2xl p-4">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter blueprints…"
          className="field max-w-sm"
        />
      </div>

      <div className="space-y-4">
        {recipes.map((bp) => {
          const parts = bp.ingredients.map(parseIngredient);
          const ready = parts.every(
            (p) => (account.inventory[p.name] ?? 0) >= p.count,
          );
          return (
            <article
              key={bp.result}
              className={cn(
                "panel rounded-2xl p-4",
                ready && "ring-1 ring-[#3ecfb3]/50",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-xl font-bold">{bp.result}</h3>
                <span className="text-sm text-[#f0b429]">{bp.rarity}</span>
              </div>
              {ready && (
                <p className="mt-1 text-xs font-medium text-[#3ecfb3]">
                  Ready to forge
                </p>
              )}
              <div className="mt-3 space-y-2">
                {parts.map((p) => {
                  const have = account.inventory[p.name] ?? 0;
                  const ok = have >= p.count;
                  return (
                    <div
                      key={p.name}
                      className="flex flex-wrap items-center gap-2 text-sm"
                    >
                      <span className={cn("min-w-[12rem]", ok && "text-[#3ecfb3]")}>
                        {p.count}× {p.name}
                      </span>
                      <span className="text-xs text-[#9bb5af]">have</span>
                      <input
                        type="number"
                        min={0}
                        value={have}
                        onChange={(e) =>
                          setCount(p.name, Number(e.target.value))
                        }
                        className="field w-20 py-1"
                      />
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
