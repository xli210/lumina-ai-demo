import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { ZH_GUIDES, zhGuideFor } from "@/lib/zh-guides";
import { appReleases } from "@/lib/release-data";
import { IMAGE_EDIT_USE_CASES } from "@/lib/image-edit-use-cases";
import { VIDEO_EXAMPLES, VIDEO_EXAMPLES_PATH, videoExamplePath } from "@/lib/video-examples";
import { TRANSLATED_PAGES } from "@/lib/i18n/locales";

const BASE = "https://nanopocket.ai";

// `lastModified` is the date a page's content last changed, not the build
// time. Stamping every URL with new Date() on each deploy tells crawlers that
// everything changed every time, which teaches them to ignore the field.
// /status is the exception: its content is live.

function latestReleaseDate(dates: string[]): Date {
  const times = dates.map((d) => new Date(d).getTime()).filter((t) => !Number.isNaN(t));
  return new Date(times.length ? Math.max(...times) : "2026-03-19");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const blogEntries = BLOG_POSTS.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
    // A guide with a Chinese counterpart points at it, and the counterpart points back.
    ...(zhGuideFor(post.slug)
      ? { alternates: { languages: { en: `${BASE}/blog/${post.slug}`, "zh-CN": `${BASE}/zh-CN/guides/${post.slug}` } } }
      : {}),
  }));
  const zhGuideEntries = [
    { url: `${BASE}/zh-CN/guides`, lastModified: new Date("2026-10-30"), changeFrequency: "weekly" as const, priority: 0.8 },
    ...ZH_GUIDES.map((g) => ({
      url: `${BASE}/zh-CN/guides/${g.slug}`,
      lastModified: new Date(g.date),
      changeFrequency: "monthly" as const,
      priority: 0.75,
      ...(g.english === false
        ? {}
        : { alternates: { languages: { en: `${BASE}/blog/${g.slug}`, "zh-CN": `${BASE}/zh-CN/guides/${g.slug}` } } }),
    })),
  ];

  const releaseNoteEntries = appReleases.map((app) => ({
    url: `${BASE}/release-notes/${app.slug}`,
    lastModified: latestReleaseDate(app.releases.map((r) => r.date)),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const homeLanguages: Record<string, string> = { en: BASE };
  for (const l of TRANSLATED_PAGES["/"]) homeLanguages[l] = `${BASE}/${l}`;

  /** A page's English address and its translations, each pointing at all the others. */
  const translatedEntries = (path: string, changeFrequency: "weekly" | "daily", priority: number, lastModified: string) => {
    const languages: Record<string, string> = { en: `${BASE}${path}`, "x-default": `${BASE}${path}` };
    for (const l of TRANSLATED_PAGES[path]) languages[l] = `${BASE}/${l}${path}`;
    return [
      { url: `${BASE}${path}`, lastModified: new Date(lastModified), changeFrequency, priority, alternates: { languages } },
      ...TRANSLATED_PAGES[path].map((l) => ({
        url: `${BASE}/${l}${path}`,
        lastModified: new Date("2026-11-01"),
        changeFrequency: "weekly" as const,
        priority: priority - 0.1,
        alternates: { languages },
      })),
    ];
  };

  return [
    {
      url: BASE,
      lastModified: new Date("2026-10-30"),
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: { languages: homeLanguages },
    },
    ...TRANSLATED_PAGES["/"].map((l) => ({
      url: `${BASE}/${l}`,
      lastModified: new Date("2026-11-01"),
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: { languages: homeLanguages },
    })),
    // Nano FaceStudio Online. High priority because it is the only indexable description
    // of the hosted product, and because /api/demos/open?id=image — every
    // "Try online" button on the site — now lands on it.
    ...translatedEntries("/face-studio", "weekly", 0.95, "2026-10-30"),
    // Nano ImageEdit 2.0 Online landing page; the editor itself is auth-gated.
    ...translatedEntries("/image-edit", "weekly", 0.95, "2026-10-30"),
    // Video FaceSwap Online 1.1.0: the public page of the release (its studio is behind sign-in).
    ...translatedEntries("/headswap-pro", "weekly", 0.9, "2026-10-30"),
    ...translatedEntries("/facestudio-v", "daily", 0.95, "2026-10-30"),
    // One watch page per example clip, so Google can index the videos (see lib/video-examples.ts).
    { url: `${BASE}${VIDEO_EXAMPLES_PATH}`, lastModified: new Date("2026-10-30"), changeFrequency: "monthly", priority: 0.8 },
    ...VIDEO_EXAMPLES.map((v) => ({ url: `${BASE}${videoExamplePath(v)}`, lastModified: new Date("2026-10-30"), changeFrequency: "monthly" as const, priority: 0.6 })),
    // The catalogue of desktop apps and the index of release notes: the parents of the per-app pages.
    { url: `${BASE}/apps`, lastModified: new Date("2026-10-21"), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/video-face-swap-test-results`, lastModified: new Date("2026-10-24"), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/video-head-swap`, lastModified: new Date("2026-11-08"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/release-notes`, lastModified: new Date("2026-10-21"), changeFrequency: "weekly", priority: 0.7 },
    // What everything costs: read from the code that charges it, so it is always current.
    ...translatedEntries("/pricing", "weekly", 0.9, "2026-10-21"),
    { url: `${BASE}/use-cases`, lastModified: new Date("2026-10-05"), changeFrequency: "monthly", priority: 0.8 },
    ...IMAGE_EDIT_USE_CASES.map((u) => ({ url: `${BASE}/use-cases/${u.slug}`, lastModified: new Date("2026-10-05"), changeFrequency: "monthly" as const, priority: 0.85 })),
    // The index changes whenever a post is added, so it carries the newest post's date.
    { url: `${BASE}/blog`, lastModified: new Date(Math.max(...BLOG_POSTS.map((p) => new Date(p.date).getTime()))), changeFrequency: "weekly", priority: 0.8 },
    ...blogEntries,
    ...zhGuideEntries,
    ...releaseNoteEntries,
    // 10 SEO product landings
    { url: `${BASE}/apps/nanoface-vivid`, lastModified: new Date("2026-06-02"), changeFrequency: "weekly", priority: 0.9 },
    ...(() => {
      const faceSwapLocales = TRANSLATED_PAGES["/face-swap"];
      const faceSwapLanguages: Record<string, string> = { en: `${BASE}/face-swap` };
      for (const l of faceSwapLocales) faceSwapLanguages[l] = `${BASE}/${l}/face-swap`;
      return [
        {
          url: `${BASE}/face-swap`,
          lastModified: new Date("2026-10-30"),
          changeFrequency: "weekly" as const,
          priority: 0.95,
          alternates: { languages: faceSwapLanguages },
        },
        ...faceSwapLocales.map((l) => ({
          url: `${BASE}/${l}/face-swap`,
          lastModified: new Date("2026-10-30"),
          changeFrequency: "weekly" as const,
          priority: 0.9,
          alternates: { languages: faceSwapLanguages },
        })),
      ];
    })(),
    { url: `${BASE}/compare/nanopocket-vs-wavespeed`, lastModified: new Date("2026-10-30"), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/status`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.6 },
    ...translatedEntries("/apps/nano-facestudio-pro", "weekly", 0.95, "2026-07-09"),
    { url: `${BASE}/apps/nano-imageenh-pro`, lastModified: new Date("2026-05-29"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/apps/nano-videoenhance`, lastModified: new Date("2026-05-29"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/apps/nano-videogen`, lastModified: new Date("2026-05-29"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/apps/nano-imageedit`, lastModified: new Date("2026-05-29"), changeFrequency: "monthly", priority: 0.85 },
    ...translatedEntries("/apps/nano-facialedit", "weekly", 0.8, "2026-05-29"),
    ...translatedEntries("/apps/nano-imagetryon", "weekly", 0.8, "2026-05-29"),
    ...translatedEntries("/apps/nano-faceswap", "weekly", 0.8, "2026-05-29"),
    { url: `${BASE}/best-face-swap-app-2026`, lastModified: new Date("2026-10-30"), changeFrequency: "monthly", priority: 0.95 },
    { url: `${BASE}/compare`, lastModified: new Date("2026-10-30"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/compare/nanopocket-vs-reface`, lastModified: new Date("2026-10-30"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/compare/nanopocket-vs-deepswap`, lastModified: new Date("2026-10-30"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/compare/nanopocket-vs-facefusion`, lastModified: new Date("2026-10-30"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/compare/nanopocket-vs-akool`, lastModified: new Date("2026-10-30"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/compare/nanopocket-vs-magic-hour`, lastModified: new Date("2026-10-30"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/compare/nanopocket-vs-nano-banana`, lastModified: new Date("2026-06-02"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/about`, lastModified: new Date("2026-06-02"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/trust`, lastModified: new Date("2026-10-30"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/verify`, lastModified: new Date("2026-10-30"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/community`, lastModified: new Date("2026-05-29"), changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE}/docs`, lastModified: new Date("2026-06-04"), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/docs/face-swap-pipeline`, lastModified: new Date("2026-10-30"), changeFrequency: "monthly", priority: 0.9 },
    // Live figures: recomputed on every load, so "today" is when they last changed.
    { url: `${BASE}/data/face-swap-stats`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    {
      url: `${BASE}/zh-CN/faq`,
      lastModified: new Date("2026-10-30"),
      changeFrequency: "monthly",
      priority: 0.85,
      alternates: {
        languages: {
          en: `${BASE}/face-swap`,
          "zh-CN": `${BASE}/zh-CN/faq`,
        },
      },
    },
    { url: `${BASE}/privacy`, lastModified: new Date("2026-10-30"), changeFrequency: "yearly", priority: 0.7 },
    { url: `${BASE}/terms`, lastModified: new Date("2026-10-30"), changeFrequency: "yearly", priority: 0.7 },
    { url: `${BASE}/security`, lastModified: new Date("2026-10-30"), changeFrequency: "yearly", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: new Date("2026-03-19"), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/business`, lastModified: new Date("2026-11-07"), changeFrequency: "monthly", priority: 0.6 },
  ];
}
