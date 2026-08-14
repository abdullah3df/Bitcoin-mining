// Basic Offline & Cache Worker for PWA
const CACHE_NAME = 'nerdminer-v2-cache';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network handle dynamic stratum and btc api requests
  if (event.request.url.includes('/api') || event.request.url.includes('mempool.space') || event.request.url.includes('coingecko') || event.request.url.includes('publicpool')) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
