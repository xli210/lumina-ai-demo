-- ============================================
-- Free credits: one claim per device and per network
--
-- New accounts get a one-off welcome grant, and every account is topped up to a
-- small daily allowance. Both are free, so both can be farmed by opening many
-- accounts (several free Gmail addresses is enough). The daily top-up is the
-- bigger leak: a welcome grant is paid once per account, the top-up every day.
--
-- This table records, once per account, which device and network it first
-- claimed from, and `free_credit_claim` decides whether that claim is allowed:
--
--   * one claim per device (an httpOnly first-party cookie, forever), and
--   * one claim per network (the visitor's IP, for ip_window_days),
--
-- where "claim" means a granted claim made under this rule. Accounts that
-- already held welcome credits before this migration are recorded as
-- 'grandfathered': they keep what they have, they count against a *device*
-- (so an old account does not get a second life on the same browser), and they
-- do not count against an IP, so the rule does not sweep up the network of
-- every existing customer.
--
-- Nothing here stores a raw IP address or a raw device id. Both arrive as
-- keyed hashes made by the application (see lib/free-claim.ts).
--
-- A blocked account is not locked out: it can still buy credits, and the
-- application treats any account that has bought credits as eligible again.
--
-- Requires: 009 (the credit ledger).
-- ============================================

CREATE TABLE IF NOT EXISTS public.free_credit_claims (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  outcome      TEXT NOT NULL
               CHECK (outcome IN ('granted', 'blocked_ip', 'blocked_device', 'grandfathered')),
  ip_hash      TEXT,
  device_hash  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS free_credit_claims_ip_idx
  ON public.free_credit_claims (ip_hash, created_at)
  WHERE ip_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS free_credit_claims_device_idx
  ON public.free_credit_claims (device_hash)
  WHERE device_hash IS NOT NULL;

-- Server-side only. RLS on with no policy means anon and authenticated roles
-- see nothing; the service role bypasses RLS.
ALTER TABLE public.free_credit_claims ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.free_credit_claims FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.free_credit_claim(
  p_user_id         UUID,
  p_ip_hash         TEXT,
  p_device_hash     TEXT,
  p_max_per_ip      INTEGER DEFAULT 1,
  p_max_per_device  INTEGER DEFAULT 1,
  p_ip_window_days  INTEGER DEFAULT 30,
  p_grandfather     BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing TEXT;
  v_outcome  TEXT := 'granted';
  v_count    INTEGER;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id is required';
  END IF;

  -- Serialise claims that share a key, so two signups arriving together from
  -- one device cannot both pass the count below. The IP lock is always taken
  -- before the device lock, and the two live in different namespaces, so two
  -- callers can never wait on each other's locks.
  IF p_ip_hash IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(hashtextextended('free_claim:ip:' || p_ip_hash, 0));
  END IF;
  IF p_device_hash IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(hashtextextended('free_claim:device:' || p_device_hash, 0));
  END IF;

  -- One verdict per account, ever. A retry or a second request returns it.
  SELECT outcome INTO v_existing
  FROM public.free_credit_claims
  WHERE user_id = p_user_id;
  IF FOUND THEN
    RETURN jsonb_build_object('outcome', v_existing, 'applied', false);
  END IF;

  IF p_grandfather THEN
    v_outcome := 'grandfathered';
  ELSE
    IF p_device_hash IS NOT NULL THEN
      SELECT count(*) INTO v_count
      FROM public.free_credit_claims
      WHERE device_hash = p_device_hash
        AND outcome IN ('granted', 'grandfathered');
      IF v_count >= p_max_per_device THEN
        v_outcome := 'blocked_device';
      END IF;
    END IF;

    IF v_outcome = 'granted' AND p_ip_hash IS NOT NULL THEN
      SELECT count(*) INTO v_count
      FROM public.free_credit_claims
      WHERE ip_hash = p_ip_hash
        AND outcome = 'granted'
        AND created_at > now() - make_interval(days => p_ip_window_days);
      IF v_count >= p_max_per_ip THEN
        v_outcome := 'blocked_ip';
      END IF;
    END IF;
  END IF;

  INSERT INTO public.free_credit_claims (user_id, outcome, ip_hash, device_hash)
  VALUES (p_user_id, v_outcome, p_ip_hash, p_device_hash);

  RETURN jsonb_build_object('outcome', v_outcome, 'applied', true);
END;
$$;

REVOKE ALL ON FUNCTION public.free_credit_claim(UUID, TEXT, TEXT, INTEGER, INTEGER, INTEGER, BOOLEAN)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.free_credit_claim(UUID, TEXT, TEXT, INTEGER, INTEGER, INTEGER, BOOLEAN)
  TO service_role;

-- ------------------------------------------------------------
-- Looking for abuse (run in the SQL editor; nothing here is automatic):
--
--   -- Devices that made more than one account, newest first.
--   SELECT device_hash, count(*) AS accounts, max(created_at) AS latest,
--          array_agg(outcome ORDER BY created_at) AS outcomes
--   FROM public.free_credit_claims
--   WHERE device_hash IS NOT NULL
--   GROUP BY device_hash HAVING count(*) > 1
--   ORDER BY latest DESC;
--
--   -- How many claims each outcome has had.
--   SELECT outcome, count(*) FROM public.free_credit_claims GROUP BY 1;
--
-- Old rows can be pruned; only the last ip_window_days matter for the IP rule:
--   DELETE FROM public.free_credit_claims
--   WHERE outcome <> 'grandfathered' AND device_hash IS NULL
--     AND created_at < now() - interval '90 days';
-- ------------------------------------------------------------
