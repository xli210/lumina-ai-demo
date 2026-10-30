// One public watch page per Video FaceSwap Online example clip, at /video-face-swap-examples/<slug>.
//
// Search Console found the nineteen clips on /facestudio-v as valid VideoObjects but indexed none of
// them: Google indexes a video only where it is the main content of the page, and on /facestudio-v
// they are illustrations on a product page. Each clip gets a page of its own here, built from the
// same list as the video sitemap and the markup on /facestudio-v (lib/facestudio-v-videos.ts).

import { FACESTUDIO_V_VIDEOS, type FacestudioVVideo } from "@/lib/facestudio-v-videos";

export const VIDEO_EXAMPLES_PATH = "/video-face-swap-examples";

export interface VideoExample extends FacestudioVVideo {
  slug: string;
  /** Whole-head swap (hair and head shape replaced) rather than a face swap. */
  headSwap: boolean;
  /**
   * The description without its last clause, which points at the original clip and reference face shown
   * beside the result on /facestudio-v; a watch page shows the result alone.
   */
  summary: string;
}

export const VIDEO_EXAMPLES: readonly VideoExample[] = FACESTUDIO_V_VIDEOS.map((v) => ({
  ...v,
  slug: v.key.replace(/_/g, "-"),
  headSwap: v.key.startsWith("h3_"),
  summary: v.description
    .replace(/: the swapped video, with the original clip and the reference face beside it on the page\.$/, ".")
    .replace(/ Shown beside the original clip and the reference face used\.$/, ""),
}));

export function videoExample(slug: string): VideoExample | undefined {
  return VIDEO_EXAMPLES.find((v) => v.slug === slug);
}

export function videoExamplePath(v: VideoExample): string {
  return `${VIDEO_EXAMPLES_PATH}/${v.slug}`;
}

/** ISO 8601 duration for VideoObject, whole seconds. */
export function isoDuration(seconds: number): string {
  return `PT${Math.max(1, Math.round(seconds))}S`;
}
