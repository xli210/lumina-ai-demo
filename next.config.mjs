import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const PUBLIC_CACHE = {
  key: "Cache-Control",
  value: "public, max-age=0, s-maxage=600, stale-while-revalidate=86400",
};
// Next overwrites Cache-Control on these pages with no-store (the root layout reads the request
// headers for the locale), so PUBLIC_CACHE alone never let the CDN keep a page and every view was
// rendered again. Vercel-CDN-Cache-Control is read by Vercel's CDN only, is not sent to the browser,
// and wins over Cache-Control there. Checked on /security (2026-11-20): HTML and the RSC payload are
// kept apart (Vary), a different query string is a different entry, and a new deployment starts
// with an empty cache. Only pages whose HTML is the same for every visitor may get it: signed-in
// state, balances and live figures are fetched in the browser. Never add a page that reads cookies,
// the signed-in user or a cookie-chosen language (lib/i18n/locales.ts COOKIE_LOCALE_PATHS), nor a
// path that redirects signed-out visitors (lib/supabase/middleware.ts PROTECTED_PATH_PREFIXES).
const PUBLIC_PAGE = [
  PUBLIC_CACHE,
  { key: "Vercel-CDN-Cache-Control", value: "max-age=600, stale-while-revalidate=86400" },
];

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
  // Nano FaceStudio-V Online's page is a static file in public/facestudio-v/; serve it at the clean
  // address. Its videos and pictures are at /facestudio-v/media/. (Next does not map a folder to its
  // index.html on its own.)
  async rewrites() {
    return [{ source: "/facestudio-v", destination: "/facestudio-v/index.html" }];
  },
  async redirects() {
    return [
      // Addresses Google found linked from outside the site (Search Console 404s, 2026-11-11).
      { source: "/faq", destination: "/#faq", permanent: true },
      { source: "/face-swap-video", destination: "/facestudio-v", permanent: true },
      // SpotEdit is built to change one spot: colourising and restoring old photos did not work in our tests.
      { source: "/blog/restore-and-colorize-old-photos-with-ai", destination: "/image-edit", permanent: true },
      { source: "/use-cases/old-family-photos", destination: "/use-cases", permanent: true },
      // "Nano FaceSwap Pro 2.0" never shipped as a desktop product; its pages
      // described Nano FaceStudio Online (browser) and Nano FaceStudio Pro
      // (desktop). Send old links and search results to the real pages.
      { source: "/apps/nano-faceswap-pro", destination: "/face-studio", permanent: true },
      // The free "Video FaceSwap Pro" demo (its tunnel was retired on 2026-09-28) is replaced by
      // Video FaceSwap Online 1.1.0, which is paid in credits. The old page still promised a free,
      // watermark-free demo, and ChatGPT was sending people to it with that promise.
      { source: "/apps/nano-faceswap-pro/video", destination: "/facestudio-v", permanent: true },
      {
        // The illustrated feature tour now lives on /face-studio itself.
        source: "/apps/nano-faceswap-pro/features",
        destination: "/face-studio#features",
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
        // Exact pages. /image-edit and /face-studio only: their sub-paths need a session.
        // /headswap-pro only: /headswap-pro/config.js is read fresh (no-store) on purpose.
        // /status and /data/ are left out on purpose: they show live figures.
        source:
          "/:path(|about|blog|face-swap|image-edit|face-studio|compare|trust|security|privacy|terms|best-face-swap-app-2026|best-free-face-swap|docs|release-notes|apps|pricing|headswap-pro|head-swap|video-head-swap|use-cases|video-face-swap-examples|video-face-swap-test-results|verify|business|contact|community)",
        headers: PUBLIC_PAGE,
      },
      {
        // internal-preview reads the signed-in user on the server: never cached.
        source: "/apps/:rest((?!nano-facestudio-pro/internal-preview).*)",
        headers: PUBLIC_PAGE,
      },
      {
        source:
          "/:section(blog|compare|release-notes|docs|face-swap|use-cases|video-face-swap-examples|head-swap)/:rest*",
        headers: PUBLIC_PAGE,
      },
      {
        // The translated pages (app/[locale]): landing pages only, none reads the visitor.
        source: "/:locale(zh-CN|ja|ko|es|pt-BR|de|fr)/:rest*",
        headers: PUBLIC_PAGE,
      },
      {
        // Pictures and videos in public/ were sent with max-age=0, so a returning visitor's
        // browser asked about every one again. A day, not a year: some files are replaced
        // under the same name (bump ?v= on the reference when it must show at once).
        source:
          "/:dir(images|videos|email|face-studio|facestudio-v|headswap-pro|image-edit)/:rest*(jpg|jpeg|png|webp|avif|gif|svg|mp4|webm)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
}

export default withNextIntl(nextConfig);
