"use client";

import { useState, useEffect } from "react";
import { UniversalInstallButton, IOSInstallButton } from "@/components/pwa";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function InstallAppPage() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if already in standalone mode
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
  }, []);

  if (isStandalone) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold mb-6'>Install App</h1>
        <Card>
          <CardHeader>
            <CardTitle>App Already Installed</CardTitle>
            <CardDescription>
              You&apos;re currently using the SmartSearch app in standalone mode!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600 dark:text-gray-400'>
              You&apos;ve successfully installed the app to your device. Enjoy
              the full app experience!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6'>Install SmartSearch App</h1>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Install App</CardTitle>
            <CardDescription>
              Install SmartSearch as an app on your device for the best
              experience
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-600 dark:text-gray-400'>
              Installing the SmartSearch app on your device provides:
            </p>
            <ul className='list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400'>
              <li>Faster access without opening a browser</li>
              <li>Better performance and offline capabilities</li>
              <li>Full-screen experience without browser controls</li>
              <li>Quick access from your home screen</li>
            </ul>

            <div className='pt-4'>
              <UniversalInstallButton className='w-full' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Progressive Web Apps provide a native app-like experience
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-600 dark:text-gray-400'>
              SmartSearch is a Progressive Web App (PWA), which means:
            </p>
            <ul className='list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400'>
              <li>No app store downloads or updates required</li>
              <li>Minimal storage space used on your device</li>
              <li>Automatic updates when you use the app</li>
              <li>Works across all your devices with the same account</li>
            </ul>

            {isIOS && (
              <div className='pt-4'>
                <p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>
                  On iOS devices, tap the button below for step-by-step
                  installation instructions:
                </p>
                <IOSInstallButton className='w-full' />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
