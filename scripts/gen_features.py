import zipfile, os, re, xml.etree.ElementTree as ET, json
from pathlib import Path

p = Path(os.environ["TEMP"]) / "eatventure-sheet" / "export.xlsx"
z = zipfile.ZipFile(p)
ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
ss = []
root = ET.fromstring(z.read("xl/sharedStrings.xml"))
for si in root.findall("m:si", ns):
    ss.append("".join(t.text or "" for t in si.findall(".//m:t", ns)))
wb = ET.fromstring(z.read("xl/workbook.xml"))
sheets = {
    sh.attrib.get("name"): sh.attrib.get(
        "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
    )
    for sh in wb.findall("m:sheets/m:sheet", ns)
}
rels = {
    rel.attrib["Id"]: rel.attrib["Target"]
    for rel in ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
}
out = Path(r"C:\Users\miladbn\Desktop\New folder\eatvature-fun\src\data")


def col_row(cell_ref):
    m = re.match(r"([A-Z]+)(\d+)", cell_ref)
    col, row = m.group(1), int(m.group(2))
    n = 0
    for c in col:
        n = n * 26 + (ord(c) - 64)
    return n - 1, row - 1


def sheet_grid(name, max_rows=400, max_cols=40):
    target = rels[sheets[name]]
    path = ("xl/" + target) if not target.startswith("/") else target.lstrip("/")
    root = ET.fromstring(z.read(path))
    rows = {}
    for c in root.findall(".//m:c", ns):
        ref = c.attrib.get("r")
        if not ref:
            continue
        ci, ri = col_row(ref)
        if ri >= max_rows or ci >= max_cols:
            continue
        t = c.attrib.get("t")
        v = c.find("m:v", ns)
        if v is None or v.text is None:
            val = ""
        elif t == "s":
            val = ss[int(v.text)]
        else:
            val = v.text
        rows.setdefault(ri, {})[ci] = val
    max_r = max(rows)
    max_c = max(max(r.keys()) for r in rows.values())
    return [[rows.get(r, {}).get(c, "") for c in range(max_c + 1)] for r in range(max_r + 1)]


def slug(s):
    s = re.sub(r"[^a-zA-Z0-9]+", " ", str(s)).strip().lower()
    parts = s.split()
    if not parts:
        return "item"
    return parts[0] + "".join(p.title() for p in parts[1:])


def num(x, default=0):
    try:
        if x in ("", None):
            return default
        return float(x)
    except Exception:
        return default


# ---- Items catalog ----
items_grid = sheet_grid("Items", 250, 20)
# headers row 2: Image, Name, Type, Rarity, Event, AP Min, AP Max, Faster Food, Faster Walk, Perfect, Instant, Double, Another, Divine
catalog = []
for row in items_grid[2:]:
    name = str(row[1]).strip() if len(row) > 1 else ""
    if not name:
        continue
    slot = str(row[2]).strip().lower() if len(row) > 2 else ""
    rarity = str(row[3]).strip().lower() if len(row) > 3 else ""
    event = str(row[4]).strip() if len(row) > 4 else ""
    catalog.append(
        {
            "id": slug(name + " " + slot),
            "name": name,
            "slot": slot or "misc",
            "rarity": rarity or "common",
            "event": event or "—",
            "apMin": num(row[5]) if len(row) > 5 else 0,
            "apMax": num(row[6]) if len(row) > 6 else 0,
            "fasterFood": num(row[7]) if len(row) > 7 else 0,
            "fasterWalk": num(row[8]) if len(row) > 8 else 0,
            "perfectFood": num(row[9]) if len(row) > 9 else 0,
            "instantFood": num(row[10]) if len(row) > 10 else 0,
            "doubleFood": num(row[11]) if len(row) > 11 else 0,
            "anotherOrder": num(row[12]) if len(row) > 12 else 0,
            "divineFood": num(row[13]) if len(row) > 13 else 0,
        }
    )

# dedupe ids
seen = {}
for c in catalog:
    base = c["id"]
    if base in seen:
        seen[base] += 1
        c["id"] = f"{base}{seen[base]}"
    else:
        seen[base] = 1

items_ts = '''export interface CatalogItem {
  id: string;
  name: string;
  slot: string;
  rarity: string;
  event: string;
  apMin: number;
  apMax: number;
  fasterFood: number;
  fasterWalk: number;
  perfectFood: number;
  instantFood: number;
  doubleFood: number;
  anotherOrder: number;
  divineFood: number;
}

/** Full gear/accessory catalog from Spectre Handbook Items sheet. */
export const CATALOG_ITEMS: CatalogItem[] = [
'''
for c in catalog:
    items_ts += (
        f'  {{ id: {json.dumps(c["id"])}, name: {json.dumps(c["name"])}, slot: {json.dumps(c["slot"])}, '
        f'rarity: {json.dumps(c["rarity"])}, event: {json.dumps(c["event"])}, '
        f'apMin: {c["apMin"]}, apMax: {c["apMax"]}, fasterFood: {c["fasterFood"]}, fasterWalk: {c["fasterWalk"]}, '
        f'perfectFood: {c["perfectFood"]}, instantFood: {c["instantFood"]}, doubleFood: {c["doubleFood"]}, '
        f'anotherOrder: {c["anotherOrder"]}, divineFood: {c["divineFood"]} }},\n'
    )
items_ts += '''];

export const CATALOG_EVENTS = Array.from(new Set(CATALOG_ITEMS.map((i) => i.event))).sort();
export const CATALOG_SLOTS = Array.from(new Set(CATALOG_ITEMS.map((i) => i.slot))).sort();
export const CATALOG_RARITIES = ["common", "rare", "epic", "legendary", "ultimate", "mythic"];
'''
(out / "catalog.ts").write_text(items_ts, encoding="utf-8")
print("catalog", len(catalog))

# ---- City matrix from restaurants ----
# Build restaurant -> cities map from CITY_RESTAURANTS already generated
rest_path = out / "restaurants.ts"
text = rest_path.read_text(encoding="utf-8")
# parse city blocks roughly via regex
import ast

# regenerate matrix from restaurants sheet
grid = sheet_grid("Restaurants Per City", 200, 50)
restaurants_by_city = {}
i = 0
while i < len(grid):
    row = grid[i]
    if any(str(row[c]).startswith("City ") for c in range(0, min(len(row), 50), 3)):
        name_row = grid[i - 1] if i > 0 else []
        for col in range(0, min(len(row), 50), 3):
            label = str(row[col])
            if not label.startswith("City "):
                continue
            try:
                city_num = int(label.replace("City ", "").strip())
            except Exception:
                continue
            city_name = str(name_row[col]) if col < len(name_row) else ""
            spots = []
            j = i + 1
            while j < len(grid):
                r = grid[j]
                spot = str(r[col]) if col < len(r) else ""
                gem = r[col + 1] if col + 1 < len(r) else ""
                if spot == "Total":
                    break
                if spot and spot not in ("", "N/A"):
                    try:
                        g = int(float(gem))
                    except Exception:
                        g = 0
                    spots.append(spot)
                if not any(str(x).strip() for x in r):
                    break
                j += 1
            restaurants_by_city[city_num] = {"name": city_name, "restaurants": spots}
        i += 1
    else:
        i += 1

all_rest = sorted({r for b in restaurants_by_city.values() for r in b["restaurants"]})
matrix_ts = '''export interface MatrixCity {
  cityId: number;
  cityName: string;
  restaurants: string[];
}

export const MATRIX_CITIES: MatrixCity[] = [
'''
for k in sorted(restaurants_by_city):
    b = restaurants_by_city[k]
    matrix_ts += f'  {{ cityId: {k}, cityName: {json.dumps(b["name"])}, restaurants: {json.dumps(b["restaurants"])} }},\n'
matrix_ts += '''];

export const MATRIX_RESTAURANTS = ''' + json.dumps(all_rest) + ''' as string[];

export function citiesWithRestaurant(name: string): number[] {
  return MATRIX_CITIES.filter((c) => c.restaurants.includes(name)).map((c) => c.cityId);
}
'''
(out / "matrix.ts").write_text(matrix_ts, encoding="utf-8")
print("matrix cities", len(restaurants_by_city), "restaurants", len(all_rest))

# ---- meta / events / links ----
meta = '''export const HANDBOOK_META = {
  gamePatch: "1.33.2",
  handbookVersion: "1.16.2",
  lastUpdate: "Mar 24, 2025",
  author: "Spectre",
  sheetUrl: "https://docs.google.com/spreadsheets/d/1xcVOTizpCp8oQFAalfHUrB91F_Mr-mFZmP1HoHU8xQo",
  discordUrl: "https://discord.gg/eatventure",
  redditUrl: "https://www.reddit.com/r/eatventureofficial",
  calculatorNote: "EV Multi-purpose Calculator by BladedCross (Discord: bladedcross)",
};

export const EVENTS = [
  {
    id: "moon",
    name: "Moon",
    box: "Moon Event Box",
    highlights: ["Robot Head", "Robot Suit", "Laser Gun"],
    tip: "Best ultimate set for all-worker instant / perfect.",
  },
  {
    id: "mine",
    name: "Mine",
    box: "Mine Event Box",
    highlights: ["Torch Helmet", "Tool Belt", "Pickaxe"],
    tip: "Walk and food speed ultimates; Pickaxe hand for perfect.",
  },
  {
    id: "seaport",
    name: "SeaPort",
    box: "Seaport Event Box",
    highlights: ["Shark Head", "Shark Body", "Anchor"],
    tip: "Shark body is a strong AW instant option.",
  },
  {
    id: "middleAges",
    name: "Middle Ages",
    box: "Middle Ages Event Box",
    highlights: ["Royal Crown", "Royal Robe", "Royal Sceptre"],
    tip: "Royal Crown is a top ultimate head for AW food + instant.",
  },
  {
    id: "potion",
    name: "Potion Shop",
    box: "Alchemical Chest",
    highlights: ["Alchemist Goggles", "Alchemist Bandolier", "Potion Flask", "Arcane Vault"],
    tip: "Farm scrolls for Arcane Vault; potions carry into main game.",
  },
  {
    id: "space",
    name: "Space",
    box: "Space Event Box",
    highlights: ["Robot-adjacent gear"],
    tip: "Check Items catalog for Space-tagged pieces.",
  },
  {
    id: "adventure",
    name: "Adventure",
    box: "Adventure / Zeus rewards",
    highlights: ["Rings", "Necklaces", "Trident"],
    tip: "Mythic rings/necklaces come from adventure content.",
  },
  {
    id: "club",
    name: "Club",
    box: "Club Box",
    highlights: ["Chef's Helmet", "Armoured Apron", "Warrior's Cleaver"],
    tip: "Mythics are club-box exclusive. Push equal XP contribution.",
  },
] as const;

export const MILESTONES = [
  { id: "unlockAll", label: "Unlock every vault card", check: "allUnlocked" },
  { id: "registerMax", label: "Max Register (or own Panda)", check: "registerMax" },
  { id: "remote10", label: "Remote level 10", check: "remote10" },
  { id: "remote20", label: "Remote level 20", check: "remote20" },
  { id: "remote50", label: "Remote maxed", check: "remote50" },
  { id: "mop20", label: "Mop maxed", check: "mop20" },
  { id: "checkbook20", label: "Checkbook maxed", check: "checkbook20" },
  { id: "city60", label: "Reach city 60", check: "city60" },
  { id: "city120", label: "Reach city 120", check: "city120" },
  { id: "city450", label: "Reach city 450", check: "city450" },
  { id: "ownPanda", label: "Own Legendary Panda", check: "ownPanda" },
  { id: "vault100", label: "100% vault", check: "vault100" },
] as const;
'''
(out / "meta.ts").write_text(meta, encoding="utf-8")
print("meta written")
