-- ============================================
-- Auto top-up: limits in dollars for consents under Terms 1.5 and later
--
-- 018 allowed one charge in 24 hours and three in 30 days. That stops a heavy user: on
-- 2026-11-06 a buyer who spends about 2,500 credits a day on a $5 pack could be topped up with
-- 500 credits once a day. By the owner's decision the limits become amounts:
--   - at most $100 in any 24 hours (the price of the largest pack, Studio);
--   - at most $1,000 in any 30 days.
-- A charge is allowed only if it keeps both sums within the limit, so a $100 pack still fits.
--
-- Who gets which rule is decided by the version of the terms the person agreed to, stored with
-- their consent: what they were shown is what applies.
--   - terms_version 1.5 or later: the dollar limits above, plus no new charge while another is
--     still pending from the last 15 minutes (a charge Stripe is still settling has not added
--     credits yet, so the balance would still look low);
--   - anything earlier, or not a version number: 022's count limits, unchanged (p_max_per_day and
--     p_max_per_month, 1 and 3 as the application passes them).
-- In both, failed attempts made before the current consent do not count (022), and a failed
-- charge still turns auto top-up off, so a card is never retried.
--
-- Same signature, grants and return values as 018 and 022: run this before the application that
-- records version 1.5 is deployed, and nothing changes for anyone until then. Safe to run again.
--
-- Requires: 018, 022.
-- ============================================

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
  v_row          public.auto_recharge%ROWTYPE;
  v_by_amount    BOOLEAN;
  v_day          INTEGER;
  v_month        INTEGER;
  v_day_cents    BIGINT;
  v_month_cents  BIGINT;
  v_attempt      UUID;
  c_day_cents    CONSTANT BIGINT := 10000;   -- $100
  c_month_cents  CONSTANT BIGINT := 100000;  -- $1,000
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

  v_by_amount := v_row.terms_version ~ '^[0-9]+\.[0-9]+$'
    AND string_to_array(v_row.terms_version, '.')::int[] >= ARRAY[1, 5];

  IF v_by_amount THEN
    IF EXISTS (
      SELECT 1 FROM public.auto_recharge_attempts
      WHERE user_id = p_user_id AND status = 'pending' AND created_at > now() - interval '15 minutes'
    ) THEN
      RETURN jsonb_build_object('claimed', false, 'reason', 'pending');
    END IF;

    SELECT coalesce(sum(amount_cents), 0) INTO v_day_cents
    FROM public.auto_recharge_attempts
    WHERE user_id = p_user_id
      AND created_at > now() - interval '24 hours'
      AND NOT (status = 'failed' AND created_at < v_row.consented_at);
    IF v_day_cents + p_amount_cents > c_day_cents THEN
      RETURN jsonb_build_object('claimed', false, 'reason', 'daily_limit');
    END IF;

    SELECT coalesce(sum(amount_cents), 0) INTO v_month_cents
    FROM public.auto_recharge_attempts
    WHERE user_id = p_user_id
      AND created_at > now() - interval '30 days'
      AND NOT (status = 'failed' AND created_at < v_row.consented_at);
    IF v_month_cents + p_amount_cents > c_month_cents THEN
      RETURN jsonb_build_object('claimed', false, 'reason', 'monthly_limit');
    END IF;
  ELSE
    SELECT count(*) INTO v_day
    FROM public.auto_recharge_attempts
    WHERE user_id = p_user_id
      AND created_at > now() - interval '24 hours'
      AND NOT (status = 'failed' AND created_at < v_row.consented_at);
    IF v_day >= p_max_per_day THEN
      RETURN jsonb_build_object('claimed', false, 'reason', 'daily_limit');
    END IF;

    SELECT count(*) INTO v_month
    FROM public.auto_recharge_attempts
    WHERE user_id = p_user_id AND created_at > now() - interval '30 days';
    IF v_month >= p_max_per_month THEN
      RETURN jsonb_build_object('claimed', false, 'reason', 'monthly_limit');
    END IF;
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
