import type { Account } from "../types";
import { freshAccount, loadAccount, saveAccount } from "./storage";

const PROFILES_KEY = "eatventure-profiles-v1";
const ACTIVE_KEY = "eatventure-active-profile";
const THEME_KEY = "eatventure-theme";
const SHARE_PREFIX = "evh1.";

export type ThemeMode = "dark" | "light";

export interface ProfileMeta {
  id: string;
  name: string;
  updatedAt: number;
}

function readProfiles(): Record<string, Account> {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Account>;
  } catch {
    return {};
  }
}

function writeProfiles(map: Record<string, Account>) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function listProfiles(): ProfileMeta[] {
  const map = readProfiles();
  // Ensure current account is mirrored
  const current = loadAccount();
  const active = getActiveProfileId();
  if (current && active) {
    map[active] = current;
  }
  return Object.entries(map).map(([id, acc]) => ({
    id,
    name: acc.name || `Chef ${id.slice(0, 4)}`,
    updatedAt: Date.now(),
  }));
}

export function getActiveProfileId(): string {
  try {
    return localStorage.getItem(ACTIVE_KEY) || "main";
  } catch {
    return "main";
  }
}

export function setActiveProfileId(id: string) {
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function saveProfile(id: string, account: Account) {
  const map = readProfiles();
  map[id] = account;
  writeProfiles(map);
  if (id === getActiveProfileId()) saveAccount(account);
}

export function loadProfile(id: string): Account {
  const map = readProfiles();
  if (map[id]) return map[id];
  if (id === "main") {
    const existing = loadAccount();
    if (existing) return existing;
  }
  return freshAccount();
}

export function createProfile(name: string): string {
  const id = `p${Date.now().toString(36)}`;
  const account = { ...freshAccount(), name };
  saveProfile(id, account);
  return id;
}

export function deleteProfile(id: string) {
  if (id === "main") return;
  const map = readProfiles();
  delete map[id];
  writeProfiles(map);
  if (getActiveProfileId() === id) setActiveProfileId("main");
}

export function exportAccountJson(account: Account): string {
  return JSON.stringify(
    {
      version: 2,
      exportedAt: new Date().toISOString(),
      account,
    },
    null,
    2,
  );
}

export function importAccountJson(raw: string): Account | null {
  try {
    const parsed = JSON.parse(raw) as { account?: Account } & Partial<Account>;
    const acc = parsed.account ?? (parsed as Account);
    if (!acc || typeof acc !== "object") return null;
    return {
      ...freshAccount(),
      ...acc,
      inventory: acc.inventory && typeof acc.inventory === "object" ? acc.inventory : {},
      notes: typeof acc.notes === "string" ? acc.notes : "",
    };
  } catch {
    return null;
  }
}

export function encodeShareLink(account: Account): string {
  const payload = {
    n: account.name,
    c: account.city,
    g: account.gems,
    s: account.scrolls,
    p: account.playstyle,
    h: account.hasPanda ? 1 : 0,
    l: account.levels,
  };
  const json = JSON.stringify(payload);
  const b64 =
    typeof btoa === "function"
      ? btoa(unescape(encodeURIComponent(json)))
      : Buffer.from(json, "utf8").toString("base64");
  const url = new URL(window.location.href);
  url.searchParams.set("share", SHARE_PREFIX + b64);
  return url.toString();
}

export function decodeShareParam(param: string): Partial<Account> | null {
  try {
    if (!param.startsWith(SHARE_PREFIX)) return null;
    const b64 = param.slice(SHARE_PREFIX.length);
    const json = decodeURIComponent(escape(atob(b64)));
    const p = JSON.parse(json) as Record<string, unknown>;
    return {
      name: typeof p.n === "string" ? p.n : "",
      city: Number(p.c) || 1,
      gems: Number(p.g) || 0,
      scrolls: Number(p.s) || 0,
      playstyle: (p.p as Account["playstyle"]) || "spectre",
      hasPanda: Boolean(p.h),
      levels: (p.l as Account["levels"]) || undefined,
    };
  } catch {
    return null;
  }
}

export function getTheme(): ThemeMode {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function setTheme(mode: ThemeMode) {
  try {
    localStorage.setItem(THEME_KEY, mode);
    document.documentElement.dataset.theme = mode;
  } catch {
    document.documentElement.dataset.theme = mode;
  }
}

/** Offline "cloud sync" code — pasteable snapshot, no server. */
export function makeSyncCode(account: Account): string {
  return SHARE_PREFIX + btoa(unescape(encodeURIComponent(exportAccountJson(account))));
}

export function applySyncCode(code: string): Account | null {
  try {
    if (!code.startsWith(SHARE_PREFIX)) return importAccountJson(code);
    const json = decodeURIComponent(escape(atob(code.slice(SHARE_PREFIX.length))));
    return importAccountJson(json);
  } catch {
    return null;
  }
}
