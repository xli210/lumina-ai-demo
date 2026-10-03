import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const PUBLIC_CACHE = {
  key: "Cache-Control",
  value: "public, max-age=0, s-maxage=600, stale-while-revalidate=86400",
};

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
  // Assistants and visitors guess /pricing; it 404'd. The price list is the
  // homepage section that the navbar and footer already link to.
  async redirects() {
    return [
      { source: "/pricing", destination: "/#pricing", permanent: true },
      // "Nano FaceSwap Pro 2.0" never shipped as a desktop product; its pages
      // described Nano FaceStudio Online (browser) and Nano FaceStudio Pro
      // (desktop). Send old links and search results to the real pages.
      { source: "/apps/nano-faceswap-pro", destination: "/face-studio", permanent: true },
      {
        source: "/apps/nano-faceswap-pro/features",
        destination: "/apps/nano-facestudio-pro",
        permanent: true,
      },
    ];
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
      // Public pages are identical for every visitor (the signed-in state is read
      // in the browser), so the CDN may keep them briefly. Next marks pages that
      // read request headers as no-store, and the middleware's own Cache-Control is
      // overridden on Vercel, so it is set here. Keep in step with middleware.ts.
      {
        source:
          "/:path(|about|blog|face-swap|image-edit|compare|trust|security|privacy|terms|best-face-swap-app-2026|docs|release-notes|apps|status)",
        headers: [PUBLIC_CACHE],
      },
      {
        // internal-preview reads the signed-in user on the server: never cached.
        source: "/apps/:rest((?!nano-facestudio-pro/internal-preview).*)",
        headers: [PUBLIC_CACHE],
      },
      {
        source:
          "/:section(blog|compare|release-notes|docs|face-swap|zh-CN|ja|ko)/:rest*",
        headers: [PUBLIC_CACHE],
      },
    ];
  },
}

export default withNextIntl(nextConfig);
