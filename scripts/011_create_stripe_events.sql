-- ============================================
-- MIGRATION 011: Stripe webhook de-duplication
--
-- THE PROBLEM
--
-- app/api/webhooks/stripe/route.ts verifies the signature and then acts on
-- the event with no record that it ever saw it. Stripe retries a webhook
-- until it gets a 2xx — on timeouts, on deploys, on any 5xx — so the same
-- event routinely arrives more than once. Today the only thing preventing a
-- duplicate license is the UNIQUE constraint on
-- licenses.stripe_payment_intent_id, and the trial-upgrade branch does not
-- even benefit from that, because it runs an UPDATE that succeeds every
-- time it is replayed.
--
-- Once credits are purchasable, a replay stops being a cosmetic problem and
-- becomes free money.
--
-- TWO LAYERS, DIFFERENT JOBS
--
-- This table de-duplicates *deliveries of one event*. It cannot
-- de-duplicate *a payment*, because one payment emits several events with
-- different ids (checkout.session.completed, charge.succeeded,
-- payment_intent.succeeded). The ledger's UNIQUE idempotency_key —
-- 'stripe:<payment_intent_id>' — is what guarantees a given payment grants
-- credits exactly once, no matter which event or code path gets there
-- first. Neither layer replaces the other.
--
-- Safe to re-run.
-- ============================================

CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id      TEXT        PRIMARY KEY,
  type          TEXT        NOT NULL,
  received_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at  TIMESTAMPTZ,
  error         TEXT,
  payload       JSONB
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_received
  ON public.stripe_events (received_at DESC);

-- Find deliveries that were claimed but never finished.
CREATE INDEX IF NOT EXISTS idx_stripe_events_unprocessed
  ON public.stripe_events (received_at)
  WHERE processed_at IS NULL;

COMMENT ON TABLE public.stripe_events IS
  'One row per Stripe event id the webhook has claimed. Rows older than a '
  'few months can be pruned; Stripe stops retrying long before that.';

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- No policies at all: this is service-role-only infrastructure. RLS with no
-- policy denies everything, and the revoke states the same thing at the
-- privilege layer.
REVOKE ALL ON public.stripe_events FROM anon, authenticated;

-- --------------------------------------------
-- stripe_event_begin
--
-- Returns true when the caller should process the event.
--
-- The awkward case is a delivery that was claimed and then crashed
-- mid-processing: the row exists with processed_at NULL, and refusing to
-- retry it would silently drop a real payment. So a claim older than
-- p_stale_seconds is handed out again. That is only safe because the ledger
-- key makes the actual credit grant idempotent — this function is an
-- optimisation against redundant work, not the thing protecting the money.
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.stripe_event_begin(
  p_event_id       TEXT,
  p_type           TEXT,
  p_payload        JSONB   DEFAULT NULL,
  p_stale_seconds  INTEGER DEFAULT 300
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.stripe_events%ROWTYPE;
BEGIN
  INSERT INTO public.stripe_events (event_id, type, payload)
  VALUES (p_event_id, p_type, p_payload)
  ON CONFLICT (event_id) DO NOTHING;

  IF FOUND THEN
    RETURN true;
  END IF;

  SELECT * INTO v_row FROM public.stripe_events
  WHERE event_id = p_event_id FOR UPDATE;

  IF v_row.processed_at IS NOT NULL THEN
    RETURN false;
  END IF;

  IF v_row.received_at < now() - make_interval(secs => p_stale_seconds) THEN
    UPDATE public.stripe_events
    SET received_at = now(), error = NULL
    WHERE event_id = p_event_id;
    RETURN true;
  END IF;

  -- Claimed recently and still running: another delivery is in flight.
  RETURN false;
END;
$$;

-- --------------------------------------------
-- stripe_event_complete
--
-- Marks a delivery finished. Passing p_error leaves processed_at NULL so
-- the next retry is allowed to pick it up again.
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.stripe_event_complete(
  p_event_id TEXT,
  p_error    TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.stripe_events
  SET processed_at = CASE WHEN p_error IS NULL THEN now() ELSE NULL END,
      error = p_error
  WHERE event_id = p_event_id;
END;
$$;

-- --------------------------------------------
-- Execution privileges: server-side only.
-- --------------------------------------------
REVOKE EXECUTE ON FUNCTION
  public.stripe_event_begin(TEXT, TEXT, JSONB, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION
  public.stripe_event_begin(TEXT, TEXT, JSONB, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION
  public.stripe_event_begin(TEXT, TEXT, JSONB, INTEGER) TO service_role;

REVOKE EXECUTE ON FUNCTION
  public.stripe_event_complete(TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION
  public.stripe_event_complete(TEXT, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION
  public.stripe_event_complete(TEXT, TEXT) TO service_role;
