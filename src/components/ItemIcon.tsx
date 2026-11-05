import { useState } from "react";
import type { ArcaneVaultId, GearItem, PetRarity } from "../types";

/** Icons extracted from the Spectre Eatventure Handbook sheet (public/images). */
const BASE = "/images";

/** camelCase id used for icon file names by scripts/sync_sheet.py. */
export function iconKey(name: string) {
  const words = name.split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (!words.length) return "";
  return (
    words[0].toLowerCase() +
    words
      .slice(1)
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join("")
  );
}

export const catalogIconUrl = (catalogId: string) =>
  `${BASE}/items/${catalogId}.png`;
export const itemIconUrl = (id: string | null | undefined) =>
  id ? catalogIconUrl(id) : undefined;
export const gearIconUrl = (g: Pick<GearItem, "id">) => catalogIconUrl(g.id);
export const vaultIconUrl = (id: string) => `${BASE}/vault/${id}.png`;
export const arcaneIconUrl = (id: ArcaneVaultId) => `${BASE}/arcane/${id}.png`;
export const petIconUrl = (petId: string) => `${BASE}/pets/${petId}.png`;
export const eggIconUrl = (rarity: PetRarity) => `${BASE}/eggs/${rarity}.png`;
export const potionIconUrl = (potionId: string) => `${BASE}/potions/${potionId}.png`;
export const ingredientIconUrl = (name: string) =>
  `${BASE}/ingredients/${iconKey(name)}.png`;

export function ItemIcon({
  src,
  alt = "",
  className = "",
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  // Remember which src failed so a changed src (e.g. new selection) retries.
  const [failedSrc, setFailedSrc] = useState<string>();
  if (!src || failedSrc === src) return null;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailedSrc(src)}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
