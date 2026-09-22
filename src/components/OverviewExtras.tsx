import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Account, UpgradeStep } from "../types";
import {
  evaluateCityProgress,
  gemBudgetVsPlan,
  type ProgressGrade,
} from "../utils/features";
import { formatGems } from "../utils/calc";
import { AVG_GEMS_PER_CITY } from "../data/cities";
import {
  buildDailyChecklist,
  toggleChecked,
} from "../utils/checklist";
import { evaluateGearMatch } from "../utils/gearMatch";
import {
  formatCountdown,
  getEventRotation,
} from "../utils/eventSchedule";
import { loadHistory, type HistoryPoint } from "../utils/history";
import { cn } from "../utils/cn";
import { gradeLabelKey, useI18n } from "../utils/i18n";
import { ITEM_MAP } from "../data/vault";

const GRADE_STYLE: Record<ProgressGrade, string> = {
  ahead: "border-[#3ecfb3]/40 bg-[#3ecfb3]/10 text-[#3ecfb3]",
  onTrack: "border-[#f0b429]/40 bg-[#f0b429]/10 text-[#f0b429]",
  behind: "border-orange-400/40 bg-orange-400/10 text-orange-300",
  farBehind: "border-rose-400/40 bg-rose-400/10 text-rose-300",
  fresh: "border-white/20 bg-white/5 text-[#9bb5af]",
};

export function ProgressGradeCard({ account }: { account: Account }) {
  const { t } = useI18n();
  const report = useMemo(() => evaluateCityProgress(account), [account]);

  return (
    <section className="panel rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold">{t("progressGrade")}</h3>
          <p className="mt-1 text-sm text-[#9bb5af]">{report.summary}</p>
        </div>
        <span
          className={cn(
            "rounded-lg border px-3 py-1.5 text-sm font-semibold",
            GRADE_STYLE[report.grade],
          )}
        >
          {t(gradeLabelKey(report.grade))} · {report.scorePct}%
        </span>
      </div>
      <p className="mt-3 text-xs text-[#9bb5af]">
        Met {report.met}/{report.total} handbook targets
        {report.lockedCount > 0 ? ` · ${report.lockedCount} locked cards` : ""}
      </p>
      {report.behind.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {report.behind.map((b) => (
            <li
              key={b.id}
              className="flex justify-between gap-2 rounded-lg bg-black/20 px-3 py-1.5"
            >
              <span>{b.name}</span>
              <span className="text-rose-300">
                {b.have}/{b.need} (−{b.gap})
              </span>
            </li>
          ))}
        </ul>
      )}
      {report.ahead.length > 0 && report.behind.length === 0 && (
        <ul className="mt-3 space-y-1 text-sm text-[#3ecfb3]">
          {report.ahead.map((a) => (
            <li key={a.id}>
              {a.name} {a.have}/{a.need}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function GemBudgetCard({
  account,
  plan,
}: {
  account: Account;
  plan: UpgradeStep[];
}) {
  const { t } = useI18n();
  const report = useMemo(() => gemBudgetVsPlan(account, plan), [account, plan]);

  return (
    <section className="panel rounded-2xl p-5">
      <h3 className="font-display text-xl font-bold">{t("gemBudget")}</h3>
      <p className="mt-2 text-sm text-[#c5d5d0]">
        With {formatGems(account.gems)} gems you finish{" "}
        <span className="font-semibold text-[#f0b429]">
          {report.stepsAffordable}/{report.totalSteps}
        </span>{" "}
        plan steps
        {report.shortfall > 0 ? (
          <>
            {" "}
            — about{" "}
            <span className="font-semibold text-rose-300">
              {report.citiesBehindPlan.toLocaleString()}
            </span>{" "}
            cities behind finishing the path (~{AVG_GEMS_PER_CITY}/city).
          </>
        ) : (
          <> — gems cover the remaining path.</>
        )}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
        <div
          className="h-full rounded-full bg-[#3ecfb3]"
          style={{ width: `${report.pctCovered}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[#9bb5af]">
        Plan cost {formatGems(report.planCost)} · leftover after buyable steps{" "}
        {formatGems(report.leftover)}
      </p>
    </section>
  );
}

export function DailyChecklistCard({
  account,
  nextStep,
}: {
  account: Account;
  nextStep: UpgradeStep | null;
}) {
  const { t } = useI18n();
  const [tick, setTick] = useState(0);
  const items = useMemo(() => {
    void tick;
    return buildDailyChecklist(account, nextStep);
  }, [account, nextStep, tick]);

  return (
    <section className="panel rounded-2xl p-5">
      <h3 className="font-display text-xl font-bold">{t("dailyChecklist")}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <input
                type="checkbox"
                checked={item.done}
                disabled={item.auto && !item.done}
                onChange={() => {
                  toggleChecked(item.id);
                  setTick((n) => n + 1);
                }}
                className="mt-1"
              />
              <span>
                <span
                  className={cn(
                    "block text-sm font-medium",
                    item.done && "text-[#9bb5af] line-through",
                  )}
                >
                  {item.label.includes(":")
                    ? item.label.replace(
                        /: (\w+)/,
                        (_, id) => `: ${ITEM_MAP[id as keyof typeof ITEM_MAP]?.name ?? id}`,
                      )
                    : item.label}
                </span>
                <span className="text-xs text-[#9bb5af]">{item.detail}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function GearMatchCard({ account }: { account: Account }) {
  const { t } = useI18n();
  const report = useMemo(() => evaluateGearMatch(account), [account]);
  if (!report.build) return null;

  return (
    <section className="panel rounded-2xl p-5">
      <h3 className="font-display text-xl font-bold">{t("gearMatch")}</h3>
      <p className="mt-1 text-sm text-[#9bb5af]">
        {report.build.label} · {report.build.cityRange}
      </p>
      <p className="mt-2 text-sm">{report.summary}</p>
      <ul className="mt-3 space-y-1 text-sm">
        {report.rows.map((row) => (
          <li
            key={row.slot}
            className="flex justify-between gap-2 rounded-lg bg-black/20 px-3 py-1.5"
          >
            <span className="text-[#9bb5af]">{row.slot}</span>
            <span className={row.match ? "text-[#3ecfb3]" : "text-rose-300"}>
              {row.equippedName} {row.match ? "✓" : `→ need ${row.needed}`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function EventCountdownCard() {
  const { t } = useI18n();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const rot = getEventRotation(now);

  return (
    <section className="panel rounded-2xl p-5">
      <h3 className="font-display text-xl font-bold">{t("eventNow")}</h3>
      <p className="mt-1 text-xs text-[#9bb5af]">
        Estimated weekly rotation (schedules vary in-game).
      </p>
      <p className="mt-3 font-display text-2xl font-bold text-[#f0b429]">
        {rot.current.name}
      </p>
      <p className="text-sm text-[#c5d5d0]">{rot.current.box}</p>
      <p className="mt-2 text-sm">{rot.farmTip}</p>
      <p className="mt-3 text-xs text-[#9bb5af]">
        Ends in ~{formatCountdown(rot.msLeft)} · next: {rot.next.name}
      </p>
    </section>
  );
}

export function HistoryChartCard({ refreshKey }: { refreshKey?: number }) {
  const { t } = useI18n();
  const points = useMemo(() => {
    void refreshKey;
    return loadHistory();
  }, [refreshKey]);

  if (points.length < 2) {
    return (
      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">{t("history")}</h3>
        <p className="mt-2 text-sm text-[#9bb5af]">
          Keep playing — snapshots appear after city or vault changes.
        </p>
      </section>
    );
  }

  return (
    <section className="panel rounded-2xl p-5">
      <h3 className="font-display text-xl font-bold">{t("history")}</h3>
      <HistorySpark points={points} />
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <Stat label="City" a={points[0].city} b={points[points.length - 1].city} />
        <Stat
          label="Vault lv"
          a={points[0].levelsOwned}
          b={points[points.length - 1].levelsOwned}
        />
        <Stat
          label="Cities done"
          a={points[0].citiesCompleted}
          b={points[points.length - 1].citiesCompleted}
        />
        <Stat
          label="Gems on hand"
          a={points[0].gems}
          b={points[points.length - 1].gems}
        />
      </dl>
    </section>
  );
}

function Stat({ label, a, b }: { label: string; a: number; b: number }) {
  const d = b - a;
  return (
    <div className="rounded-xl bg-black/20 px-3 py-2">
      <div className="text-[10px] text-[#9bb5af]">{label}</div>
      <div className="font-semibold">{b.toLocaleString()}</div>
      <div className={cn("text-xs", d >= 0 ? "text-[#3ecfb3]" : "text-rose-300")}>
        {d >= 0 ? "+" : ""}
        {d.toLocaleString()}
      </div>
    </div>
  );
}

function HistorySpark({ points }: { points: HistoryPoint[] }) {
  const w = 320;
  const h = 72;
  const maxCity = Math.max(...points.map((p) => p.city), 1);
  const maxLv = Math.max(...points.map((p) => p.levelsOwned), 1);
  const cityPath = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * (w - 8) + 4;
      const y = h - 4 - (p.city / maxCity) * (h - 12);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  const lvPath = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * (w - 8) + 4;
      const y = h - 4 - (p.levelsOwned / maxLv) * (h - 12);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full" role="img">
      <path d={cityPath} fill="none" stroke="#f0b429" strokeWidth="2" />
      <path d={lvPath} fill="none" stroke="#3ecfb3" strokeWidth="2" />
    </svg>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[#f0b429]/25 bg-black/20 px-4 py-3 text-sm text-[#9bb5af]">
      {children}
    </div>
  );
}
