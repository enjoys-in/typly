// Typly PWA service worker (web only; not used over file:// in Electron).
// Caches the app shell + content-hashed build assets for offline/installable use,
// plus the heavy language assets (Harper's WASM model, spell dictionaries).
const SHELL = 'typly-shell-v1';
const ASSETS = 'typly-assets-v1';
const SHELL_URLS = ['./', './index.html', './manifest.webmanifest', './favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      await cache.addAll(SHELL_URLS).catch(() => undefined);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL, ASSETS]);
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k.startsWith('typly-') && !keep.has(k)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

const isLangAsset = (url) =>
  url.pathname.includes('/dictionaries/') ||
  url.pathname.includes('/tesseract/') ||
  url.pathname.endsWith('.wasm');
const isBuildAsset = (url) =>
  url.pathname.includes('/assets/') || /\.(js|css|woff2?|png|svg|json)$/.test(url.pathname);

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // App navigations: network-first (fresh deploys), fall back to the cached shell offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          const cache = await caches.open(SHELL);
          return (await cache.match('./index.html')) ?? (await cache.match('./')) ?? Response.error();
        }
      })(),
    );
    return;
  }

  if (isLangAsset(url)) {
    event.respondWith(cacheFirst(req, ASSETS)); // large + immutable
    return;
  }
  if (isBuildAsset(url)) {
    event.respondWith(cacheFirst(req, SHELL)); // content-hashed → safe to keep
  }
  // Everything else: default network handling.
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.ok) cache.put(req, res.clone());
  return res;
}
