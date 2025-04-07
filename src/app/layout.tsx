import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { auth } from "@clerk/nextjs/server";
import { ClerkProvider } from "@clerk/nextjs";
import { TanstackProvider } from "@/lib/tanstack";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PWAProvider } from "@/components/providers/pwa-provider";
import { InstallBanner } from "@/components/pwa";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });
const APP_NAME = "Smart Search Chat";
const APP_DESCRIPTION =
  "AI-powered chat interface with smart search capabilities";
const APP_TITLE_TEMPLATE = `%s | ${APP_NAME}`;
export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  themeColor: "#ffffff",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
    other: {
      rel: "icon",
      url: "/favicon.ico",
    },
  },
  openGraph: {
    title: {
      default: APP_NAME,
      template: APP_TITLE_TEMPLATE,
    },
    siteName: APP_NAME,
    type: "website",
    locale: "en_US",
    url: "https://search.utkarshchaudhary.space",
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/favicon.ico",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_NAME,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/favicon.ico",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
              <PWAProvider />
              <div className='flex h-screen flex-col'>
                <Navbar userId={userId} />
                <InstallBanner
                  delay={5000}
                  showOnce={true}
                />
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
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
