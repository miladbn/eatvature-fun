import { useEffect, useMemo, useState, type ReactNode } from "react";
import { VaultIcon } from "./components/VaultIcons";
import {
  DEFAULT_ACCOUNT,
  EMPTY_LEVELS,
  GEMS_PER_CITY,
  ITEM_MAP,
  PHASES,
  PLAYSTYLE_META,
  TOTAL_VAULT_GEMS,
  VAULT_ITEMS,
} from "./data/vault";
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
import { BEST_PET_COMBOS, PET_FOOD_TO_MAX, PET_MAP, PETS } from "./data/pets";
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
  canUnlock,
  costToMax,
  effectAt,
  formatCash,
  formatEffect,
  formatGems,
  itemBreakdown,
  recommendedCityPhase,
  remainingMaxCost,
  remainingPriorityCost,
  remainingUnlockCost,
  spentSoFar,
  upgradeCost,
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

type MainTab =
  | "overview"
  | "vault"
  | "plan"
  | "totals"
  | "gear"
  | "pets"
  | "club"
  | "arcane"
  | "builds"
  | "blueprints";

const MAIN_TABS: { id: MainTab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "vault", label: "Vault", icon: "🏦" },
  { id: "plan", label: "Plan", icon: "🗺️" },
  { id: "totals", label: "Totals", icon: "💎" },
  { id: "gear", label: "Gear", icon: "⚔️" },
  { id: "pets", label: "Pets", icon: "🐾" },
  { id: "club", label: "Club", icon: "🏆" },
  { id: "arcane", label: "Arcane", icon: "🧪" },
  { id: "builds", label: "Builds", icon: "📋" },
  { id: "blueprints", label: "Blueprints", icon: "📜" },
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
    if (ready && !onboarding) saveAccount(account);
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
      <div className="flex min-h-screen items-center justify-center bg-[#090704] text-[#e8c36a]">
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

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#090704] text-[#f6efe2]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(9,7,4,0.15), #090704), url('/images/hero-vault.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(232,195,106,0.12),_transparent_42%)]" />

      <header className="relative z-10 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e8c36a]/30 bg-[#1a140c] shadow-[0_0_24px_rgba(232,195,106,0.2)]">
            <img
              src="/images/gem-icon.png"
              alt=""
              className="h-7 w-7 object-contain"
            />
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight gold-text">
              Eatventure Handbook
            </p>
            <p className="text-xs text-[#b8ab96]">
              Full account tracker · saved on this device
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://github.com/miladbn/eatvature-fun"
            target="_blank"
            rel="noreferrer"
            aria-label="Star Eatventure Handbook on GitHub"
            className="rounded-full border border-[#e8c36a]/20 bg-[#16110b]/80 px-3 py-1.5 text-xs text-[#d9cbb3] transition hover:border-[#e8c36a]/50 hover:text-[#e8c36a]"
          >
            <span aria-hidden="true">★</span> Star on GitHub
          </a>
          <GemChip value={account.gems} label="gems" />
          <GemChip value={account.scrolls} label="scrolls" gem={false} />
          <button
            type="button"
            onClick={() => setTab("vault")}
            className="rounded-full border border-[#e8c36a]/20 bg-[#16110b]/80 px-3 py-1.5 text-xs text-[#e8c36a]"
          >
            City {account.city || 1}
            {account.name ? ` · ${account.name}` : ""}
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <nav className="mb-6 flex flex-wrap gap-2">
          {MAIN_TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "rounded-full px-3 py-2 text-xs transition sm:px-4 sm:text-sm",
                tab === id
                  ? "bg-[#e8c36a] text-[#1a1208] shadow-[0_8px_24px_rgba(232,195,106,0.28)]"
                  : "border border-[#e8c36a]/15 bg-[#16110b]/70 text-[#d9cbb3] hover:border-[#e8c36a]/40",
              )}
            >
              <span className="mr-1">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {tab === "overview" && (
          <Overview
            account={account}
            plan={plan}
            budget={budget}
            progress={progress}
            unlockLeft={unlockLeft}
            maxLeft={maxLeft}
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
      </main>
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
    <div className="relative min-h-screen bg-[#090704] text-[#f6efe2]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(9,7,4,0.25), rgba(9,7,4,0.78) 55%, #090704), url('/images/hero-vault.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-10">
        <div className="panel shine rounded-[32px] p-6 sm:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#e8c36a]/80">
            Step {step + 1} of 3
          </p>
          {step === 0 && (
            <div className="rise">
              <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
                Crack the<span className="gold-text"> vault.</span>
              </h1>
              <p className="mt-4 max-w-lg text-[#cbbda6]">
                Track your entire Eatventure account — vault, gear, pets, club,
                arcane vault, and more. Everything saved on this device.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full bg-[#e8c36a] px-6 py-3 text-sm font-semibold text-[#1a1208]"
                >
                  Enter my account
                </button>
                <button
                  type="button"
                  onClick={onSkip}
                  className="rounded-full border border-[#e8c36a]/25 px-6 py-3 text-sm text-[#e8c36a]"
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
              <label className="flex items-center gap-3 rounded-2xl border border-[#e8c36a]/15 bg-black/20 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={account.hasPanda}
                  onChange={(e) => update("hasPanda", e.target.checked)}
                  className="accent-[#e8c36a]"
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
                          ? "border-[#e8c36a] bg-[#e8c36a]/10"
                          : "border-[#e8c36a]/15 bg-black/20",
                      )}
                    >
                      <div className="text-sm font-medium">
                        {PLAYSTYLE_META[id].name}
                      </div>
                      <div className="mt-1 text-xs text-[#b8ab96]">
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
                  className="text-sm text-[#b8ab96]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full bg-[#e8c36a] px-5 py-2.5 text-sm font-semibold text-[#1a1208]"
                >
                  Set vault levels
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="rise">
              <h2 className="mt-3 font-display text-3xl">Current vault</h2>
              <p className="mt-2 text-sm text-[#b8ab96]">
                0 means locked. Unlocking a later card will auto-unlock the ones
                before it.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => update("levels", { ...EMPTY_LEVELS })}
                  className="rounded-full border border-[#e8c36a]/20 px-3 py-1.5 text-xs"
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
                  className="rounded-full border border-[#e8c36a]/20 px-3 py-1.5 text-xs"
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
                  className="text-sm text-[#b8ab96]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={onDone}
                  className="rounded-full bg-[#e8c36a] px-5 py-2.5 text-sm font-semibold text-[#1a1208]"
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <div className="panel rounded-3xl p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#e8c36a]/80">
                Next recommended step
              </p>
              {next ? (
                <h2 className="mt-2 font-display text-3xl">
                  {next.kind === "unlock" ? "Unlock" : "Upgrade"}{" "}
                  {ITEM_MAP[next.itemId].name}
                </h2>
              ) : (
                <h2 className="mt-2 font-display text-3xl">
                  Vault is finished.
                </h2>
              )}
            </div>
            {next && (
              <div className="text-right">
                <div className="gem-text text-3xl font-semibold">
                  {formatGems(next.cost)}
                </div>
                <div className="text-xs text-[#b8ab96]">gems</div>
              </div>
            )}
          </div>
          {next && (
            <>
              <div className="mt-5 flex items-center gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10"
                  style={{ background: `${ITEM_MAP[next.itemId].accent}22` }}
                >
                  <VaultIcon id={next.itemId} className="h-12 w-12" />
                </div>
                <div>
                  <p className="text-sm text-[#d9cbb3]">
                    {next.kind === "unlock"
                      ? `Open ${ITEM_MAP[next.itemId].name} at level 1.`
                      : `Level ${next.from} → ${next.to} · ${formatEffect(next.itemId, next.to)}`}
                  </p>
                  <p className="mt-1 text-sm text-[#b8ab96]">{next.reason}</p>
                  <p className="mt-1 text-xs text-[#e8c36a]/80">
                    {next.phaseName} · {ITEM_MAP[next.itemId].effectLabel}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onComplete(next)}
                  className="rounded-full bg-[#2ee6c7] px-5 py-2.5 text-sm font-semibold text-[#04261f]"
                >
                  {spendGems ? "I bought this" : "Mark complete"}
                </button>
                <button
                  type="button"
                  onClick={onBurst}
                  className="rounded-full border border-[#2ee6c7]/30 px-5 py-2.5 text-sm text-[#2ee6c7]"
                >
                  {spendGems
                    ? `Spend ${formatGems(budget.spent)} on next ${budget.count || 0}`
                    : "Complete next only"}
                </button>
              </div>
            </>
          )}
        </div>
        <div className="panel rounded-3xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-xl">Coming up</h3>
            <span className="text-xs text-[#b8ab96]">
              {plan.length} steps left
            </span>
          </div>
          <div className="space-y-2">
            {nextFive.length === 0 && (
              <p className="text-sm text-[#b8ab96]">
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
        <div className="panel rounded-3xl p-5">
          <h3 className="font-display text-xl">Account snapshot</h3>
          <p className="mt-1 text-sm text-[#b8ab96]">
            {PLAYSTYLE_META[account.playstyle].name} · City {account.city || 1}
          </p>
          <div className="mt-4 rounded-2xl border border-[#e8c36a]/15 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#e8c36a]/80">
              Handbook phase
            </p>
            <p className="mt-1 font-display text-2xl">{phase?.name}</p>
            <p className="mt-1 text-sm text-[#b8ab96]">{phase?.blurb}</p>
            <p className="mt-2 text-xs text-[#e8c36a]/70">{phase?.cityRange}</p>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <Row k="Gems invested" v={formatGems(invested)} />
            <Row k="Still to unlock" v={formatGems(unlockLeft)} />
            <Row k="Still to 100% vault" v={formatGems(maxLeft)} />
            <Row k="Your gems cover" v={`${budget.count} steps`} />
            <Row
              k="Cards unlocked"
              v={`${progress.unlocked}/${progress.totalItems}`}
            />
            <Row k="Cities completed" v={String(account.citiesCompleted)} />
            <Row k="Pet food needed" v={formatGems(PET_FOOD_TO_MAX)} />
            <Row
              k="Scrolls to max arcane"
              v={formatGems(TOTAL_SCROLLS_TO_MAX)}
            />
            <Row k="Gear equipped" v={hasGear ? "Yes" : "None"} />
            <Row k="Pets owned" v={String(petCount)} />
            <Row
              k="Arcane vault done"
              v={`${arcaneDone}/${ARCANE_VAULT_ITEMS.length}`}
            />
          </dl>
        </div>
        <div className="overflow-hidden rounded-3xl border border-[#e8c36a]/15">
          <img
            src="/images/gold-coins.png"
            alt=""
            className="h-40 w-full object-cover opacity-90"
          />
          <div className="bg-[#120e09] p-4 text-xs text-[#b8ab96]">
            Handbook total to unlock + max every card from zero is{" "}
            <span className="text-[#e8c36a]">
              {formatGems(TOTAL_VAULT_GEMS)}
            </span>{" "}
            gems — about{" "}
            {Math.ceil(TOTAL_VAULT_GEMS / GEMS_PER_CITY).toLocaleString()}{" "}
            cities at 184 gems each.
          </div>
        </div>
      </aside>
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
            className="w-full rounded-xl border border-[#e8c36a]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#e8c36a]"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <input
              type="number"
              min={1}
              value={account.city}
              onChange={(e) => update("city", Number(e.target.value))}
              className="w-full rounded-xl border border-[#e8c36a]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#e8c36a]"
            />
          </Field>
          <Field label="Gems">
            <input
              type="number"
              min={0}
              value={account.gems}
              onChange={(e) => update("gems", Number(e.target.value))}
              className="w-full rounded-xl border border-[#e8c36a]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#e8c36a]"
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
              className="w-full rounded-xl border border-[#e8c36a]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#e8c36a]"
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
              className="w-full rounded-xl border border-[#e8c36a]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#e8c36a]"
            />
          </Field>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={account.hasPanda}
            onChange={(e) => update("hasPanda", e.target.checked)}
            className="accent-[#e8c36a]"
          />{" "}
          Legendary Panda owned
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={spendGems}
            onChange={(e) => setSpendGems(e.target.checked)}
            className="accent-[#2ee6c7]"
          />{" "}
          Subtract gems when I complete a step
        </label>
        <Field label="Structure">
          <select
            value={account.playstyle}
            onChange={(e) => update("playstyle", e.target.value as Playstyle)}
            className="w-full rounded-xl border border-[#e8c36a]/20 bg-black/30 px-3 py-2 outline-none"
          >
            {(Object.keys(PLAYSTYLE_META) as Playstyle[]).map((id) => (
              <option key={id} value={id}>
                {PLAYSTYLE_META[id].name}
              </option>
            ))}
          </select>
        </Field>
        <p className="text-xs text-[#b8ab96]">
          {PLAYSTYLE_META[account.playstyle].tagline}
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => update("levels", { ...EMPTY_LEVELS })}
            className="rounded-full border border-[#e8c36a]/20 px-3 py-1.5 text-xs"
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
            className="rounded-full border border-[#e8c36a]/20 px-3 py-1.5 text-xs"
          >
            Unlock all
          </button>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="rounded-full border border-rose-400/30 px-3 py-1.5 text-xs text-rose-300"
            >
              Reset saved data
            </button>
          ) : (
            <button
              type="button"
              onClick={onReset}
              className="rounded-full bg-rose-500 px-3 py-1.5 text-xs text-white"
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
                <p className="text-xs text-[#b8ab96]">{item.effectLabel}</p>
              </div>
            </div>
            <LevelRow
              id={item.id}
              level={account.levels[item.id]}
              levels={account.levels}
              onChange={(n) => setLevel(item.id, n)}
            />
            <div className="mt-2 flex justify-between text-[11px] text-[#b8ab96]">
              <span>Now {formatEffect(item.id, account.levels[item.id])}</span>
              <span>
                {account.levels[item.id] >= item.maxLevel
                  ? "Maxed"
                  : `${formatGems(upgradeCost(item.id, account.levels[item.id] + 1))} next · ${formatGems(costToMax(item.id, account.levels[item.id]))} to max`}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/40">
              <div
                className="h-full rounded-full"
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
          <p className="text-sm text-[#b8ab96]">
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
              className="accent-[#2ee6c7]"
            />{" "}
            Spend gems on complete
          </label>
          <button
            type="button"
            onClick={onBurst}
            disabled={plan.length === 0}
            className="rounded-full bg-[#2ee6c7] px-4 py-2 text-sm font-semibold text-[#04261f] disabled:opacity-40"
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
                    <span className="rounded-full bg-[#e8c36a] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#1a1208] uppercase">
                      your city
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#b8ab96]">{meta?.blurb}</p>
              </div>
              <p className="text-sm text-[#e8c36a]">
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
          <p className="mt-2 text-[#b8ab96]">
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
          hint="upgrade-when-possible"
        />
        <Stat
          label="Full vault to max"
          value={formatGems(maxLeft)}
          hint={`${Math.ceil(maxLeft / GEMS_PER_CITY).toLocaleString()} cities`}
        />
      </div>
      <div className="panel overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-black/30 text-xs tracking-wide text-[#e8c36a] uppercase">
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
                <tr key={row.item.id} className="border-t border-[#e8c36a]/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <VaultIcon id={row.item.id} className="h-8 w-8" />
                      <div>
                        <div>{row.item.name}</div>
                        <div className="text-[11px] text-[#b8ab96]">
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
                    {(row.toMax / GEMS_PER_CITY).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-[#b8ab96]">
        Source: Spectre Eatventure Handbook. Level costs match the public vault
        sheet. City estimates use 184 gems per city and ignore event / investor
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
        <p className="mt-1 text-sm text-[#b8ab96]">
          Select what you currently wear. Stats are calculated from equipped
          items.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {slots.map(({ key, label, slot }) => (
            <div key={key}>
              <label className="mb-1 block text-xs uppercase tracking-wide text-[#b8ab96]">
                {label}
              </label>
              <select
                value={account.gear[key]}
                onChange={(e) => setGear(key, e.target.value)}
                className="w-full rounded-xl border border-[#e8c36a]/20 bg-black/30 px-3 py-2 text-sm outline-none"
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
                <div className="mt-2 rounded-xl border border-[#e8c36a]/10 bg-black/20 p-2 text-xs">
                  <div
                    className="font-medium"
                    style={{
                      color: RARITY_COLORS[GEAR_MAP[account.gear[key]].rarity],
                    }}
                  >
                    {GEAR_MAP[account.gear[key]].name}
                  </div>
                  <div className="mt-1 text-[#b8ab96]">
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
      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">All Gear Items</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {GEAR_ITEMS.sort(
            (a, b) =>
              RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity),
          ).map((g) => (
            <div
              key={g.id}
              className="rounded-2xl border border-[#e8c36a]/10 bg-black/20 p-3"
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
              <div className="text-[11px] text-[#b8ab96]">
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
        <p className="mt-1 text-sm text-[#b8ab96]">
          Add pets you own and set their level. Save all pet food for Legendary
          Panda first.
        </p>
        {account.pets.length === 0 ? (
          <p className="mt-4 text-sm text-[#b8ab96]">
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
                  className="rounded-2xl border border-[#e8c36a]/15 bg-black/20 p-4"
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
                      <div className="text-xs text-[#b8ab96]">
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
                    <span className="text-xs text-[#b8ab96]">Level</span>
                    <button
                      type="button"
                      onClick={() => updatePetLevel(op.petId, op.level - 1)}
                      className="h-7 w-7 rounded border border-[#e8c36a]/20 text-sm"
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
                      className="h-7 w-14 rounded border border-[#e8c36a]/20 bg-black/30 text-center text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => updatePetLevel(op.petId, op.level + 1)}
                      className="h-7 w-7 rounded border border-[#e8c36a]/20 text-sm"
                    >
                      +
                    </button>
                    <span className="text-xs text-[#b8ab96]">/ 50</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/40">
                    <div
                      className="h-full rounded-full bg-[#e8c36a]"
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
                  ? "border-[#e8c36a]/10 opacity-40"
                  : "border-[#e8c36a]/15 bg-black/20 hover:border-[#e8c36a]/40",
              )}
            >
              <div
                className="font-medium"
                style={{ color: RARITY_COLORS[pet.rarity as GearRarity] }}
              >
                {pet.name}
              </div>
              <div className="text-[11px] text-[#b8ab96]">
                {pet.rarity} · {pet.ability}
              </div>
              {ownedIds.has(pet.id) && (
                <div className="mt-1 text-[10px] text-[#e8c36a]">Owned</div>
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
              className="rounded-2xl border border-[#e8c36a]/10 bg-black/20 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{c.combo}</span>
                <span className="text-xs text-[#e8c36a]">{c.city}</span>
              </div>
              <div className="text-xs text-[#b8ab96]">{c.notes}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Pet Food</h3>
        <p className="mt-1 text-sm text-[#b8ab96]">
          Total pet food to max one pet from level 1 to 50:{" "}
          <span className="text-[#e8c36a]">{formatGems(PET_FOOD_TO_MAX)}</span>
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
        <p className="mt-1 text-sm text-[#b8ab96]">
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
              className="w-full rounded-xl border border-[#e8c36a]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#e8c36a]"
            />
          </Field>
          <Field label="Your XP this season">
            <input
              type="number"
              min={0}
              value={account.clubXp}
              onChange={(e) => update("clubXp", Number(e.target.value))}
              className="w-full rounded-xl border border-[#e8c36a]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#e8c36a]"
            />
          </Field>
          <Field label="Target per member">
            <div className="rounded-xl border border-[#e8c36a]/20 bg-black/30 px-3 py-2 text-[#e8c36a]">
              {formatGems(24195)} XP
            </div>
          </Field>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#e8c36a] to-[#2ee6c7]"
            style={{
              width: `${Math.min(100, (account.clubXp / 24195) * 100)}%`,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-[#b8ab96]">
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
              className="flex items-center justify-between rounded-xl border border-[#e8c36a]/10 bg-black/20 px-3 py-2"
            >
              <span className="text-sm" style={{ color: item.color }}>
                {item.name}
              </span>
              <span className="text-sm font-medium text-[#e8c36a]">
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
                  ? "border-[#2ee6c7]/30 bg-[#2ee6c7]/5"
                  : "border-[#e8c36a]/10 bg-black/20",
              )}
            >
              <div>
                <span className="font-medium">Level {cl.level}</span>
                <span className="ml-2 text-xs text-[#b8ab96]">
                  {cl.rewards}
                </span>
              </div>
              <span className="text-sm text-[#e8c36a]">
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
        <p className="mt-1 text-sm text-[#b8ab96]">
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
              className="w-full rounded-xl border border-[#e8c36a]/20 bg-black/30 px-3 py-2 outline-none focus:border-[#e8c36a]"
            />
          </Field>
          <Field label="Scrolls used">
            <div className="rounded-xl border border-[#e8c36a]/20 bg-black/30 px-3 py-2 text-[#e8c36a]">
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
              <p className="text-xs text-[#b8ab96]">{item.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setArcaneLevel(item.id, level - 1)}
                  className="h-7 w-7 rounded border border-[#e8c36a]/20 text-sm"
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
                  className="h-7 w-14 rounded border border-[#e8c36a]/20 bg-black/30 text-center text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setArcaneLevel(item.id, level + 1)}
                  className="h-7 w-7 rounded border border-[#e8c36a]/20 text-sm"
                >
                  +
                </button>
                <span className="text-xs text-[#b8ab96]">
                  / {item.maxLevel}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-[#b8ab96]">
                <span>
                  {item.effectLabel}: {item.effects[level] ?? "—"}
                </span>
                <span>
                  {level >= item.maxLevel
                    ? "Maxed"
                    : `${formatGems(nextCost)} scrolls next`}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full bg-[#a78bfa]"
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
              className="rounded-2xl border border-[#e8c36a]/10 bg-black/20 p-3"
            >
              <div className="font-medium text-[#a78bfa]">{p.name}</div>
              <div className="text-xs text-[#b8ab96]">{p.effect}</div>
              <div className="mt-1 text-[10px] text-[#b8ab96]">
                {p.ingredients.join(", ")}
              </div>
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
        <p className="mt-1 text-sm text-[#b8ab96]">
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
              active && "ring-2 ring-[#e8c36a]",
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl">{b.label}</h3>
                  {active && (
                    <span className="rounded-full bg-[#e8c36a] px-2 py-0.5 text-[10px] font-semibold text-[#1a1208] uppercase">
                      your range
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#e8c36a]">{b.cityRange}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl bg-black/20 p-2">
                <span className="text-[10px] uppercase text-[#b8ab96]">
                  Head
                </span>
                <div className="text-sm">{b.head}</div>
              </div>
              <div className="rounded-xl bg-black/20 p-2">
                <span className="text-[10px] uppercase text-[#b8ab96]">
                  Body
                </span>
                <div className="text-sm">{b.body}</div>
              </div>
              <div className="rounded-xl bg-black/20 p-2">
                <span className="text-[10px] uppercase text-[#b8ab96]">
                  Hand
                </span>
                <div className="text-sm">{b.hand}</div>
              </div>
            </div>
            <p className="mt-2 text-xs text-[#b8ab96]">{b.notes}</p>
          </div>
        );
      })}
      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Upgrade Priority</h3>
        <p className="mt-1 text-sm text-[#b8ab96]">
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
            6. <span className="text-[#e8c36a]">All Profit %</span> — general
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
        <p className="mt-1 text-sm text-[#b8ab96]">
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
                  "#e8c36a",
              }}
            >
              {bp.rarity}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bp.ingredients.map((ing, j) => (
              <span
                key={j}
                className="rounded-lg border border-[#e8c36a]/15 bg-black/20 px-2 py-1 text-xs text-[#d9cbb3]"
              >
                {ing}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="panel rounded-3xl p-5">
        <h3 className="font-display text-xl">Salvage Tips</h3>
        <ul className="mt-2 space-y-1 text-sm text-[#b8ab96]">
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
        "flex items-center gap-3 rounded-2xl border border-[#e8c36a]/10 bg-black/20 px-3 py-2.5",
        dim && "opacity-45",
      )}
    >
      <div className="w-6 text-center text-xs text-[#b8ab96]">{index}</div>
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
        <div className="truncate text-[11px] text-[#b8ab96]">
          {item.effectKind === "cash"
            ? formatCash(effectAt(item.id, step.to) ?? 0)
            : formatEffect(item.id, step.to)}
          {compact ? "" : ` · ${step.reason}`}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-[#2ee6c7]">
          {formatGems(step.cost)}
        </div>
        {running != null && (
          <div className="text-[10px] text-[#b8ab96]">
            {formatGems(running)} total
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onComplete}
        className="rounded-full border border-[#2ee6c7]/30 px-2.5 py-1 text-[11px] text-[#2ee6c7] hover:bg-[#2ee6c7]/10"
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
        className="h-8 w-8 rounded-lg border border-[#e8c36a]/20 text-lg leading-none"
      >
        −
      </button>
      <input
        type="number"
        min={0}
        max={item.maxLevel}
        value={level}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 w-16 rounded-lg border border-[#e8c36a]/20 bg-black/30 text-center outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(level + 1)}
        className="h-8 w-8 rounded-lg border border-[#e8c36a]/20 text-lg leading-none"
      >
        +
      </button>
      <span className="text-xs text-[#b8ab96]">/ {item.maxLevel}</span>
      {level === 0 && !canUnlock(id, levels) && (
        <span className="text-[10px] text-[#b8ab96]">needs previous card</span>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs tracking-wide text-[#b8ab96] uppercase">
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
    <div className="rounded-2xl bg-black/25 p-3">
      <div className="text-[11px] tracking-wide text-[#b8ab96] uppercase">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-2xl font-semibold",
          gem ? "gem-text" : "gold-text",
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] text-[#b8ab96]">{hint}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[#b8ab96]">{k}</dt>
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
      className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", m.cls)}
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
        "flex items-center gap-2 rounded-full border px-3 py-1.5",
        gem
          ? "border-[#2ee6c7]/25 bg-[#04261f]/70"
          : "border-[#a78bfa]/25 bg-[#1a0f2e]/70",
      )}
    >
      <span
        className={cn(
          "text-sm font-medium",
          gem ? "text-[#2ee6c7]" : "text-[#a78bfa]",
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
