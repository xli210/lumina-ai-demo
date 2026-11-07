/**
 * AI assistants' user agents, as the middleware records them (scripts/024, /admin/ai-citations).
 *
 * "answer": the assistant fetches the page while answering someone, so the page is being read for
 * an answer right now. "index": its search indexer, which decides what it can cite later.
 * Training crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended, ...) are left out: they say nothing
 * about answers. Order matters only where one name contains another; none do here.
 */
const AGENTS: ReadonlyArray<{ token: string; agent: string; kind: "answer" | "index" }> = [
  { token: "chatgpt-user", agent: "ChatGPT", kind: "answer" },
  { token: "claude-user", agent: "Claude", kind: "answer" },
  { token: "perplexity-user", agent: "Perplexity", kind: "answer" },
  { token: "mistralai-user", agent: "Mistral", kind: "answer" },
  { token: "duckassistbot", agent: "DuckDuckGo", kind: "answer" },
  { token: "meta-externalfetcher", agent: "Meta AI", kind: "answer" },
  { token: "oai-searchbot", agent: "ChatGPT", kind: "index" },
  { token: "claude-searchbot", agent: "Claude", kind: "index" },
  { token: "perplexitybot", agent: "Perplexity", kind: "index" },
];

export interface AiAgentMatch {
  agent: string;
  kind: "answer" | "index";
}

export function matchAiAgent(userAgent: string | null): AiAgentMatch | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  for (const a of AGENTS) {
    if (ua.includes(a.token)) return { agent: a.agent, kind: a.kind };
  }
  return null;
}

/** Pages, and llms.txt: assets, API calls and Next internals are not what an answer cites. */
export function isRecordablePath(pathname: string): boolean {
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.startsWith("/admin")) return false;
  if (/^\/llms(?:-full)?\.txt$/.test(pathname)) return true;
  return !/\.(?:js|css|map|ico|json|woff2?|ttf|xml|txt|pdf|zip|exe)$/i.test(pathname);
}
