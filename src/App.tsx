import { useEffect, useMemo, useState, type ReactNode } from "react";
import { VaultIcon } from "./components/VaultIcons";
import {
  DEFAULT_ACCOUNT,
  EMPTY_LEVELS,
  ITEM_MAP,
  PHASES,
  PLAYSTYLE_META,
  TOTAL_VAULT_GEMS,
  VAULT_ITEMS,
} from "./data/vault";
import {
  AVG_GEMS_PER_CITY,
  LOOP_GEMS,
  cityForNumber,
} from "./data/cities";
import { CitiesView } from "./components/CitiesView";
import { GuideView } from "./components/GuideView";
import { CatalogView } from "./components/CatalogView";
import { MatrixView } from "./components/MatrixView";
import { ForgeView } from "./components/ForgeView";
import { ToolsView } from "./components/ToolsView";
import { EventsView, MoreView } from "./components/EventsView";
import { HANDBOOK_META } from "./data/meta";
import {
  decodeShareParam,
  getTheme,
  saveProfile,
  setTheme,
  getActiveProfileId,
} from "./utils/profiles";
import {
  ARCANE_MAP,
  ARCANE_VAULT_ITEMS,
  POTIONS,
  SCROLLS_PER_EVENT_WITH_PASS,
  TOTAL_SCROLLS_TO_MAX,
} from "./data/arcane";
import {
  BEST_BUILDS,
  BLUEPRINT_RECIPES,
  CLUB_LEVELS,
  GEAR_ITEMS,
  GEAR_MAP,
  RARITY_COLORS,
  RARITY_ORDER,
  SLOT_LABELS,
} from "./data/gear";
import { BEST_PET_COMBOS, PET_FOOD_PER_LEVEL, PET_FOOD_TO_MAX, PET_MAP, PETS } from "./data/pets";
import type {
  Account,
  ArcaneVaultId,
  GearRarity,
  GearSlot,
  ItemId,
  Playstyle,
  UpgradeStep,
} from "./types";
import {
  applyStep,
  buildFocusTips,
  canUnlock,
  citiesNeededForGems,
  costToMax,
  effectAt,
  formatCash,
  formatEffect,
  formatGems,
  itemBreakdown,
  loopsNeededForGems,
  recommendedCityPhase,
  remainingMaxCost,
  remainingPriorityCost,
  remainingUnlockCost,
  spentSoFar,
  upgradeCost,
  vaultMultiplierRows,
  vaultProgress,
} from "./utils/calc";
import {
  affordablePrefix,
  buildPlan,
  groupSteps,
  planTotals,
} from "./utils/planner";
import {
  clearAccount,
  freshAccount,
  loadAccount,
  saveAccount,
} from "./utils/storage";
import { cn } from "./utils/cn";
import { Analytics } from "@vercel/analytics/react";
type MainTab =
  | "overview"
  | "vault"
  | "plan"
  | "totals"
  | "cities"
  | "gear"
  | "pets"
  | "builds"
  | "blueprints"
  | "club"
  | "arcane"
  | "guide"
  | "catalog"
  | "matrix"
  | "forge"
  | "tools"
  | "events"
  | "more";

const MAIN_TABS: { id: MainTab; label: string; group: string }[] = [
  { id: "overview", label: "Overview", group: "Play" },
  { id: "vault", label: "Vault", group: "Play" },
  { id: "plan", label: "Plan", group: "Play" },
  { id: "totals", label: "Totals", group: "Play" },
  { id: "cities", label: "Cities", group: "Play" },
  { id: "gear", label: "Gear", group: "Loadout" },
  { id: "pets", label: "Pets", group: "Loadout" },
  { id: "builds", label: "Builds", group: "Loadout" },
  { id: "forge", label: "Forge", group: "Loadout" },
  { id: "blueprints", label: "Blueprints", group: "Loadout" },
  { id: "catalog", label: "Catalog", group: "Reference" },
  { id: "matrix", label: "Matrix", group: "Reference" },
  { id: "club", label: "Club", group: "Reference" },
  { id: "arcane", label: "Arcane", group: "Reference" },
  { id: "events", label: "Events", group: "Reference" },
  { id: "guide", label: "Guide", group: "Reference" },
  { id: "tools", label: "Tools", group: "System" },
  { id: "more", label: "More", group: "System" },
];

export default function App() {
  const [account, setAccount] = useState<Account>(DEFAULT_ACCOUNT);
  const [ready, setReady] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState<MainTab>("overview");
  const [spendGems, setSpendGems] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setTheme(getTheme());
    const params = new URLSearchParams(window.location.search);
    const share = params.get("share");
    if (share) {
      const partial = decodeShareParam(share);
      if (partial) {
        setAccount((prev) => ({
          ...freshAccount(),
          ...prev,
          ...partial,
          levels: partial.levels ?? prev.levels,
        }));
        setOnboarding(false);
        setReady(true);
        setTab("overview");
        return;
      }
    }
    const saved = loadAccount();
    if (saved) {
      setAccount(saved);
      setOnboarding(false);
    } else {
      setOnboarding(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !onboarding) {
      saveAccount(account);
      saveProfile(getActiveProfileId(), account);
    }
  }, [account, ready, onboarding]);

  const plan = useMemo(() => buildPlan(account), [account]);
  const totals = useMemo(() => planTotals(plan), [plan]);
  const progress = useMemo(
    () => vaultProgress(account.levels),
    [account.levels],
  );
  const unlockLeft = useMemo(
    () => remainingUnlockCost(account.levels),
    [account.levels],
  );
  const maxLeft = useMemo(
    () => remainingMaxCost(account.levels),
    [account.levels],
  );
  const priorityLeft = useMemo(
    () => remainingPriorityCost(account.levels),
    [account.levels],
  );
  const invested = useMemo(() => spentSoFar(account.levels), [account.levels]);
  const budget = useMemo(
    () => affordablePrefix(plan, account.gems),
    [plan, account.gems],
  );
  const groups = useMemo(() => groupSteps(plan), [plan]);
  const rows = useMemo(() => itemBreakdown(account.levels), [account.levels]);
  const cityPhase = recommendedCityPhase(account.city);

  function update<K extends keyof Account>(key: K, value: Account[K]) {
    setAccount((prev) => ({ ...prev, [key]: value }));
  }

  function setLevel(id: ItemId, raw: number) {
    const item = ITEM_MAP[id];
    const next = Math.max(0, Math.min(item.maxLevel, Math.floor(raw) || 0));
    setAccount((prev) => {
      const levels = { ...prev.levels, [id]: next };
      if (next > 0) {
        for (const other of VAULT_ITEMS) {
          if (other.unlockOrder < item.unlockOrder && levels[other.id] === 0) {
            levels[other.id] = 1;
          }
        }
      }
      return { ...prev, levels };
    });
  }

  function setArcaneLevel(id: ArcaneVaultId, raw: number) {
    const item = ARCANE_MAP[id];
    const next = Math.max(0, Math.min(item.maxLevel, Math.floor(raw) || 0));
    setAccount((prev) => ({
      ...prev,
      arcaneLevels: { ...prev.arcaneLevels, [id]: next },
    }));
  }

  function addPet(petId: string) {
    setAccount((prev) => {
      if (prev.pets.some((p) => p.petId === petId)) return prev;
      const pet = PET_MAP[petId];
      return {
        ...prev,
        pets: [...prev.pets, { petId, level: 1, rarity: pet.rarity }],
        hasPanda: prev.hasPanda || petId === "panda",
      };
    });
  }

  function removePet(petId: string) {
    setAccount((prev) => ({
      ...prev,
      pets: prev.pets.filter((p) => p.petId !== petId),
      hasPanda: petId === "panda" ? false : prev.hasPanda,
    }));
  }

  function updatePetLevel(petId: string, level: number) {
    setAccount((prev) => ({
      ...prev,
      pets: prev.pets.map((p) =>
        p.petId === petId
          ? { ...p, level: Math.max(0, Math.min(50, level)) }
          : p,
      ),
    }));
  }

  function setGear(slot: GearSlot | "hand1" | "hand2", itemId: string) {
    setAccount((prev) => ({
      ...prev,
      gear: { ...prev.gear, [slot]: itemId },
    }));
  }

  function completeStep(target: UpgradeStep) {
    setAccount((prev) => {
      const steps = buildPlan(prev);
      let next = prev;
      for (const s of steps) {
        next = applyStep(next, s.itemId, s.to, spendGems);
        if (
          s.id === target.id ||
          (s.itemId === target.itemId && s.to === target.to)
        )
          break;
      }
      return next;
    });
  }

  function completeAffordable() {
    setAccount((prev) => {
      const steps = buildPlan(prev);
      let next = prev;
      let gems = prev.gems;
      for (const s of steps) {
        if (spendGems && s.cost > gems) break;
        next = applyStep(next, s.itemId, s.to, spendGems);
        if (spendGems) gems -= s.cost;
        else break;
      }
      if (!spendGems && steps[0])
        return applyStep(prev, steps[0].itemId, steps[0].to, false);
      return next;
    });
  }

  function finishOnboarding() {
    setOnboarding(false);
    saveAccount(account);
    setTab("overview");
  }

  function resetAll() {
    clearAccount();
    setAccount(freshAccount());
    setConfirmReset(false);
    setOnboarding(true);
    setStep(0);
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b2422] text-[#f0b429]">
        Opening the vault…
      </div>
    );
  }

  if (onboarding) {
    return (
      <Onboarding
        account={account}
        step={step}
        setStep={setStep}
        update={update}
        setLevel={setLevel}
        onDone={finishOnboarding}
        onSkip={() => {
          setAccount(freshAccount());
          finishOnboarding();
        }}
      />
    );
  }

  const cityMeta = cityForNumber(account.city || 1);

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[#f2f5f3]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] kitchen-grid opacity-40" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[380px] opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(11,36,34,0.2), #0b2422), url('/images/hero-vault.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 28%",
        }}
      />

      <header className="relative z-10 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="brand-mark" aria-hidden="true">
            EV
          </div>
          <div>
            <p className="font-display text-xl font-extrabold tracking-tight text-[#f0b429]">
              Eatventure Handbook
            </p>
            <p className="text-xs text-[#9bb5af]">
              v{HANDBOOK_META.handbookVersion} · patch {HANDBOOK_META.gamePatch}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://github.com/miladbn/eatvature-fun"
            target="_blank"
            rel="noreferrer"
            aria-label="Star Eatventure Handbook on GitHub"
            className="btn-ghost text-xs"
          >
            Star on GitHub
          </a>
          <GemChip value={account.gems} label="gems" />
          <GemChip value={account.scrolls} label="scrolls" gem={false} />
          <button
            type="button"
            onClick={() => setTab("cities")}
            className="btn-ghost text-xs text-[#f0b429]"
          >
            City {account.city || 1} · {cityMeta.name}
            {account.name ? ` · ${account.name}` : ""}
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl gap-6 px-4 pb-24 lg:grid-cols-[210px_1fr] sm:px-6">
        <nav className="nav-rail lg:sticky lg:top-4 lg:self-start">
          <div className="mb-1 hidden px-2 text-xs text-[#9bb5af] lg:block">
            Sections
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {MAIN_TABS.map(({ id, label, group }, index) => {
              const prev = MAIN_TABS[index - 1];
              const showGroup = !prev || prev.group !== group;
              return (
                <div key={id} className="contents lg:block">
                  {showGroup && (
                    <div className="mb-1 mt-3 hidden px-2 text-[10px] text-[#9bb5af] first:mt-0 lg:block">
                      {group}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setTab(id)}
                    className={cn(
                      "nav-item shrink-0 whitespace-nowrap",
                      tab === id && "active",
                    )}
                  >
                    {label}
                  </button>
                </div>
              );
            })}
          </div>
        </nav>

        <div className="min-w-0">
        {tab === "overview" && (
          <Overview
            account={account}
            plan={plan}
            budget={budget}
            progress={progress}
            unlockLeft={unlockLeft}
            maxLeft={maxLeft}
            priorityLeft={priorityLeft}
            invested={invested}
            cityPhase={cityPhase}
            spendGems={spendGems}
            onComplete={completeStep}
            onBurst={completeAffordable}
          />
        )}
        {tab === "vault" && (
          <AccountEditor
            account={account}
            update={update}
            setLevel={setLevel}
            spendGems={spendGems}
            setSpendGems={setSpendGems}
            confirmReset={confirmReset}
            setConfirmReset={setConfirmReset}
            onReset={resetAll}
          />
        )}
        {tab === "plan" && (
          <PlanView
            account={account}
            plan={plan}
            groups={groups}
            totals={totals}
            budget={budget}
            cityPhase={cityPhase}
            spendGems={spendGems}
            setSpendGems={setSpendGems}
            onComplete={completeStep}
            onBurst={completeAffordable}
          />
        )}
        {tab === "totals" && (
          <TotalsView
            rows={rows}
            invested={invested}
            unlockLeft={unlockLeft}
            maxLeft={maxLeft}
            priorityLeft={priorityLeft}
          />
        )}
        {tab === "cities" && (
          <CitiesView
            currentCity={account.city}
            gemsToMaxVault={maxLeft}
            gemsToPriority={priorityLeft}
          />
        )}
        {tab === "gear" && <GearView account={account} setGear={setGear} />}
        {tab === "pets" && (
          <PetsView
            account={account}
            addPet={addPet}
            removePet={removePet}
            updatePetLevel={updatePetLevel}
          />
        )}
        {tab === "club" && <ClubView account={account} update={update} />}
        {tab === "arcane" && (
          <ArcaneView
            account={account}
            setArcaneLevel={setArcaneLevel}
            update={update}
          />
        )}
        {tab === "builds" && <BuildsView account={account} />}
        {tab === "blueprints" && <BlueprintsView />}
        {tab === "guide" && <GuideView />}
        {tab === "catalog" && <CatalogView />}
        {tab === "matrix" && <MatrixView />}
        {tab === "forge" && (
          <ForgeView
            account={account}
            setInventory={(inventory) =>
              setAccount((prev) => ({ ...prev, inventory }))
            }
          />
        )}
        {tab === "tools" && (
          <ToolsView
            account={account}
            onImport={(next) => {
              setAccount(next);
              setOnboarding(false);
            }}
          />
        )}
        {tab === "events" && <EventsView />}
        {tab === "more" && (
          <MoreView
            account={account}
            setNotes={(notes) => setAccount((prev) => ({ ...prev, notes }))}
            onSwitchProfile={(next) => {
              setAccount(next);
              setOnboarding(false);
            }}
          />
        )}
        </div>
      </main>

      <nav className="mobile-dock lg:hidden">
        {(
          [
            ["overview", "Home"],
            ["plan", "Plan"],
            ["cities", "Cities"],
            ["tools", "Tools"],
            ["more", "More"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn("mobile-dock-item", tab === id && "active")}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ─── Onboarding ─── */
function Onboarding({
  account,
  step,
  setStep,
  update,
  setLevel,
  onDone,
  onSkip,
}: {
  account: Account;
  step: number;
  setStep: (n: number) => void;
  update: <K extends keyof Account>(k: K, v: Account[K]) => void;
  setLevel: (id: ItemId, raw: number) => void;
  onDone: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="relative min-h-screen bg-[#0b2422] text-[#f2f5f3]">
      <Analytics />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(9,7,4,0.25), rgba(9,7,4,0.78) 55%, #0b2422), url('/images/hero-vault.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-10">
        <div className="panel shine rounded-[32px] p-6 sm:p-10">
          <p className="text-xs tracking-wide text-[#f0b429]/80">
            Step {step + 1} of 3
          </p>
          {step === 0 && (
            <div className="rise">
              <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                Crack the vault.
              </h1>
              <p className="mt-4 max-w-lg text-[#9bb5af]">
                Track your Eatventure account from the Spectre handbook — vault,
                cities, gear, pets, club, and arcane. Saved on this device.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-primary"
                >
                  Enter my account
                </button>
                <button
                  type="button"
                  onClick={onSkip}
                  className="btn-secondary"
                >
                  Start empty
                </button>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="rise space-y-5">
              <h2 className="mt-3 font-display text-3xl">Your kitchen</h2>
              <Field label="Chef name (optional)">
                <input
                  value={account.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Spectre"
                  className="field"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Current city">
                  <input
                    type="number"
                    min={1}
                    value={account.city}
                    onChange={(e) => update("city", Number(e.target.value))}
                    className="field"
                  />
                </Field>
                <Field label="Gems on hand">
                  <input
                    type="number"
                    min={0}
                    value={account.gems}
                    onChange={(e) => update("gems", Number(e.target.value))}
                    className="field"
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Scrolls on hand">
                  <input
                    type="number"
                    min={0}
                    value={account.scrolls}
                    onChange={(e) => update("scrolls", Number(e.target.value))}
                    className="field"
                  />
                </Field>
                <Field label="Cities completed">
                  <input
                    type="number"
                    min={0}
                    value={account.citiesCompleted}
                    onChange={(e) =>
                      update("citiesCompleted", Number(e.target.value))
                    }
                    className="field"
                  />
                </Field>
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-[#f0b429]/15 bg-black/20 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={account.hasPanda}
                  onChange={(e) => update("hasPanda", e.target.checked)}
                  className="accent-[#f0b429]"
                />
                I own the Legendary Panda (skip Register upgrades)
              </label>
              <Field label="Upgrade structure">
                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.keys(PLAYSTYLE_META) as Playstyle[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => update("playstyle", id)}
                      className={cn(
                        "rounded-2xl border px-3 py-3 text-left",
                        account.playstyle === id
                          ? "border-[#f0b429] bg-[#f0b429]/10"
                          : "border-[#f0b429]/15 bg-black/20",
                      )}
                    >
                      <div className="text-sm font-medium">
                        {PLAYSTYLE_META[id].name}
                      </div>
                      <div className="mt-1 text-xs text-[#9bb5af]">
                        {PLAYSTYLE_META[id].tagline}
                      </div>
                    </button>
                  ))}
                </div>
              </Field>
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="text-sm text-[#9bb5af]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-lg bg-[#f0b429] px-5 py-2.5 text-sm font-semibold text-[#0b2422]"
                >
                  Set vault levels
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="rise">
              <h2 className="mt-3 font-display text-3xl">Current vault</h2>
              <p className="mt-2 text-sm text-[#9bb5af]">
                0 means locked. Unlocking a later card will auto-unlock the ones
                before it.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => update("levels", { ...EMPTY_LEVELS })}
                  className="rounded-lg border border-[#f0b429]/20 px-3 py-1.5 text-xs"
                >
                  All locked
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const l = { ...EMPTY_LEVELS };
                    VAULT_ITEMS.forEach((i) => (l[i.id] = 1));
                    update("levels", l);
                  }}
                  className="rounded-lg border border-[#f0b429]/20 px-3 py-1.5 text-xs"
                >
                  All unlocked at 1
                </button>
              </div>
              <div className="mt-4 grid max-h-[48vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {VAULT_ITEMS.map((item) => (
                  <LevelRow
                    key={item.id}
                    id={item.id}
                    level={account.levels[item.id]}
                    levels={account.levels}
                    onChange={(n) => setLevel(item.id, n)}
                  />
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-[#9bb5af]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={onDone}
                  className="rounded-lg bg-[#f0b429] px-5 py-2.5 text-sm font-semibold text-[#0b2422]"
                >
                  Build my plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Overview ─── */
function Overview({
  account,
  plan,
  budget,
  progress,
  unlockLeft,
  maxLeft,
  priorityLeft,
  invested,
  cityPhase,
  spendGems,
  onComplete,
  onBurst,
}: {
  account: Account;
  plan: UpgradeStep[];
  budget: { spent: number; count: number; leftover: number };
  progress: ReturnType<typeof vaultProgress>;
  unlockLeft: number;
  maxLeft: number;
  priorityLeft: number;
  invested: number;
  cityPhase: string;
  spendGems: boolean;
  onComplete: (s: UpgradeStep) => void;
  onBurst: () => void;
}) {
  const next = plan[0];
  const phase = PHASES.find((p) => p.id === cityPhase);
  const nextFive = plan.slice(0, 5);
  const arcaneDone = ARCANE_VAULT_ITEMS.filter(
    (i) => account.arcaneLevels[i.id] >= i.maxLevel,
  ).length;
  const petCount = account.pets.length;
  const hasGear = account.gear.head || account.gear.body || account.gear.hand1;
  const cityMeta = cityForNumber(account.city || 1);
  const multipliers = vaultMultiplierRows(account.levels);
  const focusTips = buildFocusTips(
    account.levels,
    account.city || 1,
    account.hasPanda,
    account.playstyle,
    next
      ? { itemId: next.itemId, kind: next.kind, reason: next.reason }
      : null,
  );
  const citiesToFull = citiesNeededForGems(maxLeft, AVG_GEMS_PER_CITY);
  const citiesToPriority = citiesNeededForGems(priorityLeft, AVG_GEMS_PER_CITY);
  const citiesAtCurrent = citiesNeededForGems(maxLeft, cityMeta.gems);
  const loopsToFull = loopsNeededForGems(maxLeft, LOOP_GEMS);
  const keyMultis = multipliers.filter((m) =>
    ["remote", "register", "mop", "checkbook", "tv", "pickaxe", "tipJar"].includes(
      m.id,
    ),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="ticket rounded-2xl p-4">
          <div className="text-xs font-medium text-[#5c6f69]">
            Cities to max vault
          </div>
          <div className="mt-1 font-display text-3xl font-extrabold text-[#e8452d]">
            {citiesToFull.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-[#5c6f69]">
            ~{AVG_GEMS_PER_CITY} gems/city · {formatGems(maxLeft)} gems left
          </p>
        </div>
        <div className="stat-tile">
          <div className="text-[11px] text-[#9bb5af]">At your city rate</div>
          <div className="mt-1 font-display text-2xl font-bold gold-text">
            {citiesAtCurrent.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-[#9bb5af]">
            {cityMeta.name} pays {cityMeta.gems} gems
          </p>
        </div>
        <div className="stat-tile">
          <div className="text-[11px] text-[#9bb5af]">Priority path only</div>
          <div className="mt-1 font-display text-2xl font-bold gem-text">
            {citiesToPriority.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-[#9bb5af]">
            Upgrade-when-possible cards · {formatGems(priorityLeft)} gems
          </p>
        </div>
        <div className="stat-tile">
          <div className="text-[11px] text-[#9bb5af]">60-city loops left</div>
          <div className="mt-1 font-display text-2xl font-bold">
            {loopsToFull.toFixed(1)}
          </div>
          <p className="mt-1 text-[11px] text-[#9bb5af]">
            {formatGems(LOOP_GEMS)} gems per full loop
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <div className="ticket rise rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#5c6f69]">
                Next kitchen ticket
              </p>
              {next ? (
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#14201c]">
                  {next.kind === "unlock" ? "Unlock" : "Upgrade"}{" "}
                  {ITEM_MAP[next.itemId].name}
                </h2>
              ) : (
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#14201c]">
                  Vault is finished.
                </h2>
              )}
            </div>
            {next && (
              <div className="text-right">
                <div className="text-3xl font-bold text-[#e8452d]">
                  {formatGems(next.cost)}
                </div>
                <div className="text-xs text-[#5c6f69]">gems</div>
              </div>
            )}
          </div>
          {next && (
            <>
              <div className="mt-5 flex items-center gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white/70"
                  style={{ background: `${ITEM_MAP[next.itemId].accent}33` }}
                >
                  <VaultIcon id={next.itemId} className="h-12 w-12" />
                </div>
                <div>
                  <p className="text-sm text-[#2a3d38]">
                    {next.kind === "unlock"
                      ? `Open ${ITEM_MAP[next.itemId].name} at level 1.`
                      : `Level ${next.from} → ${next.to} · ${formatEffect(next.itemId, next.to)}`}
                  </p>
                  <p className="mt-1 text-sm text-[#5c6f69]">{next.reason}</p>
                  <p className="mt-1 text-xs font-medium text-[#e8452d]">
                    {next.phaseName} · {ITEM_MAP[next.itemId].effectLabel}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onComplete(next)}
                  className="btn-primary"
                >
                  {spendGems ? "I bought this" : "Mark complete"}
                </button>
                <button
                  type="button"
                  onClick={onBurst}
                  className="rounded-lg border border-[#14201c]/20 bg-white/60 px-5 py-2.5 text-sm font-semibold text-[#14201c]"
                >
                  {spendGems
                    ? `Spend ${formatGems(budget.spent)} on next ${budget.count || 0}`
                    : "Complete next only"}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="panel rounded-2xl p-5">
          <h3 className="font-display text-xl font-bold">What to focus on</h3>
          <p className="mt-1 text-sm text-[#9bb5af]">
            Based on your vault levels, city {account.city || 1}, and{" "}
            {PLAYSTYLE_META[account.playstyle].name}.
          </p>
          <div className="mt-4 space-y-2">
            {focusTips.map((tip) => (
              <div
                key={tip.title}
                className={cn(
                  "rounded-xl border px-3 py-3",
                  tip.tone === "now" &&
                    "border-[#e8452d]/40 bg-[#e8452d]/10",
                  tip.tone === "soon" &&
                    "border-[#f0b429]/30 bg-[#f0b429]/8",
                  tip.tone === "later" && "border-white/10 bg-black/20",
                  tip.tone === "done" &&
                    "border-[#3ecfb3]/30 bg-[#3ecfb3]/8",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                      tip.tone === "now" && "bg-[#e8452d] text-white",
                      tip.tone === "soon" && "bg-[#f0b429] text-[#0b2422]",
                      tip.tone === "later" && "bg-white/10 text-[#9bb5af]",
                      tip.tone === "done" && "bg-[#3ecfb3] text-[#0b2422]",
                    )}
                  >
                    {tip.tone === "now"
                      ? "Now"
                      : tip.tone === "soon"
                        ? "Soon"
                        : tip.tone === "done"
                          ? "Done"
                          : "Later"}
                  </span>
                  <span className="font-medium">{tip.title}</span>
                </div>
                <p className="mt-1 text-xs text-[#9bb5af]">{tip.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-xl font-bold">Coming up</h3>
            <span className="text-xs text-[#9bb5af]">
              {plan.length} steps left
            </span>
          </div>
          <div className="space-y-2">
            {nextFive.length === 0 && (
              <p className="text-sm text-[#9bb5af]">
                Nothing left on this path.
              </p>
            )}
            {nextFive.map((s, i) => (
              <StepRow
                key={s.id}
                step={s}
                index={i + 1}
                dim={false}
                onComplete={() => onComplete(s)}
                compact
              />
            ))}
          </div>
        </div>
      </div>
      <aside className="space-y-6">
        <div className="panel rounded-2xl p-5">
          <h3 className="font-display text-xl font-bold">Your multipliers</h3>
          <p className="mt-1 text-sm text-[#9bb5af]">
            Live vault effects at your current levels.
          </p>
          <div className="mt-4 space-y-3">
            {keyMultis.map((row) => (
              <div key={row.id}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2">
                    <VaultIcon id={row.id} className="h-6 w-6" />
                    {row.name}
                  </span>
                  <span className="font-semibold" style={{ color: row.accent }}>
                    {row.current}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-[#9bb5af]">
                  <span>
                    Lv {row.level}/{row.maxLevel} · max {row.max}
                  </span>
                  <PriorityBadge priority={row.priority} />
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/40">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${row.progress}%`,
                      background: row.accent,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel rounded-2xl p-5">
          <h3 className="font-display text-xl font-bold">Account snapshot</h3>
          <p className="mt-1 text-sm text-[#9bb5af]">
            {PLAYSTYLE_META[account.playstyle].name} · {cityMeta.name} (city{" "}
            {account.city || 1}) · {cityMeta.gems} gems here
          </p>
          <div className="mt-4 rounded-xl border border-[#f0b429]/20 bg-black/20 p-4">
            <p className="text-xs tracking-wide text-[#f0b429]">
              Handbook phase
            </p>
            <p className="mt-1 font-display text-2xl font-bold">{phase?.name}</p>
            <p className="mt-1 text-sm text-[#9bb5af]">{phase?.blurb}</p>
            <p className="mt-2 text-xs text-[#f0b429]/80">{phase?.cityRange}</p>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <Row k="Gems invested" v={formatGems(invested)} />
            <Row k="Still to unlock" v={formatGems(unlockLeft)} />
            <Row k="Still to 100% vault" v={formatGems(maxLeft)} />
            <Row
              k="Cities to finish vault"
              v={`${citiesToFull.toLocaleString()} @ avg`}
            />
            <Row k="Your gems cover" v={`${budget.count} steps`} />
            <Row
              k="Cards unlocked"
              v={`${progress.unlocked}/${progress.totalItems}`}
            />
            <Row
              k="Vault levels"
              v={`${progress.levelsOwned}/${progress.levelsMax} (${progress.percent.toFixed(0)}%)`}
            />
            <Row k="Cities completed" v={String(account.citiesCompleted)} />
            <Row k="Pets owned" v={String(petCount)} />
            <Row k="Gear equipped" v={hasGear ? "Yes" : "None"} />
            <Row
              k="Arcane vault done"
              v={`${arcaneDone}/${ARCANE_VAULT_ITEMS.length}`}
            />
          </dl>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#f0b429]/15">
          <img
            src="/images/gold-coins.png"
            alt=""
            className="h-40 w-full object-cover opacity-90"
          />
          <div className="bg-[#102a27] p-4 text-xs text-[#9bb5af]">
            Full vault from zero is{" "}
            <span className="text-[#f0b429]">
              {formatGems(TOTAL_VAULT_GEMS)}
            </span>{" "}
            gems (~
            {Math.ceil(TOTAL_VAULT_GEMS / AVG_GEMS_PER_CITY).toLocaleString()}{" "}
            cities). You still need about{" "}
            <span className="text-[#3ecfb3]">
              {citiesToFull.toLocaleString()} cities
            </span>{" "}
            or {loopsToFull.toFixed(1)} loops from where you are.
          </div>
        </div>
      </aside>
      </div>
    </div>
  );
}

/* ─── Account Editor ─── */
function AccountEditor({
  account,
  update,
  setLevel,
  spendGems,
  setSpendGems,
  confirmReset,
  setConfirmReset,
  onReset,
}: {
  account: Account;
  update: <K extends keyof Account>(k: K, v: Account[K]) => void;
  setLevel: (id: ItemId, raw: number) => void;
  spendGems: boolean;
  setSpendGems: (v: boolean) => void;
  confirmReset: boolean;
  setConfirmReset: (v: boolean) => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="panel space-y-4 rounded-3xl p-5">
        <h2 className="font-display text-2xl">Account</h2>
        <Field label="Chef name">
          <input
            value={account.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full rounded-xl border border-[#f0b429]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#f0b429]"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <input
              type="number"
              min={1}
              value={account.city}
              onChange={(e) => update("city", Number(e.target.value))}
              className="w-full rounded-xl border border-[#f0b429]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#f0b429]"
            />
          </Field>
          <Field label="Gems">
            <input
              type="number"
              min={0}
              value={account.gems}
              onChange={(e) => update("gems", Number(e.target.value))}
              className="w-full rounded-xl border border-[#f0b429]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#f0b429]"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Scrolls">
            <input
              type="number"
              min={0}
              value={account.scrolls}
              onChange={(e) => update("scrolls", Number(e.target.value))}
              className="w-full rounded-xl border border-[#f0b429]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#f0b429]"
            />
          </Field>
          <Field label="Cities done">
            <input
              type="number"
              min={0}
              value={account.citiesCompleted}
              onChange={(e) =>
                update("citiesCompleted", Number(e.target.value))
              }
              className="w-full rounded-xl border border-[#f0b429]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#f0b429]"
            />
          </Field>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={account.hasPanda}
            onChange={(e) => update("hasPanda", e.target.checked)}
            className="accent-[#f0b429]"
          />{" "}
          Legendary Panda owned
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={spendGems}
            onChange={(e) => setSpendGems(e.target.checked)}
            className="accent-[#3ecfb3]"
          />{" "}
          Subtract gems when I complete a step
        </label>
        <Field label="Structure">
          <select
            value={account.playstyle}
            onChange={(e) => update("playstyle", e.target.value as Playstyle)}
            className="w-full rounded-xl border border-[#f0b429]/20 bg-black/30 px-3 py-2 outline-none"
          >
            {(Object.keys(PLAYSTYLE_META) as Playstyle[]).map((id) => (
              <option key={id} value={id}>
                {PLAYSTYLE_META[id].name}
              </option>
            ))}
          </select>
        </Field>
        <p className="text-xs text-[#9bb5af]">
          {PLAYSTYLE_META[account.playstyle].tagline}
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => update("levels", { ...EMPTY_LEVELS })}
            className="rounded-lg border border-[#f0b429]/20 px-3 py-1.5 text-xs"
          >
            Lock all
          </button>
          <button
            type="button"
            onClick={() => {
              const l = { ...EMPTY_LEVELS };
              VAULT_ITEMS.forEach((i) => (l[i.id] = 1));
              update("levels", l);
            }}
            className="rounded-lg border border-[#f0b429]/20 px-3 py-1.5 text-xs"
          >
            Unlock all
          </button>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="rounded-lg border border-rose-400/30 px-3 py-1.5 text-xs text-rose-300"
            >
              Reset saved data
            </button>
          ) : (
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs text-white"
            >
              Confirm wipe
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {VAULT_ITEMS.map((item) => (
          <article key={item.id} className="panel rounded-3xl p-4">
            <div className="flex items-start gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: `${item.accent}22` }}
              >
                <VaultIcon id={item.id} className="h-10 w-10" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-medium">{item.name}</h3>
                  <PriorityBadge priority={item.priority} />
                </div>
                <p className="text-xs text-[#9bb5af]">{item.effectLabel}</p>
              </div>
            </div>
            <LevelRow
              id={item.id}
              level={account.levels[item.id]}
              levels={account.levels}
              onChange={(n) => setLevel(item.id, n)}
            />
            <div className="mt-2 flex justify-between text-[11px] text-[#9bb5af]">
              <span>Now {formatEffect(item.id, account.levels[item.id])}</span>
              <span>
                {account.levels[item.id] >= item.maxLevel
                  ? "Maxed"
                  : `${formatGems(upgradeCost(item.id, account.levels[item.id] + 1))} next · ${formatGems(costToMax(item.id, account.levels[item.id]))} to max`}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-lg bg-black/40">
              <div
                className="h-full rounded-lg"
                style={{
                  width: `${(account.levels[item.id] / item.maxLevel) * 100}%`,
                  background: item.accent,
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ─── Plan View ─── */
function PlanView({
  account,
  plan,
  groups,
  totals,
  budget,
  cityPhase,
  spendGems,
  setSpendGems,
  onComplete,
  onBurst,
}: {
  account: Account;
  plan: UpgradeStep[];
  groups: { phaseId: string; phaseName: string; steps: UpgradeStep[] }[];
  totals: ReturnType<typeof planTotals>;
  budget: { spent: number; count: number; leftover: number };
  cityPhase: string;
  spendGems: boolean;
  setSpendGems: (v: boolean) => void;
  onComplete: (s: UpgradeStep) => void;
  onBurst: () => void;
}) {
  let running = 0;
  return (
    <div className="space-y-6">
      <div className="panel flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5">
        <div>
          <h2 className="font-display text-2xl">
            {totals.count} steps · {formatGems(totals.cost)} gems
          </h2>
          <p className="text-sm text-[#9bb5af]">
            With {formatGems(account.gems)} gems you can finish the next{" "}
            {budget.count} steps ({formatGems(budget.spent)} spent,{" "}
            {formatGems(Math.max(0, budget.leftover))} left).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={spendGems}
              onChange={(e) => setSpendGems(e.target.checked)}
              className="accent-[#3ecfb3]"
            />{" "}
            Spend gems on complete
          </label>
          <button
            type="button"
            onClick={onBurst}
            disabled={plan.length === 0}
            className="rounded-lg bg-[#3ecfb3] px-4 py-2 text-sm font-semibold text-[#0a2a27] disabled:opacity-40"
          >
            Complete next affordable
          </button>
        </div>
      </div>
      {groups.map((group) => {
        const meta = PHASES.find((p) => p.id === group.phaseId);
        const active = group.phaseId === cityPhase;
        return (
          <section key={group.phaseId} className="panel rounded-3xl p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-2xl">{group.phaseName}</h3>
                  {active && (
                    <span className="rounded-lg bg-[#f0b429] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#0b2422] uppercase">
                      your city
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#9bb5af]">{meta?.blurb}</p>
              </div>
              <p className="text-sm text-[#f0b429]">
                {group.steps.length} steps ·{" "}
                {formatGems(group.steps.reduce((s, x) => s + x.cost, 0))} gems
              </p>
            </div>
            <div className="space-y-2">
              {group.steps.map((s) => {
                running += s.cost;
                const inBudget = running <= account.gems;
                return (
                  <StepRow
                    key={s.id}
                    step={s}
                    index={plan.indexOf(s) + 1}
                    dim={!inBudget && account.gems > 0}
                    running={running}
                    onComplete={() => onComplete(s)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
      {plan.length === 0 && (
        <div className="panel rounded-3xl p-10 text-center">
          <p className="font-display text-3xl">The vault is complete.</p>
          <p className="mt-2 text-[#9bb5af]">
            Every card on this structure is already maxed.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Totals View ─── */
function TotalsView({
  rows,
  invested,
  unlockLeft,
  maxLeft,
  priorityLeft,
}: {
  rows: ReturnType<typeof itemBreakdown>;
  invested: number;
  unlockLeft: number;
  maxLeft: number;
  priorityLeft: number;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat
          label="Already invested"
          value={formatGems(invested)}
          hint="gems spent so far"
        />
        <Stat
          label="Unlock remaining"
          value={formatGems(unlockLeft)}
          hint="buy locked cards"
          gem
        />
        <Stat
          label="Priority to max"
          value={formatGems(priorityLeft)}
          hint={`${citiesNeededForGems(priorityLeft, AVG_GEMS_PER_CITY).toLocaleString()} cities`}
        />
        <Stat
          label="Full vault to max"
          value={formatGems(maxLeft)}
          hint={`${citiesNeededForGems(maxLeft, AVG_GEMS_PER_CITY).toLocaleString()} cities · ${loopsNeededForGems(maxLeft, LOOP_GEMS).toFixed(1)} loops`}
        />
      </div>
      <div className="panel overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-black/30 text-xs tracking-wide text-[#f0b429]">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Current</th>
                <th className="px-4 py-3">Next</th>
                <th className="px-4 py-3 text-right">Next cost</th>
                <th className="px-4 py-3 text-right">To max</th>
                <th className="px-4 py-3 text-right">Cities</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.item.id} className="border-t border-[#f0b429]/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <VaultIcon id={row.item.id} className="h-8 w-8" />
                      <div>
                        <div>{row.item.name}</div>
                        <div className="text-[11px] text-[#9bb5af]">
                          Unlock{" "}
                          {row.item.unlockCost === 0
                            ? "Free"
                            : formatGems(row.item.unlockCost)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={row.item.priority} />
                  </td>
                  <td className="px-4 py-3">
                    {row.locked
                      ? "Locked"
                      : `${row.level}/${row.item.maxLevel}`}
                  </td>
                  <td className="px-4 py-3">{row.currentEffect}</td>
                  <td className="px-4 py-3">{row.nextEffect}</td>
                  <td className="px-4 py-3 text-right">
                    {row.maxed ? "—" : formatGems(row.next)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatGems(row.toMax)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {(row.toMax / AVG_GEMS_PER_CITY).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-[#9bb5af]">
        Source: Spectre Eatventure Handbook. Level costs match the public vault
        sheet. City estimates use ~{AVG_GEMS_PER_CITY} gems per city (
        {formatGems(LOOP_GEMS)} per 60-city loop) and ignore event / investor
        extras.
      </p>
    </div>
  );
}

/* ─── Gear View ─── */
function GearView({
  account,
  setGear,
}: {
  account: Account;
  setGear: (slot: GearSlot | "hand1" | "hand2", id: string) => void;
}) {
  const slots: { key: keyof Account["gear"]; label: string; slot: GearSlot }[] =
    [
      { key: "head", label: "Head", slot: "head" },
      { key: "body", label: "Body", slot: "body" },
      { key: "hand1", label: "Hand 1", slot: "hand" },
      { key: "hand2", label: "Hand 2", slot: "hand" },
    ];
  const equipped = [
    account.gear.head,
    account.gear.body,
    account.gear.hand1,
    account.gear.hand2,
  ].filter(Boolean);
  const totalProfit = equipped.reduce(
    (sum, id) => sum + (GEAR_MAP[id]?.profitPct ?? 0),
    0,
  );
  const totalWalk = equipped.reduce(
    (sum, id) => sum + (GEAR_MAP[id]?.walkSpeed ?? 0),
    0,
  );
  const totalInstant = equipped.reduce(
    (sum, id) => sum + (GEAR_MAP[id]?.instantFood ?? 0),
    0,
  );
  const totalPerfect = equipped.reduce(
    (sum, id) => sum + (GEAR_MAP[id]?.perfectFood ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="panel rounded-3xl p-5">
        <h2 className="font-display text-2xl">Equipped Gear</h2>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Select what you currently wear. Stats are calculated from equipped
          items.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {slots.map(({ key, label, slot }) => (
            <div key={key}>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#9bb5af]">
                {label}
              </label>
              <select
                value={account.gear[key]}
                onChange={(e) => setGear(key, e.target.value)}
                className="w-full rounded-xl border border-[#f0b429]/20 bg-black/30 px-3 py-2 text-sm outline-none"
              >
                <option value="">None</option>
                {GEAR_ITEMS.filter((g) => g.slot === slot)
                  .sort(
                    (a, b) =>
                      RARITY_ORDER.indexOf(a.rarity) -
                      RARITY_ORDER.indexOf(b.rarity),
                  )
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.rarity})
                    </option>
                  ))}
              </select>
              {account.gear[key] && GEAR_MAP[account.gear[key]] && (
                <div className="mt-2 rounded-xl border border-[#f0b429]/10 bg-black/20 p-2 text-xs">
                  <div
                    className="font-medium"
                    style={{
                      color: RARITY_COLORS[GEAR_MAP[account.gear[key]].rarity],
                    }}
                  >
                    {GEAR_MAP[account.gear[key]].name}
                  </div>
                  <div className="mt-1 text-[#9bb5af]">
                    {GEAR_MAP[account.gear[key]].description}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {GEAR_MAP[account.gear[key]].profitPct > 0 && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-300">
                        +{GEAR_MAP[account.gear[key]].profitPct}% profit
                      </span>
                    )}
                    {GEAR_MAP[account.gear[key]].walkSpeed > 0 && (
                      <span className="rounded bg-teal-500/15 px-1.5 py-0.5 text-teal-300">
                        +{GEAR_MAP[account.gear[key]].walkSpeed}% walk
                      </span>
                    )}
                    {GEAR_MAP[account.gear[key]].instantFood > 0 && (
                      <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">
                        {GEAR_MAP[account.gear[key]].instantFood}% instant
                      </span>
                    )}
                    {GEAR_MAP[account.gear[key]].perfectFood > 0 && (
                      <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-purple-300">
                        {GEAR_MAP[account.gear[key]].perfectFood}% perfect
                      </span>
                    )}
                    {GEAR_MAP[account.gear[key]].allWorker && (
                      <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-blue-300">
                        All-worker
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat
          label="Total Profit"
          value={`+${totalProfit}%`}
          hint="from equipped gear"
        />
        <Stat
          label="Walk Speed"
          value={`+${totalWalk}%`}
          hint="movement speed"
        />
        <Stat
          label="Instant Food"
          value={`${totalInstant}%`}
          hint="chance to serve instantly"
        />
        <Stat
          label="Perfect Food"
          value={`${totalPerfect}%`}
          hint="chance for perfect food"
        />
      </div>
      <div className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">Build checker</h3>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Your totals vs handbook targets. Aim: 100% instant, then perfect, then
          walk.
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          <li>
            Instant:{" "}
            <span
              className={
                totalInstant >= 100 ? "text-[#3ecfb3]" : "text-[#f0b429]"
              }
            >
              {totalInstant}%
            </span>{" "}
            {totalInstant >= 100 ? "— capped" : `— need ${100 - totalInstant}% more`}
          </li>
          <li>
            Perfect:{" "}
            <span
              className={
                totalPerfect >= 100 ? "text-[#3ecfb3]" : "text-[#9bb5af]"
              }
            >
              {totalPerfect}%
            </span>
          </li>
          <li>Walk: +{totalWalk}%</li>
          <li>Profit: +{totalProfit}%</li>
        </ul>
        <p className="mt-3 text-xs text-[#9bb5af]">
          City {account.city}: see Builds tab for the recommended set in your
          range.
        </p>
      </div>
      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">All Gear Items</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {GEAR_ITEMS.sort(
            (a, b) =>
              RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity),
          ).map((g) => (
            <div
              key={g.id}
              className="rounded-2xl border border-[#f0b429]/10 bg-black/20 p-3"
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-medium"
                  style={{ color: RARITY_COLORS[g.rarity] }}
                >
                  {g.name}
                </span>
                <span
                  className="text-[10px] uppercase"
                  style={{ color: RARITY_COLORS[g.rarity] }}
                >
                  {g.rarity}
                </span>
              </div>
              <div className="text-[11px] text-[#9bb5af]">
                {SLOT_LABELS[g.slot]} · {g.description}
              </div>
              <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                {g.profitPct > 0 && (
                  <span className="rounded bg-amber-500/10 px-1 py-0.5 text-amber-300">
                    +{g.profitPct}%
                  </span>
                )}
                {g.walkSpeed > 0 && (
                  <span className="rounded bg-teal-500/10 px-1 py-0.5 text-teal-300">
                    +{g.walkSpeed}% walk
                  </span>
                )}
                {g.instantFood > 0 && (
                  <span className="rounded bg-emerald-500/10 px-1 py-0.5 text-emerald-300">
                    {g.instantFood}% instant
                  </span>
                )}
                {g.perfectFood > 0 && (
                  <span className="rounded bg-purple-500/10 px-1 py-0.5 text-purple-300">
                    {g.perfectFood}% perfect
                  </span>
                )}
                {g.allWorker && (
                  <span className="rounded bg-blue-500/10 px-1 py-0.5 text-blue-300">
                    All-worker
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Pets View ─── */
function PetsView({
  account,
  addPet,
  removePet,
  updatePetLevel,
}: {
  account: Account;
  addPet: (id: string) => void;
  removePet: (id: string) => void;
  updatePetLevel: (id: string, level: number) => void;
}) {
  const ownedIds = new Set(account.pets.map((p) => p.petId));
  return (
    <div className="space-y-6">
      <div className="panel rounded-3xl p-5">
        <h2 className="font-display text-2xl">Your Pets</h2>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Add pets you own and set their level. Save all pet food for Legendary
          Panda first.
        </p>
        {account.pets.length === 0 ? (
          <p className="mt-4 text-sm text-[#9bb5af]">
            No pets added yet. Add one below.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {account.pets.map((op) => {
              const pet = PET_MAP[op.petId];
              if (!pet) return null;
              return (
                <div
                  key={op.petId}
                  className="rounded-2xl border border-[#f0b429]/15 bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div
                        className="font-medium"
                        style={{
                          color: RARITY_COLORS[pet.rarity as GearRarity],
                        }}
                      >
                        {pet.name}
                      </div>
                      <div className="text-xs text-[#9bb5af]">
                        {pet.rarity} · {pet.ability}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePet(op.petId)}
                      className="text-xs text-rose-400"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-[#9bb5af]">Level</span>
                    <button
                      type="button"
                      onClick={() => updatePetLevel(op.petId, op.level - 1)}
                      className="h-7 w-7 rounded border border-[#f0b429]/20 text-sm"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={op.level}
                      onChange={(e) =>
                        updatePetLevel(op.petId, Number(e.target.value))
                      }
                      className="h-7 w-14 rounded border border-[#f0b429]/20 bg-black/30 text-center text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => updatePetLevel(op.petId, op.level + 1)}
                      className="h-7 w-7 rounded border border-[#f0b429]/20 text-sm"
                    >
                      +
                    </button>
                    <span className="text-xs text-[#9bb5af]">/ 50</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-lg bg-black/40">
                    <div
                      className="h-full rounded-lg bg-[#f0b429]"
                      style={{ width: `${(op.level / 50) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Add a Pet</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PETS.sort(
            (a, b) =>
              RARITY_ORDER.indexOf(a.rarity as GearRarity) -
              RARITY_ORDER.indexOf(b.rarity as GearRarity),
          ).map((pet) => (
            <button
              key={pet.id}
              type="button"
              onClick={() => addPet(pet.id)}
              disabled={ownedIds.has(pet.id)}
              className={cn(
                "rounded-2xl border p-3 text-left transition",
                ownedIds.has(pet.id)
                  ? "border-[#f0b429]/10 opacity-40"
                  : "border-[#f0b429]/15 bg-black/20 hover:border-[#f0b429]/40",
              )}
            >
              <div
                className="font-medium"
                style={{ color: RARITY_COLORS[pet.rarity as GearRarity] }}
              >
                {pet.name}
              </div>
              <div className="text-[11px] text-[#9bb5af]">
                {pet.rarity} · {pet.ability}
              </div>
              {ownedIds.has(pet.id) && (
                <div className="mt-1 text-[10px] text-[#f0b429]">Owned</div>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Best Pet Combos</h3>
        <div className="mt-3 space-y-2">
          {BEST_PET_COMBOS.map((c, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#f0b429]/10 bg-black/20 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{c.combo}</span>
                <span className="text-xs text-[#f0b429]">{c.city}</span>
              </div>
              <div className="text-xs text-[#9bb5af]">{c.notes}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Pet Food</h3>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Total pet food to max one pet from level 1 to 50:{" "}
          <span className="text-[#f0b429]">{formatGems(PET_FOOD_TO_MAX)}</span>
        </p>
        {account.pets.length > 0 && (
          <div className="mt-3 space-y-2">
            {account.pets.map((op) => {
              const pet = PET_MAP[op.petId];
              const need = PET_FOOD_PER_LEVEL.slice(op.level + 1).reduce(
                (a, b) => a + b,
                0,
              );
              return (
                <div
                  key={op.petId}
                  className="flex justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
                >
                  <span>{pet?.name ?? op.petId} lv {op.level}</span>
                  <span className="text-[#3ecfb3]">
                    {formatGems(need)} to 50
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-3 text-xs text-[#9bb5af]">
          Advisor: before city 60 use a delivery pet; with Panda keep a perfect
          pet (Dark Horse / Tortoise). Endgame: Red Panda + Baby Kraken for
          divine stacking.
        </p>
      </div>
    </div>
  );
}

/* ─── Club View ─── */
function ClubView({
  account,
  update,
}: {
  account: Account;
  update: <K extends keyof Account>(k: K, v: Account[K]) => void;
}) {
  const xpItems = [
    { name: "Common", xp: 4, color: "#9ca3af" },
    { name: "Rare", xp: 9, color: "#22c55e" },
    { name: "Epic", xp: 22, color: "#a855f7" },
    { name: "Legendary BP", xp: 26, color: "#f59e0b" },
    { name: "Legendary", xp: 52, color: "#f59e0b" },
    { name: "Ultimate BP", xp: 61, color: "#ef4444" },
    { name: "Ultimate", xp: 122, color: "#ef4444" },
    { name: "Mythic BP", xp: 144, color: "#3b82f6" },
    { name: "Mythic", xp: 287, color: "#3b82f6" },
    { name: "Common Egg", xp: 25, color: "#9ca3af" },
    { name: "Rare Egg", xp: 50, color: "#22c55e" },
    { name: "Epic Egg", xp: 150, color: "#a855f7" },
    { name: "Legendary Egg", xp: 425, color: "#f59e0b" },
    { name: "Ultimate Egg", xp: 1000, color: "#ef4444" },
  ];
  const xpPerCity = 236;
  const citiesNeeded = Math.ceil(24195 / xpPerCity);

  return (
    <div className="space-y-6">
      <div className="panel rounded-3xl p-5">
        <h2 className="font-display text-2xl">Club Tracker</h2>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Track your club level and XP contribution. Clubs unlock at City 7.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Club Level (0–50)">
            <input
              type="number"
              min={0}
              max={50}
              value={account.clubLevel}
              onChange={(e) => update("clubLevel", Number(e.target.value))}
              className="w-full rounded-xl border border-[#f0b429]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#f0b429]"
            />
          </Field>
          <Field label="Your XP this season">
            <input
              type="number"
              min={0}
              value={account.clubXp}
              onChange={(e) => update("clubXp", Number(e.target.value))}
              className="w-full rounded-xl border border-[#f0b429]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#f0b429]"
            />
          </Field>
          <Field label="Target per member">
            <div className="rounded-xl border border-[#f0b429]/20 bg-black/30 px-3 py-2 text-[#f0b429]">
              {formatGems(24195)} XP
            </div>
          </Field>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-lg bg-black/40">
          <div
            className="h-full rounded-lg bg-gradient-to-r from-[#f0b429] to-[#3ecfb3]"
            style={{
              width: `${Math.min(100, (account.clubXp / 24195) * 100)}%`,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-[#9bb5af]">
          Your contribution: {formatGems(account.clubXp)} / 24,195 XP (
          {((account.clubXp / 24195) * 100).toFixed(1)}%)
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Cities to max"
          value={String(citiesNeeded)}
          hint={`@ ${xpPerCity} XP/city`}
        />
        <Stat
          label="XP per city"
          value={String(xpPerCity)}
          hint="salvaging all small boxes"
        />
        <Stat label="Big box XP/gem" value="0.40" hint="best gem-to-XP ratio" />
      </div>
      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Salvage XP Values</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {xpItems.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-xl border border-[#f0b429]/10 bg-black/20 px-3 py-2"
            >
              <span className="text-sm" style={{ color: item.color }}>
                {item.name}
              </span>
              <span className="text-sm font-medium text-[#f0b429]">
                {item.xp} XP
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Club Milestones</h3>
        <div className="mt-3 space-y-2">
          {CLUB_LEVELS.map((cl) => (
            <div
              key={cl.level}
              className={cn(
                "flex items-center justify-between rounded-xl border px-3 py-2",
                account.clubLevel >= cl.level
                  ? "border-[#3ecfb3]/30 bg-[#3ecfb3]/5"
                  : "border-[#f0b429]/10 bg-black/20",
              )}
            >
              <div>
                <span className="font-medium">Level {cl.level}</span>
                <span className="ml-2 text-xs text-[#9bb5af]">
                  {cl.rewards}
                </span>
              </div>
              <span className="text-sm text-[#f0b429]">
                {formatGems(cl.xp)} XP
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Arcane Vault View ─── */
function ArcaneView({
  account,
  setArcaneLevel,
  update,
}: {
  account: Account;
  setArcaneLevel: (id: ArcaneVaultId, raw: number) => void;
  update: <K extends keyof Account>(k: K, v: Account[K]) => void;
}) {
  const totalScrollsUsed = ARCANE_VAULT_ITEMS.reduce((sum, item) => {
    let s = 0;
    for (let i = 1; i <= account.arcaneLevels[item.id]; i++)
      s += item.scrollCosts[i] ?? 0;
    return sum + s;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="panel rounded-3xl p-5">
        <h2 className="font-display text-2xl">Arcane Vault</h2>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Potion Shop event vault. Scrolls carry over between events. Earn up to
          150 per event (with pass).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Scrolls on hand">
            <input
              type="number"
              min={0}
              value={account.scrolls}
              onChange={(e) => update("scrolls", Number(e.target.value))}
              className="w-full rounded-xl border border-[#f0b429]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#f0b429]"
            />
          </Field>
          <Field label="Scrolls used">
            <div className="rounded-xl border border-[#f0b429]/20 bg-black/30 px-3 py-2 text-[#f0b429]">
              {formatGems(totalScrollsUsed)} /{" "}
              {formatGems(TOTAL_SCROLLS_TO_MAX)}
            </div>
          </Field>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Total to max"
          value={formatGems(TOTAL_SCROLLS_TO_MAX)}
          hint={`${Math.ceil(TOTAL_SCROLLS_TO_MAX / SCROLLS_PER_EVENT_WITH_PASS)} events with pass`}
        />
        <Stat
          label="Scrolls used"
          value={formatGems(totalScrollsUsed)}
          hint="already spent"
        />
        <Stat
          label="Scrolls remaining"
          value={formatGems(TOTAL_SCROLLS_TO_MAX - totalScrollsUsed)}
          hint="still needed"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {ARCANE_VAULT_ITEMS.map((item) => {
          const level = account.arcaneLevels[item.id];
          const nextCost =
            level < item.maxLevel ? item.scrollCosts[level + 1] : 0;
          return (
            <article key={item.id} className="panel rounded-3xl p-4">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-xs text-[#9bb5af]">{item.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setArcaneLevel(item.id, level - 1)}
                  className="h-7 w-7 rounded border border-[#f0b429]/20 text-sm"
                >
                  −
                </button>
                <input
                  type="number"
                  min={0}
                  max={item.maxLevel}
                  value={level}
                  onChange={(e) =>
                    setArcaneLevel(item.id, Number(e.target.value))
                  }
                  className="h-7 w-14 rounded border border-[#f0b429]/20 bg-black/30 text-center text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setArcaneLevel(item.id, level + 1)}
                  className="h-7 w-7 rounded border border-[#f0b429]/20 text-sm"
                >
                  +
                </button>
                <span className="text-xs text-[#9bb5af]">
                  / {item.maxLevel}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-[#9bb5af]">
                <span>
                  {item.effectLabel}: {item.effects[level] ?? "—"}
                </span>
                <span>
                  {level >= item.maxLevel
                    ? "Maxed"
                    : `${formatGems(nextCost)} scrolls next`}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-lg bg-black/40">
                <div
                  className="h-full rounded-lg bg-[#a78bfa]"
                  style={{ width: `${(level / item.maxLevel) * 100}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Potions</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {POTIONS.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border border-[#f0b429]/10 bg-black/20 p-3"
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
      </div>
    </div>
  );
}

/* ─── Builds View ─── */
function BuildsView({ account }: { account: Account }) {
  return (
    <div className="space-y-6">
      <div className="panel rounded-3xl p-5">
        <h2 className="font-display text-2xl">Best Builds</h2>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Recommended gear progression from the Eatventure Handbook. Your city:{" "}
          {account.city}
        </p>
      </div>
      {BEST_BUILDS.map((b, i) => {
        const active = (() => {
          const [min, max] = b.cityRange
            .replace("+", "-99999")
            .split("–")
            .map((s) => parseInt(s.trim()));
          return account.city >= min && account.city <= max;
        })();
        return (
          <div
            key={i}
            className={cn(
              "panel rounded-3xl p-5",
              active && "ring-2 ring-[#f0b429]",
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl">{b.label}</h3>
                  {active && (
                    <span className="rounded-lg bg-[#f0b429] px-2 py-0.5 text-[10px] font-semibold text-[#0b2422] uppercase">
                      your range
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#f0b429]">{b.cityRange}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl bg-black/20 p-2">
                <span className="text-[10px] uppercase text-[#9bb5af]">
                  Head
                </span>
                <div className="text-sm">{b.head}</div>
              </div>
              <div className="rounded-xl bg-black/20 p-2">
                <span className="text-[10px] uppercase text-[#9bb5af]">
                  Body
                </span>
                <div className="text-sm">{b.body}</div>
              </div>
              <div className="rounded-xl bg-black/20 p-2">
                <span className="text-[10px] uppercase text-[#9bb5af]">
                  Hand
                </span>
                <div className="text-sm">{b.hand}</div>
              </div>
            </div>
            <p className="mt-2 text-xs text-[#9bb5af]">{b.notes}</p>
          </div>
        );
      })}
      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Upgrade Priority</h3>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Stat priority order for gear:
        </p>
        <ol className="mt-3 space-y-1 text-sm">
          <li>
            1. <span className="text-emerald-300">Instant Food %</span> — aim
            for 100%
          </li>
          <li>
            2. <span className="text-purple-300">Perfect Food %</span> — aim for
            100%
          </li>
          <li>
            3. <span className="text-blue-300">Double Food %</span> — extra
            servings
          </li>
          <li>
            4. <span className="text-amber-300">Divine Food %</span> — endgame
            multiplier
          </li>
          <li>
            5. <span className="text-teal-300">Walk Speed %</span> — faster
            clears
          </li>
          <li>
            6. <span className="text-[#f0b429]">All Profit %</span> — general
            boost
          </li>
        </ol>
      </div>
    </div>
  );
}

/* ─── Blueprints View ─── */
function BlueprintsView() {
  return (
    <div className="space-y-6">
      <div className="panel rounded-3xl p-5">
        <h2 className="font-display text-2xl">Blueprint Recipes</h2>
        <p className="mt-1 text-sm text-[#9bb5af]">
          What you need to forge each item. Keep 6 rare and 4 epic of the same
          items to always have enough for forging.
        </p>
      </div>
      {BLUEPRINT_RECIPES.map((bp, i) => (
        <div key={i} className="panel rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl">{bp.result}</h3>
            <span
              className="text-sm"
              style={{
                color:
                  RARITY_COLORS[bp.rarity.toLowerCase() as GearRarity] ||
                  "#f0b429",
              }}
            >
              {bp.rarity}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bp.ingredients.map((ing, j) => (
              <span
                key={j}
                className="rounded-lg border border-[#f0b429]/15 bg-black/20 px-2 py-1 text-xs text-[#c5d5d0]"
              >
                {ing}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Salvage Tips</h3>
        <ul className="mt-2 space-y-1 text-sm text-[#9bb5af]">
          <li>• No XP loss when salvaging leveled items</li>
          <li>• Forging leveled items does transfer XP</li>
          <li>• Use commons to salvage and upgrade your gear</li>
          <li>• Keep 6 rare + 4 epic of the same items for forging</li>
          <li>• Only donate duplicate or clearly obsolete gear to club</li>
        </ul>
      </div>
    </div>
  );
}

/* ─── Shared Components ─── */
function StepRow({
  step,
  index,
  dim,
  running,
  onComplete,
  compact,
}: {
  step: UpgradeStep;
  index: number;
  dim: boolean;
  running?: number;
  onComplete: () => void;
  compact?: boolean;
}) {
  const item = ITEM_MAP[step.itemId];
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-[#f0b429]/10 bg-black/20 px-3 py-2.5",
        dim && "opacity-45",
      )}
    >
      <div className="w-6 text-center text-xs text-[#9bb5af]">{index}</div>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${item.accent}22` }}
      >
        <VaultIcon id={step.itemId} className="h-8 w-8" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm">
          {step.kind === "unlock" ? "Unlock" : `Lv ${step.from} → ${step.to}`}{" "}
          {item.name}
        </div>
        <div className="truncate text-[11px] text-[#9bb5af]">
          {item.effectKind === "cash"
            ? formatCash(effectAt(item.id, step.to) ?? 0)
            : formatEffect(item.id, step.to)}
          {compact ? "" : ` · ${step.reason}`}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-[#3ecfb3]">
          {formatGems(step.cost)}
        </div>
        {running != null && (
          <div className="text-[10px] text-[#9bb5af]">
            {formatGems(running)} total
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onComplete}
        className="rounded-lg border border-[#3ecfb3]/30 px-2.5 py-1 text-[11px] text-[#3ecfb3] hover:bg-[#3ecfb3]/10"
      >
        Done
      </button>
    </div>
  );
}

function LevelRow({
  id,
  level,
  levels,
  onChange,
}: {
  id: ItemId;
  level: number;
  levels: Record<ItemId, number>;
  onChange: (n: number) => void;
}) {
  const item = ITEM_MAP[id];
  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(level - 1)}
        className="h-8 w-8 rounded-lg border border-[#f0b429]/20 text-lg leading-none"
      >
        −
      </button>
      <input
        type="number"
        min={0}
        max={item.maxLevel}
        value={level}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 w-16 rounded-lg border border-[#f0b429]/20 bg-black/30 text-center outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(level + 1)}
        className="h-8 w-8 rounded-lg border border-[#f0b429]/20 text-lg leading-none"
      >
        +
      </button>
      <span className="text-xs text-[#9bb5af]">/ {item.maxLevel}</span>
      {level === 0 && !canUnlock(id, levels) && (
        <span className="text-[10px] text-[#9bb5af]">needs previous card</span>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs tracking-wide text-[#9bb5af]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Stat({
  label,
  value,
  hint,
  gem,
}: {
  label: string;
  value: string;
  hint: string;
  gem?: boolean;
}) {
  return (
    <div className="stat-tile">
      <div className="text-[11px] text-[#9bb5af]">{label}</div>
      <div
        className={cn(
          "mt-1 text-2xl font-semibold",
          gem ? "gem-text" : "gold-text",
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] text-[#9bb5af]">{hint}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[#9bb5af]">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: "upgrade" | "asNeeded" | "avoid";
}) {
  const map = {
    upgrade: { label: "Upgrade", cls: "bg-emerald-500/15 text-emerald-300" },
    asNeeded: { label: "As needed", cls: "bg-amber-500/15 text-amber-300" },
    avoid: { label: "Avoid", cls: "bg-rose-500/15 text-rose-300" },
  } as const;
  const m = map[priority];
  return (
    <span
      className={cn("rounded-lg px-2 py-0.5 text-[10px] font-medium", m.cls)}
    >
      {m.label}
    </span>
  );
}

function GemChip({
  value,
  label,
  gem = true,
}: {
  value: number;
  label: string;
  gem?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-1.5",
        gem
          ? "border-[#3ecfb3]/25 bg-[#0a2a27]/70"
          : "border-[#a78bfa]/25 bg-[#1a0f2e]/70",
      )}
    >
      <span
        className={cn(
          "text-sm font-medium",
          gem ? "text-[#3ecfb3]" : "text-[#a78bfa]",
        )}
      >
        {formatGems(value)}
      </span>
      <span
        className={cn("text-[11px]", gem ? "text-[#8fd9cc]" : "text-[#c4b5fd]")}
      >
        {label}
      </span>
    </div>
  );
}
