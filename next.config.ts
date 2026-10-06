import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

const nextConfig = (phase: string): NextConfig => {
  // Canonical URLs, the sitemap and social previews use NEXT_PUBLIC_SITE_URL (see lib/site.ts).
  if (phase === PHASE_PRODUCTION_BUILD && !process.env.NEXT_PUBLIC_SITE_URL && !process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    console.warn(
      "\n⚠ NEXT_PUBLIC_SITE_URL is not set: canonical URLs, the sitemap and social previews will point to localhost.\n  Set it to the live domain (e.g. https://www.yourdomain.co.uk) before deploying.\n",
    );
  }

  return {
    images: {
      formats: ["image/avif", "image/webp"],
      qualities: [60, 75, 90],
      remotePatterns: [{ protocol: "https", hostname: "m.media-amazon.com", pathname: "/images/**" }],
    },
    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          ],
        },
        {
          source: "/(products|brand)/:path*",
          headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
        },
      ];
    },
  };
};

export default nextConfig;
