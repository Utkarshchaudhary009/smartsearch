"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IOSInstallInstructions } from "./IOSInstallInstructions";

interface InstallBannerProps {
  delay?: number; // Delay in milliseconds before showing the toast
  showOnce?: boolean; // Whether to show the toast only once per session
  duration?: number; // Duration the toast stays visible (ms)
}

export function InstallBanner({
  delay = 3500,
  showOnce = true,
  duration = 8000, // Default 8 seconds
}: InstallBannerProps) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [toastId, setToastId] = useState<string | number | undefined>(
    undefined
  );
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const handleInstallClick = useCallback(async () => {
    if (isIOS) {
      setShowIOSInstructions(true); // Show separate instructions for iOS
      if (toastId) toast.dismiss(toastId);
      return;
    }

    if (!installPrompt) return;

    try {
      // Show the install prompt first
      await installPrompt.prompt();
      // Then wait for the user's choice
      const { outcome } = await installPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
        setInstallPrompt(null); // Clear the prompt
        if (toastId) toast.dismiss(toastId); // Dismiss the toast
        if (showOnce) {
          sessionStorage.setItem("installBannerDismissed", "true");
        }
      } else {
        console.log("User dismissed the install prompt");
        if (showOnce) {
          sessionStorage.setItem("installBannerDismissed", "true"); // Also dismiss if rejected but showOnce is true
        }
      }
    } catch (err) {
      console.error("Error showing install prompt:", err);
    } finally {
      // Dismiss the toast regardless of outcome if not already dismissed
      if (toastId) toast.dismiss(toastId);
    }
  }, [installPrompt, isIOS, showOnce, toastId]);

  const handleLaterClick = useCallback(() => {
    if (showOnce) {
      sessionStorage.setItem("installBannerDismissed", "true");
    }
    if (toastId) toast.dismiss(toastId);
  }, [showOnce, toastId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if already dismissed in this session
      if (showOnce && sessionStorage.getItem("installBannerDismissed")) {
        return;
      }

      // Check if running in standalone mode
      setIsStandalone(
        window.matchMedia("(display-mode: standalone)").matches ||
          (window.navigator as unknown as { standalone: boolean })
            .standalone === true
      );

      if (isStandalone) return; // Don't show if already standalone

      // Detect iOS
      const ua = window.navigator.userAgent;
      const iosCheck =
        /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      setIsIOS(iosCheck);

      // Listen for the beforeinstallprompt event (non-iOS)
      const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
        e.preventDefault();
        setInstallPrompt(e);
      };

      window.addEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as unknown as EventListener
      );

      // Reset on install
      const handleAppInstalled = () => {
        setInstallPrompt(null);
        if (showOnce) {
          sessionStorage.setItem("installBannerDismissed", "true");
        }
        if (toastId) toast.dismiss(toastId);
      };
      window.addEventListener("appinstalled", handleAppInstalled);

      // Show toast after delay if installable
      const timer = setTimeout(() => {
        if (installPrompt || iosCheck) {
          // Check if installable (Android/Desktop or iOS)
          const id = toast("Install SmartSearch App", {
            description: isIOS
              ? 'Tap the share button and then "Add to Home Screen".'
              : "Add to your home screen for a better experience.",
            duration: duration,
            action: !isIOS ? (
              <Button
                size='sm'
                onClick={handleInstallClick}
              >
                Install
              </Button>
            ) : undefined, // No direct install button for iOS
            cancel: (
              <Button
                variant='outline'
                size='sm'
                onClick={handleLaterClick}
              >
                Later
              </Button>
            ),
            onDismiss: () => {
              if (showOnce) {
                // Mark as dismissed if toast auto-dismisses or is manually closed
                sessionStorage.setItem("installBannerDismissed", "true");
              }
            },
          });
          setToastId(id);
        }
      }, delay);

      return () => {
        clearTimeout(timer);
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt as unknown as EventListener
        );
        window.removeEventListener("appinstalled", handleAppInstalled);
        // Ensure toast is dismissed on unmount if it exists
        if (toastId) toast.dismiss(toastId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    delay,
    showOnce,
    duration,
    installPrompt,
    isStandalone,
    handleInstallClick,
    handleLaterClick,
  ]); // Added dependencies

  // Render iOS instructions modal if needed
  return isIOS ? (
    <IOSInstallInstructions
      isOpen={showIOSInstructions}
      onClose={() => setShowIOSInstructions(false)}
    />
  ) : null; // Don't render anything else directly
}
