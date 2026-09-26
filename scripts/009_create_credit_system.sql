-- ============================================
-- MIGRATION 009: credit system storage
--
-- Three tables that together replace what would otherwise be a single
-- mutable `profiles.credits` integer:
--
--   credit_ledger    append-only record of every credit that moved, and why
--   credit_accounts  materialised balance, maintained in the same
--                    transaction as the ledger write
--   credit_holds     reservations against in-flight async work
--
-- WHY NOT JUST A COLUMN
--
-- `UPDATE profiles SET credits = credits - 10` cannot answer "why is my
-- balance 37", loses writes under concurrency, and has nowhere to express a
-- refund or a chargeback. The ledger is the source of truth; the account row
-- exists only so reads do not have to sum it. The two are always written
-- together, so SUM(amount) per user must equal balance — see
-- scripts/verify-credit-system.mjs, which asserts exactly that.
--
-- WHY HOLDS ARE NOT LEDGER ROWS
--
-- A hold is a reservation, not a movement of credits. Charging on submit
-- means every failed render needs a refund, and any bug in the refund path
-- takes money from users; charging only on completion lets one credit launch
-- a hundred concurrent jobs. So submit reserves (credit_holds), and the
-- terminal state either settles the real cost (one ledger row) or releases
-- the reservation (no ledger row at all). The ledger therefore contains
-- nothing but real money movements.
--
-- Migration 010 adds the functions that are the only supported way to write
-- to any of this.
--
-- Safe to re-run.
-- ============================================

-- --------------------------------------------
-- Enums
-- --------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credit_entry_kind') THEN
    CREATE TYPE public.credit_entry_kind AS ENUM (
      'purchase',      -- credits bought with money
      'bonus',         -- volume bonus attached to a purchase
      'signup_grant',  -- free credits given at registration
      'promo',         -- marketing / goodwill grant
      'spend',         -- consumed by a service
      'refund',        -- credits handed back (bad render, support gesture)
      'reversal',      -- credits clawed back because the money went back
                       -- (Stripe refund or chargeback)
      'admin_adjust'   -- manual correction; the only kind allowed either sign
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'credit_hold_status') THEN
    CREATE TYPE public.credit_hold_status AS ENUM (
      'open',      -- reserved, job in flight
      'captured',  -- settled against actual usage
      'released',  -- returned in full, nothing charged
      'expired'    -- released by the sweeper because nothing ever settled it
    );
  END IF;
END
$$;

-- --------------------------------------------
-- credit_accounts
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS public.credit_accounts (
  user_id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance             BIGINT      NOT NULL DEFAULT 0,
  held                BIGINT      NOT NULL DEFAULT 0,
  lifetime_purchased  BIGINT      NOT NULL DEFAULT 0,
  lifetime_spent      BIGINT      NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT credit_accounts_held_non_negative CHECK (held >= 0),
  CONSTRAINT credit_accounts_lifetime_non_negative
    CHECK (lifetime_purchased >= 0 AND lifetime_spent >= 0)
);

-- Note the absence of CHECK (balance >= 0). A chargeback can land after the
-- credits have already been spent, and the honest representation of that is
-- a negative balance the user has to top up out of. Silently clamping to
-- zero would write off the loss without recording it. New holds are blocked
-- while the balance is negative because available = balance - held is then
-- negative too, so no extra rule is needed to stop further spending.
COMMENT ON COLUMN public.credit_accounts.balance IS
  'Settled credits. May be negative after a reversal; see migration 009.';
COMMENT ON COLUMN public.credit_accounts.held IS
  'Sum of open holds. Spendable amount is (balance - held), never balance.';

-- --------------------------------------------
-- credit_ledger
-- --------------------------------------------

-- user_id deliberately carries no foreign key. Every other table here
-- cascades from auth.users, but a cascade issues a DELETE, and the
-- append-only trigger below rejects DELETE from every role — so an FK would
-- make deleting a user fail outright. ON DELETE SET NULL has the same
-- problem, because a referential action fires the UPDATE trigger.
--
-- Dropping the FK is also the behaviour you want: deleting an account
-- removes its operational state and leaves the financial record standing,
-- which is the normal treatment for an immutable audit log.
CREATE TABLE IF NOT EXISTS public.credit_ledger (
  id               BIGSERIAL    PRIMARY KEY,
  user_id          UUID         NOT NULL,
  amount           BIGINT       NOT NULL,
  kind             public.credit_entry_kind NOT NULL,
  balance_after    BIGINT       NOT NULL,
  idempotency_key  TEXT         NOT NULL UNIQUE,
  hold_id          UUID,
  reference        JSONB        NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT credit_ledger_amount_non_zero CHECK (amount <> 0),

  -- Sign is implied by kind, so let the database enforce it rather than
  -- trusting every future caller to get it right. A 'spend' of +500 is a
  -- bug that would otherwise silently mint credits.
  CONSTRAINT credit_ledger_sign_matches_kind CHECK (
    (kind IN ('purchase', 'bonus', 'signup_grant', 'promo', 'refund') AND amount > 0)
    OR (kind IN ('spend', 'reversal') AND amount < 0)
    OR (kind = 'admin_adjust')
  )
);

-- The single most important constraint in the credit system. Every write
-- path derives a deterministic key (e.g. 'stripe:pi_3Abc...'), so a Stripe
-- redelivery, a double-clicked button, or a retried request collapses into
-- one row instead of minting credits twice.
COMMENT ON COLUMN public.credit_ledger.idempotency_key IS
  'Deterministic per logical event. stripe:<payment_intent_id> for top-ups, '
  'hold:<hold_id>:capture for settlements. Uniqueness here is what makes '
  'every credit write safe to retry.';

COMMENT ON COLUMN public.credit_ledger.balance_after IS
  'Balance snapshot at write time. Redundant with a running sum, kept so a '
  'single row explains itself during a support conversation.';

COMMENT ON COLUMN public.credit_ledger.reference IS
  'Free-form provenance: stripe payment_intent / session, pack_id, service '
  'job id, price_version. Queried with jsonb operators for reconciliation.';

-- Statement view for the account page, newest first.
CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_created
  ON public.credit_ledger (user_id, created_at DESC);

-- Walk back from a hold to whatever it settled as.
CREATE INDEX IF NOT EXISTS idx_credit_ledger_hold
  ON public.credit_ledger (hold_id)
  WHERE hold_id IS NOT NULL;

-- Reconcile a Stripe payment against what it granted.
CREATE INDEX IF NOT EXISTS idx_credit_ledger_reference
  ON public.credit_ledger USING GIN (reference);

-- --------------------------------------------
-- Append-only enforcement
--
-- The RLS policies below give users SELECT only, but every server path in
-- this codebase uses createAdminClient() with the service_role key, which
-- bypasses RLS entirely. So RLS is not what protects the ledger — a trigger
-- is. This makes an accidental UPDATE or DELETE fail no matter which role
-- issues it, which is the property that lets the table be trusted as an
-- audit log.
--
-- Corrections are made by appending an offsetting 'admin_adjust' row, the
-- same way a general ledger is corrected.
-- --------------------------------------------

CREATE OR REPLACE FUNCTION public.credit_ledger_reject_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION
    'credit_ledger is append-only; correct a mistake by inserting an '
    'offsetting admin_adjust entry instead of % on it', TG_OP
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS credit_ledger_no_update_delete ON public.credit_ledger;
CREATE TRIGGER credit_ledger_no_update_delete
  BEFORE UPDATE OR DELETE ON public.credit_ledger
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.credit_ledger_reject_mutation();

-- TRUNCATE cannot share a trigger with row-level events, and it is the one
-- statement that would wipe the audit log without tripping the guard above.
DROP TRIGGER IF EXISTS credit_ledger_no_truncate ON public.credit_ledger;
CREATE TRIGGER credit_ledger_no_truncate
  BEFORE TRUNCATE ON public.credit_ledger
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.credit_ledger_reject_mutation();

-- --------------------------------------------
-- credit_holds
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS public.credit_holds (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      BIGINT      NOT NULL CHECK (amount > 0),
  status      public.credit_hold_status NOT NULL DEFAULT 'open',
  service     TEXT        NOT NULL,
  job_ref     TEXT,
  estimate    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at  TIMESTAMPTZ,

  CONSTRAINT credit_holds_settled_iff_terminal CHECK (
    (status = 'open' AND settled_at IS NULL)
    OR (status <> 'open' AND settled_at IS NOT NULL)
  )
);

-- job_ref is null between reserving credits and the upstream gateway
-- returning an id, so the uniqueness has to skip those rows. Once a job id
-- exists it maps to exactly one hold, which is what makes settlement
-- idempotent when a polling client reports the same terminal state twice.
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_holds_service_job
  ON public.credit_holds (service, job_ref)
  WHERE job_ref IS NOT NULL;

-- Drives the sweeper in migration 010.
CREATE INDEX IF NOT EXISTS idx_credit_holds_open_expiry
  ON public.credit_holds (expires_at)
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_credit_holds_user
  ON public.credit_holds (user_id, created_at DESC);

COMMENT ON COLUMN public.credit_holds.expires_at IS
  'Without this a job that never reaches a terminal state — dead worker, '
  'lost callback — strands the reservation and the user can never spend '
  'those credits again.';

COMMENT ON COLUMN public.credit_holds.estimate IS
  'The inputs the reservation was computed from (dimensions, frames, model, '
  'price_version). Kept so estimates can be compared against actuals and '
  'the pricing table recalibrated.';

-- --------------------------------------------
-- RLS
--
-- Read-only for the owner, read-everything for admins, no write policies at
-- all. Writes go through the SECURITY DEFINER functions in migration 010 or
-- the service role, never straight from a client.
-- --------------------------------------------

ALTER TABLE public.credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_ledger   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_holds    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "credit_accounts_select_own" ON public.credit_accounts;
CREATE POLICY "credit_accounts_select_own"
  ON public.credit_accounts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "credit_accounts_admin_select_all" ON public.credit_accounts;
CREATE POLICY "credit_accounts_admin_select_all"
  ON public.credit_accounts FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "credit_ledger_select_own" ON public.credit_ledger;
CREATE POLICY "credit_ledger_select_own"
  ON public.credit_ledger FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "credit_ledger_admin_select_all" ON public.credit_ledger;
CREATE POLICY "credit_ledger_admin_select_all"
  ON public.credit_ledger FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "credit_holds_select_own" ON public.credit_holds;
CREATE POLICY "credit_holds_select_own"
  ON public.credit_holds FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "credit_holds_admin_select_all" ON public.credit_holds;
CREATE POLICY "credit_holds_admin_select_all"
  ON public.credit_holds FOR SELECT
  USING (public.is_admin());

-- Supabase hands `anon` and `authenticated` full table privileges by
-- default and relies on RLS to gate them. RLS already denies these writes
-- (no policy means no access), but dropping the grant states the intent at
-- the privilege layer too, and is what would still hold if a policy were
-- ever added carelessly.
REVOKE INSERT, UPDATE, DELETE ON public.credit_accounts FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.credit_ledger   FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.credit_holds    FROM anon, authenticated;

-- ==============================================
-- WHAT HAPPENS WHEN A USER IS DELETED
--
-- credit_accounts and credit_holds cascade away with the user; credit_ledger
-- rows stay, with a user_id that no longer resolves. That is intentional —
-- see the comment on the table — and has two consequences worth knowing:
--
--   * The retained rows are an orphaned audit trail. If a deletion request
--     requires erasing them too, that is a deliberate, logged operation, not
--     something a cascade should do silently.
--   * Reconciliation (SUM(ledger) = balance) only holds for users that still
--     have an account row. Scope any reconciliation query with a join to
--     credit_accounts.
--
-- Genuinely purging ledger rows means stepping around the guard on purpose:
--
--   ALTER TABLE public.credit_ledger DISABLE TRIGGER credit_ledger_no_update_delete;
--   DELETE FROM public.credit_ledger WHERE user_id = '...';
--   ALTER TABLE public.credit_ledger ENABLE TRIGGER credit_ledger_no_update_delete;
-- ==============================================
