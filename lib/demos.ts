/**
 * Single source of truth for the three online demos.
 *
 * When a Cloudflare tunnel rotates, edit ONLY this file (and re-deploy).
 * Both the website and the GitHub Actions uptime checker import from here.
 *
 * One of the three no longer lives behind a tunnel: Image FaceSwap Pro 2.0 is
 * now Face Studio, hosted on nanopocket.ai and metered in credits. See
 * `internal` and `metered` below, and docs/face-studio.md.
 */

export type DemoId = "image" | "video" | "vivid";

export interface DemoEntry {
  id: DemoId;
  /** Display name. */
  name: string;
  /** Public origin (no trailing slash, no path). */
  origin: string;
  /** Path the user should land on (login page or root). */
  landingPath: string;
  /** Path the uptime checker should ping. Should return 2xx/3xx without auth. */
  pingPath: string;
  /** Human-readable demo password, or null if no gate. */
  password: string | null;
  /** Internal product page on nanopocket.ai for context. */
  productHref: string;
  /**
   * True when this runs on nanopocket.ai itself rather than behind a tunnel,
   * in which case `landingPath` is a site-relative route. Callers should
   * redirect to it directly instead of to an external origin.
   */
  internal?: boolean;
  /**
   * True when credits pay for it. The free per-day demo quota is skipped for
   * these: the balance is already the limit, and charging a user credits and
   * then also refusing them at 10 opens a day would be two limits for one
   * thing.
   */
  metered?: boolean;
}

export const DEMOS: DemoEntry[] = [
  {
    id: "image",
    name: "Image FaceSwap Pro 2.0",
    // Was a Cloudflare tunnel until that pipeline was retired. Now served by
    // /face-studio against our own RunPod endpoint, priced per render.
    origin: "https://nanopocket.ai",
    landingPath: "/face-studio",
    pingPath: "/face-studio",
    password: null,
    productHref: "/apps/nano-faceswap-pro/features",
    internal: true,
    metered: true,
  },
  {
    id: "video",
    name: "Video FaceSwap Pro",
    origin: "https://lay-bedroom-jail-planet.trycloudflare.com",
    landingPath: "/",
    pingPath: "/",
    password: "nanopocket-video",
    productHref: "/apps/nano-faceswap-pro/video",
  },
  {
    id: "vivid",
    name: "NanoFace Vivid",
    origin: "https://sagem-julie-personnel-msg.trycloudflare.com",
    landingPath: "/login",
    pingPath: "/login",
    password: "nanofacevivid",
    productHref: "/apps/nanoface-vivid",
  },
];

export function demoUrl(d: DemoEntry): string {
  return `${d.origin}${d.landingPath}`;
}

/** Runs on nanopocket.ai rather than behind a tunnel. */
export function isInternalDemo(d: DemoEntry): boolean {
  return d.internal === true;
}

/** Paid per use in credits, so the free daily quota does not apply. */
export function isMeteredDemo(d: DemoEntry): boolean {
  return d.metered === true;
}

export function demoPingUrl(d: DemoEntry): string {
  return `${d.origin}${d.pingPath}`;
}

/**
 * Site-internal wrapper URL that user-facing buttons should point at.
 *
 * The path routes through /api/demos/open which auth-gates and enforces the
 * per-user, per-day quota (see lib/demo-quota.ts + scripts/006_create_demo_usage_daily.sql)
 * before 302-redirecting to the actual Cloudflare tunnel origin.
 *
 * ANY user-facing "Try free online" / "Try Pro Demo" / "Open in browser"
 * button should use this instead of demoUrl(demo). demoUrl() is now reserved
 * for internal machinery (status page, uptime checker) that needs the raw
 * origin.
 */
export function demoRedirectPath(id: DemoId): string {
  return `/api/demos/open?id=${id}`;
}

export function getDemo(id: DemoId): DemoEntry {
  const d = DEMOS.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown demo id: ${id}`);
  return d;
}
