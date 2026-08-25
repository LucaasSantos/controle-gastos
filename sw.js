const CACHE_NAME = 'trackm7-cache-dinamico';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Instala o Service Worker e já força ele a assumir o controle
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); 
});

// Limpa qualquer cache velho que tenha sobrado
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ESTRATÉGIA: Network First (Rede Primeiro)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Se a internet pegou e achou o arquivo, ele salva uma cópia nova no cache (Automático!)
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Se estiver offline ou der erro de rede, ele puxa o que salvou no cache
        return caches.match(event.request);
      })
  );
});
