-- ============================================
-- MIGRATION 029: weekly growth figures for /admin/growth
--
-- One row per week (Monday start, Pacific time) with the steps from a new
-- account to repeat money:
--
--   sign-ups -> free credits granted -> first tool use -> free credits run
--   low -> first payment -> repeat payment
--
-- plus the week's revenue and how many earlier users came back. Read-only;
-- it creates one function and no tables.
--
-- Sources
--   accounts       auth.users.created_at; free credits = credit_ledger
--                  kind 'signup_grant' (a refused claim has none)
--   tool use       credit_holds with status 'captured' (a delivered render;
--                  desktop apps do not appear here)
--   run low        the first 'spend' that left a never-paid account at 20
--                  credits or fewer
--   money          stripe_events: paid checkout sessions (credits and
--                  licences, video studio included) and auto top-ups
--                  (payment_intent.succeeded with metadata auto_recharge).
--                  Amounts are what Stripe took before its fees; refunds are
--                  not subtracted.
--   a buyer        the account id on the payment, or its email when a
--                  payment has no account id
--
-- Left out: admin accounts, and any account or payment whose email has the
-- same local part (before "+" and "@") as an admin's, so the owner's test
-- accounts and test purchases do not count.
--
-- Safe to re-run.
-- ============================================

CREATE OR REPLACE FUNCTION public.growth_admin_weekly(
  p_weeks INTEGER DEFAULT 12
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tz CONSTANT TEXT := 'America/Los_Angeles';
  v_result JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  IF p_weeks IS NULL OR p_weeks < 1 OR p_weeks > 104 THEN
    RAISE EXCEPTION 'p_weeks must be between 1 and 104, got %', p_weeks;
  END IF;

  WITH
  admin_local AS (
    SELECT DISTINCT lower(split_part(split_part(u.email, '@', 1), '+', 1)) AS lp
    FROM auth.users u
    JOIN public.profiles p ON p.id = u.id
    WHERE p.role = 'admin' AND u.email IS NOT NULL
  ),
  excl AS (
    SELECT u.id
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE p.role = 'admin'
       OR lower(split_part(split_part(u.email, '@', 1), '+', 1)) IN (SELECT lp FROM admin_local)
  ),
  weeks AS (
    SELECT generate_series(
      date_trunc('week', now() AT TIME ZONE v_tz) - make_interval(weeks => p_weeks - 1),
      date_trunc('week', now() AT TIME ZONE v_tz),
      INTERVAL '1 week'
    ) AS wk
  ),
  signups AS (
    SELECT date_trunc('week', u.created_at AT TIME ZONE v_tz) AS wk, count(*) AS n
    FROM auth.users u
    WHERE u.id NOT IN (SELECT id FROM excl)
    GROUP BY 1
  ),
  granted AS (
    SELECT date_trunc('week', l.created_at AT TIME ZONE v_tz) AS wk, count(DISTINCT l.user_id) AS n
    FROM public.credit_ledger l
    WHERE l.kind = 'signup_grant' AND l.user_id NOT IN (SELECT id FROM excl)
    GROUP BY 1
  ),
  holds AS (
    SELECT h.user_id, h.amount, h.created_at,
           date_trunc('week', h.created_at AT TIME ZONE v_tz) AS wk
    FROM public.credit_holds h
    WHERE h.status = 'captured' AND h.user_id NOT IN (SELECT id FROM excl)
  ),
  first_use AS (
    SELECT user_id, min(created_at) AS t, min(wk) AS wk
    FROM holds
    GROUP BY 1
  ),
  active AS (
    SELECT h.wk,
           count(DISTINCT h.user_id) AS users,
           count(DISTINCT h.user_id) FILTER (WHERE f.wk < h.wk) AS returning_users,
           sum(h.amount) AS credits
    FROM holds h
    JOIN first_use f USING (user_id)
    GROUP BY 1
  ),
  ran_low AS (
    SELECT l.user_id, min(l.created_at) AS t
    FROM public.credit_ledger l
    WHERE l.kind = 'spend'
      AND l.balance_after <= 20
      AND l.user_id NOT IN (SELECT id FROM excl)
      AND NOT EXISTS (
        SELECT 1 FROM public.credit_ledger b
        WHERE b.user_id = l.user_id AND b.kind = 'purchase' AND b.created_at < l.created_at
      )
    GROUP BY 1
  ),
  ran_low_week AS (
    SELECT date_trunc('week', t AT TIME ZONE v_tz) AS wk, count(*) AS n
    FROM ran_low
    GROUP BY 1
  ),
  pays_raw AS (
    SELECT e.type, e.payload -> 'data' -> 'object' AS o,
           to_timestamp((e.payload ->> 'created')::BIGINT) AS t
    FROM public.stripe_events e
    WHERE e.type IN ('checkout.session.completed', 'payment_intent.succeeded')
  ),
  pays AS (
    SELECT t,
           (CASE WHEN type = 'checkout.session.completed'
                 THEN (o ->> 'amount_total')::NUMERIC
                 ELSE (o ->> 'amount_received')::NUMERIC END) / 100 AS amt,
           CASE WHEN type = 'payment_intent.succeeded' THEN 'auto'
                WHEN o -> 'metadata' ->> 'product_id' IS NOT NULL THEN 'licence'
                ELSE 'credits' END AS kind,
           nullif(o -> 'metadata' ->> 'supabase_user_id', '') AS uid,
           lower(coalesce(o -> 'customer_details' ->> 'email', o ->> 'receipt_email', '')) AS email
    FROM pays_raw
    WHERE (type = 'checkout.session.completed' AND o ->> 'payment_status' = 'paid')
       OR (type = 'payment_intent.succeeded' AND o -> 'metadata' ->> 'auto_recharge' IS NOT NULL)
  ),
  pays2 AS (
    SELECT p.*,
           coalesce(p.uid, nullif(p.email, '')) AS buyer,
           date_trunc('week', p.t AT TIME ZONE v_tz) AS wk
    FROM pays p
    WHERE coalesce(p.uid, '') NOT IN (SELECT id::TEXT FROM excl)
      AND split_part(split_part(p.email, '@', 1), '+', 1) NOT IN (SELECT lp FROM admin_local)
  ),
  first_pay AS (
    SELECT buyer, min(t) AS t FROM pays2 GROUP BY 1
  ),
  pay_week AS (
    SELECT p.wk,
           count(*) AS payments,
           count(DISTINCT p.buyer) AS buyers,
           sum(p.amt) AS revenue,
           coalesce(sum(p.amt) FILTER (WHERE p.kind = 'credits'), 0) AS rev_credits,
           coalesce(sum(p.amt) FILTER (WHERE p.kind = 'licence'), 0) AS rev_licences,
           coalesce(sum(p.amt) FILTER (WHERE p.kind = 'auto'), 0) AS rev_auto,
           count(DISTINCT p.buyer) FILTER (WHERE p.t = f.t) AS first_buyers,
           count(*) FILTER (WHERE p.t > f.t) AS repeat_payments,
           count(DISTINCT p.buyer) FILTER (WHERE p.t > f.t) AS repeat_buyers,
           coalesce(sum(p.amt) FILTER (WHERE p.t > f.t), 0) AS rev_repeat
    FROM pays2 p
    JOIN first_pay f USING (buyer)
    GROUP BY 1
  ),
  first_pay_user AS (
    SELECT uid, min(t) AS t FROM pays2 WHERE uid IS NOT NULL GROUP BY 1
  ),
  cohort AS (
    SELECT f.wk,
           count(*) AS n,
           count(*) FILTER (WHERE fp.t IS NOT NULL) AS paid,
           count(*) FILTER (WHERE fp.t IS NOT NULL AND fp.t < f.t + INTERVAL '14 days') AS paid_14d
    FROM first_use f
    LEFT JOIN first_pay_user fp ON fp.uid = f.user_id::TEXT
    GROUP BY 1
  )
  SELECT jsonb_agg(jsonb_build_object(
           'week', to_char(w.wk, 'YYYY-MM-DD'),
           'signups', coalesce(s.n, 0),
           'granted', coalesce(g.n, 0),
           'new_tool_users', coalesce(c.n, 0),
           'active_tool_users', coalesce(a.users, 0),
           'returning_tool_users', coalesce(a.returning_users, 0),
           'credits_used', coalesce(a.credits, 0),
           'ran_low', coalesce(r.n, 0),
           'payments', coalesce(pw.payments, 0),
           'buyers', coalesce(pw.buyers, 0),
           'first_buyers', coalesce(pw.first_buyers, 0),
           'repeat_payments', coalesce(pw.repeat_payments, 0),
           'repeat_buyers', coalesce(pw.repeat_buyers, 0),
           'revenue', coalesce(pw.revenue, 0),
           'revenue_credits', coalesce(pw.rev_credits, 0),
           'revenue_licences', coalesce(pw.rev_licences, 0),
           'revenue_auto', coalesce(pw.rev_auto, 0),
           'revenue_repeat', coalesce(pw.rev_repeat, 0),
           'cohort_paid', coalesce(c.paid, 0),
           'cohort_paid_14d', coalesce(c.paid_14d, 0)
         ) ORDER BY w.wk)
  INTO v_result
  FROM weeks w
  LEFT JOIN signups s ON s.wk = w.wk
  LEFT JOIN granted g ON g.wk = w.wk
  LEFT JOIN active a ON a.wk = w.wk
  LEFT JOIN ran_low_week r ON r.wk = w.wk
  LEFT JOIN pay_week pw ON pw.wk = w.wk
  LEFT JOIN cohort c ON c.wk = w.wk;

  RETURN coalesce(v_result, '[]'::JSONB);
END;
$$;

REVOKE ALL ON FUNCTION public.growth_admin_weekly(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.growth_admin_weekly(INTEGER) FROM anon;
GRANT EXECUTE ON FUNCTION public.growth_admin_weekly(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.growth_admin_weekly(INTEGER) TO service_role;

COMMENT ON FUNCTION public.growth_admin_weekly(INTEGER) IS
  'Admin-only weekly growth figures (Monday weeks, Pacific time): sign-ups, '
  'first tool use, free credits run low, first and repeat payments, revenue. '
  'Re-checks is_admin(). Read by /admin/growth.';
