const CACHE_NAME = "vapless-v7";
const SHELL = [
  "./",
  "./index.html",
  "./css/tokens.css",
  "./css/style.css",
  "./css/fonts.css",
  "./assets/fonts/inter-var.woff2",
  "./assets/fonts/poppins-600.woff2",
  "./assets/fonts/poppins-800.woff2",
  "./js/api.js",
  "./js/app.js",
  "./js/theme.js",
  "./js/accordion.js",
  "./js/assessment.js",
  "./js/craving.js",
  "./js/hack.js",
  "./js/pulse.js",
  "./manifest.json",
  "./assets/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
