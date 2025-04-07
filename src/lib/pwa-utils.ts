"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to check PWA installation status
 * @returns Object with installation status info
 */
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Check if running in standalone mode
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as unknown as { standalone: boolean }).standalone === true
    );
    
    // Detect iOS
    const ua = window.navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) || 
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isiOS);
    
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };
    
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as unknown as EventListener);
    
    // If on iOS, it's always "installable" via manual process
    if (isiOS) {
      setIsInstallable(true);
    }
    
    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setInstallPrompt(null);
      setIsInstallable(false);
      // Update standalone status after a short delay
      setTimeout(() => {
        setIsStandalone(true);
      }, 1000);
    });
    
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as unknown as EventListener);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    // If accepted, reset the prompt
    if (outcome === "accepted") {
      setInstallPrompt(null);
      return true;
    }
    
    return false;
  }, [installPrompt]);

  return {
    isIOS,
    isStandalone,
    isInstallable,
    installPrompt,
    promptInstall
  };
}

/**
 * Detects if the app is running in standalone mode
 * @returns Boolean indicating if app is in standalone mode
 */
export function isAppInstalled(): boolean {
  if (typeof window === "undefined") return false;
  
  return (
    window.matchMedia("(display-mode: standalone)").matches || 
    (window.navigator as unknown as { standalone: boolean }).standalone ===
      true
  );
}

/**
 * Detects if the device is an iOS device
 * @returns Boolean indicating if the device is iOS
 */
export function isIOSDevice(): boolean {
  if (typeof window === "undefined") return false;
  
  const ua = window.navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) || 
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
} 