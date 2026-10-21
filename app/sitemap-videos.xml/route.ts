// Video sitemap, served at /sitemap-videos.xml.
//
// Format: Google Sitemaps Video extension
// (https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps)
//
// Search Console showed no video indexed for the site although /facestudio-v embeds
// nineteen real before/after clips. The same clips are also described on the page as
// VideoObject structured data (public/facestudio-v/index.html). Both are generated from
// lib/facestudio-v-videos.ts, so the sitemap, the markup and the page agree.

import { FACESTUDIO_V_VIDEOS } from "@/lib/facestudio-v-videos";

const BASE = "https://nanopocket.ai";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** Google limits: title 100 characters, description 2048. */
const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`);

function buildXml(): string {
  const videos = FACESTUDIO_V_VIDEOS.map(
    (v) => `    <video:video>
      <video:thumbnail_loc>${esc(`${BASE}${v.thumbnailUrl}`)}</video:thumbnail_loc>
      <video:title>${esc(clip(`${v.title}: Video FaceSwap Online`, 100))}</video:title>
      <video:description>${esc(clip(v.description, 2048))}</video:description>
      <video:content_loc>${esc(`${BASE}${v.contentUrl}`)}</video:content_loc>
      <video:duration>${Math.max(1, Math.round(v.durationSeconds))}</video:duration>
      <video:publication_date>${v.uploadDate}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:requires_subscription>no</video:requires_subscription>
    </video:video>`
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>${BASE}/facestudio-v</loc>
${videos}
  </url>
</urlset>
`;
}

export function GET() {
  return new Response(buildXml(), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

export const dynamic = "force-static";
export const revalidate = 3600;
