-- ============================================
-- Referrals: invite a friend, both get credits when the friend first buys
--
-- Every account can have one invite code (referral_codes). A visitor who
-- arrives through https://nanopocket.ai/?ref=<code> carries the code in a
-- first-party cookie (np_ref, 30 days, see middleware.ts). When that visitor
-- opens a new account, the account is linked to the inviter (referrals).
-- Nothing is paid at signup: free credits at signup are what a person with
-- many accounts farms. The reward is paid when the invited account first buys
-- credits with real money (app/api/webhooks/stripe), as two promo grants keyed
-- on the invited account, so a webhook redelivery cannot pay twice.
--
-- A second account opened on the inviter's own browser or network is refused
-- free credits by free_credit_claim (015) and is never linked, so inviting
-- yourself does not work in the common case. Paying for your own invite still
-- costs more than the reward.
--
-- Requires: 009 (the credit ledger).
-- ============================================

CREATE TABLE IF NOT EXISTS public.referral_codes (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code        TEXT NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9]{8}$'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.referrals (
  referred_user_id  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code              TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  rewarded_at       TIMESTAMPTZ,
  reward_payment_intent TEXT,
  CHECK (referred_user_id <> referrer_user_id)
);

CREATE INDEX IF NOT EXISTS referrals_referrer_idx
  ON public.referrals (referrer_user_id, created_at DESC);

-- Server-side only. RLS on with no policy means anon and authenticated roles
-- see nothing; the service role bypasses RLS.
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.referral_codes FROM anon, authenticated;
REVOKE ALL ON TABLE public.referrals FROM anon, authenticated;

-- ------------------------------------------------------------
-- Looking at it (run in the SQL editor):
--
--   -- Inviters, how many signed up and how many have bought.
--   SELECT referrer_user_id, count(*) AS signups,
--          count(rewarded_at) AS bought
--   FROM public.referrals GROUP BY 1 ORDER BY 2 DESC;
-- ------------------------------------------------------------
