import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Installers now live in Supabase Storage (bucket: product-downloads)
  // and are streamed to the browser via short-lived signed URLs in
  // /api/downloads/[filename]. The downloads-private/ folder stays in
  // git-lfs as the source-of-truth mirror but must NOT be bundled into
  // the Vercel Lambda — that would blow past the 250 MB function limit.
  outputFileTracingExcludes: {
    "*": ["./downloads-private/**/*"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
}

export default withNextIntl(nextConfig);
