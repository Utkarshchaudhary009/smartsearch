"use client";

import { useEffect } from "react";

export function PWAProvider() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerServiceWorker = async () => {
        try {
          // Wait for the window to load fully
          if (window.workbox !== undefined) {
            // Workbox is available (production build)
            const registration = await navigator.serviceWorker.register(
              "/sw.js"
            );
            console.log(
              "Service Worker registered with scope:",
              registration.scope
            );
          }
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      };

      window.addEventListener("load", registerServiceWorker);

      return () => {
        window.removeEventListener("load", registerServiceWorker);
      };
    }
  }, []);

  return null;
}
