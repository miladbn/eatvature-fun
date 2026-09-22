import type { Account } from "../types";
import { exportAccountJson, importAccountJson } from "./profiles";

const BLOB_KEY = "eatventure-cloud-blob-id";
const JSONBLOB = "https://jsonblob.com/api/jsonBlob";

export function getSavedBlobId(): string {
  try {
    return localStorage.getItem(BLOB_KEY) || "";
  } catch {
    return "";
  }
}

export function setSavedBlobId(id: string) {
  try {
    if (id) localStorage.setItem(BLOB_KEY, id);
    else localStorage.removeItem(BLOB_KEY);
  } catch {
    /* ignore */
  }
}

function extractId(location: string | null): string {
  if (!location) return "";
  const parts = location.split("/");
  return parts[parts.length - 1] || "";
}

/** Push account to jsonblob.com (no API key). Returns blob id. */
export async function cloudPush(account: Account, existingId?: string): Promise<string> {
  const body = exportAccountJson(account);
  const id = existingId || getSavedBlobId();
  if (id) {
    const res = await fetch(`${JSONBLOB}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body,
    });
    if (!res.ok) throw new Error(`Cloud update failed (${res.status})`);
    setSavedBlobId(id);
    return id;
  }
  const res = await fetch(JSONBLOB, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body,
  });
  if (!res.ok) throw new Error(`Cloud create failed (${res.status})`);
  const newId = extractId(res.headers.get("Location"));
  if (!newId) throw new Error("No cloud id returned");
  setSavedBlobId(newId);
  return newId;
}

/** Pull account from jsonblob.com by id. */
export async function cloudPull(id: string): Promise<Account> {
  const clean = id.trim();
  if (!clean) throw new Error("Enter a sync id");
  const res = await fetch(`${JSONBLOB}/${clean}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Cloud load failed (${res.status})`);
  const text = await res.text();
  const account = importAccountJson(text);
  if (!account) throw new Error("Invalid cloud payload");
  setSavedBlobId(clean);
  return account;
}
