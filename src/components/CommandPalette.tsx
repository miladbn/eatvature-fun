import { useEffect, useMemo, useState } from "react";
import { cn } from "../utils/cn";
import { useI18n } from "../utils/i18n";
import { NavIcon } from "./NavIcons";

export type PaletteTab = {
  id: string;
  label: string;
  group: string;
};

export function CommandPalette({
  tabs,
  open,
  onClose,
  onSelect,
}: {
  tabs: PaletteTab[];
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const { t } = useI18n();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return tabs;
    return tabs.filter(
      (tab) =>
        tab.label.toLowerCase().includes(needle) ||
        tab.group.toLowerCase().includes(needle) ||
        tab.id.includes(needle),
    );
  }, [q, tabs]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="panel pop w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter" && filtered[0]) {
              onSelect(filtered[0].id);
              onClose();
            }
          }}
          placeholder={`${t("search")} (Ctrl+K)`}
          className="field w-full rounded-none border-0 border-b border-white/10 bg-transparent px-4 py-3"
        />
        <ul className="max-h-72 overflow-y-auto p-2">
          {filtered.map((tab, i) => (
            <li key={tab.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-white/10",
                  i === 0 && q.trim() && "bg-white/[0.06]",
                )}
                onClick={() => {
                  onSelect(tab.id);
                  onClose();
                }}
              >
                <NavIcon id={tab.id} className="h-4 w-4 text-[#9bb5af]" />
                <span className="flex-1">{tab.label}</span>
                <span className="text-xs text-[#9bb5af]">
                  {tab.group}
                </span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-3 py-4 text-sm text-[#9bb5af]">No matches</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export function useCommandPaletteHotkey(setOpen: (v: boolean) => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}

export function GroupedNav({
  tabs,
  active,
  onSelect,
  collapsedGroups,
  toggleGroup,
}: {
  tabs: PaletteTab[];
  active: string;
  onSelect: (id: string) => void;
  collapsedGroups: Set<string>;
  toggleGroup: (group: string) => void;
}) {
  const { t } = useI18n();
  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, PaletteTab[]>();
    for (const tab of tabs) {
      if (!map.has(tab.group)) {
        map.set(tab.group, []);
        order.push(tab.group);
      }
      map.get(tab.group)!.push(tab);
    }
    return order.map((g) => ({ group: g, items: map.get(g)! }));
  }, [tabs]);

  const groupLabel = (g: string) => {
    const key = g.toLowerCase() as "play" | "loadout" | "reference" | "system";
    if (key === "play") return t("play");
    if (key === "loadout") return t("loadout");
    if (key === "reference") return t("reference");
    if (key === "system") return t("system");
    return g;
  };

  return (
    <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
      {groups.map(({ group, items }) => {
        const collapsed = collapsedGroups.has(group);
        const hasActive = items.some((i) => i.id === active);
        const open = !collapsed || hasActive;
        return (
          <div key={group} className="contents lg:block">
            <button
              type="button"
              onClick={() => toggleGroup(group)}
              aria-expanded={open}
              className="nav-group mt-4 hidden w-full items-center justify-between first:mt-0 lg:flex"
            >
              <span>{groupLabel(group)}</span>
              <NavIcon
                id="chevron"
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  !open && "-rotate-90",
                )}
              />
            </button>
            {items.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelect(tab.id)}
                  aria-current={active === tab.id ? "page" : undefined}
                  className={cn(
                    "nav-item shrink-0 whitespace-nowrap",
                    active === tab.id && "active",
                    !open && "lg:hidden",
                  )}
                >
                  <NavIcon id={tab.id} />
                  <span>{tab.label}</span>
                </button>
              ))}
          </div>
        );
      })}
    </div>
  );
}
