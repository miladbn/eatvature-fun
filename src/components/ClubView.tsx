import {
  CLUB_INFO,
  CLUB_LEVELS,
  CLUB_MAX_XP,
  CLUB_SALVAGE,
  CLUB_TOTAL_REWARDS,
  CLUB_XP_PER_PLAYER,
  RARITY_COLORS,
  SALVAGE_XP,
} from "../data/gear";
import type { Account } from "../types";
import { formatGems } from "../utils/calc";
import { cn } from "../utils/cn";
import {
  CLUB_EQUAL_SHARE_XP,
  CLUB_XP_PER_CITY,
  clubCitiesToTarget,
} from "../utils/features";
import { Field, Stat } from "./ui";

export function ClubView({
  account,
  update,
}: {
  account: Account;
  update: <K extends keyof Account>(k: K, v: Account[K]) => void;
}) {
  const level = Math.max(0, Math.min(50, account.clubLevel));
  const next = CLUB_LEVELS.find((l) => l.level === level + 1);
  const share = Math.min(100, (account.clubXp / CLUB_EQUAL_SHARE_XP) * 100);
  const smallBoxXp = CLUB_SALVAGE.find((s) => s.type === "Small Box")?.xp ?? 9;
  const boxesLeft = Math.ceil(Math.max(0, CLUB_EQUAL_SHARE_XP - account.clubXp) / smallBoxXp);

  return (
    <div className="space-y-6">
      <div className="panel rounded-3xl p-5">
        <h2 className="font-display text-2xl">Club Tracker</h2>
        <p className="mt-1 text-sm text-[#9bb5af]">
          {formatGems(CLUB_MAX_XP)} club XP unlocks every reward. Split across 10
          members that is {formatGems(CLUB_EQUAL_SHARE_XP)} XP each.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Club level (0–50)">
            <input
              type="number"
              min={0}
              max={50}
              value={account.clubLevel}
              onChange={(e) => update("clubLevel", Number(e.target.value))}
              className="field"
            />
          </Field>
          <Field label="Your XP this season">
            <input
              type="number"
              min={0}
              value={account.clubXp}
              onChange={(e) => update("clubXp", Number(e.target.value))}
              className="field"
            />
          </Field>
          <Field label="Next club reward">
            <div className="rounded-xl border border-[#f0b429]/20 bg-black/30 px-3 py-2 text-sm text-[#f0b429]">
              {next ? `Lv ${next.level}: ${next.reward}` : "All rewards unlocked"}
            </div>
          </Field>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-lg bg-black/40">
          <div
            className="h-full rounded-lg bg-gradient-to-r from-[#f0b429] to-[#3ecfb3]"
            style={{ width: `${share}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[#9bb5af]">
          Your contribution: {formatGems(account.clubXp)} /{" "}
          {formatGems(CLUB_EQUAL_SHARE_XP)} XP ({share.toFixed(1)}%)
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Cities to your share"
          value={formatGems(clubCitiesToTarget(account.clubXp))}
          hint={`@ ~${CLUB_XP_PER_CITY} XP per city`}
        />
        <Stat
          label="Small boxes left"
          value={formatGems(boxesLeft)}
          hint={`${smallBoxXp} XP each when salvaged`}
        />
        <Stat
          label="Club XP to next level"
          value={next ? formatGems(next.xpNeeded) : "—"}
          hint={next ? `${formatGems(next.totalXp)} total for lv ${next.level}` : "maxed"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel rounded-3xl p-5">
          <h3 className="font-display text-xl">Club information</h3>
          <ul className="mt-2 space-y-1 text-sm text-[#c5d5d0]">
            {CLUB_INFO.map((i) => (
              <li key={i}>• {i}</li>
            ))}
          </ul>
          <h4 className="mt-4 text-sm font-semibold">Total rewards at level 50</h4>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CLUB_TOTAL_REWARDS.map((r) => (
              <span
                key={r}
                className="rounded-lg border border-[#f0b429]/20 bg-black/20 px-2 py-1 text-xs text-[#f0b429]"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
        <div className="panel rounded-3xl p-5">
          <h3 className="font-display text-xl">Salvage for club XP</h3>
          <table className="data-table mt-3 w-full text-left text-sm">
            <thead className="text-[#9bb5af]">
              <tr>
                <th className="px-2 py-1">Box</th>
                <th className="px-2 py-1 text-right">XP (incl. eggs)</th>
                <th className="px-2 py-1 text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {CLUB_SALVAGE.map((s) => (
                <tr key={s.type} className="border-t border-white/8">
                  <td className="px-2 py-1.5">{s.type}</td>
                  <td className="px-2 py-1.5 text-right text-[#f0b429]">{s.xp}</td>
                  <td className="px-2 py-1.5 text-right text-[#9bb5af]">{s.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h4 className="mt-4 text-sm font-semibold">XP needed per player</h4>
          <ul className="mt-1 space-y-0.5 text-xs text-[#c5d5d0]">
            {CLUB_XP_PER_PLAYER.map((p) => (
              <li key={p.levels} className="flex justify-between">
                <span>{p.levels}</span>
                <span>{p.xp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Salvage XP per item</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SALVAGE_XP.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-xl border border-[#f0b429]/10 bg-black/20 px-3 py-2"
            >
              <span className="text-sm" style={{ color: RARITY_COLORS[item.rarity] }}>
                {item.name}
              </span>
              <span className="text-sm font-medium text-[#f0b429]">{item.xp} XP</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">All club levels</h3>
        <div className="mt-3 max-h-[32rem] overflow-auto">
          <table className="data-table w-full min-w-[420px] text-left text-sm">
            <thead className="sticky top-0 bg-[#0b2422] text-[#9bb5af]">
              <tr>
                <th className="px-2 py-1">Level</th>
                <th className="px-2 py-1">Reward</th>
                <th className="px-2 py-1 text-right">XP needed</th>
                <th className="px-2 py-1 text-right">Total XP</th>
              </tr>
            </thead>
            <tbody>
              {CLUB_LEVELS.map((cl) => (
                <tr
                  key={cl.level}
                  className={cn(
                    "border-t border-white/8",
                    level >= cl.level && "bg-[#3ecfb3]/5 text-[#3ecfb3]",
                  )}
                >
                  <td className="px-2 py-1.5">{cl.level}</td>
                  <td className="px-2 py-1.5">{cl.reward || "—"}</td>
                  <td className="px-2 py-1.5 text-right">
                    {cl.xpNeeded ? formatGems(cl.xpNeeded) : "—"}
                  </td>
                  <td className="px-2 py-1.5 text-right text-[#f0b429]">
                    {formatGems(cl.totalXp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
