-- ============================================
-- MIGRATION 008: close a privilege-escalation hole on public.profiles
--
-- THE PROBLEM
--
-- 001_create_profiles.sql grants users UPDATE on their own row:
--
--     create policy "profiles_update_own" on public.profiles
--       for update using (auth.uid() = id);
--
-- Postgres RLS gates *rows*, never *columns*, and Supabase grants
-- table-level UPDATE to `authenticated` by default. So that policy lets any
-- signed-in user change any column on their own profile — including the two
-- that exist specifically to constrain them:
--
--     update profiles set role = 'admin'   where id = auth.uid();
--     update profiles set is_banned = false where id = auth.uid();
--
-- role = 'admin' is the only thing standing between a regular account and
-- /admin, every /private-demos/* console (which proxy upstream AI services
-- using server-side API keys), and the "super license" branch in
-- app/api/license/activate/route.ts that lets one key activate any product.
--
-- This also has to be fixed before the credit migrations land: the RLS on
-- the credit tables is written in terms of public.is_admin(), so a
-- self-promotable admin role would make that access control meaningless,
-- and 007 just added profiles.stripe_customer_id, which inherits the same
-- hole.
--
-- THE FIX
--
-- Replace the blanket table-level UPDATE grant with column-level grants for
-- exactly the fields a user is allowed to edit about themselves. The RLS
-- policy still restricts them to their own row; the grant now restricts
-- which columns. Privileged fields move to SECURITY DEFINER RPCs that check
-- admin status server-side.
--
-- Safe to re-run.
-- ============================================

-- --------------------------------------------
-- 1. Column-level write grants
-- --------------------------------------------

-- Supabase grants UPDATE on every public table to these roles at project
-- setup. A table-level grant implies all columns and cannot be narrowed by
-- revoking individual columns, so it has to be dropped first.
REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE UPDATE ON public.profiles FROM anon;

-- The only profile fields a user edits about themselves. account-profile.tsx
-- writes display_name + updated_at; avatar_url is included for the Google /
-- GitHub OAuth avatar path.
GRANT UPDATE (display_name, avatar_url, updated_at)
  ON public.profiles TO authenticated;

-- Deliberately NOT granted to anyone but the service role:
--   role                 -- see admin_set_user_role below
--   is_banned            -- see admin_set_user_banned below
--   has_purchased        -- derived from a completed Stripe payment
--   stripe_customer_id   -- payment identity, set during checkout
--   id, created_at       -- immutable

-- --------------------------------------------
-- 2. Privileged mutations, as audited RPCs
--
-- app/admin/admin-dashboard.tsx used to write these columns straight from
-- the browser with the anon key, relying on the admin_update_all_profiles
-- policy. That path is gone now, so the two operations it needs become
-- explicit functions that re-check admin status themselves rather than
-- trusting the caller.
-- --------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_set_user_role(
  p_user_id UUID,
  p_role    TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  IF p_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION 'role must be user or admin, got %', p_role;
  END IF;

  -- Without this an admin can demote themselves and, if they are the last
  -- one, lock the whole project out of /admin with no way back in except a
  -- manual SQL statement against production.
  IF p_user_id = auth.uid() AND p_role <> 'admin' THEN
    RAISE EXCEPTION 'cannot remove your own admin role';
  END IF;

  UPDATE public.profiles
  SET role = p_role, updated_at = now()
  WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_banned(
  p_user_id UUID,
  p_banned  BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  IF p_user_id = auth.uid() AND p_banned THEN
    RAISE EXCEPTION 'cannot ban yourself';
  END IF;

  UPDATE public.profiles
  SET is_banned = p_banned, updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- SECURITY DEFINER functions are executable by PUBLIC unless told otherwise,
-- so the admin check inside each one is the real gate. Narrowing EXECUTE as
-- well means an anonymous caller cannot even reach that check.
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_banned(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_banned(UUID, BOOLEAN) TO authenticated;

-- --------------------------------------------
-- 3. Retire the now-redundant admin UPDATE policy
--
-- admin_update_all_profiles was what made the browser-side role/ban writes
-- work. With the column grant gone it can no longer authorize anything the
-- RPCs above do not already handle, and leaving it in place suggests a
-- write path that no longer exists.
-- --------------------------------------------
DROP POLICY IF EXISTS "admin_update_all_profiles" ON public.profiles;

-- ==============================================
-- AFTER RUNNING THIS
--
-- Verify the hole is closed. Signed in as a NON-admin user, this should now
-- report 0 updated rows instead of succeeding:
--
--   update profiles set role = 'admin' where id = auth.uid();
--
-- and this should still work:
--
--   update profiles set display_name = 'new name' where id = auth.uid();
--
-- If any account was already self-promoted, audit before trusting the data:
--
--   select id, display_name, role, created_at from public.profiles
--   where role = 'admin';
-- ==============================================
