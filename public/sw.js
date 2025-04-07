// This is the service worker for SmartSearch PWA
// It handles offline caching for the application

// Skip waiting for page refresh
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
