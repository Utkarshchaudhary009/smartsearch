"use client";

import { useEffect } from "react";

export function PWAProvider() {
  useEffect(() => {
    // We don't need to manually register the service worker
    // Serwist will handle this automatically
    
    // Just add event listeners for tracking install status
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Listen for app installed event for analytics/tracking
      const handleAppInstalled = () => {
        console.log("App was installed to home screen");
        // You could send analytics event here
      };
      
      window.addEventListener("appinstalled", handleAppInstalled);
      
      return () => {
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }
  }, []);

  return null;
}
