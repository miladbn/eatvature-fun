import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "fa";

const LANG_KEY = "eatventure-lang";

const STRINGS = {
  en: {
    sections: "Sections",
    overview: "Overview",
    vault: "Vault",
    plan: "Plan",
    totals: "Totals",
    cities: "Cities",
    gear: "Gear",
    pets: "Pets",
    builds: "Builds",
    forge: "Forge",
    blueprints: "Blueprints",
    catalog: "Catalog",
    matrix: "Matrix",
    club: "Club",
    arcane: "Arcane",
    events: "Events",
    guide: "Guide",
    tools: "Tools",
    more: "More",
    play: "Play",
    loadout: "Loadout",
    reference: "Reference",
    system: "System",
    search: "Search sections…",
    language: "Language",
    dailyChecklist: "Daily checklist",
    progressGrade: "City progress",
    gemBudget: "Gem budget vs plan",
    history: "Progress history",
    eventNow: "Estimated event",
    gearMatch: "Build match",
    cloudSync: "Cloud sync",
    resetTitle: "Reset all saved data?",
    resetBody:
      "This wipes vault levels, gear, pets, notes, inventory, and local progress history for this profile.",
    cancel: "Cancel",
    confirmWipe: "Yes, wipe everything",
    emptyVault: "Vault is empty — unlock Tip Jar to start the plan.",
    emptyPets: "No pets yet — add Panda when you hatch it.",
    emptyGear: "No gear equipped — open Builds for your city set.",
    emptyForge: "Inventory empty — log blueprint pieces as you craft.",
    onboardingCheck: "Quick check",
    ahead: "Ahead of pace",
    onTrack: "On track",
    behind: "A bit behind",
    farBehind: "Behind for your city",
    fresh: "Just starting",
  },
  fa: {
    sections: "بخش‌ها",
    overview: "نمای کلی",
    vault: "گاوصندوق",
    plan: "برنامه",
    totals: "جمع‌ها",
    cities: "شهرها",
    gear: "تجهیزات",
    pets: "حیوانات",
    builds: "بیلدها",
    forge: "فورج",
    blueprints: "نقشه‌ها",
    catalog: "کاتالوگ",
    matrix: "ماتریکس",
    club: "کلاب",
    arcane: "آرکین",
    events: "ایونت‌ها",
    guide: "راهنما",
    tools: "ابزارها",
    more: "بیشتر",
    play: "بازی",
    loadout: "لودآوت",
    reference: "مرجع",
    system: "سیستم",
    search: "جستجوی بخش…",
    language: "زبان",
    dailyChecklist: "چک‌لیست روزانه",
    progressGrade: "پیشرفت بر اساس شهر",
    gemBudget: "بودجه جم در برابر برنامه",
    history: "تاریخچه پیشرفت",
    eventNow: "ایونت تقریبی",
    gearMatch: "تطابق بیلد",
    cloudSync: "همگام‌سازی ابری",
    resetTitle: "پاک کردن همه داده‌ها؟",
    resetBody:
      "سطوح گاوصندوق، تجهیزات، حیوانات، یادداشت‌ها، اینونتوری و تاریخچه این پروفایل پاک می‌شود.",
    cancel: "لغو",
    confirmWipe: "بله، همه را پاک کن",
    emptyVault: "گاوصندوق خالی است — Tip Jar را باز کنید.",
    emptyPets: "هنوز حیوانی ندارید — پاندای افسانه‌ای را اضافه کنید.",
    emptyGear: "تجهیزاتی ست نشده — بیلد شهر خود را ببینید.",
    emptyForge: "اینونتوری خالی است — قطعات نقشه را ثبت کنید.",
    onboardingCheck: "بررسی سریع",
    ahead: "جلوتر از برنامه",
    onTrack: "در مسیر درست",
    behind: "کمی عقب",
    farBehind: "عقب نسبت به شهر",
    fresh: "تازه‌کار",
  },
} as const;

export type StringKey = keyof typeof STRINGS.en;

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey) => string;
  dir: "ltr" | "rtl";
};

const Ctx = createContext<I18nCtx | null>(null);

export function getStoredLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === "fa" ? "fa" : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getStoredLang);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);

  const value = useMemo<I18nCtx>(
    () => ({
      lang,
      setLang,
      t: (key) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key,
      dir: lang === "fa" ? "rtl" : "ltr",
    }),
    [lang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n outside provider");
  return ctx;
}

export function gradeLabelKey(
  grade: string,
): StringKey {
  if (grade === "ahead") return "ahead";
  if (grade === "onTrack") return "onTrack";
  if (grade === "behind") return "behind";
  if (grade === "farBehind") return "farBehind";
  return "fresh";
}
