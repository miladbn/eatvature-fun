import { EVENTS, HANDBOOK_META, MILESTONES } from "../data/meta";
import type { Account } from "../types";
import { evaluateMilestones } from "../utils/features";
import {
  createProfile,
  deleteProfile,
  getActiveProfileId,
  getTheme,
  listProfiles,
  loadProfile,
  setActiveProfileId,
  setTheme,
  type ThemeMode,
} from "../utils/profiles";
import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import {
  formatCountdown,
  getEventRotation,
} from "../utils/eventSchedule";
import { CloudSyncPanel } from "./CloudSyncPanel";
import { useI18n } from "../utils/i18n";

export function EventsView() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const rot = getEventRotation(now);

  return (
    <div className="space-y-5">
      <section className="ticket rounded-2xl p-5">
        <h2 className="font-display text-3xl font-bold text-[#14201c]">
          Events
        </h2>
        <p className="mt-1 text-sm text-[#5c6f69]">
          What to farm and which boxes drop key gear.
        </p>
      </section>

      <section className="panel rounded-2xl p-5">
        <p className="text-xs text-[#9bb5af]">Estimated focus this week</p>
        <h3 className="mt-1 font-display text-2xl font-bold text-[#f0b429]">
          {rot.current.name}
        </h3>
        <p className="text-sm text-[#c5d5d0]">{rot.current.box}</p>
        <p className="mt-2 text-sm">{rot.farmTip}</p>
        <p className="mt-2 text-xs text-[#9bb5af]">
          ~{formatCountdown(rot.msLeft)} left · next: {rot.next.name}
        </p>
        <p className="mt-1 text-[10px] text-[#9bb5af]">
          Rotation is an estimate — live schedules vary.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {EVENTS.map((ev) => (
          <article
            key={ev.id}
            className={cn(
              "panel rounded-2xl p-4",
              ev.id === rot.current.id && "ring-1 ring-[#f0b429]",
            )}
          >
            <h3 className="font-display text-xl font-bold">{ev.name}</h3>
            <p className="text-xs text-[#f0b429]">{ev.box}</p>
            <ul className="mt-2 space-y-1 text-sm text-[#c5d5d0]">
              {ev.highlights.map((h) => (
                <li key={h}>· {h}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-[#9bb5af]">{ev.tip}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function MoreView({
  account,
  setNotes,
  onSwitchProfile,
  onImportCloud,
}: {
  account: Account;
  setNotes: (notes: string) => void;
  onSwitchProfile: (account: Account) => void;
  onImportCloud?: (account: Account) => void;
}) {
  const { t, lang, setLang } = useI18n();
  const [theme, setThemeState] = useState<ThemeMode>(getTheme());
  const [profiles, setProfiles] = useState(() => listProfiles());
  const [newName, setNewName] = useState("");
  const milestones = evaluateMilestones(account);
  const doneCount = Object.values(milestones).filter(Boolean).length;

  function toggleTheme() {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }

  function refreshProfiles() {
    setProfiles(listProfiles());
  }

  function addProfile() {
    const id = createProfile(newName.trim() || "New chef");
    setActiveProfileId(id);
    onSwitchProfile(loadProfile(id));
    setNewName("");
    refreshProfiles();
  }

  function switchTo(id: string) {
    setActiveProfileId(id);
    onSwitchProfile(loadProfile(id));
    refreshProfiles();
  }

  return (
    <div className="space-y-6">
      <section className="ticket rounded-2xl p-5">
        <h2 className="font-display text-3xl font-bold text-[#14201c]">{t("more")}</h2>
        <p className="mt-1 text-sm text-[#5c6f69]">
          Theme, language, profiles, milestones, notes, and handbook links.
        </p>
      </section>

      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">{t("language")}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={cn("btn-secondary", lang === "en" && "ring-1 ring-[#f0b429]")}
            onClick={() => setLang("en")}
          >
            English
          </button>
          <button
            type="button"
            className={cn("btn-secondary", lang === "fa" && "ring-1 ring-[#f0b429]")}
            onClick={() => setLang("fa")}
          >
            فارسی
          </button>
        </div>
      </section>

      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">Appearance</h3>
        <button type="button" className="btn-secondary mt-3" onClick={toggleTheme}>
          Switch to {theme === "dark" ? "light" : "dark"} theme
        </button>
        <p className="mt-2 text-xs text-[#9bb5af]">
          Install tip: on mobile browsers use Add to Home Screen for a PWA-like
          shortcut. This build is a single-file app.
        </p>
      </section>

      {onImportCloud && (
        <CloudSyncPanel account={account} onImport={onImportCloud} />
      )}

      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">Profiles</h3>
        <p className="mt-1 text-sm text-[#9bb5af]">
          Active: {getActiveProfileId()}
        </p>
        <div className="mt-3 space-y-2">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            >
              <button type="button" onClick={() => switchTo(p.id)}>
                {p.name}{" "}
                <span className="text-[#9bb5af]">({p.id})</span>
              </button>
              {p.id !== "main" && (
                <button
                  type="button"
                  className="text-xs text-rose-300"
                  onClick={() => {
                    deleteProfile(p.id);
                    refreshProfiles();
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New profile name"
            className="field max-w-xs"
          />
          <button type="button" className="btn-primary" onClick={addProfile}>
            Add profile
          </button>
        </div>
      </section>

      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">
          Milestones ({doneCount}/{MILESTONES.length})
        </h3>
        <div className="mt-3 space-y-2">
          {MILESTONES.map((m) => (
            <div
              key={m.id}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm",
                milestones[m.id]
                  ? "border-[#3ecfb3]/35 bg-[#3ecfb3]/10"
                  : "border-white/10 bg-black/20 text-[#9bb5af]",
              )}
            >
              {milestones[m.id] ? "✓" : "○"} {m.label}
            </div>
          ))}
        </div>
      </section>

      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">Notes</h3>
        <textarea
          value={account.notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Personal tips per city, vault goals, club reminders…"
          className="field mt-3 min-h-[120px]"
        />
      </section>

      <section className="panel rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold">Handbook & links</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[#9bb5af]">Game patch</dt>
            <dd>{HANDBOOK_META.gamePatch}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#9bb5af]">Handbook</dt>
            <dd>{HANDBOOK_META.handbookVersion}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#9bb5af]">Updated</dt>
            <dd>{HANDBOOK_META.lastUpdate}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#9bb5af]">Author</dt>
            <dd>{HANDBOOK_META.author}</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            className="btn-secondary text-sm"
            href={HANDBOOK_META.sheetUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open Spectre sheet
          </a>
          <a
            className="btn-ghost text-sm"
            href={HANDBOOK_META.discordUrl}
            target="_blank"
            rel="noreferrer"
          >
            Discord
          </a>
          <a
            className="btn-ghost text-sm"
            href={HANDBOOK_META.redditUrl}
            target="_blank"
            rel="noreferrer"
          >
            Reddit
          </a>
          <a
            className="btn-ghost text-sm"
            href={HANDBOOK_META.githubUrl}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
        <p className="mt-3 text-xs text-[#9bb5af]">
          {HANDBOOK_META.calculatorNote}
        </p>
      </section>
    </div>
  );
}
