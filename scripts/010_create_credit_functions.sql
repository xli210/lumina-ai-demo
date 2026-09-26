-- ============================================
-- MIGRATION 010: the only supported way to write credits
--
-- Five operations plus a sweeper. Everything is SECURITY DEFINER and
-- service_role-only; nothing here is reachable from a browser.
--
--   credit_grant    add credits (purchase, bonus, signup, promo, refund)
--   credit_hold     reserve credits against an in-flight job
--   credit_capture  settle a reservation at the real cost
--   credit_release  return a reservation in full, charging nothing
--   credit_reverse  claw credits back when the money went back
--
-- WHY FUNCTIONS AND NOT APPLICATION CODE
--
-- "check the balance, write the ledger row, update the materialised
-- balance" has to be one atomic step, and the Supabase JS client cannot
-- open a transaction across statements. Doing it in TypeScript would mean
-- two concurrent spends could both read the same balance and both succeed.
-- Each function below takes a row lock on credit_accounts before reading
-- anything, so concurrent calls for one user serialise.
--
-- CONVENTIONS
--
-- Every function returns JSONB rather than raising for expected outcomes,
-- so the API layer can map a result to an HTTP status without parsing error
-- strings. Programmer errors (bad kind, negative amount) still raise.
-- Every function is idempotent: calling it twice with the same key, or on
-- an already-settled hold, reports `applied: false` and changes nothing.
--
-- Safe to re-run.
-- ============================================

-- --------------------------------------------
-- Internal: current account state as JSONB.
-- Assumes the caller already holds the row lock.
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_account_state(p_user_id UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'user_id',            a.user_id,
    'balance',            a.balance,
    'held',               a.held,
    'available',          a.balance - a.held,
    'lifetime_purchased', a.lifetime_purchased,
    'lifetime_spent',     a.lifetime_spent
  )
  FROM public.credit_accounts a
  WHERE a.user_id = p_user_id;
$$;

-- --------------------------------------------
-- credit_grant
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_grant(
  p_user_id         UUID,
  p_amount          BIGINT,
  p_kind            public.credit_entry_kind,
  p_idempotency_key TEXT,
  p_reference       JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_id BIGINT;
  v_balance     BIGINT;
  v_ledger_id   BIGINT;
BEGIN
  IF p_kind IN ('spend', 'reversal') THEN
    RAISE EXCEPTION 'credit_grant cannot write % entries; use credit_capture '
      'or credit_reverse', p_kind;
  END IF;

  IF p_kind <> 'admin_adjust' AND p_amount <= 0 THEN
    RAISE EXCEPTION 'grant amount must be positive, got %', p_amount;
  END IF;

  IF p_amount = 0 THEN
    RAISE EXCEPTION 'grant amount must not be zero';
  END IF;

  IF p_idempotency_key IS NULL OR length(p_idempotency_key) = 0 THEN
    RAISE EXCEPTION 'idempotency_key is required';
  END IF;

  INSERT INTO public.credit_accounts (user_id) VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Serialise every write for this user behind one lock.
  PERFORM 1 FROM public.credit_accounts
    WHERE user_id = p_user_id FOR UPDATE;

  -- Safe as a plain read because the lock is already held: a concurrent
  -- duplicate cannot be mid-insert.
  SELECT id INTO v_existing_id
  FROM public.credit_ledger
  WHERE idempotency_key = p_idempotency_key;

  IF v_existing_id IS NOT NULL THEN
    RETURN public.credit_account_state(p_user_id)
      || jsonb_build_object('applied', false, 'ledger_id', v_existing_id);
  END IF;

  UPDATE public.credit_accounts
  SET balance = balance + p_amount,
      lifetime_purchased = lifetime_purchased
        + CASE WHEN p_kind IN ('purchase', 'bonus') AND p_amount > 0
               THEN p_amount ELSE 0 END,
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_balance;

  INSERT INTO public.credit_ledger
    (user_id, amount, kind, balance_after, idempotency_key, reference)
  VALUES
    (p_user_id, p_amount, p_kind, v_balance, p_idempotency_key, p_reference)
  RETURNING id INTO v_ledger_id;

  RETURN public.credit_account_state(p_user_id)
    || jsonb_build_object('applied', true, 'ledger_id', v_ledger_id);
END;
$$;

-- --------------------------------------------
-- credit_hold
--
-- Returns { ok: false, reason: 'insufficient_credits', shortfall: n } rather
-- than raising, because running out of credits is an ordinary outcome the
-- API turns into a 402 with a top-up link, not an exception.
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_hold(
  p_user_id     UUID,
  p_amount      BIGINT,
  p_service     TEXT,
  p_job_ref     TEXT    DEFAULT NULL,
  p_ttl_seconds INTEGER DEFAULT 3600,
  p_estimate    JSONB   DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_available BIGINT;
  v_existing  public.credit_holds%ROWTYPE;
  v_hold_id   UUID;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'hold amount must be positive, got %', p_amount;
  END IF;

  IF p_service IS NULL OR length(p_service) = 0 THEN
    RAISE EXCEPTION 'service is required';
  END IF;

  IF p_ttl_seconds <= 0 THEN
    RAISE EXCEPTION 'ttl_seconds must be positive, got %', p_ttl_seconds;
  END IF;

  INSERT INTO public.credit_accounts (user_id) VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  PERFORM 1 FROM public.credit_accounts
    WHERE user_id = p_user_id FOR UPDATE;

  -- Re-reserving for a job that already has a hold is a no-op, which is what
  -- makes a retried submit safe.
  IF p_job_ref IS NOT NULL THEN
    SELECT * INTO v_existing
    FROM public.credit_holds
    WHERE service = p_service AND job_ref = p_job_ref;

    IF FOUND THEN
      RETURN public.credit_account_state(p_user_id) || jsonb_build_object(
        'ok', true,
        'applied', false,
        'hold_id', v_existing.id,
        'hold_status', v_existing.status
      );
    END IF;
  END IF;

  SELECT balance - held INTO v_available
  FROM public.credit_accounts WHERE user_id = p_user_id;

  IF v_available < p_amount THEN
    RETURN public.credit_account_state(p_user_id) || jsonb_build_object(
      'ok', false,
      'applied', false,
      'reason', 'insufficient_credits',
      'required', p_amount,
      'shortfall', p_amount - v_available
    );
  END IF;

  INSERT INTO public.credit_holds
    (user_id, amount, service, job_ref, estimate, expires_at)
  VALUES
    (p_user_id, p_amount, p_service, p_job_ref, p_estimate,
     now() + make_interval(secs => p_ttl_seconds))
  RETURNING id INTO v_hold_id;

  UPDATE public.credit_accounts
  SET held = held + p_amount, updated_at = now()
  WHERE user_id = p_user_id;

  RETURN public.credit_account_state(p_user_id) || jsonb_build_object(
    'ok', true,
    'applied', true,
    'hold_id', v_hold_id
  );
END;
$$;

-- --------------------------------------------
-- credit_hold_attach_job
--
-- The gateway only returns a job id after the credits are already reserved,
-- so the reference is filled in afterwards. Kept separate from credit_hold
-- so the reservation can fail fast before any upstream call is made.
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_hold_attach_job(
  p_hold_id UUID,
  p_job_ref TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hold public.credit_holds%ROWTYPE;
BEGIN
  SELECT * INTO v_hold FROM public.credit_holds WHERE id = p_hold_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'hold_not_found');
  END IF;

  IF v_hold.status <> 'open' THEN
    RETURN jsonb_build_object(
      'ok', false, 'reason', 'hold_not_open', 'hold_status', v_hold.status
    );
  END IF;

  UPDATE public.credit_holds SET job_ref = p_job_ref WHERE id = p_hold_id;

  RETURN jsonb_build_object('ok', true, 'hold_id', p_hold_id);
END;
$$;

-- --------------------------------------------
-- credit_capture
--
-- Settles a reservation. p_actual_amount is clamped to the amount that was
-- reserved: the user was quoted an estimate before submitting, and charging
-- more than the quote is worse than absorbing the difference. When the
-- estimate is exceeded the uncapped figure is recorded in the ledger
-- reference so the pricing table can be recalibrated against reality.
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_capture(
  p_hold_id       UUID,
  p_actual_amount BIGINT,
  p_reference     JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hold      public.credit_holds%ROWTYPE;
  v_charge    BIGINT;
  v_balance   BIGINT;
  v_ledger_id BIGINT;
  v_reference JSONB;
BEGIN
  IF p_actual_amount < 0 THEN
    RAISE EXCEPTION 'actual amount cannot be negative, got %', p_actual_amount;
  END IF;

  SELECT * INTO v_hold FROM public.credit_holds WHERE id = p_hold_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'hold_not_found');
  END IF;

  -- Lock order is always account then hold, matching every other function
  -- here, so two settlements for one user cannot deadlock each other.
  PERFORM 1 FROM public.credit_accounts
    WHERE user_id = v_hold.user_id FOR UPDATE;
  SELECT * INTO v_hold FROM public.credit_holds WHERE id = p_hold_id FOR UPDATE;

  IF v_hold.status <> 'open' THEN
    RETURN public.credit_account_state(v_hold.user_id) || jsonb_build_object(
      'ok', true,
      'applied', false,
      'hold_status', v_hold.status
    );
  END IF;

  v_charge := LEAST(p_actual_amount, v_hold.amount);

  v_reference := p_reference || jsonb_build_object(
    'hold_id', v_hold.id,
    'service', v_hold.service,
    'job_ref', v_hold.job_ref,
    'reserved', v_hold.amount,
    'metered', p_actual_amount
  );

  UPDATE public.credit_accounts
  SET balance = balance - v_charge,
      held = held - v_hold.amount,
      lifetime_spent = lifetime_spent + v_charge,
      updated_at = now()
  WHERE user_id = v_hold.user_id
  RETURNING balance INTO v_balance;

  -- A job that finished at zero cost still settles the hold, it just has
  -- nothing to write to the ledger — the ledger only records movements.
  IF v_charge > 0 THEN
    INSERT INTO public.credit_ledger
      (user_id, amount, kind, balance_after, idempotency_key, hold_id, reference)
    VALUES
      (v_hold.user_id, -v_charge, 'spend', v_balance,
       'hold:' || v_hold.id::text || ':capture', v_hold.id, v_reference)
    RETURNING id INTO v_ledger_id;
  END IF;

  UPDATE public.credit_holds
  SET status = 'captured', settled_at = now()
  WHERE id = p_hold_id;

  RETURN public.credit_account_state(v_hold.user_id) || jsonb_build_object(
    'ok', true,
    'applied', true,
    'charged', v_charge,
    'ledger_id', v_ledger_id
  );
END;
$$;

-- --------------------------------------------
-- credit_release
--
-- Returns the whole reservation and writes no ledger row, because nothing
-- moved. Used whenever a job fails: a failed render is not billable.
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_release(
  p_hold_id UUID,
  p_reason  TEXT DEFAULT NULL,
  p_status  public.credit_hold_status DEFAULT 'released'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hold public.credit_holds%ROWTYPE;
BEGIN
  IF p_status NOT IN ('released', 'expired') THEN
    RAISE EXCEPTION 'release status must be released or expired, got %', p_status;
  END IF;

  SELECT * INTO v_hold FROM public.credit_holds WHERE id = p_hold_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'hold_not_found');
  END IF;

  PERFORM 1 FROM public.credit_accounts
    WHERE user_id = v_hold.user_id FOR UPDATE;
  SELECT * INTO v_hold FROM public.credit_holds WHERE id = p_hold_id FOR UPDATE;

  IF v_hold.status <> 'open' THEN
    RETURN public.credit_account_state(v_hold.user_id) || jsonb_build_object(
      'ok', true,
      'applied', false,
      'hold_status', v_hold.status
    );
  END IF;

  UPDATE public.credit_accounts
  SET held = held - v_hold.amount, updated_at = now()
  WHERE user_id = v_hold.user_id;

  UPDATE public.credit_holds
  SET status = p_status,
      settled_at = now(),
      estimate = estimate || jsonb_build_object('release_reason', p_reason)
  WHERE id = p_hold_id;

  RETURN public.credit_account_state(v_hold.user_id) || jsonb_build_object(
    'ok', true,
    'applied', true,
    'released', v_hold.amount
  );
END;
$$;

-- --------------------------------------------
-- credit_reverse
--
-- For Stripe refunds and chargebacks. p_amount is given as a positive
-- number and written to the ledger as negative. The balance is allowed to
-- go below zero: the credits may already have been spent, and recording the
-- debt is more honest than clamping it to zero and quietly eating the loss.
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_reverse(
  p_user_id         UUID,
  p_amount          BIGINT,
  p_idempotency_key TEXT,
  p_reference       JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_id BIGINT;
  v_balance     BIGINT;
  v_ledger_id   BIGINT;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'reversal amount must be positive, got %', p_amount;
  END IF;

  IF p_idempotency_key IS NULL OR length(p_idempotency_key) = 0 THEN
    RAISE EXCEPTION 'idempotency_key is required';
  END IF;

  INSERT INTO public.credit_accounts (user_id) VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  PERFORM 1 FROM public.credit_accounts
    WHERE user_id = p_user_id FOR UPDATE;

  SELECT id INTO v_existing_id
  FROM public.credit_ledger
  WHERE idempotency_key = p_idempotency_key;

  IF v_existing_id IS NOT NULL THEN
    RETURN public.credit_account_state(p_user_id)
      || jsonb_build_object('applied', false, 'ledger_id', v_existing_id);
  END IF;

  UPDATE public.credit_accounts
  SET balance = balance - p_amount,
      -- Floored because the CHECK forbids a negative lifetime total, and a
      -- reversal larger than everything ever bought means the figure was
      -- already meaningless.
      lifetime_purchased = GREATEST(0, lifetime_purchased - p_amount),
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_balance;

  INSERT INTO public.credit_ledger
    (user_id, amount, kind, balance_after, idempotency_key, reference)
  VALUES
    (p_user_id, -p_amount, 'reversal', v_balance, p_idempotency_key, p_reference)
  RETURNING id INTO v_ledger_id;

  RETURN public.credit_account_state(p_user_id) || jsonb_build_object(
    'applied', true,
    'ledger_id', v_ledger_id,
    'balance_negative', v_balance < 0
  );
END;
$$;

-- --------------------------------------------
-- credit_release_expired_holds
--
-- Sweeper for holds nothing ever settled — a dead worker, a client that
-- stopped polling, a job id that never came back. Without it those credits
-- stay reserved forever and the user can never spend them again.
--
-- Bounded per run so a large backlog cannot hold locks for minutes.
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_release_expired_holds(
  p_limit INTEGER DEFAULT 500
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hold_id UUID;
  v_count   INTEGER := 0;
BEGIN
  FOR v_hold_id IN
    SELECT id FROM public.credit_holds
    WHERE status = 'open' AND expires_at < now()
    ORDER BY expires_at
    LIMIT p_limit
  LOOP
    PERFORM public.credit_release(v_hold_id, 'expired by sweeper', 'expired');
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- --------------------------------------------
-- Execution privileges
--
-- These are SECURITY DEFINER, which means they run as the table owner and
-- ignore RLS. Postgres makes new functions executable by PUBLIC, so without
-- the revokes below any signed-in user could call credit_grant and mint
-- themselves an unlimited balance. Only the service role — reachable solely
-- from server code holding SUPABASE_SERVICE_ROLE_KEY — may call them.
-- --------------------------------------------

DO $$
DECLARE
  v_signature TEXT;
BEGIN
  FOREACH v_signature IN ARRAY ARRAY[
    'public.credit_account_state(UUID)',
    'public.credit_grant(UUID, BIGINT, public.credit_entry_kind, TEXT, JSONB)',
    'public.credit_hold(UUID, BIGINT, TEXT, TEXT, INTEGER, JSONB)',
    'public.credit_hold_attach_job(UUID, TEXT)',
    'public.credit_capture(UUID, BIGINT, JSONB)',
    'public.credit_release(UUID, TEXT, public.credit_hold_status)',
    'public.credit_reverse(UUID, BIGINT, TEXT, JSONB)',
    'public.credit_release_expired_holds(INTEGER)'
  ]
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', v_signature);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon, authenticated', v_signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', v_signature);
  END LOOP;
END
$$;
