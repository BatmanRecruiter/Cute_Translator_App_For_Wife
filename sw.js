/* Crystyl service worker — app shell cache only.
 * Translation API responses are NOT cached (we never persist user text).
 */
const VERSION = 'crystyl-v1';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './quotes.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Never cache the translation API — keeps user text out of any storage.
  if (url.hostname.includes('mymemory.translated.net')) {
    event.respondWith(fetch(req));
    return;
  }

  // App-shell: cache-first for same-origin GET
  if (req.method === 'GET' && url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          // Only cache successful basic responses
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => cached);
      })
    );
  }
});
