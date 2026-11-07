-- ============================================
-- AI assistant fetches: which pages ChatGPT, Claude, Perplexity and the like open for their users
--
-- When someone asks an assistant a question and it browses, the assistant fetches the page with
-- its own user agent (ChatGPT-User, Claude-User, Perplexity-User, ...). Such a fetch is the
-- closest thing a site can see to "an AI answer used this page". Their search indexers
-- (OAI-SearchBot, Claude-SearchBot, PerplexityBot) decide what can be cited at all. The
-- middleware records both kinds (lib/ai-agents.ts); training crawlers are not recorded.
--
-- One row per fetch: when, which assistant, which kind, which path. No IP, no query string,
-- nothing about a person: the requester is the assistant's server.
--
-- Read on /admin/ai-citations through the two views below.
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_fetches (
  id          BIGSERIAL   PRIMARY KEY,
  fetched_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  agent       TEXT        NOT NULL,
  kind        TEXT        NOT NULL CHECK (kind IN ('answer', 'index')),
  path        TEXT        NOT NULL
);

CREATE INDEX IF NOT EXISTS ai_fetches_fetched_at_idx ON public.ai_fetches (fetched_at DESC);

-- Server-side only: the middleware writes with the service role, the admin page reads with it.
ALTER TABLE public.ai_fetches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.ai_fetches FROM anon, authenticated;

-- Per Pacific day, assistant and kind, for the last 30 days.
CREATE OR REPLACE VIEW public.ai_fetches_daily AS
SELECT (fetched_at AT TIME ZONE 'America/Los_Angeles')::date AS day, agent, kind, count(*)::int AS fetches
FROM public.ai_fetches
WHERE fetched_at > now() - interval '30 days'
GROUP BY 1, 2, 3;

-- Per path over the last 7 days: what assistants opened while answering, and what they indexed.
CREATE OR REPLACE VIEW public.ai_fetches_pages_7d AS
SELECT path,
       count(*) FILTER (WHERE kind = 'answer')::int AS answer_fetches,
       count(*) FILTER (WHERE kind = 'index')::int  AS index_fetches,
       string_agg(DISTINCT agent, ', ' ORDER BY agent) FILTER (WHERE kind = 'answer') AS answer_agents,
       max(fetched_at) AS last_fetched_at
FROM public.ai_fetches
WHERE fetched_at > now() - interval '7 days'
GROUP BY path;

REVOKE ALL ON public.ai_fetches_daily, public.ai_fetches_pages_7d FROM anon, authenticated;

-- Keeping it small (run by hand if it ever matters; nothing here is automatic):
--   DELETE FROM public.ai_fetches WHERE fetched_at < now() - interval '180 days';
