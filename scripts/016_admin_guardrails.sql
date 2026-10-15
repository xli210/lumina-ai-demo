-- ============================================
-- MIGRATION 016: guardrails for the admin dashboard's dangerous actions
--
-- WHY
--
-- On 2026-10-14 an admin promoted a two-hour-old account to admin by tapping the
-- Promote button on a phone. In the dashboard that button sat in every user row,
-- next to Ban, and acted on one tap. The database accepted it: admin_set_user_role
-- (migration 008) only asked "is the caller an admin?". Nothing recorded who did
-- it, and nothing slowed it down.
--
-- WHAT THIS CHANGES (the dashboard UI adds its own layer on top: a danger zone,
-- a typed confirmation and a countdown, see app/admin/confirm-action-dialog.tsx.
-- A UI layer alone is not enough: the database must refuse a request that did
-- not name its target.)
--
--   1. admin_audit_log: an append-only record of every dangerous admin action:
--      who, to whom, when, from which address.
--   2. admin_set_user_role / admin_set_user_banned / admin_set_license_revoked now
--      take a third argument, p_confirm, which must equal the target's identity
--      (the account email, or the license key). A stray or half-formed request
--      cannot act, whatever sent it.
--   3. Making someone an admin additionally needs: a confirmed email, an account at
--      least 24 hours old, and no more than 3 role changes by that admin per hour.
--      An admin cannot be banned (demote first), and nobody can ban or demote
--      themselves.
--   4. The unguarded two-argument versions are dropped, so there is no path around
--      the new checks, and the blanket "admins may UPDATE any license" policy is
--      dropped so is_revoked cannot be flipped straight from the browser either.
--   5. admin_user_identity(): lets the dashboard show the email, age and sign-in
--      method it asks the admin to confirm (auth.users is not readable from the
--      browser).
--
-- Safe to re-run.
-- ============================================

-- --------------------------------------------
-- 1. The audit log (append-only)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id           BIGSERIAL   PRIMARY KEY,
  at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id     UUID        NOT NULL,
  actor_email  TEXT,
  action       TEXT        NOT NULL,
  target_id    UUID,
  target_email TEXT,
  detail       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  ip           TEXT,
  user_agent   TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_at
  ON public.admin_audit_log (at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_actor
  ON public.admin_audit_log (actor_id, at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_audit_log_select ON public.admin_audit_log;
CREATE POLICY admin_audit_log_select
  ON public.admin_audit_log FOR SELECT
  USING (public.is_admin());

-- Nobody writes here directly. Rows arrive through the SECURITY DEFINER functions below.
REVOKE ALL ON public.admin_audit_log FROM PUBLIC;
REVOKE ALL ON public.admin_audit_log FROM anon;
REVOKE ALL ON public.admin_audit_log FROM authenticated;
GRANT SELECT ON public.admin_audit_log TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_audit_log_append_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'admin_audit_log is append-only' USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS admin_audit_log_no_change ON public.admin_audit_log;
CREATE TRIGGER admin_audit_log_no_change
  BEFORE UPDATE OR DELETE ON public.admin_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.admin_audit_log_append_only();

DROP TRIGGER IF EXISTS admin_audit_log_no_truncate ON public.admin_audit_log;
CREATE TRIGGER admin_audit_log_no_truncate
  BEFORE TRUNCATE ON public.admin_audit_log
  FOR EACH STATEMENT EXECUTE FUNCTION public.admin_audit_log_append_only();

-- Internal: append one row, taking the caller's address and browser from the
-- request headers PostgREST exposes. Not callable by clients.
CREATE OR REPLACE FUNCTION public.admin_audit_append(
  p_action       TEXT,
  p_target_id    UUID,
  p_target_email TEXT,
  p_detail       JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_headers JSONB;
  v_ip      TEXT;
  v_ua      TEXT;
  v_actor   TEXT;
BEGIN
  BEGIN
    v_headers := nullif(current_setting('request.headers', true), '')::jsonb;
  EXCEPTION WHEN OTHERS THEN
    v_headers := NULL;
  END;

  v_ip := coalesce(
    v_headers ->> 'cf-connecting-ip',
    split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1)
  );
  v_ip := nullif(btrim(v_ip), '');
  v_ua := left(v_headers ->> 'user-agent', 300);

  SELECT u.email INTO v_actor FROM auth.users u WHERE u.id = auth.uid();

  INSERT INTO public.admin_audit_log
    (actor_id, actor_email, action, target_id, target_email, detail, ip, user_agent)
  VALUES
    (auth.uid(), v_actor, p_action, p_target_id, p_target_email,
     coalesce(p_detail, '{}'::jsonb), v_ip, v_ua);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_audit_append(TEXT, UUID, TEXT, JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_audit_append(TEXT, UUID, TEXT, JSONB) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_audit_append(TEXT, UUID, TEXT, JSONB) FROM authenticated;

-- --------------------------------------------
-- 2. Who is this account? (for the confirmation dialog)
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_user_identity(p_user_id UUID)
RETURNS TABLE (
  email           TEXT,
  created_at      TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  provider        TEXT,
  email_confirmed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT u.email::text,
           u.created_at,
           u.last_sign_in_at,
           (u.raw_app_meta_data ->> 'provider')::text,
           (u.email_confirmed_at IS NOT NULL)
    FROM auth.users u
    WHERE u.id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_user_identity(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_user_identity(UUID) TO authenticated;

-- --------------------------------------------
-- 3. Role changes
-- --------------------------------------------
DROP FUNCTION IF EXISTS public.admin_set_user_role(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.admin_set_user_role(
  p_user_id UUID,
  p_role    TEXT,
  p_confirm TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email     TEXT;
  v_created   TIMESTAMPTZ;
  v_confirmed TIMESTAMPTZ;
  v_old       TEXT;
  v_ident     TEXT;
  v_recent    INTEGER;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  IF p_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION 'role must be user or admin, got %', p_role;
  END IF;

  SELECT u.email, u.created_at, u.email_confirmed_at, p.role
    INTO v_email, v_created, v_confirmed, v_old
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE u.id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found';
  END IF;

  -- Keeping the last admin from locking everyone out: nobody removes their own role.
  IF p_user_id = auth.uid() AND p_role <> 'admin' THEN
    RAISE EXCEPTION 'cannot remove your own admin role';
  END IF;

  IF coalesce(v_old, 'user') = p_role THEN
    RAISE EXCEPTION 'this account is already %', p_role;
  END IF;

  -- The caller must name the target. The dashboard makes a person type this.
  v_ident := coalesce(v_email, p_user_id::text);
  IF lower(btrim(coalesce(p_confirm, ''))) <> lower(v_ident) THEN
    RAISE EXCEPTION 'confirmation does not match the account email'
      USING ERRCODE = '22023';
  END IF;

  IF p_role = 'admin' THEN
    IF v_confirmed IS NULL THEN
      RAISE EXCEPTION 'this account has not confirmed its email, so it cannot become an admin';
    END IF;
    IF v_created > now() - interval '24 hours' THEN
      RAISE EXCEPTION 'this account is less than 24 hours old; wait before making it an admin';
    END IF;
  END IF;

  SELECT count(*) INTO v_recent
  FROM public.admin_audit_log
  WHERE actor_id = auth.uid()
    AND action IN ('grant_admin', 'revoke_admin')
    AND at > now() - interval '1 hour';
  IF v_recent >= 3 THEN
    RAISE EXCEPTION 'too many role changes in the last hour; try again later'
      USING ERRCODE = '54000';
  END IF;

  UPDATE public.profiles
  SET role = p_role, updated_at = now()
  WHERE id = p_user_id;

  PERFORM public.admin_audit_append(
    CASE WHEN p_role = 'admin' THEN 'grant_admin' ELSE 'revoke_admin' END,
    p_user_id,
    v_email,
    jsonb_build_object('from', coalesce(v_old, 'user'), 'to', p_role,
                       'account_created_at', v_created)
  );
END;
$$;

-- --------------------------------------------
-- 4. Bans
-- --------------------------------------------
DROP FUNCTION IF EXISTS public.admin_set_user_banned(UUID, BOOLEAN);

CREATE OR REPLACE FUNCTION public.admin_set_user_banned(
  p_user_id UUID,
  p_banned  BOOLEAN,
  p_confirm TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email  TEXT;
  v_role   TEXT;
  v_old    BOOLEAN;
  v_ident  TEXT;
  v_recent INTEGER;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  SELECT u.email, p.role, coalesce(p.is_banned, false)
    INTO v_email, v_role, v_old
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE u.id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found';
  END IF;

  IF p_user_id = auth.uid() AND p_banned THEN
    RAISE EXCEPTION 'cannot ban yourself';
  END IF;

  IF p_banned AND v_role = 'admin' THEN
    RAISE EXCEPTION 'cannot ban an admin; remove the admin role first';
  END IF;

  IF v_old = p_banned THEN
    RAISE EXCEPTION 'this account is already %', CASE WHEN p_banned THEN 'banned' ELSE 'not banned' END;
  END IF;

  v_ident := coalesce(v_email, p_user_id::text);
  IF lower(btrim(coalesce(p_confirm, ''))) <> lower(v_ident) THEN
    RAISE EXCEPTION 'confirmation does not match the account email'
      USING ERRCODE = '22023';
  END IF;

  SELECT count(*) INTO v_recent
  FROM public.admin_audit_log
  WHERE actor_id = auth.uid()
    AND action IN ('ban', 'unban')
    AND at > now() - interval '1 hour';
  IF v_recent >= 10 THEN
    RAISE EXCEPTION 'too many ban changes in the last hour; try again later'
      USING ERRCODE = '54000';
  END IF;

  UPDATE public.profiles
  SET is_banned = p_banned, updated_at = now()
  WHERE id = p_user_id;

  PERFORM public.admin_audit_append(
    CASE WHEN p_banned THEN 'ban' ELSE 'unban' END,
    p_user_id,
    v_email,
    jsonb_build_object('banned', p_banned)
  );
END;
$$;

-- --------------------------------------------
-- 5. License revoke / restore
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_license_revoked(
  p_license_id UUID,
  p_revoked    BOOLEAN,
  p_confirm    TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key     TEXT;
  v_product TEXT;
  v_user    UUID;
  v_old     BOOLEAN;
  v_email   TEXT;
  v_recent  INTEGER;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  SELECT l.license_key, l.product_id, l.user_id, coalesce(l.is_revoked, false)
    INTO v_key, v_product, v_user, v_old
  FROM public.licenses l
  WHERE l.id = p_license_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'license not found';
  END IF;

  IF v_old = p_revoked THEN
    RAISE EXCEPTION 'this license is already %', CASE WHEN p_revoked THEN 'revoked' ELSE 'active' END;
  END IF;

  IF upper(btrim(coalesce(p_confirm, ''))) <> upper(v_key) THEN
    RAISE EXCEPTION 'confirmation does not match the license key'
      USING ERRCODE = '22023';
  END IF;

  SELECT count(*) INTO v_recent
  FROM public.admin_audit_log
  WHERE actor_id = auth.uid()
    AND action IN ('revoke_license', 'restore_license')
    AND at > now() - interval '1 hour';
  IF v_recent >= 20 THEN
    RAISE EXCEPTION 'too many license changes in the last hour; try again later'
      USING ERRCODE = '54000';
  END IF;

  UPDATE public.licenses
  SET is_revoked = p_revoked, updated_at = now()
  WHERE id = p_license_id;

  IF v_user IS NOT NULL THEN
    SELECT u.email INTO v_email FROM auth.users u WHERE u.id = v_user;
  END IF;

  PERFORM public.admin_audit_append(
    CASE WHEN p_revoked THEN 'revoke_license' ELSE 'restore_license' END,
    v_user,
    v_email,
    jsonb_build_object('license_id', p_license_id, 'product_id', v_product)
  );
END;
$$;

-- --------------------------------------------
-- 6. Who may call them, and closing the side doors
-- --------------------------------------------
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_banned(UUID, BOOLEAN, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_set_license_revoked(UUID, BOOLEAN, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_banned(UUID, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_license_revoked(UUID, BOOLEAN, TEXT) TO authenticated;

-- 008 meant to remove this and the column grants already make it unusable for
-- profiles; drop it so the policy list says what is true.
DROP POLICY IF EXISTS "admin_update_all_profiles" ON public.profiles;

-- Admins used to flip licenses.is_revoked straight from the browser. That path
-- skipped every check above, so close it: revoking goes through
-- admin_set_license_revoked from now on. (Server code uses the service role and
-- is unaffected.)
DROP POLICY IF EXISTS "admin_update_all_licenses" ON public.licenses;

-- ==============================================
-- AFTER RUNNING THIS
--
-- Deploy the dashboard that calls the three-argument functions (this repo's
-- app/admin/admin-dashboard.tsx). Until it is deployed, the old dashboard's
-- Promote / Ban / Revoke buttons fail with "function ... does not exist", which is
-- the safe way for them to fail.
--
-- Read the trail:
--   select at, actor_email, action, target_email, detail, ip
--   from public.admin_audit_log order by at desc limit 50;
-- ==============================================
