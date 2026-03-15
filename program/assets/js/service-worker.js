const STATIC_CACHE = 'budget-tracker-static-v8';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/program/pages/dashboard.html',
  '/program/pages/splitRatio.html',
  '/program/pages/account.html',
  '/program/pages/faq.html',
  '/program/pages/terms.html',
  '/program/pages/visuals.html',
  '/program/pages/login.html',
  '/program/styles.css',
  '/program/assets/js/auth.js',
  '/program/assets/js/dashboard.js',
  '/program/assets/js/account.js',
  '/program/assets/js/visuals.js',
  '/program/assets/js/split-ratio.js',
  '/program/assets/js/theme.js',
  '/program/assets/js/presets.js',
  '/program/assets/js/cache-registration.js',
  '/program/assets/js/firebase-config.js',
  '/program/assets/js/service-worker.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  const isStaticRequest = ['document', 'script', 'style'].includes(request.destination);

  if (!isStaticRequest) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone));
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});