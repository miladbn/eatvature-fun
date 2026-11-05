import { useMemo, useState } from "react";
import { BLUEPRINT_RECIPES, GEAR_MAP, SLOT_LABELS } from "../data/gear";
import type { Account, BlueprintIngredient } from "../types";
import { ItemIcon, itemIconUrl } from "./ItemIcon";
import { cn } from "../utils/cn";
import { EmptyHint } from "./OverviewExtras";
import { useI18n } from "../utils/i18n";

const FORGEABLE = BLUEPRINT_RECIPES.filter((r) => !r.legacy && r.ingredients.length);

/** Inventory key for an ingredient: the catalog item's name (falls back to the sheet text). */
function invKey(ing: BlueprintIngredient): string {
  return (ing.itemId && GEAR_MAP[ing.itemId]?.name) || ing.name;
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
    if (!q) return FORGEABLE;
    return FORGEABLE.filter(
      (r) =>
        r.result.toLowerCase().includes(q) ||
        r.rarity.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.name.toLowerCase().includes(q)),
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
          const parts = bp.ingredients.map((i) => ({ ...i, key: invKey(i) }));
          const ready = parts.every(
            (p) => (account.inventory[p.key] ?? 0) >= p.count,
          );
          return (
            <article
              key={`${bp.rarity}-${bp.slot}-${bp.result}`}
              className={cn(
                "panel rounded-2xl p-4",
                ready && "ring-1 ring-[#3ecfb3]/50",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 font-display text-xl font-bold">
                  <ItemIcon src={itemIconUrl(bp.resultId)} className="h-9 w-9" />
                  {bp.result}
                </h3>
                <span className="text-sm capitalize text-[#f0b429]">
                  {bp.rarity}
                  {bp.slot && ` · ${SLOT_LABELS[bp.slot]}`}
                </span>
              </div>
              {ready && (
                <p className="mt-1 text-xs font-medium text-[#3ecfb3]">
                  Ready to forge
                </p>
              )}
              <div className="mt-3 space-y-2">
                {parts.map((p) => {
                  const have = account.inventory[p.key] ?? 0;
                  const ok = have >= p.count;
                  return (
                    <div
                      key={p.key}
                      className="flex flex-wrap items-center gap-2 text-sm"
                    >
                      <span
                        className={cn(
                          "flex min-w-[12rem] items-center gap-1.5",
                          ok && "text-[#3ecfb3]",
                        )}
                      >
                        <ItemIcon src={itemIconUrl(p.itemId)} className="h-6 w-6" />
                        {p.count}× {p.key}
                      </span>
                      <span className="text-xs text-[#9bb5af]">have</span>
                      <input
                        type="number"
                        min={0}
                        value={have}
                        aria-label={`How many ${p.key} you have`}
                        onChange={(e) =>
                          setCount(p.key, Number(e.target.value))
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
