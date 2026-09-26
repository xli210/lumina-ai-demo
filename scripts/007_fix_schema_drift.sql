-- ============================================
-- MIGRATION 007: close two gaps between the code and the schema
--
-- Nothing here is part of the credit system itself. These are pre-existing
-- drifts that the credit work surfaced, and the credit migrations assume a
-- consistent baseline, so they are fixed first.
--
-- 1. licenses.is_trial / licenses.trial_ends_at
--    Read and written in app/api/license/{claim,activate,verify,my-licenses,
--    test-grant}/route.ts and app/api/webhooks/stripe/route.ts, but created
--    by no migration in this directory. They exist in production only
--    because someone added them by hand. Re-running 002 on a fresh database
--    therefore produces a schema the application cannot run against.
--
-- 2. profiles.stripe_customer_id
--    The checkout flow currently creates a Session with no Customer object
--    (app/actions/stripe.ts), so a user's payments are not linked to
--    anything reusable. The credit system needs a stable Customer per user
--    so top-ups are attributable and receipts/saved cards work later.
--
-- Safe to re-run.
-- ============================================

-- --------------------------------------------
-- 1. licenses trial columns
-- --------------------------------------------
ALTER TABLE public.licenses
  ADD COLUMN IF NOT EXISTS is_trial BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.licenses
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

COMMENT ON COLUMN public.licenses.is_trial IS
  'True while the license is a time-limited trial. The Stripe webhook flips '
  'this to false (and nulls trial_ends_at) when the trial is upgraded, '
  'deliberately keeping the same license_key so the desktop app does not '
  'need to be re-activated.';

COMMENT ON COLUMN public.licenses.trial_ends_at IS
  'Expiry for trial licenses; NULL for permanent ones. Enforced in the '
  'activate/verify routes, not by the database.';

-- The webhook looks up an existing trial on every purchase
-- (user_id + product_id + is_trial + is_revoked). Without this it is a
-- sequential scan on a table that grows with every sale.
CREATE INDEX IF NOT EXISTS idx_licenses_user_product_trial
  ON public.licenses (user_id, product_id)
  WHERE is_trial = true AND is_revoked = false;

-- --------------------------------------------
-- 2. profiles.stripe_customer_id
-- --------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- One Stripe Customer per profile, and one profile per Stripe Customer.
-- A duplicate here would mean two users sharing a payment identity, so it is
-- worth a constraint rather than an application-level check.
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

COMMENT ON COLUMN public.profiles.stripe_customer_id IS
  'Stripe Customer id, created lazily on the first credit top-up. Writable '
  'only by the service role — migration 008 removes the blanket UPDATE grant '
  'that would otherwise let a user set this on their own row.';
