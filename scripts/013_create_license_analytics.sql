-- ============================================
-- License analytics for the admin console
--
-- Answers the question the licenses tab could not: which of these 334 rows
-- represent money, and which are giveaways.
--
-- The distinguisher is `stripe_payment_intent_id`. It is set only by the
-- Stripe webhook, on both a fresh purchase and a trial upgrade, and is NULL
-- for every other path (free claim, trial, admin test-grant). It also carries
-- a UNIQUE constraint, so it cannot be double-counted.
--
-- Read-only. Each function re-checks is_admin() rather than trusting the
-- caller, the same reasoning as migration 012: a route that forgets its own
-- gate should still fail closed.
--
-- Requires: 002 (licenses), 003 (is_admin via profiles.role), 005
-- (public.is_admin), 007 (is_trial, trial_ends_at).
-- ============================================

-- Drives every aggregate below. Without it each dashboard load sequentially
-- scans licenses, and the classification filters on three columns at once.
CREATE INDEX IF NOT EXISTS idx_licenses_product_origin
  ON public.licenses (product_id, is_trial, is_revoked);

-- Partial index over the rows that represent revenue. Small, and it makes
-- "show me the actual purchases" instant however large the table gets.
CREATE INDEX IF NOT EXISTS idx_licenses_paid
  ON public.licenses (created_at DESC)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- --------------------------------------------
-- license_admin_summary
--
-- The four origins, and how each is recognised:
--
--   paid          stripe_payment_intent_id IS NOT NULL
--   trial_active  is_trial AND trial_ends_at > now()
--   trial_expired is_trial AND NOT the above
--   granted       everything else
--
-- `granted` is deliberately coarse: it cannot tell a free-product claim from
-- a comped copy of a paid product, because the difference is the price, and
-- prices live in lib/products.ts rather than in the database. The page
-- applies that split. Mirroring a price table into SQL is how the two drift.
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.license_admin_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'generated_at', now(),

    'totals', (
      SELECT jsonb_build_object(
        'licenses',      COUNT(*),
        'paid',          COUNT(*) FILTER (WHERE stripe_payment_intent_id IS NOT NULL),
        'trial_active',  COUNT(*) FILTER (WHERE is_trial AND trial_ends_at > now()),
        'trial_expired', COUNT(*) FILTER (WHERE is_trial AND (trial_ends_at IS NULL OR trial_ends_at <= now())),
        'granted',       COUNT(*) FILTER (WHERE stripe_payment_intent_id IS NULL AND NOT is_trial),
        'revoked',       COUNT(*) FILTER (WHERE is_revoked),
        'holders',       COUNT(DISTINCT user_id),
        'paying_holders', COUNT(DISTINCT user_id) FILTER (WHERE stripe_payment_intent_id IS NOT NULL)
      )
      FROM public.licenses
    ),

    -- Per product, so the page can pair each row with its catalogue price.
    'by_product', (
      SELECT COALESCE(jsonb_agg(row_to_json(p) ORDER BY p.total DESC), '[]'::jsonb)
      FROM (
        SELECT
          l.product_id,
          COUNT(*)                                                                       AS total,
          COUNT(*) FILTER (WHERE l.stripe_payment_intent_id IS NOT NULL)                 AS paid,
          COUNT(*) FILTER (WHERE l.is_trial AND l.trial_ends_at > now())                 AS trial_active,
          COUNT(*) FILTER (WHERE l.is_trial AND (l.trial_ends_at IS NULL OR l.trial_ends_at <= now())) AS trial_expired,
          COUNT(*) FILTER (WHERE l.stripe_payment_intent_id IS NULL AND NOT l.is_trial)  AS granted,
          COUNT(*) FILTER (WHERE l.is_revoked)                                           AS revoked,
          COUNT(DISTINCT l.user_id)                                                      AS holders,
          MIN(l.created_at) FILTER (WHERE l.stripe_payment_intent_id IS NOT NULL)        AS first_paid_at,
          MAX(l.created_at) FILTER (WHERE l.stripe_payment_intent_id IS NOT NULL)        AS last_paid_at,
          MAX(l.created_at)                                                              AS last_issued_at
        FROM public.licenses l
        GROUP BY l.product_id
      ) p
    ),

    -- Purchases, newest first. Empty is itself a finding.
    'recent_paid', (
      SELECT COALESCE(jsonb_agg(row_to_json(r) ORDER BY r.created_at DESC), '[]'::jsonb)
      FROM (
        SELECT
          l.license_key,
          l.product_id,
          l.user_id,
          pr.display_name,
          l.stripe_payment_intent_id,
          l.is_revoked,
          l.created_at
        FROM public.licenses l
        LEFT JOIN public.profiles pr ON pr.id = l.user_id
        WHERE l.stripe_payment_intent_id IS NOT NULL
        ORDER BY l.created_at DESC
        LIMIT 50
      ) r
    ),

    -- Trials still running. These are the only rows that can still convert,
    -- so they are the actionable list on this page.
    'trials_open', (
      SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.trial_ends_at ASC), '[]'::jsonb)
      FROM (
        SELECT
          l.license_key,
          l.product_id,
          l.user_id,
          pr.display_name,
          l.trial_ends_at,
          l.created_at
        FROM public.licenses l
        LEFT JOIN public.profiles pr ON pr.id = l.user_id
        WHERE l.is_trial
          AND l.trial_ends_at > now()
          -- is_revoked is nullable (002 gave it a default, not NOT NULL), so
          -- a bare NOT would silently drop rows where it was never written.
          AND COALESCE(l.is_revoked, false) = false
        ORDER BY l.trial_ends_at ASC
        LIMIT 50
      ) t
    ),

    -- Licenses nobody ever activated. A paid one here is a refund risk; a
    -- trial one never really started.
    'never_activated', (
      SELECT jsonb_build_object(
        'paid',    COUNT(*) FILTER (WHERE l.stripe_payment_intent_id IS NOT NULL),
        'trial',   COUNT(*) FILTER (WHERE l.is_trial),
        'granted', COUNT(*) FILTER (WHERE l.stripe_payment_intent_id IS NULL AND NOT l.is_trial),
        'total',   COUNT(*)
      )
      FROM public.licenses l
      WHERE NOT EXISTS (
        SELECT 1 FROM public.activations a WHERE a.license_id = l.id
      )
    ),

    -- Licenses issued per month, split by whether money changed hands.
    'monthly', (
      SELECT COALESCE(jsonb_agg(row_to_json(m) ORDER BY m.month ASC), '[]'::jsonb)
      FROM (
        SELECT
          to_char(date_trunc('month', l.created_at), 'YYYY-MM')          AS month,
          COUNT(*)                                                        AS issued,
          COUNT(*) FILTER (WHERE l.stripe_payment_intent_id IS NOT NULL)  AS paid
        FROM public.licenses l
        WHERE l.created_at >= now() - interval '12 months'
        GROUP BY 1
      ) m
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- --------------------------------------------
-- Privileges
--
-- Granted to authenticated because each function re-checks is_admin(); a
-- non-admin calling directly gets 42501 rather than data. This also means
-- the dashboard reads them with the user's own session, which is required:
-- is_admin() resolves through auth.uid(), and the service role has none.
-- --------------------------------------------
REVOKE ALL ON FUNCTION public.license_admin_summary() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.license_admin_summary() FROM anon;
GRANT EXECUTE ON FUNCTION public.license_admin_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.license_admin_summary() TO service_role;

COMMENT ON FUNCTION public.license_admin_summary() IS
  'Admin-only license breakdown by origin. A license counts as paid only if '
  'stripe_payment_intent_id is set, which the Stripe webhook is the sole '
  'writer of. Re-checks is_admin().';
