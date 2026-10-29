-- ============================================
-- Auto top-up: an opt-in that buys the same credit pack again when the balance runs low
--
-- Off by default. A person turns it on with a checkbox while buying a pack; that purchase
-- also saves the card with Stripe for off-session use. When a job settles and the balance
-- is below the pack's threshold, the application charges the saved card for the same pack
-- and grants the credits (lib/auto-recharge.ts). The extra bonus for auto top-ups is
-- applied by the application, not here.
--
-- Two tables:
--
--   auto_recharge           one row per person who has ever turned it on: which pack, which
--                           saved card, when they agreed to what version of the terms, and,
--                           if it is off, why.
--   auto_recharge_attempts  one row per charge we tried. It is the audit trail, and it is what
--                           the frequency limit counts.
--
-- `auto_recharge_claim` is the only way to start a charge. It takes a lock on the person's row,
-- checks that auto top-up is on and under its limits, and records the attempt, in one step, so
-- two jobs finishing at the same moment cannot both charge the card.
--
-- Limits (arguments, so they can change without a migration): at most one attempt in any 24
-- hours and three in any 30 days. Every attempt counts, whatever became of it, so a run of
-- failures cannot keep hitting a card either.
--
-- Nothing here stores card details: payment_method_id is Stripe's opaque id.
--
-- Requires: 009 (the credit ledger).
-- ============================================

CREATE TABLE IF NOT EXISTS public.auto_recharge (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id           TEXT NOT NULL,
  payment_method_id TEXT,
  enabled           BOOLEAN NOT NULL DEFAULT true,
  consented_at      TIMESTAMPTZ NOT NULL,
  terms_version     TEXT NOT NULL,
  disabled_reason   TEXT
                    CHECK (disabled_reason IS NULL OR disabled_reason IN
                      ('user', 'card_declined', 'authentication_required', 'dispute', 'no_payment_method', 'other')),
  disabled_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.auto_recharge_attempts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id           TEXT NOT NULL,
  amount_cents      INTEGER NOT NULL CHECK (amount_cents > 0),
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'succeeded', 'failed')),
  payment_intent_id TEXT,
  failure_code      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS auto_recharge_attempts_user_idx
  ON public.auto_recharge_attempts (user_id, created_at DESC);

-- Server-side only. RLS on with no policy means anon and authenticated roles see nothing;
-- the service role bypasses RLS. The credits page reads a person's own row through the server.
ALTER TABLE public.auto_recharge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_recharge_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.auto_recharge FROM anon, authenticated;
REVOKE ALL ON TABLE public.auto_recharge_attempts FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.auto_recharge_claim(
  p_user_id        UUID,
  p_amount_cents   INTEGER,
  p_max_per_day    INTEGER DEFAULT 1,
  p_max_per_month  INTEGER DEFAULT 3
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row     public.auto_recharge%ROWTYPE;
  v_day     INTEGER;
  v_month   INTEGER;
  v_attempt UUID;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id is required';
  END IF;

  -- The row lock is what serialises two jobs that settle together for one person.
  SELECT * INTO v_row
  FROM public.auto_recharge
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND OR NOT v_row.enabled THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'off');
  END IF;

  IF v_row.payment_method_id IS NULL THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'no_payment_method');
  END IF;

  SELECT count(*) INTO v_day
  FROM public.auto_recharge_attempts
  WHERE user_id = p_user_id AND created_at > now() - interval '24 hours';
  IF v_day >= p_max_per_day THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'daily_limit');
  END IF;

  SELECT count(*) INTO v_month
  FROM public.auto_recharge_attempts
  WHERE user_id = p_user_id AND created_at > now() - interval '30 days';
  IF v_month >= p_max_per_month THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'monthly_limit');
  END IF;

  INSERT INTO public.auto_recharge_attempts (user_id, pack_id, amount_cents)
  VALUES (p_user_id, v_row.pack_id, p_amount_cents)
  RETURNING id INTO v_attempt;

  RETURN jsonb_build_object(
    'claimed', true,
    'attempt_id', v_attempt,
    'pack_id', v_row.pack_id,
    'payment_method_id', v_row.payment_method_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.auto_recharge_claim(UUID, INTEGER, INTEGER, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_recharge_claim(UUID, INTEGER, INTEGER, INTEGER)
  TO service_role;

-- ------------------------------------------------------------
-- Looking at it (run in the SQL editor; nothing here is automatic):
--
--   -- Who has it on, and how often it has charged.
--   SELECT r.user_id, r.pack_id, r.enabled, r.disabled_reason,
--          count(a.id) FILTER (WHERE a.status = 'succeeded') AS charged,
--          count(a.id) FILTER (WHERE a.status = 'failed')    AS failed
--   FROM public.auto_recharge r
--   LEFT JOIN public.auto_recharge_attempts a USING (user_id)
--   GROUP BY 1, 2, 3, 4 ORDER BY charged DESC;
--
--   -- Attempts that never settled (a crash between claiming and charging).
--   SELECT * FROM public.auto_recharge_attempts
--   WHERE status = 'pending' AND created_at < now() - interval '15 minutes';
-- ------------------------------------------------------------
