import { BEST_BUILDS, PHASE_RANGES, buildInRange } from "../data/gear";
import type { Account, BuildReco } from "../types";
import { cn } from "../utils/cn";
import { ItemIcon, itemIconUrl } from "./ItemIcon";
import { GearMatchCard } from "./OverviewExtras";

const PHASES = Array.from(new Set(BEST_BUILDS.map((b) => b.phase)));

function BuildCard({ build, active }: { build: BuildReco; active: boolean }) {
  return (
    <div className={cn("panel rounded-3xl p-5", active && "ring-2 ring-action")}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-xl">{build.label}</h3>
        {active && (
          <span className="rounded-lg bg-action px-2 py-0.5 text-xs font-semibold text-on-action">
            your range
          </span>
        )}
      </div>
      <div
        className={cn(
          "mt-3 grid gap-2",
          build.slots.length > 4 ? "sm:grid-cols-3" : build.slots.length > 3 ? "sm:grid-cols-4" : "sm:grid-cols-3",
        )}
      >
        {build.slots.map((s) => (
          <div key={s.label} className="rounded-xl bg-sunken p-2">
            <span className="text-xs text-muted">{s.label}</span>
            <div className="mt-1 flex items-center gap-2">
              <ItemIcon src={itemIconUrl(s.itemId)} className="h-9 w-9" />
              <div className="min-w-0">
                <div className="text-sm font-medium">{s.name}</div>
                {s.source && (
                  <div className="text-xs text-muted">Found in: {s.source}</div>
                )}
              </div>
            </div>
            {s.stats.length > 0 && (
              <ul className="mt-1 text-xs text-soft">
                {s.stats.map((st) => (
                  <li key={st}>{st}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      {(build.totals.solo.length > 0 || build.totals.aw.length > 0) && (
        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-xl border border-line p-2">
            <div className="font-semibold text-ink">Total · solo</div>
            <div className="mt-1 text-soft">
              {build.totals.solo.length ? build.totals.solo.join(" · ") : "N/A"}
            </div>
          </div>
          <div className="rounded-xl border border-line p-2">
            <div className="font-semibold text-gem">Total · all workers</div>
            <div className="mt-1 text-soft">
              {build.totals.aw.length ? build.totals.aw.join(" · ") : "N/A"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BuildsView({ account }: { account: Account }) {
  return (
    <div className="space-y-6">
      <div className="panel rounded-3xl p-5">
        <h2 className="font-display text-2xl">Best Builds</h2>
        <p className="mt-1 text-sm text-muted">
          All {BEST_BUILDS.length} builds from the handbook. Your city:{" "}
          {account.city}
        </p>
      </div>
      <GearMatchCard account={account} />
      {PHASES.map((phase) => (
        <section key={phase} className="space-y-3">
          <h3 className="font-display text-lg">
            {phase}
            <span className="ml-2 text-sm text-muted">
              {PHASE_RANGES[phase]?.label}
            </span>
          </h3>
          {BEST_BUILDS.filter((b) => b.phase === phase).map((b) => (
            <BuildCard key={b.id} build={b} active={buildInRange(b, account.city)} />
          ))}
        </section>
      ))}
      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Upgrade priority</h3>
        <ol className="mt-3 space-y-1 text-sm">
          <li>
            1. <span className="font-medium text-ink">Instant food %</span> — aim for 100%
          </li>
          <li>
            2. <span className="font-medium text-ink">Perfect food %</span> — aim for 100%
          </li>
          <li>
            3. <span className="text-blue-300">Double food %</span> — extra servings
          </li>
          <li>
            4. <span className="font-medium text-ink">Divine food %</span> — endgame multiplier
          </li>
          <li>
            5. <span className="font-medium text-ink">Walk speed %</span> — faster clears
          </li>
        </ol>
      </div>
    </div>
  );
}
