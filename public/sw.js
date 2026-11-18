/*
 * Service Worker – macht die App nach dem ersten Laden offline-fähig.
 *
 * Die beiden Platzhalter unten werden beim `npm run build` automatisch durch
 * eine Build-ID und die Liste aller gebauten Dateien ersetzt
 * (siehe Plugin "service-worker-precache" in vite.config.js).
 * Im Dev-Server wird dieser Service Worker bewusst nicht registriert.
 */
const BUILD_ID = '__BUILD_ID__';
const PRECACHE_URLS = /*__PRECACHE_URLS__*/ ['./'];

const CACHE_PREFIX = 'lucas-adventure-';
const CACHE_NAME = CACHE_PREFIX + BUILD_ID;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  // Absichtlich kein skipWaiting(): Eine neue Version übernimmt erst, wenn die
  // App komplett geschlossen war. So passen geladene Seite und Cache immer zusammen.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Seitenaufrufe: erst Netzwerk (frische Version), sonst Cache (offline).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches
          .match(request, { ignoreSearch: true })
          .then((hit) => hit || caches.match('./index.html'))
          .then((hit) => hit || caches.match('./')),
      ),
    );
    return;
  }

  // Alles andere (JS, CSS, Icons …): erst Cache, dann Netzwerk + nachladen.
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
