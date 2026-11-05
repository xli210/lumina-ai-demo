/** Post rewards (scripts/021): the rules, safe to import from both client and server. */

/** Paid once per account. */
export const SOCIAL_REWARD_CREDITS = 100;

/** Rejected posts an account may replace before it runs out of tries. */
export const SOCIAL_REWARD_MAX_TRIES = 3;

/**
 * Reddit is left out on purpose: posts paid for in credits are the thing its communities ban, and a
 * ban there can land on the whole nanopocket.ai domain, not on one post.
 */
const PLATFORM_HOSTS: Record<string, string[]> = {
  x: ["x.com", "twitter.com"],
  tiktok: ["tiktok.com"],
  instagram: ["instagram.com"],
  youtube: ["youtube.com", "youtu.be"],
  facebook: ["facebook.com", "fb.watch"],
  threads: ["threads.net", "threads.com"],
  linkedin: ["linkedin.com"],
  xiaohongshu: ["xiaohongshu.com", "xhslink.com"],
  douyin: ["douyin.com"],
  bilibili: ["bilibili.com", "b23.tv"],
};

export const SOCIAL_PLATFORM_LABELS: Record<string, string> = {
  x: "X",
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  threads: "Threads",
  linkedin: "LinkedIn",
  xiaohongshu: "Xiaohongshu",
  douyin: "Douyin",
  bilibili: "Bilibili",
};

export type SocialRejectReason = "not_found" | "disclosure" | "off_topic" | "rules";
export const SOCIAL_REJECT_REASONS: SocialRejectReason[] = ["not_found", "disclosure", "off_topic", "rules"];

export type SocialSubmitError = "invalid" | "platform" | "reddit" | "used" | "done" | "not_eligible" | "failed";

function hostMatches(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

/**
 * Which platform a pasted link belongs to, and the form used to spot the same post pasted twice: no query
 * string (except YouTube's video id), no tracking, no trailing slash. A link to a bare site or profile home
 * has no path and is refused here; whether the path really is a post is checked by hand.
 */
export function parseSocialPostUrl(
  raw: string,
): { platform: string; url: string; normalized: string } | { error: "invalid" | "platform" | "reddit" } {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { error: "invalid" };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return { error: "invalid" };
  if (raw.length > 600) return { error: "invalid" };

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (hostMatches(host, "reddit.com") || host === "redd.it") return { error: "reddit" };

  const platform = Object.keys(PLATFORM_HOSTS).find((p) => PLATFORM_HOSTS[p].some((d) => hostMatches(host, d)));
  if (!platform) return { error: "platform" };

  const path = parsed.pathname.replace(/\/+$/, "");
  if (!path) return { error: "invalid" };

  const videoId = platform === "youtube" ? parsed.searchParams.get("v") : null;
  const site = host.replace(/^(m|mobile)\./, "");
  const normalized = `${site}${path}${videoId ? `?v=${videoId}` : ""}`;
  parsed.protocol = "https:";
  return { platform, url: parsed.toString(), normalized };
}
