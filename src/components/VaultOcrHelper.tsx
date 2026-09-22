import { useState } from "react";
import { VAULT_ITEMS } from "../data/vault";
import type { Account, ItemId } from "../types";
import { parseVaultLevelsFromText } from "../utils/ocrParse";
import { VaultIcon } from "./VaultIcons";

export function VaultOcrHelper({
  account,
  onApply,
}: {
  account: Account;
  onApply: (levels: Partial<Record<ItemId, number>>) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<Partial<Record<ItemId, number>>>({});
  const [msg, setMsg] = useState("");

  function onFile(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setMsg("Screenshot loaded — enter levels beside it, or paste OCR text below.");
  }

  function parseText() {
    const parsed = parseVaultLevelsFromText(text);
    setDraft(parsed);
    const n = Object.keys(parsed).length;
    setMsg(n ? `Parsed ${n} vault levels from text.` : "No vault names found in text.");
  }

  function apply() {
    if (Object.keys(draft).length === 0) {
      setMsg("Nothing to apply yet.");
      return;
    }
    onApply(draft);
    setMsg("Levels applied to your vault.");
  }

  return (
    <section className="panel rounded-2xl p-5">
      <h3 className="font-display text-xl font-bold">Vault screenshot helper</h3>
      <p className="mt-1 text-sm text-[#9bb5af]">
        Paste or drop a vault screenshot, then fill levels quickly. Optional: paste
        OCR / notes text to auto-detect names + numbers.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="btn-secondary cursor-pointer">
          Choose image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button
          type="button"
          className="btn-ghost text-xs"
          onPaste={(e) => {
            const item = [...e.clipboardData.items].find((i) =>
              i.type.startsWith("image/"),
            );
            if (item) onFile(item.getAsFile());
          }}
          onClick={() =>
            setMsg("Click here and press Ctrl+V to paste a screenshot.")
          }
        >
          Paste zone
        </button>
      </div>
      <div
        className="mt-3 grid gap-4 lg:grid-cols-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <div className="min-h-40 rounded-xl border border-dashed border-white/20 bg-black/20 p-2">
          {preview ? (
            <img
              src={preview}
              alt="Vault screenshot"
              className="max-h-80 w-full object-contain"
            />
          ) : (
            <p className="p-6 text-center text-sm text-[#9bb5af]">
              Drop screenshot here
            </p>
          )}
        </div>
        <div className="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
          {VAULT_ITEMS.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2 rounded-lg bg-black/20 px-2 py-1.5 text-sm"
            >
              <VaultIcon id={item.id} className="h-7 w-7" />
              <span className="min-w-0 flex-1 truncate">{item.shortName}</span>
              <input
                type="number"
                min={0}
                max={item.maxLevel}
                className="field w-14 py-1 text-center"
                value={draft[item.id] ?? account.levels[item.id] ?? 0}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    [item.id]: Math.max(
                      0,
                      Math.min(item.maxLevel, Number(e.target.value) || 0),
                    ),
                  }))
                }
              />
            </label>
          ))}
        </div>
      </div>
      <textarea
        className="field mt-3 min-h-24 w-full"
        placeholder="Paste OCR text e.g. Remote 12 / Mop 8"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={parseText}>
          Parse text
        </button>
        <button type="button" className="btn-primary" onClick={apply}>
          Apply levels
        </button>
      </div>
      {msg && <p className="mt-2 text-xs text-[#9bb5af]">{msg}</p>}
    </section>
  );
}
