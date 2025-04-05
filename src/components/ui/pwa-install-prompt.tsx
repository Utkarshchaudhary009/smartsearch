"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadCloud, CheckCircle, XCircle } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Define navigator extension for Safari
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (PWA installed)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as NavigatorWithStandalone).standalone === true
    ) {
      setIsStandalone(true);
      return;
    }

    // Store the install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // When PWA is successfully installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Show prompt after 10 seconds if it hasn't been shown
    const timer = setTimeout(() => {
      if (installPrompt && !isInstalled && !isStandalone) {
        setShowPrompt(true);
      }
    }, 10000);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(timer);
    };
  }, [installPrompt, isInstalled, isStandalone]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choiceResult = await installPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      setIsInstalled(true);
    }

    setShowPrompt(false);
    setInstallPrompt(null);
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Set a cookie or localStorage item to remember user dismissed
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (
    isStandalone ||
    !showPrompt ||
    localStorage.getItem("pwa-prompt-dismissed") === "true"
  ) {
    return null;
  }

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-900 border-t shadow-lg animate-in slide-in-from-bottom duration-300'>
      <div className='container mx-auto flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <DownloadCloud className='h-6 w-6 text-primary' />
          <div>
            <h3 className='font-semibold'>Install SmartSearch App</h3>
            <p className='text-sm text-muted-foreground'>
              Get faster access and a better experience
            </p>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={dismissPrompt}
          >
            <XCircle className='h-4 w-4 mr-1' />
            Not now
          </Button>
          <Button
            size='sm'
            onClick={handleInstallClick}
          >
            <CheckCircle className='h-4 w-4 mr-1' />
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}
