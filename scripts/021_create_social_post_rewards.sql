-- ============================================
-- Post rewards: a public post about NanoPocket, reviewed by hand, pays credits once
--
-- An account that has used a tool pastes the link to its post (/account). An admin
-- opens the post and approves or rejects it (/admin/social-rewards). Approval
-- pays promo credits keyed on the account (social_post:<user id>), so one account
-- can never be paid twice, whatever happens to these rows.
--
-- A rejected post does not use up the reward: the account may submit another,
-- up to the limit in lib/social-reward.ts. The same post cannot be claimed by two
-- accounts. Reddit is not accepted (see lib/social-reward.ts).
--
-- Requires: 009 (the credit ledger).
-- ============================================

CREATE TABLE IF NOT EXISTS public.social_post_rewards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url             TEXT NOT NULL CHECK (char_length(url) <= 600),
  normalized_url  TEXT NOT NULL CHECK (char_length(normalized_url) <= 600),
  platform        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reject_reason   TEXT CHECK (reject_reason IS NULL OR reject_reason IN ('not_found', 'disclosure', 'off_topic', 'rules')),
  credits         INTEGER,
  reviewed_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One live claim per account, and one per post. Rejected rows don't count.
CREATE UNIQUE INDEX IF NOT EXISTS social_post_rewards_one_per_user
  ON public.social_post_rewards (user_id) WHERE status <> 'rejected';
CREATE UNIQUE INDEX IF NOT EXISTS social_post_rewards_one_per_post
  ON public.social_post_rewards (normalized_url) WHERE status <> 'rejected';
CREATE INDEX IF NOT EXISTS social_post_rewards_review_idx
  ON public.social_post_rewards (status, created_at);

-- Server-side only. RLS on with no policy means anon and authenticated roles
-- see nothing; the service role bypasses RLS.
ALTER TABLE public.social_post_rewards ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.social_post_rewards FROM anon, authenticated;
