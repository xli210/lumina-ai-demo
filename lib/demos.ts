/**
 * Single source of truth for the three free online demos.
 *
 * When a Cloudflare tunnel rotates, edit ONLY this file (and re-deploy).
 * Both the website and the GitHub Actions uptime checker import from here.
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
}

export const DEMOS: DemoEntry[] = [
  {
    id: "image",
    name: "Image FaceSwap Pro 2.0",
    origin: "https://technique-phd-yen-insight.trycloudflare.com",
    landingPath: "/login",
    pingPath: "/login",
    password: "nanofaceswap-pro",
    productHref: "/apps/nano-faceswap-pro/features",
  },
  {
    id: "video",
    name: "Video FaceSwap Pro",
    origin: "https://domain-jewelry-respondents-removal.trycloudflare.com",
    landingPath: "/login",
    pingPath: "/login",
    password: "nanopocket-video",
    productHref: "/apps/nano-faceswap-pro/video",
  },
  {
    id: "vivid",
    name: "NanoFace Vivid",
    origin: "https://plasma-working-null-judgment.trycloudflare.com",
    landingPath: "/",
    pingPath: "/",
    password: "nanofacevivid",
    productHref: "/apps/nanoface-vivid",
  },
];

export function demoUrl(d: DemoEntry): string {
  return `${d.origin}${d.landingPath}`;
}

export function demoPingUrl(d: DemoEntry): string {
  return `${d.origin}${d.pingPath}`;
}

export function getDemo(id: DemoId): DemoEntry {
  const d = DEMOS.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown demo id: ${id}`);
  return d;
}
