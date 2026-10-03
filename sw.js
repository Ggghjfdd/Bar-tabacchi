const CACHE_NAME = 'bar-tabacchi-v9-20251003';
const APP_SHELL = [
  './', './index.html', './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL).catch(()=>{}))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // Prende sempre da internet, se non c'è internet usa la cache
  event.respondWith(
    fetch(event.request, {cache: 'no-store'})
      .then(r => r)
      .catch(() => caches.match(event.request).then(c => c || caches.match('./index.html')))
  );
});
