import { useState } from "react";
import { CATALOG_ITEMS } from "../data/catalog";
import type { ArcaneVaultId, GearItem } from "../types";

/** Icons extracted from the Spectre Eatventure Handbook sheet (public/images). */
const BASE = "/images";

export const catalogIconUrl = (catalogId: string) =>
  `${BASE}/items/${catalogId}.png`;
export const vaultIconUrl = (id: string) => `${BASE}/vault/${id}.png`;
export const arcaneIconUrl = (id: ArcaneVaultId) => `${BASE}/arcane/${id}.png`;

const CATALOG_BY_KEY = new Map(
  CATALOG_ITEMS.map((c) => [`${c.slot}:${c.name.toLowerCase()}`, c.id]),
);

/** Resolve a gear item (slot head/body/hand) to its catalog icon. */
export function gearIconUrl(g: Pick<GearItem, "name" | "slot">) {
  const slot = g.slot === "hand" ? "tool" : g.slot;
  const name = g.name.toLowerCase();
  const id =
    CATALOG_BY_KEY.get(`${slot}:${name}`) ??
    CATALOG_BY_KEY.get(`${slot}:${name.replace(/ (head|body)$/, "")}`);
  return id ? catalogIconUrl(id) : undefined;
}

export function ItemIcon({
  src,
  alt = "",
  className = "",
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
