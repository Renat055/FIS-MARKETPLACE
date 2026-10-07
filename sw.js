/* ==========================================================================
   EPN FIS — sw.js
   Service worker: cachea el "app shell" (páginas, CSS, JS, imágenes) para
   que el sitio sea instalable y funcione sin conexión después de la
   primera visita. Estrategia: cache-first con actualización en segundo
   plano y respaldo a la red.
   ========================================================================== */

const CACHE_VERSION = 'epnfis-v1';

const APP_SHELL = [
  './',
  'index.html',
  'productos.html',
  'producto.html',
  'categorias.html',
  'vender.html',
  'login.html',
  'registro.html',
  'carrito.html',
  'biblioteca.html',
  'dashboard.html',
  'factura.html',
  'comparar.html',
  'css/styles.css',
  'js/main.js',
  'js/productos.js',
  'js/carrito.js',
  'js/usuario.js',
  'js/dashboard.js',
  'js/asistente.js',
  'js/buscador.js',
  'js/comparar.js',
  'js/factura.js',
  'manifest.json',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/images/robot-asistente.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Solo interceptamos peticiones GET del mismo origen; lo demás (fuentes
  // de Google, etc.) pasa directo a la red sin pasar por el cache.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
