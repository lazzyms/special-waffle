const CACHE_VERSION = "v4-" + new Date().getTime();
const CACHE_NAME = "dubai-trip-" + CACHE_VERSION;

// Assets that rarely change (images, icons)
const STATIC_ASSETS = [
  "/special-waffle/splash.png",
  "/special-waffle/android/android-launchericon-192-192.png",
  "/special-waffle/android/android-launchericon-512-512.png",
  "/special-waffle/ios/180.png",
  "/special-waffle/ios/152.png",
  "/special-waffle/ios/167.png",
];

// Dynamic assets that change frequently (HTML, CSS, JS)
const DYNAMIC_ASSETS = [
  "/special-waffle/",
  "/special-waffle/index.html",
  "/special-waffle/styles.css",
  "/special-waffle/app.js",
  "/special-waffle/manifest.json",
];

// Install event - cache static resources only
self.addEventListener("install", (event) => {
  console.log("[SW] Installing new service worker...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(
          STATIC_ASSETS.map((url) => new Request(url, { cache: "reload" })),
        );
      })
      .catch((error) => {
        console.log("[SW] Cache installation failed:", error);
      }),
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event - Network First for HTML/CSS/JS, Cache First for images
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Check if this is a dynamic asset (HTML, CSS, JS)
  const isDynamicAsset =
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname === "/special-waffle/" ||
    url.pathname === "/special-waffle/manifest.json";

  if (isDynamicAsset) {
    // Network First strategy for dynamic content
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Check if valid response
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log(
                "[SW] Serving cached version (offline):",
                url.pathname,
              );
              return cachedResponse;
            }
            // If it's HTML, return cached index as fallback
            if (
              url.pathname.endsWith(".html") ||
              url.pathname === "/special-waffle/"
            ) {
              return caches.match("/special-waffle/index.html");
            }
            throw new Error("No cache available");
          });
        }),
    );
  } else {
    // Cache First strategy for static assets (images, icons)
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      }),
    );
  }
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating new service worker...");
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  // Take control of all pages immediately
  return self.clients.claim();
});
