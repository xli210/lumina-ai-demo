import type { MetadataRoute } from "next";

// Robots policy.
//
// Goals:
//   1. Explicitly allow major search-engine crawlers (Google, Bing, Yandex,
//      Baidu, Sogou, 360, Naver, Yandex, DuckDuckGo, Apple).
//   2. Explicitly allow major LLM crawlers (OpenAI, Anthropic, Google Gemini,
//      Perplexity, Apple Intelligence, Common Crawl) — these power citation
//      surfaces in ChatGPT, Claude, Gemini, Perplexity, and DeepSeek.
//   3. Block known SEO/scraper bots that contribute negative signal
//      (AhrefsBot, SemrushBot, etc.) so crawl budget goes to the bots that
//      actually drive organic discovery.
//   4. Disallow private, transactional, and admin paths for everyone.
//
// References:
//   - GPTBot: https://platform.openai.com/docs/gptbot
//   - OAI-SearchBot, ChatGPT-User: https://platform.openai.com/docs/bots
//   - Google-Extended (Gemini training opt-in): https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers#google-extended
//   - GoogleOther (Search Generative Experience and discovery): same page.
//   - ClaudeBot: https://support.anthropic.com/en/articles/8896518
//   - PerplexityBot: https://docs.perplexity.ai/guides/bots
//   - Applebot-Extended: https://support.apple.com/en-us/119829
//   - CCBot (Common Crawl, used by every major LLM at training): https://commoncrawl.org/ccbot
//   - Bytespider (TikTok / Doubao / DeepSeek): https://www.bytespider.com
//   - Baiduspider: https://help.baidu.com/question?prod_id=99&class=476&id=3001
//   - Sogou web spider, 360Spider, YisouSpider: standard CN search engines.
//   - Naver Yeti, Daum: standard KR search engines.

const PRIVATE_DISALLOW = [
  "/admin",
  "/admin/",
  "/account",
  "/account/",
  "/api/",
  "/auth/reset-password",
  "/auth/error",
  "/checkout/success",
  // Internal / unlisted preview pages — the URL itself is the shared secret,
  // and the pages also emit `noindex,nofollow` meta at render time.
  "/apps/nano-facestudio-pro/internal-preview",
  // API-proxy demo previews (NanoFace Vivid + Face Studio face-swap).
  // Both the wrapper pages and the underlying handoff HTML in
  // public/private-demos/** are admin-gated by middleware; the robots
  // block is defense-in-depth against accidental indexing.
  "/private-demos",
  "/private-demos/",
];

const ALLOWED_AI_AND_SEARCH_BOTS = [
  // Western search engines
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-Video",
  "Googlebot-News",
  "GoogleOther",
  "GoogleOther-Image",
  "GoogleOther-Video",
  "Google-Extended",
  "Bingbot",
  "DuckDuckBot",
  "Slurp", // Yahoo
  "Applebot",
  "YandexBot",
  "YandexImages",
  "YandexVideo",
  // CJK search engines
  "Baiduspider",
  "Baiduspider-image",
  "Baiduspider-video",
  "Baiduspider-news",
  "Baiduspider-favo",
  "Sogou web spider",
  "Sogou inst spider",
  "Sogou Pic Spider",
  "360Spider",
  "360Spider-Image",
  "360Spider-Video",
  "HaoSouSpider",
  "YisouSpider",
  "Yeti", // Naver
  "Daum", // Daum (KR)
  "Y!J-MMP", // Yahoo Japan
  "Y!J-WSC", // Yahoo Japan
  // LLM crawlers
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot-Extended",
  "Amazonbot",
  "CCBot",
  "Bytespider",
  "DeepSeekBot",
  "Diffbot",
  "FacebookBot",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "MistralAI-User",
  "cohere-ai",
];

const BLOCKED_SCRAPER_BOTS = [
  // Known SEO crawlers that mine the site for backlink graphs without
  // returning value. Disallowed entirely.
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "BLEXBot",
  "PetalBot",
  "rogerbot",
  "MegaIndex",
  "DataForSeoBot",
  "AwarioRssBot",
  "AwarioSmartBot",
  "magpie-crawler",
  "TweetmemeBot",
  // Aggressive content scrapers
  "SerpstatBot",
  "SiteAuditBot",
];

export default function robots(): MetadataRoute.Robots {
  const allowedRules = ALLOWED_AI_AND_SEARCH_BOTS.map((userAgent) => ({
    userAgent,
    allow: "/",
    disallow: PRIVATE_DISALLOW,
  }));

  const blockedRules = BLOCKED_SCRAPER_BOTS.map((userAgent) => ({
    userAgent,
    disallow: "/",
  }));

  return {
    rules: [
      // Default rule for any unlisted user agent: allow public content,
      // disallow private/admin/transactional paths.
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_DISALLOW,
      },
      ...allowedRules,
      ...blockedRules,
    ],
    sitemap: [
      "https://nanopocket.ai/sitemap.xml",
      "https://nanopocket.ai/sitemap-images.xml",
    ],
    host: "https://nanopocket.ai",
  };
}
