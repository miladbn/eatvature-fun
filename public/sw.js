/* Eatventure Handbook service worker — offline support + installability. */
const VERSION = "v1";
const SHELL = `eh-shell-${VERSION}`;
const RUNTIME = `eh-runtime-${VERSION}`;

// The production build inlines all JS/CSS into index.html, so caching the
// shell is enough for the whole app to run offline.
const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/favicon-32.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("eh-") && k !== SHELL && k !== RUNTIME)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Leave cross-origin requests (analytics, cloud sync) to the network.
  if (url.origin !== self.location.origin) return;
  // Vite dev server modules / HMR should never be cached.
  if (url.pathname.startsWith("/@") || url.pathname.startsWith("/src/") || url.pathname.startsWith("/node_modules/")) return;

  // Pages: network first so updates land immediately; fall back to cache offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(SHELL).then((c) => c.put("/", copy));
          }
          return res;
        })
        .catch(() => caches.match("/").then((r) => r || caches.match(req))),
    );
    return;
  }

  // Everything else (item icons, images, manifest): stale-while-revalidate.
  event.respondWith(
    caches.open(RUNTIME).then(async (cache) => {
      const cached = (await cache.match(req)) || (await caches.match(req));
      const network = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
