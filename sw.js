const CACHE = 'recepty-v16';
const ASSETS = ['./', './index.html', './recipes.js', './manifest.json', './icons/icon-192.png', './icons/icon-512.png',
  './fonts/lora-cyrillic-400-italic.woff2',
  './fonts/lora-cyrillic-400-normal.woff2',
  './fonts/lora-cyrillic-600-normal.woff2',
  './fonts/lora-cyrillic-700-normal.woff2',
  './fonts/lora-latin-400-italic.woff2',
  './fonts/lora-latin-400-normal.woff2',
  './fonts/lora-latin-600-normal.woff2',
  './fonts/lora-latin-700-normal.woff2',
  './fonts/pt-sans-cyrillic-400-normal.woff2',
  './fonts/pt-sans-cyrillic-700-normal.woff2',
  './fonts/pt-sans-latin-400-normal.woff2',
  './fonts/pt-sans-latin-700-normal.woff2'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  /* только свои кэши: на этом адресе живут и другие приложения */
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key =>
    (key !== CACHE && /^(recepty-|mangal-calc-)/.test(key)) ? caches.delete(key) : null))));
  self.clients.claim();
});
/* Сначала сеть — новые рецепты приходят сразу; без сети — сохранённая копия. */
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  if(new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req).then(res => {
      if(res && res.ok){
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? './index.html' : req, copy));
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch:true })
      .then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
