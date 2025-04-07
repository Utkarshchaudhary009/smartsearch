// This is the service worker source file for SmartSearch PWA
// Serwist will inject precaching and other functionality into this file

// Skip waiting for page refresh
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle offline fallback
self.addEventListener('fetch', (event) => {
  // Let Serwist handle this event with precaching
}); 