"""Sync game data + icons from the Spectre Eatventure Handbook Google Sheet.

Usage (from the repo root):
    py -I scripts/sync_sheet.py                # download the sheet, regenerate
    py -I scripts/sync_sheet.py --xlsx path    # use an already-downloaded .xlsx

Writes:
    src/data/sheet/*.ts        generated data modules (do not edit by hand)
    public/images/<group>/*.png  icons embedded in the sheet

Only the standard library is used. Each tab is parsed by locating labels in the
sheet (titles, "Stats", "Total Stats", ...) rather than fixed row numbers, so
small layout shifts in future handbook versions keep working; anything that
cannot be matched is reported at the end.
"""

from __future__ import annotations

import argparse
import json
import posixpath
import re
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

SHEET_ID = "1xcVOTizpCp8oQFAalfHUrB91F_Mr-mFZmP1HoHU8xQo"
ROOT = Path(__file__).resolve().parent.parent
OUT_DATA = ROOT / "src" / "data" / "sheet"
OUT_IMG = ROOT / "public" / "images"

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "xdr": "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
}
RARITIES = ["common", "rare", "epic", "legendary", "ultimate", "mythic"]
STAT_KEYS = [
    "fasterFood",
    "fasterWalk",
    "perfectFood",
    "instantFood",
    "doubleFood",
    "anotherOrder",
    "divineFood",
]
WARNINGS: list[str] = []


def warn(msg: str) -> None:
    WARNINGS.append(msg)


# ─── xlsx reading ──────────────────────────────────────────────────────────


class Workbook:
    def __init__(self, path: Path):
        self.z = zipfile.ZipFile(path)
        self.strings = self._shared_strings()
        self.sheets: dict[str, dict[tuple[int, int], str]] = {}
        self.images: dict[str, list[tuple[int, int, str]]] = {}
        wb = ET.fromstring(self.z.read("xl/workbook.xml"))
        wb_rels = self._rels("xl/workbook.xml")
        for s in wb.find("m:sheets", NS):
            name = s.get("name")
            part = wb_rels[s.get("{%s}id" % NS["r"])]
            self.sheets[name] = self._cells(part)
            self.images[name] = self._images(part)

    def _rels(self, part: str) -> dict[str, str]:
        d = posixpath.dirname(part)
        f = f"{d}/_rels/{posixpath.basename(part)}.rels"
        if f not in self.z.namelist():
            return {}
        out = {}
        for r in ET.fromstring(self.z.read(f)):
            t = r.get("Target")
            out[r.get("Id")] = t[1:] if t.startswith("/") else posixpath.normpath(posixpath.join(d, t))
        return out

    def _shared_strings(self) -> list[str]:
        if "xl/sharedStrings.xml" not in self.z.namelist():
            return []
        root = ET.fromstring(self.z.read("xl/sharedStrings.xml"))
        return ["".join(t.text or "" for t in si.iter("{%s}t" % NS["m"])) for si in root.findall("m:si", NS)]

    def _cells(self, part: str) -> dict[tuple[int, int], str]:
        cells = {}
        for c in ET.fromstring(self.z.read(part)).iter("{%s}c" % NS["m"]):
            m = re.match(r"([A-Z]+)(\d+)", c.get("r"))
            col = 0
            for ch in m.group(1):
                col = col * 26 + ord(ch) - 64
            v = c.find("m:v", NS)
            if v is not None:
                val = self.strings[int(v.text)] if c.get("t") == "s" else v.text
            else:
                isel = c.find("m:is", NS)
                val = "".join(t.text or "" for t in isel.iter("{%s}t" % NS["m"])) if isel is not None else None
            if val is not None and str(val).strip() != "":
                cells[(int(m.group(2)) - 1, col - 1)] = str(val).strip()
        return cells

    def _images(self, part: str) -> list[tuple[int, int, str]]:
        out = []
        for tgt in self._rels(part).values():
            if "drawing" not in tgt:
                continue
            drels = self._rels(tgt)
            for anc in ET.fromstring(self.z.read(tgt)):
                fr = anc.find("xdr:from", NS)
                blip = anc.find(".//a:blip", NS)
                if fr is None or blip is None:
                    continue
                media = drels.get(blip.get("{%s}embed" % NS["r"]))
                if media:
                    out.append((int(fr.find("xdr:row", NS).text), int(fr.find("xdr:col", NS).text), media))
        return out

    def read(self, media: str) -> bytes:
        return self.z.read(media)


class Sheet:
    def __init__(self, wb: Workbook, name: str):
        if name not in wb.sheets:
            sys.exit(f"Sheet tab '{name}' not found — has the handbook been reorganised?")
        self.c = wb.sheets[name]
        self.imgs = wb.images[name]
        self.max_row = max((r for r, _ in self.c), default=0)

    def get(self, r: int, c: int) -> str:
        return self.c.get((r, c), "")

    def row(self, r: int) -> dict[int, str]:
        return {c: v for (rr, c), v in self.c.items() if rr == r}

    def find(self, pred) -> list[tuple[int, int, str]]:
        return sorted((r, c, v) for (r, c), v in self.c.items() if pred(v))

    def image_at(self, r: int, c: int) -> str | None:
        for ir, ic, media in self.imgs:
            if ir == r and ic == c:
                return media
        return None


def num(v: str, default: float = 0.0) -> float:
    try:
        return float(str(v).replace(",", ""))
    except ValueError:
        return default


def clean_num(x: float):
    x = round(x, 4)
    return int(x) if x == int(x) else x


def item_id(name: str, slot: str) -> str:
    """Matches the ids used since the first catalog import (and icon file names)."""
    words = [w for w in re.split(r"[^A-Za-z0-9]+", name) if w]
    base = words[0].lower() + "".join(w[:1].upper() + w[1:] for w in words[1:])
    return base + slot[:1].upper() + slot[1:]


def camel(name: str) -> str:
    words = [w for w in re.split(r"[^A-Za-z0-9]+", name) if w]
    return words[0].lower() + "".join(w[:1].upper() + w[1:].lower() for w in words[1:])


# ─── Icons ─────────────────────────────────────────────────────────────────

ICONS: dict[str, dict[str, str]] = {}  # group -> {id: media path}


def add_icon(group: str, key: str, media: str | None) -> None:
    if media:
        ICONS.setdefault(group, {}).setdefault(key, media)


def write_icons(wb: Workbook) -> int:
    n = 0
    for group, mapping in ICONS.items():
        d = OUT_IMG / group
        d.mkdir(parents=True, exist_ok=True)
        for key, media in mapping.items():
            (d / f"{key}.png").write_bytes(wb.read(media))
            n += 1
    return n


# ─── Items ─────────────────────────────────────────────────────────────────


def parse_items(sh: Sheet) -> list[dict]:
    header = next((r for r, c, v in sh.find(lambda v: v == "Name")), None)
    if header is None:
        sys.exit("Items: header row not found")
    cols = sh.row(header)
    name_c = next(c for c, v in cols.items() if v == "Name")
    # Two stat groups: "Your character only" then "All workers".
    stat_cols = [c for c, v in sorted(cols.items()) if v.lower().startswith(("faster", "perfect", "instant", "double", "another", "divine"))]
    if len(stat_cols) != 14:
        warn(f"Items: expected 14 stat columns, found {len(stat_cols)}")
    items = []
    for r in range(header + 1, sh.max_row + 1):
        name = sh.get(r, name_c)
        if not name:
            continue
        slot = sh.get(r, name_c + 1).lower()
        rarity = sh.get(r, name_c + 2).lower()
        if rarity not in RARITIES:
            continue
        iid = item_id(name, slot)
        self_s = {k: clean_num(num(sh.get(r, stat_cols[i]))) for i, k in enumerate(STAT_KEYS)}
        aw_s = {k: clean_num(num(sh.get(r, stat_cols[7 + i]))) for i, k in enumerate(STAT_KEYS)}
        items.append(
            {
                "id": iid,
                "name": name,
                "slot": slot,
                "rarity": rarity,
                "event": sh.get(r, name_c + 3),
                "apMin": clean_num(num(sh.get(r, name_c + 4))),
                "apMax": clean_num(num(sh.get(r, name_c + 5))),
                "self": self_s,
                "aw": aw_s,
            }
        )
        img = sh.image_at(r, name_c - 1) or sh.image_at(r, 0)
        if img:
            add_icon("items", iid, img)
        else:
            warn(f"Items: no icon for {name}")
    return items


class ItemIndex:
    def __init__(self, items: list[dict]):
        self.items = items
        self.by_name: dict[str, list[dict]] = {}
        for it in items:
            self.by_name.setdefault(it["name"].lower(), []).append(it)

    def lookup(self, raw: str, rarity: str | None = None, slot: str | None = None) -> dict | None:
        name = raw.strip().lower()
        cands = []
        for n in (name, re.sub(r"s$", "", name), re.sub(r" (head|body)$", "", name)):
            cands = self.by_name.get(n, [])
            if cands:
                break
        if not cands:
            return None
        if slot is None:
            m = re.search(r" (head|body)$", name)
            slot = m.group(1) if m else None
        for filt in (
            lambda i: (rarity is None or i["rarity"] == rarity) and (slot is None or i["slot"] == slot),
            lambda i: rarity is None or i["rarity"] == rarity,
            lambda i: True,
        ):
            hit = [i for i in cands if filt(i)]
            if hit:
                return hit[0]
        return None


# ─── Blueprints ────────────────────────────────────────────────────────────

ING_RE = re.compile(r"^(\d+)\s*x\s+(.+)$", re.I)
# Ingredient names the blueprint tabs spell differently from the Items tab.
ALIASES = {"apron": "White Apron", "bowtie": "Bow Tie", "tall white hat": "Tall Hat"}


def is_recipe_row(sh: Sheet, rr: int) -> bool:
    """A row of "Nx Item" ingredients, or the legacy "not obtainable" note."""
    return any(ING_RE.match(v) or v.startswith("Legacy Item") for v in sh.row(rr).values())


def resolve_ingredients(ingredients: list[dict], idx: ItemIndex, title: str) -> str | None:
    """Look ingredients up in Items; returns the recipe's majority slot."""
    first = [idx.lookup(ALIASES.get(x["name"].lower(), x["name"])) for x in ingredients]
    slots = [h["slot"] for h in first if h]
    slot = max(set(slots), key=slots.count) if slots else None
    for x in ingredients:
        name = ALIASES.get(x["name"].lower(), x["name"])
        hit = idx.lookup(name, None, slot) or idx.lookup(name)
        x["itemId"] = hit["id"] if hit else None
        if not hit:
            warn(f"Blueprint {title}: ingredient '{x['name']}' not in Items")
    return slot


def parse_blueprints(sh: Sheet, rarity: str, idx: ItemIndex) -> list[dict]:
    out = []
    for r in range(sh.max_row + 1):
        # A title row is followed (within 7 rows) by a row of "Nx Item" cells.
        ing_row = next((rr for rr in range(r + 1, r + 8) if is_recipe_row(sh, rr)), None)
        if ing_row is None:
            continue
        titles = sorted(
            (c, v)
            for c, v in sh.row(r).items()
            if not ING_RE.match(v) and v not in ("Stats", "Box") and idx.lookup(v, rarity)
        )
        if not titles:
            continue
        # Skip if this title row actually belongs to an earlier ingredient row.
        if any(is_recipe_row(sh, rr) for rr in range(r + 1, ing_row)):
            continue
        bounds = [-1] + [(titles[i][0] + titles[i + 1][0]) / 2 for i in range(len(titles) - 1)] + [10**6]
        stats_row = next((rr for rr in range(ing_row, ing_row + 6) if "Stats" in sh.row(rr).values()), None)
        for i, (tc, title) in enumerate(titles):
            lo, hi = bounds[i], bounds[i + 1]
            in_band = lambda c: lo <= c < hi  # noqa: E731
            ingredients = []
            for c, v in sorted(sh.row(ing_row).items()):
                m = ING_RE.match(v)
                if m and in_band(c):
                    ingredients.append({"count": int(m.group(1)), "name": m.group(2).strip(), "itemId": None})
            # The recipe's slot disambiguates names like "Anchor", which is
            # both an ultimate tool and an ultimate necklace.
            slot = resolve_ingredients(ingredients, idx, title)
            res = idx.lookup(title, rarity, slot)
            stats, source = [], ""
            if stats_row is not None:
                srow = sorted((c, v) for c, v in sh.row(stats_row).items() if in_band(c))
                for j, (c, v) in enumerate(srow):
                    if v == "Box" and j + 1 < len(srow):
                        source = srow[j + 1][1]
                    elif v.startswith("All Profit"):
                        stats.append(v)
                    elif v not in ("Stats", "Box") and not source:
                        source = v
                for rr in range(stats_row + 1, stats_row + 6):
                    vals = [v for c, v in sorted(sh.row(rr).items()) if in_band(c)]
                    if not vals or any(ING_RE.match(v) for v in vals):
                        break
                    stats.extend(vals)
            note = next(
                (v for rr in range(r + 1, ing_row + 1) for c, v in sh.row(rr).items() if in_band(c) and "Legacy" in v),
                "",
            )
            out.append(
                {
                    "result": res["name"] if res else title,
                    "resultId": res["id"] if res else None,
                    "rarity": rarity,
                    "slot": res["slot"] if res else (slot or ""),
                    "ingredients": ingredients,
                    "stats": [s.replace("Fater", "Faster") for s in stats],
                    "source": source,
                    "legacy": bool(note),
                }
            )
    return out


# ─── Best builds ───────────────────────────────────────────────────────────

BUILD_RE = re.compile(r"^(.*Build)\s+(\d+)$")


def parse_builds(sh: Sheet, idx: ItemIndex) -> list[dict]:
    titles = sh.find(lambda v: bool(BUILD_RE.match(v)))
    phase_row = {c: v for c, v in sh.row(0).items()}
    out = []
    for r, c, title in titles:
        slot_row = sh.row(r + 1)
        cols = []
        cc = c
        while cc in slot_row:
            cols.append(cc)
            cc += 1
        if not cols:
            warn(f"Builds: no slots under {title}")
            continue
        # Next build title below in the same column ends this block.
        end = min([rr for rr, c2, _ in titles if c2 == c and rr > r] + [sh.max_row + 1])
        # Totals: the "Total Stats" cell inside this block's columns; item
        # stats sit above it, Solo / All Worker totals beside and below it.
        tot = next(
            ((rr, c2) for rr in range(r + 3, end) for c2 in cols if sh.get(rr, c2) == "Total Stats"),
            None,
        )
        tot_row = tot[0] if tot else end
        slots = []
        for col in cols:
            label = slot_row[col]
            name = sh.get(r + 2, col)
            slot = {"head": "head", "body": "body", "ring": "ring", "necklace": "necklace"}.get(
                label.lower(), "tool"
            )
            hit = idx.lookup(name, None, slot)
            stats, source = [], ""
            for rr in range(r + 3, tot_row):
                v = sh.get(rr, col)
                if not v:
                    continue
                if v.startswith("Found in:"):
                    source = v.split(":", 1)[1].strip()
                elif "%" in v:
                    stats.append(v)
            slots.append({"label": label, "slot": slot, "name": name, "itemId": hit["id"] if hit else None, "source": source, "stats": stats})
            if not hit:
                warn(f"Builds: '{name}' not found in Items")
        solo, aw = [], []
        if tot:
            tr, tc = tot
            for rr in range(tr + 1, end):
                a, b = sh.get(rr, tc + 1), sh.get(rr, tc + 2)
                if not a and not b:
                    if rr > tr + 1:
                        break
                    continue
                if a and a != "N/A" and "%" in a:
                    solo.append(a)
                if b and b != "N/A" and "%" in b:
                    aw.append(b)
        phase = ""
        for pc in sorted(phase_row):
            if pc <= c:
                phase = phase_row[pc]
        kind = BUILD_RE.match(title).group(1)
        out.append(
            {
                "id": camel(title),
                "label": title,
                "kind": kind,
                "phase": phase,
                "slots": slots,
                "totals": {"solo": solo, "aw": aw},
            }
        )
    order = ["Early Game Build", "Mid Game Build", "Late Game Build", "Solo Build", "Mythic Build"]
    out.sort(key=lambda b: (order.index(b["kind"]) if b["kind"] in order else 99, b["label"]))
    return out


# ─── Club ──────────────────────────────────────────────────────────────────


def parse_club(sh: Sheet) -> dict:
    header = next(r for r, c, v in sh.find(lambda v: v == "XP needed"))
    groups = [c for c, v in sh.row(header).items() if v == "Level"]
    levels = []
    for g in groups:
        for r in range(header + 1, sh.max_row + 1):
            lv = sh.get(r, g)
            if not re.match(r"^\d+(\.0)?$", lv):
                continue
            levels.append(
                {
                    "level": int(num(lv)),
                    "xpNeeded": int(num(sh.get(r, g + 1))),
                    "totalXp": int(num(sh.get(r, g + 2))),
                    "reward": sh.get(r, g + 3) if sh.get(r, g + 3) != "N/A" else "",
                }
            )
    levels.sort(key=lambda x: x["level"])
    def column_run(r0: int, c: int) -> list[str]:
        out = []
        r = r0
        while sh.get(r, c):
            out.append(sh.get(r, c))
            r += 1
        return out

    tr_r, tr_c, _ = sh.find(lambda v: v == "Total Rewards")[0]
    totals = column_run(tr_r + 1, tr_c)
    info_c = next((c for c in range(tr_c + 1, tr_c + 6) if sh.get(tr_r + 1, c)), None)
    info = column_run(tr_r + 1, info_c) if info_c is not None else []
    sv_r, sv_c, _ = sh.find(lambda v: v == "Salvage Type")[0]
    salvage = []
    for r in range(sv_r + 1, sv_r + 10):
        t = sh.get(r, sv_c)
        if not t:
            break
        salvage.append({"type": t, "xp": int(num(re.sub(r"[^\d.]", "", sh.get(r, sv_c + 1)))), "cost": sh.get(r, sv_c + 2)})
    pp = []
    lv_r, lv_c, _ = sh.find(lambda v: v == "XP Per Player")[0]
    lvl_c = max(c for c, v in sh.row(lv_r).items() if v == "Level" and c < lv_c)
    for r in range(lv_r + 1, lv_r + 10):
        a = sh.get(r, lvl_c)
        if not a:
            break
        pp.append({"levels": a, "xp": sh.get(r, lv_c)})
    return {"levels": levels, "totals": totals, "info": info, "salvage": salvage, "perPlayer": pp}


# ─── Pets ──────────────────────────────────────────────────────────────────


def parse_pet_food(sh: Sheet) -> dict:
    hdr = next(r for r, c, v in sh.find(lambda v: v == "Pet Food to next lvl"))
    groups = sorted(c for c, v in sh.row(hdr).items() if v == "Level")
    rar = ["common", "rare", "epic", "legendary", "ultimate"]
    curves, hatch = {}, {}
    for i, g in enumerate(groups[:5]):
        rows = []
        for r in range(hdr + 1, sh.max_row + 1):
            lv = sh.get(r, g)
            if not lv:
                continue
            if not re.match(r"^\d", lv):
                hatch[rar[i]] = {"label": lv, "food": int(num(sh.get(r, g + 2)))}
                continue
            nxt = sh.get(r, g + 2)
            rows.append(
                {
                    "level": int(num(lv)),
                    "profitPct": clean_num(num(sh.get(r, g + 1))),
                    "foodToNext": 0 if nxt.upper() == "MAX" else int(num(nxt)),
                    "totalWithHatch": int(num(sh.get(r, g + 3))),
                    "total": int(num(sh.get(r, g + 4))),
                }
            )
        curves[rar[i]] = rows
    tips_c = next(c for c, v in sh.row(0).items() if v == "Pet Tips")
    tips = [sh.get(r, tips_c) for r in range(1, sh.max_row + 1) if sh.get(r, tips_c)]
    return {"curves": curves, "hatch": hatch, "tips": tips}


def parse_pet_guide(sh: Sheet) -> dict:
    # Pet icons: image directly above each pet name.
    pets = sh.find(lambda v: v in PET_NAMES)
    for r, c, name in pets:
        add_icon("pets", camel(name), sh.image_at(r - 1, c))
    eggs_r = next(r for r, c, v in sh.find(lambda v: v == "Common Egg"))
    egg_names = sorted((c, v) for c, v in sh.row(eggs_r).items() if v.endswith("Egg"))
    egg_imgs = sorted((ic, m) for ir, ic, m in sh.imgs if ir == eggs_r + 1)
    for (c, name), (_, media) in zip(egg_names, egg_imgs):
        add_icon("eggs", camel(name.replace(" Egg", "")), media)
    conv = []
    ct = sh.find(lambda v: v.startswith("Pet Food Conversion"))
    if ct:
        r0, c0 = ct[0][0], ct[0][1]
        rows = [
            r
            for r in range(r0 + 1, r0 + 14)
            if any(c > c0 and re.match(r"^x?\d", v) for c, v in sh.row(r).items())
        ]
        if len(rows) >= 3:
            foods = sorted((c, v) for c, v in sh.row(rows[0]).items() if v.startswith("x"))
            for c, v in foods:
                conv.append(
                    {"food": int(num(v[1:])), "boxes": clean_num(num(sh.get(rows[1], c))), "cities": clean_num(num(sh.get(rows[2], c)))}
                )
    # Dish values / notes per pet type: blocks headed "For X:" with lines below.
    notes = []
    for r, c, v in sh.find(lambda v: v.startswith("For ") and v.endswith(":")):
        lines = []
        for rr in range(r + 1, r + 8):
            x = sh.get(rr, c)
            if not x or x.startswith("For "):
                break
            lines.append(x)
        notes.append({"title": v[4:-1], "lines": lines})
    return {"conversion": conv, "dishNotes": notes}


PET_NAMES = {
    "Chicken", "Cat", "Dog", "Dark Horse", "Tortoise", "Penguin", "Pony", "Turtle",
    "Panda", "Vroomba", "Baby Dragon", "Baby Kraken", "Mole", "Red Panda",
}


# ─── Potions ───────────────────────────────────────────────────────────────


def parse_potions(sh: Sheet) -> list[dict]:
    blocks = [r for r, c, v in sh.find(lambda v: v == "Potion")]
    # The tab repeats both tables: first with maxed Alchemy Scales, then without.
    half = len(blocks) // 2
    potions: dict[str, dict] = {}
    for bi, r in enumerate(blocks):
        maxed = bi < half
        names = sorted((c, v) for c, v in sh.row(r).items() if c > 0)
        # Potion name columns are the ones followed by an "Effect" text in the next row.
        eff_row = sh.row(r + 1)
        for c, v in names:
            if c not in eff_row or eff_row[c] == "Total":
                continue
            ing = [sh.get(r, c + 2), sh.get(r, c + 3)]
            p = potions.setdefault(
                v,
                {
                    "id": camel(v),
                    "name": v,
                    "effect": eff_row[c].replace("Aw ", "All workers: "),
                    "ingredients": ing,
                    "levels": [],
                },
            )
            if maxed:
                add_icon("potions", camel(v), sh.image_at(r, c + 1))
                for k, nm in enumerate(ing):
                    add_icon("ingredients", camel(nm), sh.image_at(r + 1, c + 2 + k))
            rows = []
            for rr in range(r + 2, r + 14):
                lv = sh.get(rr, c - 1)
                if not re.match(r"^\d", lv):
                    if sh.get(rr, c + 2) and sh.get(rr, 0) == "Total":
                        key = "totalCost" if maxed else "totalCostNoScales"
                        p[key] = [int(num(sh.get(rr, c + 2))), int(num(sh.get(rr, c + 3)))]
                    continue
                rows.append(
                    {
                        "level": int(num(lv)),
                        "gain": clean_num(num(sh.get(rr, c)) * 100),
                        "total": clean_num(num(sh.get(rr, c + 1)) * 100),
                        "cost": [int(num(sh.get(rr, c + 2))), int(num(sh.get(rr, c + 3)))],
                    }
                )
            if maxed:
                p["levels"] = rows
            else:
                for row, nr in zip(p["levels"], rows):
                    row["costNoScales"] = nr["cost"]
    return list(potions.values())


# ─── Clothing XP ───────────────────────────────────────────────────────────


def parse_clothing(sh: Sheet) -> dict:
    hdr = next(r for r, c, v in sh.find(lambda v: v == "XP to next lvl"))
    groups = sorted(c for c, v in sh.row(hdr).items() if v == "Level")
    out = {}
    for i, g in enumerate(groups[:6]):
        rows = []
        for r in range(hdr + 1, sh.max_row + 1):
            lv = sh.get(r, g)
            if not re.match(r"^\d", lv):
                continue
            nxt = sh.get(r, g + 3)
            ap = sh.get(r, g + 2)
            rows.append(
                {
                    "level": int(num(lv)),
                    "profitPct": clean_num(num(sh.get(r, g + 1))),
                    "apPct": clean_num(num(ap)) if ap else None,
                    "xpToNext": 0 if nxt.upper() == "MAX" else clean_num(num(nxt)),
                    "totalXp": clean_num(num(sh.get(r, g + 4))),
                }
            )
        out[RARITIES[i]] = rows
    return out


# ─── Vault / arcane icons ──────────────────────────────────────────────────

VAULT_IDS = {
    "Tip Jar": "tipJar", "Remote": "remote", "Pickaxe": "pickaxe", "Hour Glass": "hourglass",
    "Register": "register", "TV": "tv", "Piggy": "piggy", "Knife": "knife", "Mop": "mop",
    "Suitcase": "suitcase", "Checkbook": "checkbook", "Key Card": "keyCard",
}


def vault_icons(vault: Sheet, arcane: Sheet) -> None:
    hits = vault.find(lambda v: v in VAULT_IDS)
    for r, c, name in hits:
        add_icon("vault", VAULT_IDS[name], vault.image_at(r + 1, c))
    head = arcane.find(lambda v: v == "Potion Bandolier")
    if head:
        r = head[0][0]
        for c, name in arcane.row(r).items():
            add_icon("arcane", camel(name), arcane.image_at(r + 1, c))


# ─── Output ────────────────────────────────────────────────────────────────

HEADER = (
    "/* eslint-disable */\n"
    "// AUTO-GENERATED by scripts/sync_sheet.py from the Spectre Eatventure Handbook.\n"
    "// Do not edit by hand — re-run the script instead.\n"
)


def ts_array(items: list) -> str:
    return "[\n" + "".join(f"  {json.dumps(x, ensure_ascii=False)},\n" for x in items) + "]"


def write(name: str, body: str) -> None:
    OUT_DATA.mkdir(parents=True, exist_ok=True)
    (OUT_DATA / name).write_text(HEADER + body, encoding="utf-8", newline="\n")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--xlsx", type=Path, help="use a local copy instead of downloading")
    args = ap.parse_args()
    path = args.xlsx
    if path is None:
        path = Path(tempfile.gettempdir()) / "eatventure-handbook.xlsx"
        url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=xlsx"
        print(f"Downloading {url}")
        urllib.request.urlretrieve(url, path)
    wb = Workbook(path)

    items = parse_items(Sheet(wb, "Items"))
    idx = ItemIndex(items)
    blueprints = []
    for rar in ("legendary", "ultimate", "mythic"):
        blueprints += parse_blueprints(Sheet(wb, f"Blueprints - {rar.title()}"), rar, idx)
    builds = parse_builds(Sheet(wb, "Best Builds"), idx)
    club = parse_club(Sheet(wb, "Club Data"))
    pet_food = parse_pet_food(Sheet(wb, "Pet XPAPPet Food"))
    pet_guide = parse_pet_guide(Sheet(wb, "Pets Guide V2"))
    potions = parse_potions(Sheet(wb, "Potions"))
    clothing = parse_clothing(Sheet(wb, "ClothingAccessories XPAP"))
    vault_icons(Sheet(wb, "Vault"), Sheet(wb, "Arcane Vault"))

    write(
        "items.ts",
        'import type { GearItem } from "../../types";\n\n'
        f"export const SHEET_ITEMS: GearItem[] = {ts_array(items)};\n",
    )
    write(
        "blueprints.ts",
        'import type { Blueprint } from "../../types";\n\n'
        f"export const SHEET_BLUEPRINTS: Blueprint[] = {ts_array(blueprints)};\n",
    )
    write(
        "builds.ts",
        'import type { BuildReco } from "../../types";\n\n'
        f"export const SHEET_BUILDS: BuildReco[] = {ts_array(builds)};\n",
    )
    write(
        "club.ts",
        'import type { ClubLevel } from "../../types";\n\n'
        f"export const SHEET_CLUB_LEVELS: ClubLevel[] = {ts_array(club['levels'])};\n\n"
        f"export const SHEET_CLUB_TOTAL_REWARDS: string[] = {json.dumps(club['totals'], ensure_ascii=False, indent=2)};\n\n"
        f"export const SHEET_CLUB_INFO: string[] = {json.dumps(club['info'], ensure_ascii=False, indent=2)};\n\n"
        f"export const SHEET_CLUB_SALVAGE: {{ type: string; xp: number; cost: string }}[] = {ts_array(club['salvage'])};\n\n"
        f"export const SHEET_CLUB_XP_PER_PLAYER: {{ levels: string; xp: string }}[] = {ts_array(club['perPlayer'])};\n",
    )
    write(
        "pets.ts",
        'import type { PetLevelRow, PetRarity } from "../../types";\n\n'
        f"export const SHEET_PET_LEVELS: Record<PetRarity, PetLevelRow[]> = {json.dumps(pet_food['curves'], ensure_ascii=False)};\n\n"
        f"export const SHEET_PET_HATCH: Record<PetRarity, {{ label: string; food: number }}> = {json.dumps(pet_food['hatch'], ensure_ascii=False, indent=2)};\n\n"
        f"export const SHEET_PET_TIPS: string[] = {json.dumps(pet_food['tips'], ensure_ascii=False, indent=2)};\n\n"
        f"export const SHEET_PET_FOOD_CONVERSION: {{ food: number; boxes: number; cities: number }}[] = {ts_array(pet_guide['conversion'])};\n\n"
        f"export const SHEET_PET_DISH_NOTES: {{ title: string; lines: string[] }}[] = {ts_array(pet_guide['dishNotes'])};\n",
    )
    write(
        "potions.ts",
        'import type { Potion } from "../../types";\n\n'
        f"export const SHEET_POTIONS: Potion[] = {ts_array(potions)};\n",
    )
    write(
        "clothing.ts",
        'import type { ClothingLevel, ClothingRarity } from "../clothing";\n\n'
        f"export const SHEET_CLOTHING_XP: Record<ClothingRarity, ClothingLevel[]> = {json.dumps(clothing, ensure_ascii=False)};\n",
    )
    n_icons = write_icons(wb)

    print(
        f"items {len(items)} · blueprints {len(blueprints)} · builds {len(builds)} · club levels {len(club['levels'])}"
        f" · potions {len(potions)} · clothing rarities {len(clothing)} · icons {n_icons}"
    )
    for w in WARNINGS:
        print("WARN", w)


if __name__ == "__main__":
    main()
