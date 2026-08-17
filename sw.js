// Service Worker do Atender.adv — cache dos assets estáticos + fallback offline.
// Ao mudar qualquer arquivo estático, suba a versão do CACHE_NAME para invalidar o cache antigo.
const CACHE_NAME = 'atender-adv-v2';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js',
  '/manifest.webmanifest',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Nunca interceptar métodos que não sejam GET (ex.: POST em /api/contact)
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Não cachear chamadas de API nem origens externas (fontes, plataformas externas)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  // Navegação (abrir a página): network-first, cai pro cache e depois pro offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/offline.html')))
    );
    return;
  }

  // Demais assets estáticos: cache-first, atualiza o cache em segundo plano
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
