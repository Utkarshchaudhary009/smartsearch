// app/sw.ts (Example using TypeScript)
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from "serwist";
import { CacheableResponsePlugin } from "serwist";
import { ExpirationPlugin } from "serwist";

// Make Serwist aware of TypeScript types for the global scope.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    // Add custom properties here if needed.
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

// --- Caching Strategies ---

// 1. Supabase API Caching (NetworkFirst Strategy)
//    This is crucial for your requirement:
//    - Try network first.
//    - If network succeeds, use fresh data & update cache.
//    - If network fails (offline), serve data from the cache.

const supabaseApiStrategy = new NetworkFirst({
  cacheName: "supabase-api-cache",
  plugins: [
    // Only cache successful responses (e.g., status 200 OK)
    new CacheableResponsePlugin({
      statuses: [0, 200], // Cache opaque responses (status 0) and OK responses
    }),
    // Optional: Expire cached data after some time
    new ExpirationPlugin({
      maxEntries: 50, // Max number of API responses to cache
      maxAgeSeconds: 60 * 60 * 24 * 7, // Cache for 1 week
      // Automatically cleanup expired entries
      // purgeOnQuotaError: true, // Enable this if you expect storage quota issues
    }),
  ],
});

// 2. Static Assets Caching (StaleWhileRevalidate or CacheFirst)
//    For CSS, JS, Fonts, etc. StaleWhileRevalidate is often good for assets that might update.
const staticAssetsStrategy = new StaleWhileRevalidate({
  cacheName: "static-assets-cache",
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxEntries: 60,
      maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
    }),
  ],
});

// 3. Image Caching (CacheFirst)
//    Images often don't change, so CacheFirst is efficient.
const imageStrategy = new CacheFirst({
  cacheName: "image-cache",
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxEntries: 60,
      maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
    }),
  ],
});

// --- Routing ---

// IMPORTANT: Replace with your actual Supabase project URL pattern
const supabaseUrlPattern = ({ url }) => url.hostname.includes("supabase") || url.hostname.includes("clerk");
// --- Serwist Initialization ---

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST, // Managed by @serwist/next
  skipWaiting: true, // Activate new service worker immediately
  clientsClaim: true, // Take control of clients immediately
  navigationPreload: true, // Enable navigation preload if supported
  runtimeCaching: [
    ...defaultCache,
    {
      matcher: supabaseUrlPattern,
      handler: supabaseApiStrategy,
      method: "GET",
    },
  ], // Use default handlers provided by Serwist for common scenarios
  // Our custom registerRoute calls above will override or add to these.
  fallbacks: {
    entries: [
      {
        url: "/offline.html", // Route pattern for offline fallback
        matcher:({request}) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
// Route Supabase API calls to the NetworkFirst strategy
serwist.registerCapture(
  supabaseUrlPattern,
  supabaseApiStrategy,
  "GET" // Only cache GET requests usually
);

// Route static assets (adjust patterns as needed)
serwist.registerCapture(
  ({ request }) =>
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "worker",
  staticAssetsStrategy
);

// Route images
serwist.registerCapture(
  ({ request }) => request.destination === "image",
  imageStrategy
);

// Skip waiting for page refresh
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});
