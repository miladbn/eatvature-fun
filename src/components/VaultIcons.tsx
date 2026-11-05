import type { ItemId } from "../types";
import { vaultIconUrl } from "./ItemIcon";

/** Real in-game vault item art, extracted from the Spectre handbook. */
export function VaultIcon({ id, className = "" }: { id: ItemId; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <img
        src={vaultIconUrl(id)}
        alt=""
        aria-hidden
        draggable={false}
        decoding="async"
        className="h-full w-full object-contain"
      />
    </span>
  );
}
