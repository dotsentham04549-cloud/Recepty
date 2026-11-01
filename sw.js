const CACHE = 'recepty-v8';
const ASSETS = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => (key !== CACHE && /^(recepty-|mangal-calc-)/.test(key)) ? caches.delete(key) : null)  /* только свои кэши: на этом адресе живут и другие приложения */)));
  self.clients.claim();
});
// Страница — сначала из сети (чтобы обновления приходили сами), без сети — из кэша.
// Иконки и манифест — из кэша.
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  if(req.mode === 'navigate'){
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
});
