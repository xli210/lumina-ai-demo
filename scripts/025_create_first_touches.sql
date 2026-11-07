-- ============================================
-- First touch: where each account first came from
--
-- Until 2026-11-07 the site knew who paid but not how they found it: Vercel counts referrers
-- per page view, GA4 is per session, and neither is tied to an account. The browser now keeps
-- its first referrer, landing page and utm tags in the np_ft cookie (lib/first-touch.ts), and
-- the server copies them here the first time an account is given credits and at each checkout
-- (lib/first-touch-server.ts). The first row for an account stays.
--
-- `source` is one label: the utm source (ChatGPT tags its links utm_source=chatgpt.com), else
-- the referring host, else 'direct'.
--
-- Accounts opened before this shipped pick up a cookie written after they were opened; compare
-- first_seen_at with auth.users.created_at and leave those out.
--
-- Server-side only (service role). Safe to run again.
-- ============================================

CREATE TABLE IF NOT EXISTS public.first_touches (
  user_id        UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  source         TEXT        NOT NULL,
  referrer_host  TEXT,
  landing_path   TEXT        NOT NULL,
  utm_source     TEXT,
  utm_medium     TEXT,
  utm_campaign   TEXT,
  click_id       TEXT,
  first_seen_at  TIMESTAMPTZ NOT NULL,
  recorded_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS first_touches_source_idx ON public.first_touches (source);

ALTER TABLE public.first_touches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.first_touches FROM anon, authenticated;

-- Sign-ups and money by source, for accounts whose first touch came before the account:
--
--   WITH paid AS (
--     SELECT payload->'data'->'object'->'metadata'->>'supabase_user_id' AS u,
--            sum((payload->'data'->'object'->>'amount_total')::int) / 100.0 AS usd
--     FROM public.stripe_events WHERE type = 'checkout.session.completed' GROUP BY 1)
--   SELECT f.source, count(*) AS accounts, count(p.u) AS buyers, coalesce(sum(p.usd), 0) AS usd
--   FROM public.first_touches f
--   JOIN auth.users u ON u.id = f.user_id AND f.first_seen_at <= u.created_at + interval '1 hour'
--   LEFT JOIN paid p ON p.u = f.user_id::text
--   GROUP BY 1 ORDER BY usd DESC, accounts DESC;
