-- ============================================
-- Let a failed webhook delivery be retried immediately
--
-- `stripe_event_begin` refuses a claim when the row was received inside the
-- staleness window, on the reasoning that another delivery of the same event
-- is still running and processing it twice would issue two licenses.
--
-- That reasoning does not hold once an attempt has *finished and failed*.
-- `stripe_event_complete(p_error => ...)` deliberately leaves processed_at
-- NULL so the event can be retried, but it does not touch received_at — so
-- the row still looks in-flight for the remainder of the 300 second window
-- and the next `begin` returns false. Stripe's first retry lands inside that
-- window and is dropped. Later retries do get through, so this is lost time
-- rather than a lost license, but it is time a paying customer spends
-- holding nothing.
--
-- A non-NULL `error` is the precise signal: it is only ever written by
-- `stripe_event_complete`, which is only ever called after the handler has
-- returned. So an event carrying an error has no delivery in flight and can
-- be re-claimed at once.
--
-- The other branches are unchanged, and the ordering still matters:
--   processed_at set   -> already done, never redo          (duplicate)
--   error set          -> finished and failed, retry now    (this change)
--   received recently  -> another delivery running, wait    (in flight)
--   received long ago  -> the worker died mid-flight, retry (stale)
--
-- Requires: 011.
-- ============================================

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

  -- Already delivered. Redoing it would issue a second license.
  IF v_row.processed_at IS NOT NULL THEN
    RETURN false;
  END IF;

  -- A previous attempt ran to completion and failed. Nothing is in flight,
  -- so this retry takes it over without waiting out the staleness window.
  IF v_row.error IS NOT NULL THEN
    UPDATE public.stripe_events
    SET received_at = now(), error = NULL
    WHERE event_id = p_event_id;
    RETURN true;
  END IF;

  -- No error recorded and not old enough to be abandoned: another delivery
  -- is still running. Let it finish rather than racing it.
  IF v_row.received_at >= now() - make_interval(secs => p_stale_seconds) THEN
    RETURN false;
  END IF;

  -- Claimed long ago and never completed: the attempt died mid-flight,
  -- most likely a timeout or a deploy. Take it over.
  UPDATE public.stripe_events
  SET received_at = now(), error = NULL
  WHERE event_id = p_event_id;
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION
  public.stripe_event_begin(TEXT, TEXT, JSONB, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION
  public.stripe_event_begin(TEXT, TEXT, JSONB, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION
  public.stripe_event_begin(TEXT, TEXT, JSONB, INTEGER) TO service_role;

COMMENT ON FUNCTION public.stripe_event_begin(TEXT, TEXT, JSONB, INTEGER) IS
  'Claims a Stripe webhook delivery. Returns false when the event is already '
  'processed or another delivery is in flight; true when it is new, when a '
  'previous attempt failed, or when a claim was abandoned mid-flight.';

-- --------------------------------------------
-- Housekeeping: drop the placeholder row left behind while 011 was being
-- tested. `event_id = 'x'` cannot collide with a real Stripe event id, so
-- it is harmless, but it makes "has this app ever processed a delivery?"
-- answer yes when the truth is no.
-- --------------------------------------------
DELETE FROM public.stripe_events WHERE event_id = 'x';
