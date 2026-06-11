import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { appReleases } from "@/lib/release-data";

const BASE = "https://nanopocket.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const blogEntries = BLOG_POSTS.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const releaseNoteEntries = appReleases.map((app) => ({
    url: `${BASE}/release-notes/${app.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const homeLanguages = {
    en: BASE,
    "zh-CN": `${BASE}/zh-CN`,
  };

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: { languages: homeLanguages },
    },
    {
      url: `${BASE}/zh-CN`,
      lastModified: new Date("2026-06-03"),
      changeFrequency: "weekly",
      priority: 0.95,
      alternates: { languages: homeLanguages },
    },
    { url: `${BASE}/download`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...blogEntries,
    ...releaseNoteEntries,
    // 10 SEO product landings
    { url: `${BASE}/apps/nano-faceswap-pro`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE}/apps/nano-faceswap-pro/features`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/apps/nano-faceswap-pro/video`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/apps/nanoface-vivid`, lastModified: new Date("2026-06-02"), changeFrequency: "weekly", priority: 0.9 },
    ...(() => {
      const faceSwapLanguages = {
        en: `${BASE}/face-swap`,
        "zh-CN": `${BASE}/zh-CN/face-swap`,
        ja: `${BASE}/ja/face-swap`,
        ko: `${BASE}/ko/face-swap`,
      };
      return [
        {
          url: `${BASE}/face-swap`,
          lastModified: new Date("2026-06-03"),
          changeFrequency: "weekly" as const,
          priority: 0.95,
          alternates: { languages: faceSwapLanguages },
        },
        {
          url: `${BASE}/zh-CN/face-swap`,
          lastModified: new Date("2026-06-03"),
          changeFrequency: "weekly" as const,
          priority: 0.9,
          alternates: { languages: faceSwapLanguages },
        },
        {
          url: `${BASE}/ja/face-swap`,
          lastModified: new Date("2026-06-03"),
          changeFrequency: "weekly" as const,
          priority: 0.9,
          alternates: { languages: faceSwapLanguages },
        },
        {
          url: `${BASE}/ko/face-swap`,
          lastModified: new Date("2026-06-03"),
          changeFrequency: "weekly" as const,
          priority: 0.9,
          alternates: { languages: faceSwapLanguages },
        },
      ];
    })(),
    { url: `${BASE}/compare/nanopocket-vs-wavespeed`, lastModified: new Date("2026-06-03"), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/status`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.6 },
    { url: `${BASE}/apps/nano-imageenh-pro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/apps/nano-videoenhance`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/apps/nano-videogen`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/apps/nano-imageedit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/apps/nano-facialedit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/apps/nano-imagetryon`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/apps/nano-faceswap`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/best-face-swap-app-2026`, lastModified: new Date("2026-05-29"), changeFrequency: "monthly", priority: 0.95 },
    { url: `${BASE}/compare`, lastModified: new Date("2026-05-29"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/compare/nanopocket-vs-reface`, lastModified: new Date("2026-05-29"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/compare/nanopocket-vs-deepswap`, lastModified: new Date("2026-05-29"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/compare/nanopocket-vs-facefusion`, lastModified: new Date("2026-05-29"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/compare/nanopocket-vs-akool`, lastModified: new Date("2026-05-29"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/compare/nanopocket-vs-magic-hour`, lastModified: new Date("2026-05-29"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/compare/nanopocket-vs-nano-banana`, lastModified: new Date("2026-06-02"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/about`, lastModified: new Date("2026-06-02"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/trust`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/verify`, lastModified: new Date("2026-05-29"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/community`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE}/docs`, lastModified: new Date("2026-06-04"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/docs/face-swap-pipeline`, lastModified: new Date("2026-06-04"), changeFrequency: "monthly", priority: 0.9 },
    {
      url: `${BASE}/zh-CN/faq`,
      lastModified: new Date("2026-06-04"),
      changeFrequency: "monthly",
      priority: 0.85,
      alternates: {
        languages: {
          en: `${BASE}/face-swap`,
          "zh-CN": `${BASE}/zh-CN/faq`,
        },
      },
    },
    { url: `${BASE}/privacy`, lastModified: new Date("2026-05-29"), changeFrequency: "yearly", priority: 0.7 },
    { url: `${BASE}/terms`, lastModified: new Date("2026-05-29"), changeFrequency: "yearly", priority: 0.7 },
    { url: `${BASE}/security`, lastModified: new Date("2026-05-29"), changeFrequency: "yearly", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/checkout`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/auth/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/auth/sign-up`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];
}
