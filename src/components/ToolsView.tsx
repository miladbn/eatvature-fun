import { useMemo, useState } from "react";
import { AVG_GEMS_PER_CITY, LOOP_GEMS } from "../data/cities";
import { CLOTHING_XP, type ClothingRarity } from "../data/clothing";
import { ITEM_MAP, PLAYSTYLE_META, TOTAL_VAULT_GEMS, VAULT_ITEMS } from "../data/vault";
import { POTIONS } from "../data/arcane";
import type { Account, ItemId, Playstyle } from "../types";
import {
  effectAt,
  formatEffect,
  formatGems,
  citiesNeededForGems,
  upgradeCost,
} from "../utils/calc";
import {
  CLUB_EQUAL_SHARE_XP,
  CLUB_XP_PER_CITY,
  clothingAtLevel,
  clothingXpToLevel,
  clubCitiesToTarget,
  comparePlaystylesBase,
  EGG_COSTS,
  EGG_MERGE,
  petFoodBetween,
  projectGemIncome,
} from "../utils/features";
import {
  applySyncCode,
  encodeShareLink,
  exportAccountJson,
  importAccountJson,
  makeSyncCode,
} from "../utils/profiles";
import { buildPlan } from "../utils/planner";
import { cn } from "../utils/cn";
import { VaultOcrHelper } from "./VaultOcrHelper";
import { CloudSyncPanel } from "./CloudSyncPanel";

export function ToolsView({
  account,
  onImport,
  onApplyLevels,
}: {
  account: Account;
  onImport: (next: Account) => void;
  onApplyLevels?: (levels: Partial<Record<ItemId, number>>) => void;
}) {
  const [citiesAhead, setCitiesAhead] = useState(10);
  const [clothRarity, setClothRarity] = useState<ClothingRarity>("common");
  const [clothFrom, setClothFrom] = useState(1);
  const [clothTo, setClothTo] = useState(20);
  const [petFrom, setPetFrom] = useState(1);
  const [petTo, setPetTo] = useState(50);
  const [whatIfId, setWhatIfId] = useState<ItemId>("remote");
  const [importText, setImportText] = useState("");
  const [shareMsg, setShareMsg] = useState("");
  const [syncCode, setSyncCode] = useState("");

  const projection = useMemo(
    () => projectGemIncome(account.city || 1, citiesAhead),
    [account.city, citiesAhead],
  );

  const clothXp = clothingXpToLevel(clothRarity, clothFrom, clothTo);
  const clothNow = clothingAtLevel(clothRarity, clothFrom);
  const petFood = petFoodBetween(petFrom, petTo);
  const whatIfLevel = account.levels[whatIfId] ?? 0;
  const whatIfItem = ITEM_MAP[whatIfId];
  const nextCost =
    whatIfLevel < whatIfItem.maxLevel
      ? upgradeCost(whatIfId, whatIfLevel + 1)
      : 0;
  const nextEffect =
    whatIfLevel < whatIfItem.maxLevel
      ? formatEffect(whatIfId, whatIfLevel + 1)
      : "MAX";
  const citiesForNext = citiesNeededForGems(nextCost, AVG_GEMS_PER_CITY);

  const playstyleCompare = useMemo(() => {
    return (Object.keys(PLAYSTYLE_META) as Playstyle[]).map((id) => {
      const fake: Account = { ...account, playstyle: id };
      const plan = buildPlan(fake);
      const cost = plan.reduce((s, step) => s + step.cost, 0);
      return {
        id,
        name: PLAYSTYLE_META[id].name,
        steps: plan.length,
        cost,
        cities: citiesNeededForGems(cost, AVG_GEMS_PER_CITY),
      };
    });
  }, [account]);

  const remoteRows = useMemo(() => {
    const item = ITEM_MAP.remote;
    const rows = [];
    for (let lvl = 1; lvl <= item.maxLevel; lvl += lvl < 10 ? 1 : 5) {
      rows.push({
        level: lvl,
        effect: effectAt("remote", lvl),
        cost: upgradeCost("remote", lvl),
        toHere: (() => {
          let t = 0;
          for (let i = Math.max(1, whatIfLevel + 1); i <= lvl; i++)
            t += upgradeCost("remote", i);
          return t;
        })(),
      });
    }
    return rows;
  }, [whatIfLevel]);

  const clubNeed = clubCitiesToTarget(account.clubXp);

  function doExport() {
    const json = exportAccountJson(account);
    void navigator.clipboard?.writeText(json);
    setShareMsg("Account JSON copied to clipboard.");
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `eatventure-account-${account.name || "chef"}.json`;
    a.click();
  }

  function doImport() {
    const next = importAccountJson(importText);
    if (!next) {
      setShareMsg("Import failed — check JSON.");
      return;
    }
    onImport(next);
    setShareMsg("Account imported.");
  }

  function doShare() {
    const url = encodeShareLink(account);
    void navigator.clipboard?.writeText(url);
    setShareMsg("Share link copied.");
  }

  function doSyncMake() {
    const code = makeSyncCode(account);
    setSyncCode(code);
    void navigator.clipboard?.writeText(code);
    setShareMsg("Sync code copied.");
  }

  function doSyncApply() {
    const next = applySyncCode(syncCode);
    if (!next) {
      setShareMsg("Sync code invalid.");
      return;
    }
    onImport(next);
    setShareMsg("Synced from code.");
  }

  return (
    <div className="space-y-6">
      <section className="ticket rounded-2xl p-5">
        <h2 className="font-display text-3xl font-bold text-[#14201c]">Tools</h2>
        <p className="mt-1 text-sm text-[#5c6f69]">
          Calculators, comparisons, export/import, and share links.
        </p>
      </section>

      {onApplyLevels && (
        <VaultOcrHelper account={account} onApply={onApplyLevels} />
      )}

      <CloudSyncPanel account={account} onImport={onImport} />

      {/* Gem projector */}
      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">Gem income projector</h3>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Starting from city {account.city || 1}
        </p>
        <label className="mt-3 block text-xs text-[#9bb5af]">
          Cities ahead
          <input
            type="number"
            min={1}
            max={600}
            value={citiesAhead}
            onChange={(e) => setCitiesAhead(Number(e.target.value))}
            className="field mt-1 max-w-[140px]"
          />
        </label>
        <p className="mt-3 text-2xl font-bold gold-text">
          {formatGems(projection.gems)} gems
        </p>
        <p className="text-xs text-[#9bb5af]">
          Avg city ≈ {AVG_GEMS_PER_CITY} · loop {formatGems(LOOP_GEMS)} · vault
          from zero {formatGems(TOTAL_VAULT_GEMS)}
        </p>
      </section>

      {/* What if */}
      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">What if I buy this?</h3>
        <select
          value={whatIfId}
          onChange={(e) => setWhatIfId(e.target.value as ItemId)}
          className="field mt-3 max-w-xs"
        >
          {VAULT_ITEMS.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} (lv {account.levels[i.id]})
            </option>
          ))}
        </select>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-[#9bb5af]">Now</dt>
            <dd>{formatEffect(whatIfId, whatIfLevel)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#9bb5af]">Next</dt>
            <dd>{nextEffect}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#9bb5af]">Next cost</dt>
            <dd className="text-[#3ecfb3]">{formatGems(nextCost)} gems</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#9bb5af]">Cities to afford</dt>
            <dd>{citiesForNext}</dd>
          </div>
        </dl>
      </section>

      {/* Playstyle compare */}
      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">Compare playstyles</h3>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Remaining plan from your current vault levels.{" "}
          {comparePlaystylesBase().avgGems} gems/city avg.
        </p>
        <div className="mt-3 space-y-2">
          {playstyleCompare.map((row) => (
            <div
              key={row.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm",
                row.id === account.playstyle && "ring-1 ring-[#f0b429]",
              )}
            >
              <span className="font-medium">{row.name}</span>
              <span className="text-[#9bb5af]">
                {row.steps} steps · {formatGems(row.cost)} gems · ~{row.cities}{" "}
                cities
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Clothing XP */}
      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">Clothing XP calculator</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={clothRarity}
            onChange={(e) => setClothRarity(e.target.value as ClothingRarity)}
            className="field max-w-[140px]"
          >
            {Object.keys(CLOTHING_XP).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            max={50}
            value={clothFrom}
            onChange={(e) => setClothFrom(Number(e.target.value))}
            className="field w-20"
          />
          <span className="self-center text-sm text-[#9bb5af]">to</span>
          <input
            type="number"
            min={1}
            max={50}
            value={clothTo}
            onChange={(e) => setClothTo(Number(e.target.value))}
            className="field w-20"
          />
        </div>
        <p className="mt-3 text-lg font-semibold gold-text">
          {formatGems(clothXp)} XP
        </p>
        {clothNow && (
          <p className="text-xs text-[#9bb5af]">
            At lv {clothFrom}: +{clothNow.profitPct}% profit
            {clothNow.apPct != null ? ` · +${clothNow.apPct}% AP` : ""}
          </p>
        )}
      </section>

      {/* Pet food */}
      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">Pet food calculator</h3>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="number"
            min={0}
            max={50}
            value={petFrom}
            onChange={(e) => setPetFrom(Number(e.target.value))}
            className="field w-20"
          />
          <span className="text-sm text-[#9bb5af]">to</span>
          <input
            type="number"
            min={0}
            max={50}
            value={petTo}
            onChange={(e) => setPetTo(Number(e.target.value))}
            className="field w-20"
          />
        </div>
        <p className="mt-3 text-lg font-semibold gem-text">
          {formatGems(petFood)} pet food
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-[#9bb5af]">
          <div>Common egg hatch: {EGG_COSTS.common}</div>
          <div>Rare egg hatch: {EGG_COSTS.rare}</div>
          <div>
            Merge {EGG_MERGE.commonToRare} commons → rare
          </div>
          <div>
            Merge {EGG_MERGE.rareToEpic} rares → epic
          </div>
        </div>
      </section>

      {/* Club planner */}
      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">Club contribution</h3>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Equal share target {formatGems(CLUB_EQUAL_SHARE_XP)} XP · ~
          {CLUB_XP_PER_CITY} XP/city salvaging small boxes
        </p>
        <p className="mt-3 text-2xl font-bold">
          {clubNeed} cities
        </p>
        <p className="text-xs text-[#9bb5af]">
          You have {formatGems(account.clubXp)} XP · need{" "}
          {formatGems(Math.max(0, CLUB_EQUAL_SHARE_XP - account.clubXp))} more
        </p>
      </section>

      {/* Potion overview */}
      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">Potion brewing</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {POTIONS.map((p) => (
            <div
              key={p.name}
              className="rounded-xl border border-white/10 bg-black/20 p-3"
            >
              <div className="font-medium text-[#3ecfb3]">{p.name}</div>
              <div className="text-xs text-[#9bb5af]">{p.effect}</div>
              <div className="mt-1 text-[10px] text-[#9bb5af]">
                {p.ingredients.join(" · ")}
              </div>
              {p.totalToMax && (
                <div className="mt-1 text-[10px] text-[#f0b429]">
                  {p.totalToMax}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Remote value table */}
      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">Remote value table</h3>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Ad boost multiplier by level (from your current Remote{" "}
          {account.levels.remote}).
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="text-[#9bb5af]">
              <tr>
                <th className="px-2 py-1">Level</th>
                <th className="px-2 py-1">Multiplier</th>
                <th className="px-2 py-1">Level cost</th>
                <th className="px-2 py-1">Cost from now</th>
              </tr>
            </thead>
            <tbody>
              {remoteRows.map((r) => (
                <tr key={r.level} className="border-t border-white/8">
                  <td className="px-2 py-1.5">{r.level}</td>
                  <td className="px-2 py-1.5 text-[#e8452d]">×{r.effect}</td>
                  <td className="px-2 py-1.5">{formatGems(r.cost)}</td>
                  <td className="px-2 py-1.5">{formatGems(r.toHere)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Export / import / share / sync */}
      <section className="panel rounded-2xl p-5 space-y-3">
        <h3 className="font-display text-xl font-bold">Backup & share</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={doExport}>
            Export JSON
          </button>
          <button type="button" className="btn-secondary" onClick={doShare}>
            Copy share link
          </button>
          <button type="button" className="btn-ghost" onClick={doSyncMake}>
            Make sync code
          </button>
        </div>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste account JSON to import…"
          className="field min-h-[100px] font-mono text-xs"
        />
        <button type="button" className="btn-ghost" onClick={doImport}>
          Import JSON
        </button>
        <textarea
          value={syncCode}
          onChange={(e) => setSyncCode(e.target.value)}
          placeholder="Paste sync code…"
          className="field min-h-[80px] font-mono text-xs"
        />
        <button type="button" className="btn-ghost" onClick={doSyncApply}>
          Apply sync code
        </button>
        {shareMsg && <p className="text-sm text-[#3ecfb3]">{shareMsg}</p>}
        <p className="text-xs text-[#9bb5af]">
          Sync codes are offline snapshots (no cloud server). Paste on another
          device to restore.
        </p>
      </section>
    </div>
  );
}
