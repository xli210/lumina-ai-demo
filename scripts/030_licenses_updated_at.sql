-- ============================================
-- MIGRATION 030: licenses.updated_at
--
-- 002 declares licenses.updated_at, but the production table was created
-- before that column was added to the file, so it never existed there.
-- admin_set_license_revoked (016) sets it, which made every Revoke and
-- Restore in the Admin Console fail with
--   column "updated_at" of relation "licenses" does not exist
-- and change nothing. Found and applied in production on 2026-11-24, after a
-- refunded V Pro licence could not be revoked from the console.
--
-- Safe to re-run.
-- ============================================

ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
