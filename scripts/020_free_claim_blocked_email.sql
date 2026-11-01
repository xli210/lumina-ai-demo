-- ============================================
-- Free credits: a verdict for throwaway email addresses
--
-- lib/free-claim.ts now refuses the free sign-up credits to an account on a
-- throwaway-inbox domain (lib/disposable-email.ts) and records that as
-- 'blocked_email', next to 'blocked_ip' and 'blocked_device'. Such an account
-- still signs in and can buy credits. A 'blocked_email' row does not count
-- against its device or network: only granted claims do.
--
-- Requires: 015.
-- ============================================

DO $$
DECLARE
  c TEXT;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.free_credit_claims'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%outcome%'
  LOOP
    EXECUTE format('ALTER TABLE public.free_credit_claims DROP CONSTRAINT %I', c);
  END LOOP;
END $$;

ALTER TABLE public.free_credit_claims
  ADD CONSTRAINT free_credit_claims_outcome_check
  CHECK (outcome IN ('granted', 'blocked_ip', 'blocked_device', 'blocked_email', 'grandfathered'));

-- ------------------------------------------------------------
-- Second look for accounts the old 30-day IP window refused.
--
-- lib/free-claim.ts now holds an IP against a newcomer for 3 days, not 30.
-- Refusals that the 3-day rule would not have made (on 2026-11-01: four
-- accounts, 10-27 to 10-29, none of which had bought or used a tool) lose
-- their verdict here, so the next tool visit judges them again under the
-- current rules and, if nothing else matches, grants the welcome credits.
-- ------------------------------------------------------------

DELETE FROM public.free_credit_claims b
WHERE b.outcome = 'blocked_ip'
  AND NOT EXISTS (
    SELECT 1 FROM public.free_credit_claims g
    WHERE g.outcome = 'granted' AND g.ip_hash = b.ip_hash AND g.user_id <> b.user_id
      AND g.created_at > b.created_at - interval '3 days' AND g.created_at <= b.created_at)
  AND NOT EXISTS (
    SELECT 1 FROM public.free_credit_claims g
    WHERE g.outcome IN ('granted', 'grandfathered') AND g.device_hash = b.device_hash AND g.user_id <> b.user_id);
