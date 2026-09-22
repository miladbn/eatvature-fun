import { useMemo, useState } from "react";
import {
  MATRIX_CITIES,
  MATRIX_RESTAURANTS,
  citiesWithRestaurant,
} from "../data/matrix";
import { cn } from "../utils/cn";

export function MatrixView() {
  const [selected, setSelected] = useState(MATRIX_RESTAURANTS[0] ?? "");
  const cities = useMemo(
    () => (selected ? citiesWithRestaurant(selected) : []),
    [selected],
  );

  return (
    <div className="space-y-5">
      <section className="ticket rounded-2xl p-5">
        <h2 className="font-display text-3xl font-bold text-[#14201c]">
          City matrix
        </h2>
        <p className="mt-1 text-sm text-[#5c6f69]">
          Pick a restaurant type to see which cities include it.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="panel rounded-2xl p-4">
          <h3 className="font-display text-lg font-bold">Restaurants</h3>
          <div className="mt-3 max-h-[28rem] space-y-1 overflow-y-auto">
            {MATRIX_RESTAURANTS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setSelected(name)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm",
                  selected === name
                    ? "bg-[#f0b429] text-[#0b2422]"
                    : "hover:bg-white/5",
                )}
              >
                <span>{name}</span>
                <span className="text-xs opacity-70">
                  {citiesWithRestaurant(name).length}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel rounded-2xl p-4">
          <h3 className="font-display text-lg font-bold">{selected}</h3>
          <p className="mt-1 text-sm text-[#9bb5af]">
            Appears in {cities.length} cities
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {MATRIX_CITIES.map((c) => {
              const on = c.restaurants.includes(selected);
              return (
                <div
                  key={c.cityId}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-xs",
                    on
                      ? "border-[#3ecfb3]/40 bg-[#3ecfb3]/10 text-[#3ecfb3]"
                      : "border-white/8 bg-black/15 text-[#9bb5af] opacity-45",
                  )}
                >
                  <div className="font-medium">
                    {c.cityId}. {c.cityName}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
