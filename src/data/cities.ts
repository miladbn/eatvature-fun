export interface CityInfo {
  id: number;
  name: string;
  gems: number;
}

/** Gem totals for each city in a 60-city loop (Spectre Handbook). */
export const CITIES: CityInfo[] = [
  { id: 1, name: "San Francisco", gems: 196 },
  { id: 2, name: "New York", gems: 160 },
  { id: 3, name: "Miami", gems: 172 },
  { id: 4, name: "Paris", gems: 196 },
  { id: 5, name: "London", gems: 190 },
  { id: 6, name: "Tokyo", gems: 184 },
  { id: 7, name: "Venice", gems: 178 },
  { id: 8, name: "Beirut", gems: 190 },
  { id: 9, name: "Berlin", gems: 184 },
  { id: 10, name: "Oslo", gems: 202 },
  { id: 11, name: "Rome", gems: 178 },
  { id: 12, name: "Warsaw", gems: 184 },
  { id: 13, name: "Johannesburg", gems: 178 },
  { id: 14, name: "Stockholm", gems: 196 },
  { id: 15, name: "Mexico City", gems: 172 },
  { id: 16, name: "Portland", gems: 184 },
  { id: 17, name: "Toronto", gems: 154 },
  { id: 18, name: "Sydney", gems: 184 },
  { id: 19, name: "Lyon", gems: 208 },
  { id: 20, name: "Glasgow", gems: 178 },
  { id: 21, name: "Beijing", gems: 178 },
  { id: 22, name: "Bruges", gems: 172 },
  { id: 23, name: "Istanbul", gems: 190 },
  { id: 24, name: "Hamburg", gems: 184 },
  { id: 25, name: "Zurich", gems: 202 },
  { id: 26, name: "Milan", gems: 178 },
  { id: 27, name: "Budapest", gems: 208 },
  { id: 28, name: "Nairobi", gems: 172 },
  { id: 29, name: "Helsinki", gems: 190 },
  { id: 30, name: "Sao Paulo", gems: 172 },
  { id: 31, name: "Seattle", gems: 196 },
  { id: 32, name: "San Diego", gems: 160 },
  { id: 33, name: "Santa Monica", gems: 172 },
  { id: 34, name: "Brussels", gems: 196 },
  { id: 35, name: "Luxembourg", gems: 190 },
  { id: 36, name: "Hong Kong", gems: 184 },
  { id: 37, name: "Treviso", gems: 178 },
  { id: 38, name: "Marrakesh", gems: 190 },
  { id: 39, name: "Cologne", gems: 184 },
  { id: 40, name: "Tallinn", gems: 202 },
  { id: 41, name: "Florence", gems: 178 },
  { id: 42, name: "Prague", gems: 184 },
  { id: 43, name: "Cape Town", gems: 178 },
  { id: 44, name: "Copenhagen", gems: 196 },
  { id: 45, name: "Lima", gems: 172 },
  { id: 46, name: "Los Angeles", gems: 184 },
  { id: 47, name: "Pittsburgh", gems: 154 },
  { id: 48, name: "Nassau", gems: 184 },
  { id: 49, name: "Madrid", gems: 208 },
  { id: 50, name: "Amsterdam", gems: 178 },
  { id: 51, name: "Seoul", gems: 178 },
  { id: 52, name: "Birmingham", gems: 172 },
  { id: 53, name: "Cairo", gems: 190 },
  { id: 54, name: "Frankfurt", gems: 184 },
  { id: 55, name: "Quebec", gems: 202 },
  { id: 56, name: "Naples", gems: 178 },
  { id: 57, name: "Zagreb", gems: 208 },
  { id: 58, name: "Pretoria", gems: 172 },
  { id: 59, name: "Gothenburg", gems: 190 },
  { id: 60, name: "Santiago", gems: 172 },
];

export const CITY_MAP = Object.fromEntries(CITIES.map((c) => [c.id, c])) as Record<
  number,
  CityInfo
>;

export const LOOP_GEMS = CITIES.reduce((s, c) => s + c.gems, 0);
export const AVG_GEMS_PER_CITY = Math.round(LOOP_GEMS / CITIES.length);
export const MIN_CITY_GEMS = Math.min(...CITIES.map((c) => c.gems));
export const MAX_CITY_GEMS = Math.max(...CITIES.map((c) => c.gems));

export function cityForNumber(n: number): CityInfo {
  const idx = ((Math.max(1, Math.floor(n)) - 1) % 60) + 1;
  return CITY_MAP[idx];
}

export function gemsFromCity(cityNumber: number): number {
  return cityForNumber(cityNumber).gems;
}
