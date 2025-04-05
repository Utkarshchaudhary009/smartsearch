import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { auth } from "@clerk/nextjs/server";
import { ClerkProvider } from "@clerk/nextjs";
import { TanstackProvider } from "@/lib/tanstack";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import dynamic from "next/dynamic";
import { generateWebsiteStructuredData } from "@/lib/structured-data";
import StructuredData from "@/components/structured-data";

const PWAInstallPrompt = dynamic(
  () => import("@/components/ui/pwa-install-prompt"),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Search Chat",
  description: "AI-powered chat interface with smart search capabilities",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SmartSearch",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: ["/favicon.ico"],
    apple: ["/apple-icon.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://smartsearch.utkarshchaudhary.space";

  const websiteStructuredData = generateWebsiteStructuredData({
    url: baseUrl,
    name: "SmartSearch",
    description: "AI-powered chat interface with smart search capabilities",
    logoUrl: `${baseUrl}/web-app-manifest-512x512.png`,
  });

  return (
    <ClerkProvider>
      <html
        lang='en'
        suppressHydrationWarning
      >
        <head>
          <StructuredData data={websiteStructuredData} />
        </head>
        <body className={inter.className}>
          <ThemeProvider
            attribute='class'
            defaultTheme='light'
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
                <Footer />
              </div>
              <PWAInstallPrompt />
            </TanstackProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
