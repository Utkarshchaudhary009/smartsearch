"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IOSInstallInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IOSInstallInstructions({
  isOpen,
  onClose,
}: IOSInstallInstructionsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Install SmartSearch App</DialogTitle>
          <DialogDescription>
            Follow these steps to install the app to your home screen.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800">
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
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
            <p className="font-medium">Step 1</p>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Tap the Share button in Safari&apos;s toolbar.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800">
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
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </div>
            <p className="font-medium">Step 2</p>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Scroll down and tap &quot;Add to Home Screen&quot;.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800">
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
              >
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <p className="font-medium">Step 3</p>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Tap &quot;Add&quot; in the upper right corner to install.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function IOSInstallButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [showInstructions, setShowInstructions] = useState(false);
  
  return (
    <>
      <Button 
        className={className} 
        onClick={() => setShowInstructions(true)}
        {...props}
      >
        Install App
      </Button>
      
      <IOSInstallInstructions 
        isOpen={showInstructions} 
        onClose={() => setShowInstructions(false)} 
      />
    </>
  );
} 