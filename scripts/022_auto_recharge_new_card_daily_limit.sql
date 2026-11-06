-- ============================================
-- Auto top-up: a failed charge on a card the person has since replaced no longer blocks the day
--
-- 018's daily limit counts every attempt in the last 24 hours, failures included, so a run of
-- failures cannot keep hitting a card. But a failed charge also turns auto top-up off, and the
-- only way back on is a new, paid checkout with the box ticked, which saves a card that has just
-- worked and sets a new consented_at. Seen 2026-11-06: a debit card was declined for insufficient
-- funds at 07:05 PT, the person paid with another card at 07:14 and ticked the box again, and auto
-- top-up then could not charge the new card until 07:05 the next day, with 10 credits left.
--
-- Now the daily limit skips failed attempts made before the current consent. Everything else is
-- unchanged:
--   - successful and pending attempts always count, so the new consent never allows a second
--     charge in a day;
--   - the 30-day limit still counts every attempt;
--   - the declined card is not retried: the setting points at the card from the new checkout.
--
-- Same signature, grants and return values as 018, so the running application needs no change.
-- Safe to run more than once.
--
-- Requires: 018.
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
