"use client";
import { useTheme } from "next-themes";
import { Moon, Sun, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { AddToHomeScreenButton } from "@/components/pwa";

interface NavbarProps {
  userId: string | null;
}

export default function Navbar({ userId }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mount check to avoid hydration issues with PWA detection
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to close the sidebar sheet
  const closeSidebar = () => {
    setOpen(false);
  };

  return (
    <div className='border-b'>
      <div className='flex h-16 items-center px-4'>
        <span className='font-bold sm:inline-block mr-6 flex items-center space-x-2'>
          SmartSearch
        </span>

        <div className='ml-auto flex items-center space-x-2'>
          {mounted && <AddToHomeScreenButton />}

          <Button
            variant='ghost'
            size='icon'
            aria-label='Toggle theme'
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className='h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
            <Moon className='absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
            <span className='sr-only'>Toggle theme</span>
          </Button>
          <div className='flex justify-end items-center p-1 gap-2 h-16'>
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <Sheet
                open={open}
                onOpenChange={setOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='md:hidden'
                  >
                    <History className='h-8 w-8' />
                    <span className='sr-only'>Chat History</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side='left'
                  className='p-0'
                >
                  <Sidebar
                    userId={userId}
                    closeSidebar={closeSidebar}
                  />
                </SheetContent>
              </Sheet>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </div>
  );
}
