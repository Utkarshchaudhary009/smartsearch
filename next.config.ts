import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
  // Add any MDX plugins here if needed
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
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

export default withMDX(withSerwistInit({
  swSrc: "src/lib/pwa/sw.ts",
  swDest: "public/sw.js"
})(nextConfig));
