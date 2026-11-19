import { POTIONS } from "../data/arcane";
import { formatGems } from "../utils/calc";
import { ItemIcon, ingredientIconUrl, potionIconUrl } from "./ItemIcon";

/**
 * All potions from the handbook's Potions tab. Ingredient costs depend on the
 * Alchemy Scales arcane upgrade (max level 15), so both columns are shown and
 * the one that matches the player is highlighted.
 */
export function PotionsPanel({ scalesMaxed }: { scalesMaxed: boolean }) {
  return (
    <div className="panel rounded-3xl p-5">
      <h3 className="font-display text-xl">Potions</h3>
      <p className="mt-1 text-sm text-muted">
        Ingredients to reach level 10,{" "}
        {scalesMaxed
          ? "with your maxed Alchemy Scales."
          : "before Alchemy Scales upgrades (maxing it cuts costs by 40%)."}{" "}
        Open a potion for the per-level table.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {POTIONS.map((p) => {
          const total = scalesMaxed ? p.totalCost : p.totalCostNoScales;
          const max = p.levels[p.levels.length - 1];
          return (
            <details
              key={p.id}
              className="group rounded-2xl border border-line bg-sunken p-3"
            >
              <summary className="flex cursor-pointer list-none items-start gap-3">
                <ItemIcon src={potionIconUrl(p.id)} className="h-11 w-11" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-gem">{p.name}</span>
                  <span className="block text-xs text-muted">
                    {p.effect} · up to +{max?.total ?? 0}%
                  </span>
                  <span className="mt-1.5 flex flex-wrap gap-2 text-xs text-soft">
                    {p.ingredients.map((ing, i) => (
                      <span key={ing} className="flex items-center gap-1">
                        <ItemIcon src={ingredientIconUrl(ing)} className="h-5 w-5" />
                        {ing}
                        {total && (
                          <span className="text-gold">×{formatGems(total[i])}</span>
                        )}
                      </span>
                    ))}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="text-xs text-muted transition group-open:rotate-180"
                >
                  ▾
                </span>
              </summary>
              <div className="mt-3 overflow-x-auto">
                <table className="data-table w-full min-w-[360px] text-left text-xs">
                  <thead className="text-muted">
                    <tr>
                      <th className="px-1.5 py-1">Lv</th>
                      <th className="px-1.5 py-1 text-right">Effect</th>
                      <th className="px-1.5 py-1 text-right">Cost (scales maxed)</th>
                      <th className="px-1.5 py-1 text-right">Cost (no scales)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.levels.map((l) => (
                      <tr key={l.level} className="border-t border-line">
                        <td className="px-1.5 py-1">{l.level}</td>
                        <td className="px-1.5 py-1 text-right">
                          +{l.total}%{" "}
                          <span className="text-muted">(+{l.gain})</span>
                        </td>
                        <td
                          className={`px-1.5 py-1 text-right ${scalesMaxed ? "text-gold" : ""}`}
                        >
                          {l.cost.join(" + ")}
                        </td>
                        <td
                          className={`px-1.5 py-1 text-right ${scalesMaxed ? "" : "text-gold"}`}
                        >
                          {l.costNoScales?.join(" + ") ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
