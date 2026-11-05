import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Registers the service worker in production builds. */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("Service worker registration failed", err);
    });
  });
}

export function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIos() {
  const ua = navigator.userAgent;
  return (
    /iphone|ipad|ipod/i.test(ua) ||
    (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
  );
}

// The browser can fire beforeinstallprompt before React mounts, so capture it
// at module load and hand it to the hook later.
let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

/**
 * Install state for the header button. On Chromium browsers `canInstall`
 * becomes true once the browser offers installation; on iOS Safari (no
 * install prompt API) it is true when not already installed, and `install`
 * shows the "Add to Home Screen" hint instead.
 */
export function usePwaInstall() {
  const [, force] = useState(0);
  const [iosHint, setIosHint] = useState(false);
  const [installed, setInstalled] = useState(() => isStandalone());

  useEffect(() => {
    const l = () => {
      force((n) => n + 1);
      if (!deferred && !isIos()) setInstalled(isStandalone());
    };
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);

  const ios = isIos();
  const canInstall = !installed && (!!deferred || ios);

  const install = useCallback(async () => {
    if (deferred) {
      const ev = deferred;
      await ev.prompt();
      const { outcome } = await ev.userChoice;
      deferred = null;
      if (outcome === "accepted") setInstalled(true);
      force((n) => n + 1);
    } else if (isIos()) {
      setIosHint(true);
    }
  }, []);

  return { canInstall, install, iosHint, closeIosHint: () => setIosHint(false) };
}
