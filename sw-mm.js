const CACHE = 'moneymatic-v1';
const ASSETS = [
  './moneymatic.html',
  './manifest-mm.json',
  './icon-mm.png',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled(ASSETS.map(u => c.add(u).catch(() => {})))
    )
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isApi = ['generativelanguage.googleapis.com','api.groq.com','api.allorigins.win',
    'feeds.bbci.co.uk','techcrunch.com','feeds.weblogssl.com','entrepreneur.com',
    'artificialintelligence-news.com','socialmediatoday.com','searchenginejournal.com',
    'marketing4ecommerce.net'].some(d => url.hostname.includes(d));

  if (isApi) { e.respondWith(fetch(e.request)); return; }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => {
        if (e.request.destination === 'document') return caches.match('./moneymatic.html');
      });
    })
  );
});
