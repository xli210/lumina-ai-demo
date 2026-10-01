/**
 * Single source of truth for the three online demos.
 *
 * When a Cloudflare tunnel rotates, edit ONLY this file (and re-deploy).
 * Both the website and the GitHub Actions uptime checker import from here.
 *
 * One of the three no longer lives behind a tunnel: Nano FaceStudio Online is
 * now Nano FaceStudio Online, hosted on nanopocket.ai and metered in credits. See
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
  /**
   * Set when the demo is knowingly offline. `/api/demos/open` then sends the
   * visitor to /demos/unavailable instead of a dead origin, and the cards
   * stop advertising it as something to try.
   *
   * Deliberately a manual switch rather than something derived from the
   * uptime checker. A monitor false positive would otherwise pull a working
   * demo off the site on its own, and the failure it guards against — a
   * retired tunnel — is something we always know about before users do.
   * Setting it is a one-line edit and a deploy.
   */
  maintenance?: {
    /** ISO date it went down, shown to the user so the page is not vague. */
    since: string;
    /** One honest sentence: what happened and what is being done. */
    note: string;
    /** Rough return, or omitted when there is genuinely no estimate. */
    eta?: string;
  };
}

export const DEMOS: DemoEntry[] = [
  {
    id: "image",
    name: "Nano FaceStudio Online",
    // Was a Cloudflare tunnel until that pipeline was retired. Now served by
    // /face-studio against our own RunPod endpoint, priced per render.
    origin: "https://nanopocket.ai",
    // The console, not the /face-studio marketing page: "Try Pro Demo" should
    // open the tool. /face-studio/launch is login-gated, provisions today's
    // free credits, then redirects to /face-studio/index.html.
    landingPath: "/face-studio/launch",
    pingPath: "/face-studio",
    password: null,
    productHref: "/face-studio",
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
    maintenance: {
      since: "2026-09-28",
      note: "The tunnel this demo ran through has been retired. It is being moved onto our own GPU infrastructure, the same one Nano FaceStudio Online now runs on.",
      eta: "No firm date yet",
    },
  },
  {
    id: "vivid",
    name: "NanoFace Vivid",
    origin: "https://sagem-julie-personnel-msg.trycloudflare.com",
    landingPath: "/login",
    pingPath: "/login",
    password: "nanofacevivid",
    productHref: "/apps/nanoface-vivid",
    maintenance: {
      since: "2026-09-28",
      note: "The tunnel this demo ran through has been retired. It is being moved onto our own GPU infrastructure, the same one Nano FaceStudio Online now runs on.",
      eta: "No firm date yet",
    },
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

/** Knowingly offline. Do not send anyone to its origin. */
export function isUnderMaintenance(d: DemoEntry): boolean {
  return d.maintenance !== undefined;
}

/** The demos a visitor can actually use right now. */
export function liveDemos(): DemoEntry[] {
  return DEMOS.filter((d) => !isUnderMaintenance(d));
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
