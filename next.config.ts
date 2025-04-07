import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withSerwist({
  swSrc: "src/sw.js",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // Register precached URLs
  precacheURLs: [
    "/",
    "/settings/install-app",
  ],
  // Skip additional manifest generation
  skipWaiting: true,
  clientsClaim: true,
  fallbacks: {
    // Add offline fallback page
    document: "/offline.html",
  },
})(nextConfig);
