import { useEffect, useMemo, useState } from "react";
import { cn } from "../utils/cn";
import { useI18n } from "../utils/i18n";

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
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/60 p-4 pt-[12vh]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="panel w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
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
          {filtered.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-white/10"
                onClick={() => {
                  onSelect(tab.id);
                  onClose();
                }}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] text-[#9bb5af]">{tab.group}</span>
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
    <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {groups.map(({ group, items }) => {
        const collapsed = collapsedGroups.has(group);
        const hasActive = items.some((i) => i.id === active);
        return (
          <div key={group} className="contents lg:block">
            <button
              type="button"
              onClick={() => toggleGroup(group)}
              className="mb-1 mt-3 hidden w-full items-center justify-between px-2 text-[10px] text-[#9bb5af] first:mt-0 lg:flex"
            >
              <span>{groupLabel(group)}</span>
              <span>{collapsed && !hasActive ? "+" : "−"}</span>
            </button>
            {(!collapsed || hasActive) &&
              items.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelect(tab.id)}
                  className={cn(
                    "nav-item shrink-0 whitespace-nowrap",
                    active === tab.id && "active",
                  )}
                >
                  {tab.label}
                </button>
              ))}
          </div>
        );
      })}
    </div>
  );
}
