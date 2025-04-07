"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    if (typeof window !== "undefined") {
      setIsStandalone(
        window.matchMedia("(display-mode: standalone)").matches ||
          (window.navigator as unknown as { standalone: boolean }).standalone ===
            true
      );

      // Detect iOS
      const ua = window.navigator.userAgent;
      setIsIOS(
        /iPad|iPhone|iPod/.test(ua) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      );
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    const promptEvent = installPrompt as unknown as BeforeInstallPromptEvent;
    promptEvent.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await promptEvent.userChoice;

    // Reset the deferred prompt variable
    setInstallPrompt(null);

    // Track the outcome
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
  };

  // Don't show anything if it's already in standalone mode
  if (isStandalone || isInstalled) {
    return null;
  }

  return (
    <div className='fixed bottom-4 left-0 right-0 mx-auto max-w-md p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700'>
      <div className='flex flex-col gap-3'>
        <div className='flex justify-between items-start'>
          <div>
            <h3 className='font-medium text-lg'>Install SmartSearch App</h3>
            {isIOS ? (
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                Tap the share button and then &quot;Add to Home Screen&quot;
              </p>
            ) : (
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                Install our app for a better experience
              </p>
            )}
          </div>
          <button
            onClick={() => setIsInstalled(true)}
            className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          >
            ✕
          </button>
        </div>

        {isIOS ? (
          <div className='flex items-center gap-2'>
            <div className='p-2 bg-gray-100 dark:bg-gray-700 rounded-full'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <polyline points='8 17 12 21 16 17'></polyline>
                <line
                  x1='12'
                  y1='12'
                  x2='12'
                  y2='21'
                ></line>
                <path d='M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29'></path>
              </svg>
            </div>
            <span className='text-sm'>
              Tap the share icon and select &quot;Add to Home Screen&quot;
            </span>
          </div>
        ) : (
          <Button
            onClick={handleInstallClick}
            disabled={!installPrompt}
            className='w-full'
          >
            Install App
          </Button>
        )}
      </div>
    </div>
  );
}
