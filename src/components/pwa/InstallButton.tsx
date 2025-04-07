"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface InstallButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

export function InstallButton({ text = "Install App", className, ...props }: InstallButtonProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if already in standalone mode
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

      window.addEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as unknown as EventListener   
      );

      // Reset on install
      window.addEventListener("appinstalled", () => {
        setInstallPrompt(null);
      });

      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt as unknown as EventListener
        );
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  // Already installed or not installable
  if (isStandalone || (!installPrompt && !isIOS)) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      disabled={!installPrompt && !isIOS}
      className={className}
      {...props}
    >
      {text}
    </Button>
  );
} 