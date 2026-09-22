import { useMemo, useState } from "react";
import {
  AVG_GEMS_PER_CITY,
  CITIES,
  LOOP_GEMS,
  MAX_CITY_GEMS,
  MIN_CITY_GEMS,
  cityForNumber,
} from "../data/cities";
import { CITY_RESTAURANT_MAP } from "../data/restaurants";
import { TOTAL_VAULT_GEMS } from "../data/vault";
import {
  citiesNeededForGems,
  formatGems,
  loopsNeededForGems,
} from "../utils/calc";
import { cn } from "../utils/cn";

export function CitiesView({
  currentCity,
  gemsToMaxVault = TOTAL_VAULT_GEMS,
  gemsToPriority = TOTAL_VAULT_GEMS,
}: {
  currentCity: number;
  gemsToMaxVault?: number;
  gemsToPriority?: number;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(Math.max(1, currentCity || 1));
  const active = cityForNumber(selected);
  const restaurants = CITY_RESTAURANT_MAP[active.id];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        String(c.id).includes(q) ||
        String(c.gems).includes(q),
    );
  }, [query]);

  const yourGems = cityForNumber(currentCity || 1).gems;
  const citiesToFull = citiesNeededForGems(gemsToMaxVault, AVG_GEMS_PER_CITY);
  const citiesAtYours = citiesNeededForGems(gemsToMaxVault, yourGems);
  const citiesPriority = citiesNeededForGems(gemsToPriority, AVG_GEMS_PER_CITY);
  const loopsLeft = loopsNeededForGems(gemsToMaxVault, LOOP_GEMS);

  return (
    <div className="space-y-6">
      <section className="ticket rounded-2xl p-5 sm:p-6">
        <p className="text-sm font-medium text-[#5c6f69]">City loop handbook</p>
        <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-[#14201c]">
          {active.name}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[#5c6f69]">
          Every city pays a fixed gem total from its restaurants. Loop average is{" "}
          {AVG_GEMS_PER_CITY} gems · full 60-city loop is {formatGems(LOOP_GEMS)}.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white/70 p-3">
            <div className="text-xs text-[#5c6f69]">Cities to max your vault</div>
            <div className="mt-1 font-display text-2xl font-bold text-[#e8452d]">
              {citiesToFull.toLocaleString()}
            </div>
            <div className="mt-0.5 text-[11px] text-[#5c6f69]">
              {formatGems(gemsToMaxVault)} gems left @ avg
            </div>
          </div>
          <div className="rounded-xl bg-white/70 p-3">
            <div className="text-xs text-[#5c6f69]">At your city rate</div>
            <div className="mt-1 font-display text-2xl font-bold">
              {citiesAtYours.toLocaleString()}
            </div>
            <div className="mt-0.5 text-[11px] text-[#5c6f69]">
              {yourGems} gems in current city
            </div>
          </div>
          <div className="rounded-xl bg-white/70 p-3">
            <div className="text-xs text-[#5c6f69]">Priority cards only</div>
            <div className="mt-1 font-display text-2xl font-bold">
              {citiesPriority.toLocaleString()}
            </div>
            <div className="mt-0.5 text-[11px] text-[#5c6f69]">
              {formatGems(gemsToPriority)} gems
            </div>
          </div>
          <div className="rounded-xl bg-white/70 p-3">
            <div className="text-xs text-[#5c6f69]">Loops still needed</div>
            <div className="mt-1 font-display text-2xl font-bold">
              {loopsLeft.toFixed(1)}
            </div>
            <div className="mt-0.5 text-[11px] text-[#5c6f69]">
              This city pays {active.gems}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="stat-tile">
          <div className="text-[11px] text-[#9bb5af]">Selected city gems</div>
          <div className="mt-1 font-display text-2xl font-bold gold-text">
            {active.gems}
          </div>
        </div>
        <div className="stat-tile">
          <div className="text-[11px] text-[#9bb5af]">Loop gem range</div>
          <div className="mt-1 font-display text-2xl font-bold">
            {MIN_CITY_GEMS}–{MAX_CITY_GEMS}
          </div>
        </div>
        <div className="stat-tile">
          <div className="text-[11px] text-[#9bb5af]">From-zero vault loops</div>
          <div className="mt-1 font-display text-2xl font-bold">
            {(TOTAL_VAULT_GEMS / LOOP_GEMS).toFixed(1)}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="panel rounded-2xl p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-display text-xl font-bold">All 60 cities</h3>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city…"
              className="field max-w-[180px] py-1.5 text-sm"
            />
          </div>
          <div className="max-h-[28rem] space-y-1 overflow-y-auto pr-1">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition",
                  selected === c.id
                    ? "bg-[#f0b429] text-[#0b2422]"
                    : "hover:bg-white/5",
                )}
              >
                <span>
                  <span className="mr-2 opacity-60">{c.id}</span>
                  {c.name}
                </span>
                <span className="font-medium">{c.gems}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel rounded-2xl p-4 sm:p-5">
          <h3 className="font-display text-xl font-bold">Restaurants</h3>
          <p className="mt-1 text-sm text-[#9bb5af]">
            {restaurants
              ? `Gem payouts inside ${restaurants.cityName}.`
              : "Detailed restaurant list isn’t in the handbook for this city number — gem total still matches the city table."}
          </p>
          {restaurants ? (
            <div className="mt-4 space-y-2">
              {restaurants.restaurants.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-sm"
                >
                  <span>{r.name}</span>
                  <span className="gem-text font-medium">{r.gems} gems</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-sm font-semibold">
                <span>City total</span>
                <span className="gold-text">{restaurants.totalGems} gems</span>
              </div>
              <p className="pt-2 text-xs text-[#9bb5af]">
                At this city’s {active.gems} gems, your remaining vault needs about{" "}
                {citiesNeededForGems(gemsToMaxVault, active.gems).toLocaleString()}{" "}
                clears of {active.name}.
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-white/15 p-4 text-sm text-[#9bb5af]">
              No restaurant rows for this city index. Lowest payouts: Toronto &
              Pittsburgh (154). Highest: Lyon, Budapest, Madrid, Zagreb (208).
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
