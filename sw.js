const CACHE_NAME = 'bar-tabacchi-v9-pistola-only-20251003';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL).catch(()=>{}))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  // Per il tuo index.html e sw.js, prendi SEMPRE da rete
  if (event.request.url.includes('index.html') || event.request.url.includes('sw.js') || event.request.url.includes('?v=')) {
    event.respondWith(
      fetch(event.request, {cache: 'no-store'})
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return r;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Per tutto il resto, prova rete prima, poi cache
  event.respondWith(
    fetch(event.request, {cache: 'no-store'})
      .then(r => r)
      .catch(() => caches.match(event.request).then(c => c || caches.match('./index.html')))
  );
});
