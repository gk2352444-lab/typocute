/**
 * sw.js - Service Worker for Offline TypoCute with Auto-Update
 */
const CACHE_NAME = "typocute-cache-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./vocab_categories.js",
  "./words_10k.js",
  "./lessons.js",
  "./ai.js",
  "./app_icon.png",
  "./manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

// Stale-While-Revalidate: Return cached response immediately for instant offline speed,
// but fetch latest from network in background to update cache for next time!
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  // Never cache version.json in Service Worker - always fetch latest from network
  if (e.request.url.includes("version.json")) {
    e.respondWith(
      fetch(e.request).catch(() => new Response("{}", { headers: { "Content-Type": "application/json" } }))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
