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
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/40">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${Math.max(2, report.scorePct)}%`,
            background:
              report.grade === "ahead"
                ? "#3ecfb3"
                : report.grade === "onTrack"
                  ? "#f0b429"
                  : report.grade === "behind"
                    ? "#fb923c"
                    : report.grade === "farBehind"
                      ? "#fb7185"
                      : "#9bb5af",
          }}
        />
      </div>
      <p className="mt-2 text-xs text-[#9bb5af]">
        Met {report.met}/{report.total} handbook targets
        {report.lockedCount > 0 ? ` · ${report.lockedCount} locked cards` : ""}
      </p>
      {report.behind.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {report.behind.map((b) => (
            <li
              key={b.id}
              className="flex justify-between gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-1.5"
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
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#3ecfb3] to-[#8fe3d2] transition-[width] duration-500"
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
  const doneCount = items.filter((i) => i.done).length;

  return (
    <section className="panel rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-xl font-bold">{t("dailyChecklist")}</h3>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            doneCount === items.length && items.length > 0
              ? "bg-[#3ecfb3]/15 text-[#3ecfb3]"
              : "bg-white/5 text-[#9bb5af]",
          )}
        >
          {doneCount}/{items.length}
        </span>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-black/40">
        <div
          className="h-full rounded-full bg-[#3ecfb3] transition-[width] duration-500"
          style={{ width: `${items.length ? (doneCount / items.length) * 100 : 0}%` }}
        />
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                item.done
                  ? "border-[#3ecfb3]/20 bg-[#3ecfb3]/5"
                  : "border-white/10 bg-black/20 hover:border-[#f0b429]/30",
              )}
            >
              <input
                type="checkbox"
                checked={item.done}
                disabled={item.auto && !item.done}
                onChange={() => {
                  toggleChecked(item.id);
                  setTick((n) => n + 1);
                }}
                className="mt-0.5 shrink-0"
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

type HistoryMetric = "city" | "levelsOwned" | "citiesCompleted" | "gems";

const HISTORY_METRICS: {
  id: HistoryMetric;
  label: string;
  short: string;
  color: string;
  /** Negative change is normal (e.g. spending gems) — don't paint it red. */
  neutralDrop?: boolean;
}[] = [
  { id: "city", label: "City", short: "City", color: "#f0b429" },
  { id: "levelsOwned", label: "Vault levels", short: "Vault lv", color: "#3ecfb3" },
  { id: "citiesCompleted", label: "Cities done", short: "Done", color: "#e8452d" },
  { id: "gems", label: "Gems on hand", short: "Gems", color: "#8fb8ff", neutralDrop: true },
];

function fmtWhen(t: number, withTime: boolean) {
  const d = new Date(t);
  return withTime
    ? d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fmtRelative(t: number) {
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

function fmtValue(metric: HistoryMetric, v: number) {
  return metric === "gems" ? formatGems(v) : v.toLocaleString();
}

function fmtDelta(metric: HistoryMetric, d: number) {
  const sign = d > 0 ? "+" : d < 0 ? "−" : "±";
  return `${sign}${fmtValue(metric, Math.abs(d))}`;
}

export function HistoryChartCard({ refreshKey }: { refreshKey?: number }) {
  const { t } = useI18n();
  const [metric, setMetric] = useState<HistoryMetric>("city");
  const points = useMemo(() => {
    void refreshKey;
    return loadHistory();
  }, [refreshKey]);

  if (points.length < 2) {
    return (
      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">{t("history")}</h3>
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-dashed border-white/15 bg-black/20 p-4">
          <svg viewBox="0 0 48 32" className="h-10 w-14 shrink-0" aria-hidden>
            <path
              d="M2 28 L14 20 L24 23 L34 12 L46 6"
              fill="none"
              stroke="#3ecfb3"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 4"
              opacity="0.7"
            />
            <circle cx="2" cy="28" r="2.5" fill="#f0b429" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {points.length === 0
                ? "No snapshots yet"
                : "1 snapshot saved — one more to draw your chart"}
            </p>
            <p className="mt-0.5 text-xs text-[#9bb5af]">
              A snapshot is saved on this device whenever your city, vault levels
              or gems change.
            </p>
            <div className="mt-2 flex gap-1">
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-8 rounded-full",
                    i < points.length ? "bg-[#3ecfb3]" : "bg-white/10",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const first = points[0];
  const last = points[points.length - 1];
  const spanMs = last.t - first.t;
  const active = HISTORY_METRICS.find((m) => m.id === metric)!;

  // Recent changes: newest first, only snapshots where something moved.
  const changes = points
    .map((p, i) => {
      if (i === 0) return null;
      const prev = points[i - 1];
      const parts = HISTORY_METRICS.map((m) => ({
        m,
        d: p[m.id] - prev[m.id],
      })).filter((x) => x.d !== 0 && (x.m.id !== "gems" || Math.abs(x.d) >= 50));
      return parts.length ? { p, parts } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .reverse()
    .slice(0, 4);

  return (
    <section className="panel rounded-2xl p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-display text-xl font-bold">{t("history")}</h3>
        <span className="text-xs text-[#9bb5af]">
          {points.length} snapshots · since {fmtWhen(first.t, false)}
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Metric"
        className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {HISTORY_METRICS.map((m) => {
          const d = last[m.id] - first[m.id];
          const on = m.id === metric;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setMetric(m.id)}
              className={cn(
                "relative overflow-hidden rounded-xl border px-3 py-2 text-left transition",
                on
                  ? "bg-black/30"
                  : "border-white/5 bg-black/15 hover:border-white/15 hover:bg-black/25",
              )}
              style={on ? { borderColor: `${m.color}80` } : undefined}
            >
              <span
                className="absolute inset-x-0 top-0 h-0.5 transition-opacity"
                style={{ background: m.color, opacity: on ? 1 : 0 }}
              />
              <span className="flex items-center gap-1.5 text-xs text-[#9bb5af]">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: m.color }}
                />
                {m.label}
              </span>
              <span className="mt-0.5 block font-display text-lg font-bold leading-tight">
                {fmtValue(m.id, last[m.id])}
              </span>
              <span
                className={cn(
                  "text-xs",
                  d === 0
                    ? "text-[#9bb5af]"
                    : d > 0
                      ? "text-[#3ecfb3]"
                      : m.neutralDrop
                        ? "text-[#c5d5d0]"
                        : "text-rose-300",
                )}
              >
                {d === 0 ? "no change" : fmtDelta(m.id, d)}
              </span>
            </button>
          );
        })}
      </div>

      <HistoryChart
        points={points}
        metric={metric}
        color={active.color}
        label={active.label}
        withTime={spanMs < 3 * 24 * 3600 * 1000}
      />

      {changes.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-[#c5d5d0]">
            Recent changes
          </h4>
          <ul className="mt-2 divide-y divide-white/5 rounded-xl bg-black/20">
            {changes.map(({ p, parts }) => (
              <li
                key={p.t}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2 text-sm"
              >
                <span className="flex flex-wrap gap-1.5">
                  {parts.map(({ m, d }) => (
                    <span
                      key={m.id}
                      className="rounded-md px-1.5 py-0.5 text-xs font-medium"
                      style={{ background: `${m.color}1f`, color: m.color }}
                    >
                      {m.short} {fmtDelta(m.id, d)}
                    </span>
                  ))}
                </span>
                <span
                  className="text-xs text-[#9bb5af]"
                  title={new Date(p.t).toLocaleString()}
                >
                  {fmtRelative(p.t)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function niceBounds(min: number, max: number): [number, number] {
  if (min === max) {
    const pad = Math.max(1, Math.abs(max) * 0.1);
    return [Math.max(0, min - pad), max + pad];
  }
  const pad = (max - min) * 0.12;
  return [Math.max(0, min - pad), max + pad];
}

function HistoryChart({
  points,
  metric,
  color,
  label,
  withTime,
}: {
  points: HistoryPoint[];
  metric: HistoryMetric;
  color: string;
  label: string;
  withTime: boolean;
}) {
  const [wrap, setWrap] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(560);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (!wrap) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(Math.round(w));
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [wrap]);

  const h = 168;
  const padL = 40;
  const padR = 12;
  const padT = 12;
  const padB = 24;
  const innerW = Math.max(10, width - padL - padR);
  const innerH = h - padT - padB;

  const values = points.map((p) => p[metric]);
  const [lo, hi] = niceBounds(Math.min(...values), Math.max(...values));
  const t0 = points[0].t;
  const t1 = points[points.length - 1].t;
  // Spread by time; fall back to index spacing if timestamps collapse.
  const byTime = t1 - t0 > 0;
  const xAt = (i: number) =>
    padL +
    (byTime
      ? ((points[i].t - t0) / (t1 - t0)) * innerW
      : (i / (points.length - 1)) * innerW);
  const yAt = (v: number) => padT + innerH - ((v - lo) / (hi - lo)) * innerH;

  // Step line: values hold until the next snapshot.
  let line = `M${xAt(0)},${yAt(values[0])}`;
  for (let i = 1; i < points.length; i++) {
    line += ` H${xAt(i)} V${yAt(values[i])}`;
  }
  const area = `${line} V${padT + innerH} H${xAt(0)} Z`;

  const ticks = [lo, (lo + hi) / 2, hi];
  const tickLabel = (v: number) =>
    metric === "gems" ? formatGems(Math.round(v)) : Math.round(v).toLocaleString();

  const gradId = `hist-grad-${metric}`;

  const onMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(xAt(i) - x);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    setHover(best);
  };

  const hp = hover !== null ? points[hover] : null;
  const hx = hover !== null ? xAt(hover) : 0;
  const hy = hp ? yAt(hp[metric]) : 0;
  const prevVal = hover !== null && hover > 0 ? points[hover - 1][metric] : null;

  return (
    <div ref={setWrap} className="relative mt-4 select-none">
      <svg
        width={width}
        height={h}
        className="block touch-none"
        role="img"
        aria-label={`${label} over time`}
        onPointerMove={(e) =>
          onMove(e.clientX, e.currentTarget.getBoundingClientRect())
        }
        onPointerDown={(e) =>
          onMove(e.clientX, e.currentTarget.getBoundingClientRect())
        }
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((v, i) => (
          <g key={i}>
            <line
              x1={padL}
              x2={padL + innerW}
              y1={yAt(v)}
              y2={yAt(v)}
              stroke="white"
              strokeOpacity={i === 0 ? 0.12 : 0.06}
              strokeDasharray={i === 0 ? undefined : "3 4"}
            />
            <text
              x={padL - 8}
              y={yAt(v)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="10"
              fill="#9bb5af"
            >
              {tickLabel(v)}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#${gradId})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {points.length <= 24 &&
          points.map((p, i) => (
            <circle
              key={p.t}
              cx={xAt(i)}
              cy={yAt(p[metric])}
              r="2.5"
              fill="#0b2422"
              stroke={color}
              strokeWidth="1.5"
            />
          ))}

        <text x={padL} y={h - 6} fontSize="10" fill="#9bb5af">
          {fmtWhen(t0, withTime)}
        </text>
        <text
          x={padL + innerW}
          y={h - 6}
          fontSize="10"
          fill="#9bb5af"
          textAnchor="end"
        >
          {fmtWhen(t1, withTime)}
        </text>

        {hp && (
          <g pointerEvents="none">
            <line
              x1={hx}
              x2={hx}
              y1={padT}
              y2={padT + innerH}
              stroke="white"
              strokeOpacity="0.25"
            />
            <circle cx={hx} cy={hy} r="5" fill={color} stroke="#0b2422" strokeWidth="2" />
          </g>
        )}
      </svg>

      {hp && (
        <div
          className="pointer-events-none absolute top-1 z-10 rounded-lg border border-white/10 bg-[var(--panel-b)] px-2.5 py-1.5 text-xs shadow-lg backdrop-blur"
          style={{
            left: Math.min(Math.max(hx, 70), width - 70),
            transform: "translateX(-50%)",
          }}
        >
          <div className="text-[#9bb5af]">{fmtWhen(hp.t, true)}</div>
          <div className="font-semibold" style={{ color }}>
            {label}: {fmtValue(metric, hp[metric])}
            {prevVal !== null && hp[metric] !== prevVal && (
              <span className="ml-1 font-normal text-[#c5d5d0]">
                ({fmtDelta(metric, hp[metric] - prevVal)})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[#f0b429]/25 bg-black/20 px-4 py-3 text-sm text-[#9bb5af]">
      {children}
    </div>
  );
}
