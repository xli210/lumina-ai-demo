-- ============================================
-- Credit analytics for the admin console
--
-- Read-only aggregation over credit_ledger, credit_accounts and
-- credit_holds. Nothing here writes.
--
-- Why RPCs rather than queries from the app: the app would have to pull the
-- whole ledger to sum it, which stops working the first time the ledger is
-- large, and the numbers would then be computed in two places (here and in
-- any SQL you run by hand) with no guarantee they agree. Aggregating in
-- Postgres keeps one definition of "revenue".
--
-- Every function re-checks public.is_admin() rather than trusting the caller,
-- for the same reason migration 008 moved role changes behind SECURITY
-- DEFINER: a route that forgets its own gate should still fail closed.
--
-- Requires: 009 (tables), 010 (functions), 005 (is_admin).
-- ============================================

-- Every aggregate here filters or groups by kind, and the only index on
-- credit_ledger covering it is (user_id, created_at). Without this one, the
-- dashboard is a sequential scan of the whole ledger on every load.
CREATE INDEX IF NOT EXISTS idx_credit_ledger_kind_created
  ON public.credit_ledger (kind, created_at DESC);

-- Drives the by_mode breakdown, which reads only settled reservations.
CREATE INDEX IF NOT EXISTS idx_credit_holds_status
  ON public.credit_holds (status);

-- --------------------------------------------
-- credit_admin_summary
--
-- One jsonb document with every headline figure, so the dashboard needs a
-- single round trip.
--
-- Sign convention: credit_ledger stores spends and reversals as negative
-- amounts. This function reports them as positive magnitudes, because
-- "spent: -4,210" reads like a bug in a dashboard. `net_*` values keep the
-- signed arithmetic.
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_admin_summary(
  p_days INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_since TIMESTAMPTZ;
  v_result JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  IF p_days IS NULL OR p_days < 1 OR p_days > 3650 THEN
    RAISE EXCEPTION 'p_days must be between 1 and 3650, got %', p_days;
  END IF;

  v_since := now() - make_interval(days => p_days);

  SELECT jsonb_build_object(
    'window_days', p_days,
    'generated_at', now(),

    -- All-time totals, by ledger kind.
    'all_time', (
      SELECT jsonb_build_object(
        'purchased',      COALESCE(SUM(amount) FILTER (WHERE kind = 'purchase'), 0),
        'bonus',          COALESCE(SUM(amount) FILTER (WHERE kind = 'bonus'), 0),
        'promo',          COALESCE(SUM(amount) FILTER (WHERE kind = 'promo'), 0),
        'signup_grant',   COALESCE(SUM(amount) FILTER (WHERE kind = 'signup_grant'), 0),
        'refunded',       COALESCE(SUM(amount) FILTER (WHERE kind = 'refund'), 0),
        -- Negated so the dashboard shows a positive magnitude.
        'spent',          COALESCE(-SUM(amount) FILTER (WHERE kind = 'spend'), 0),
        'reversed',       COALESCE(-SUM(amount) FILTER (WHERE kind = 'reversal'), 0),
        'admin_adjust',   COALESCE(SUM(amount) FILTER (WHERE kind = 'admin_adjust'), 0),
        'entries',        COUNT(*),
        'renders',        COUNT(*) FILTER (WHERE kind = 'spend')
      )
      FROM public.credit_ledger
    ),

    -- Same, restricted to the window.
    'window', (
      SELECT jsonb_build_object(
        'purchased',      COALESCE(SUM(amount) FILTER (WHERE kind = 'purchase'), 0),
        'bonus',          COALESCE(SUM(amount) FILTER (WHERE kind = 'bonus'), 0),
        'promo',          COALESCE(SUM(amount) FILTER (WHERE kind = 'promo'), 0),
        'signup_grant',   COALESCE(SUM(amount) FILTER (WHERE kind = 'signup_grant'), 0),
        'spent',          COALESCE(-SUM(amount) FILTER (WHERE kind = 'spend'), 0),
        'reversed',       COALESCE(-SUM(amount) FILTER (WHERE kind = 'reversal'), 0),
        'renders',        COUNT(*) FILTER (WHERE kind = 'spend')
      )
      FROM public.credit_ledger
      WHERE created_at >= v_since
    ),

    -- What we still owe people. Every unspent credit is a delivery
    -- obligation, so this is the number that matters for cash held against
    -- future GPU cost.
    'outstanding', (
      SELECT jsonb_build_object(
        'balance',  COALESCE(SUM(balance), 0),
        'held',     COALESCE(SUM(held), 0),
        'accounts', COUNT(*)
      )
      FROM public.credit_accounts
    ),

    'users', (
      SELECT jsonb_build_object(
        'with_account',   (SELECT COUNT(*) FROM public.credit_accounts),
        'ever_purchased', (
          SELECT COUNT(DISTINCT user_id) FROM public.credit_ledger
          WHERE kind = 'purchase'
        ),
        'ever_spent', (
          SELECT COUNT(DISTINCT user_id) FROM public.credit_ledger
          WHERE kind = 'spend'
        ),
        'spent_in_window', (
          SELECT COUNT(DISTINCT user_id) FROM public.credit_ledger
          WHERE kind = 'spend' AND created_at >= v_since
        ),
        'purchased_in_window', (
          SELECT COUNT(DISTINCT user_id) FROM public.credit_ledger
          WHERE kind = 'purchase' AND created_at >= v_since
        )
      )
    ),

    -- Free vs paid renders. The ratio is the free tier's real cost: each
    -- free render is GPU time nobody paid for, and the whole argument for
    -- keeping a free tier rests on this converting.
    --
    -- A render counts as free-funded when the account had not bought
    -- anything at the time it ran. Computed by pre-aggregating each user's
    -- first purchase and joining once, rather than a correlated subquery per
    -- spend row — the naive form re-scans the ledger for every render and
    -- degrades quadratically.
    'renders_by_funding', (
      WITH first_purchase AS (
        SELECT user_id, MIN(created_at) AS first_paid
        FROM public.credit_ledger
        WHERE kind = 'purchase'
        GROUP BY user_id
      )
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'by_never_paying_user', COUNT(*) FILTER (
          WHERE fp.first_paid IS NULL OR l.created_at < fp.first_paid
        )
      )
      FROM public.credit_ledger l
      LEFT JOIN first_purchase fp ON fp.user_id = l.user_id
      WHERE l.kind = 'spend'
    ),

    -- Which service consumed the credits, read from the settlement
    -- reference credit_capture writes.
    'by_service', (
      SELECT COALESCE(jsonb_agg(row_to_json(s)), '[]'::jsonb)
      FROM (
        SELECT
          COALESCE(reference->>'service', 'unattributed') AS service,
          COUNT(*)      AS renders,
          -SUM(amount)  AS credits
        FROM public.credit_ledger
        WHERE kind = 'spend'
        GROUP BY 1
        ORDER BY 3 DESC
      ) s
    ),

    -- Face swap vs head swap, from the estimate recorded at reservation.
    'by_mode', (
      SELECT COALESCE(jsonb_agg(row_to_json(m)), '[]'::jsonb)
      FROM (
        SELECT
          COALESCE(estimate->>'mode', 'unknown') AS mode,
          COUNT(*)      AS jobs,
          SUM(amount)   AS credits_reserved
        FROM public.credit_holds
        WHERE status = 'captured'
        GROUP BY 1
        ORDER BY 2 DESC
      ) m
    ),

    -- Reservation outcomes. A high released count means jobs are failing;
    -- a high expired count means clients are abandoning them.
    'holds', (
      SELECT jsonb_build_object(
        'open',      COUNT(*) FILTER (WHERE status = 'open'),
        'captured',  COUNT(*) FILTER (WHERE status = 'captured'),
        'released',  COUNT(*) FILTER (WHERE status = 'released'),
        'expired',   COUNT(*) FILTER (WHERE status = 'expired')
      )
      FROM public.credit_holds
    ),

    -- Which packs sell, from the reference the webhook writes.
    'by_pack', (
      SELECT COALESCE(jsonb_agg(row_to_json(p)), '[]'::jsonb)
      FROM (
        SELECT
          COALESCE(reference->>'pack_id', 'unknown') AS pack_id,
          COUNT(*)    AS orders,
          SUM(amount) AS credits
        FROM public.credit_ledger
        WHERE kind = 'purchase'
        GROUP BY 1
        ORDER BY 2 DESC
      ) p
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- --------------------------------------------
-- credit_admin_daily
--
-- One row per UTC day in the window, with gaps filled. Filling them matters:
-- a chart that silently skips zero-revenue days makes a flat week look busy.
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_admin_daily(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  day             DATE,
  purchased       BIGINT,
  bonus           BIGINT,
  promo           BIGINT,
  spent           BIGINT,
  renders         BIGINT,
  paying_users    BIGINT,
  spending_users  BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  IF p_days IS NULL OR p_days < 1 OR p_days > 366 THEN
    RAISE EXCEPTION 'p_days must be between 1 and 366, got %', p_days;
  END IF;

  RETURN QUERY
  WITH days AS (
    SELECT generate_series(
      (now() - make_interval(days => p_days - 1))::date,
      now()::date,
      '1 day'::interval
    )::date AS day
  ),
  entries AS (
    SELECT
      created_at::date AS day,
      kind,
      amount,
      user_id
    FROM public.credit_ledger
    WHERE created_at >= (now() - make_interval(days => p_days - 1))::date
  )
  SELECT
    d.day,
    COALESCE(SUM(e.amount) FILTER (WHERE e.kind = 'purchase'), 0)::BIGINT,
    COALESCE(SUM(e.amount) FILTER (WHERE e.kind = 'bonus'), 0)::BIGINT,
    COALESCE(SUM(e.amount) FILTER (WHERE e.kind = 'promo'), 0)::BIGINT,
    COALESCE(-SUM(e.amount) FILTER (WHERE e.kind = 'spend'), 0)::BIGINT,
    COUNT(*) FILTER (WHERE e.kind = 'spend')::BIGINT,
    COUNT(DISTINCT e.user_id) FILTER (WHERE e.kind = 'purchase')::BIGINT,
    COUNT(DISTINCT e.user_id) FILTER (WHERE e.kind = 'spend')::BIGINT
  FROM days d
  LEFT JOIN entries e ON e.day = d.day
  GROUP BY d.day
  ORDER BY d.day;
END;
$$;

-- --------------------------------------------
-- credit_admin_top_users
--
-- The accounts worth looking at individually, ranked by lifetime spend.
--
-- Joined to profiles for a readable name. credit_ledger has no foreign key
-- to auth.users by design (see migration 009), so an account deleted after
-- spending still appears here with a null name — which is correct, the money
-- moved and the record should survive.
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_admin_top_users(
  p_limit INTEGER DEFAULT 25
)
RETURNS TABLE (
  user_id             UUID,
  display_name        TEXT,
  role                TEXT,
  balance             BIGINT,
  held                BIGINT,
  lifetime_purchased  BIGINT,
  lifetime_spent      BIGINT,
  renders             BIGINT,
  first_seen          TIMESTAMPTZ,
  last_activity       TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 200 THEN
    RAISE EXCEPTION 'p_limit must be between 1 and 200, got %', p_limit;
  END IF;

  RETURN QUERY
  SELECT
    a.user_id,
    p.display_name,
    p.role,
    a.balance,
    a.held,
    a.lifetime_purchased,
    a.lifetime_spent,
    COALESCE(l.renders, 0)::BIGINT,
    l.first_seen,
    l.last_activity
  FROM public.credit_accounts a
  LEFT JOIN public.profiles p ON p.id = a.user_id
  LEFT JOIN (
    SELECT
      user_id,
      COUNT(*) FILTER (WHERE kind = 'spend') AS renders,
      MIN(created_at) AS first_seen,
      MAX(created_at) AS last_activity
    FROM public.credit_ledger
    GROUP BY user_id
  ) l ON l.user_id = a.user_id
  ORDER BY a.lifetime_spent DESC, a.lifetime_purchased DESC
  LIMIT p_limit;
END;
$$;

-- --------------------------------------------
-- Privileges
--
-- Granted to authenticated, not just service_role: these are read-only and
-- each one re-checks is_admin(), so a non-admin calling them directly gets
-- 42501 rather than data. That also means the dashboard can read them with
-- the user's own session instead of needing the service-role key.
-- --------------------------------------------
DO $$
DECLARE
  v_signature TEXT;
BEGIN
  FOREACH v_signature IN ARRAY ARRAY[
    'public.credit_admin_summary(INTEGER)',
    'public.credit_admin_daily(INTEGER)',
    'public.credit_admin_top_users(INTEGER)'
  ]
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', v_signature);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', v_signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', v_signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', v_signature);
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.credit_admin_summary(INTEGER) IS
  'Admin-only headline credit metrics as one jsonb document. Spends are '
  'reported as positive magnitudes even though the ledger stores them '
  'negative. Re-checks is_admin().';

COMMENT ON FUNCTION public.credit_admin_daily(INTEGER) IS
  'Admin-only per-UTC-day credit series with zero-filled gaps, so a chart '
  'does not compress quiet days out of existence. Re-checks is_admin().';

COMMENT ON FUNCTION public.credit_admin_top_users(INTEGER) IS
  'Admin-only accounts ranked by lifetime spend. display_name is null for '
  'deleted accounts, whose ledger rows deliberately survive.';
