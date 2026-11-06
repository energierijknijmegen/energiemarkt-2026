/* Zorgt dat het formulier ook opent zonder internet.
   Pas je iets aan in index.html? Verhoog dan het versienummer hieronder. */
const VERSIE = 'energiemarkt-v2';
const BESTANDEN = [
  './', './index.html', './manifest.webmanifest', './fonts/asap.woff',
  './icons/logo.svg', './icons/logo-wit.svg', './icons/flowline.svg',
  './icons/beeldmerk-wit.svg', './icons/beeldmerk-wit-transparant.svg',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSIE).then(c => c.addAll(BESTANDEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSIE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Eerst uit de cache (snel en offline), op de achtergrond bijwerken als er wel internet is.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(VERSIE).then(async cache => {
    const opgeslagen = await cache.match(req, { ignoreSearch: true });
    const vers = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    return opgeslagen || (await vers) || cache.match('./index.html');
  }));
});
