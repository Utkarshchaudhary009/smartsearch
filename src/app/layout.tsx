import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { auth } from "@clerk/nextjs/server";
import { ClerkProvider } from "@clerk/nextjs";
import { TanstackProvider } from "@/lib/tanstack";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Search Chat",
  description: "AI-powered chat interface with smart search capabilities",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  return (
    <ClerkProvider>
      <html
        lang='en'
        suppressHydrationWarning
      >
        <Analytics />
        <body className={inter.className}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <TanstackProvider>
              <div className='flex h-screen flex-col'>
                <Navbar userId={userId} />
                <div className='flex flex-1 overflow-hidden'>
                  {/* Sidebar for desktop view */}
                  <div className='hidden md:flex md:w-64 md:flex-col border-r'>
                    <Sidebar userId={userId} />
                  </div>

                  {/* Main content */}
                  <main className='flex flex-1 flex-col overflow-hidden'>
                    {children}
                  </main>
                </div>
              </div>
            </TanstackProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
