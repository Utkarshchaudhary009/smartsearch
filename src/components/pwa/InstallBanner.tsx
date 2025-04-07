"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { UniversalInstallButton } from "./UniversalInstallButton";

interface InstallBannerProps {
  delay?: number; // Delay in milliseconds before showing the banner
  showOnce?: boolean; // Whether to show the banner only once per session
}

export function InstallBanner({
  delay = 3000,
  showOnce = true,
}: InstallBannerProps) {
  const [visible, setVisible] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if already dismissed in this session
      if (showOnce && sessionStorage.getItem("installBannerDismissed")) {
        return;
      }

      // Check if running in standalone mode
      setIsStandalone(
        window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as unknown as { standalone: boolean }).standalone === true
      );
      
      // Detect iOS
      const ua = window.navigator.userAgent;
      setIsIOS(
        /iPad|iPhone|iPod/.test(ua) || 
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      );

      // Listen for the beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
        e.preventDefault();
        setInstallPrompt(e);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as unknown as EventListener);
      
      // Show after delay
      const timer = setTimeout(() => {
        setVisible(true);
      }, delay);
      
      // Reset on install
      window.addEventListener("appinstalled", () => {
        setInstallPrompt(null);
        setVisible(false);
        if (showOnce) {
          sessionStorage.setItem("installBannerDismissed", "true");
        }
      });

      return () => {
        clearTimeout(timer);
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as unknown as EventListener);
      };
    }
  }, [delay, showOnce]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    
    if (showOnce) {
      sessionStorage.setItem("installBannerDismissed", "true");
    }
  };

  // Don't show if already in standalone mode, dismissed, or not installable on non-iOS
  if (isStandalone || dismissed || (!installPrompt && !isIOS) || !visible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 shadow-lg border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M21 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1Z" />
                <path d="M7 13v-6a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v6" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-lg">Install SmartSearch App</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isIOS
                ? "Install our app on your iPhone for a better experience"
                : "Add to your home screen for a better experience . "}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <UniversalInstallButton className="hidden sm:inline-flex" />
          <button
            onClick={handleDismiss}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
} 