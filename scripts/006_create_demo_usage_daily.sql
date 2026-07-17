-- ============================================
-- TABLE: demo_usage_daily
-- Counts per-user, per-kind demo redirects/day so we can rate-limit the
-- three free online demos (Image FaceSwap Pro 2.0, Video FaceSwap Pro,
-- NanoFace Vivid) to 10 image opens/day + 10 video opens/day per user.
--
--   kind = 'image'  -> Image FaceSwap Pro 2.0 + NanoFace Vivid
--   kind = 'video'  -> Video FaceSwap Pro
--
-- Rows are keyed on (user_id, kind, day) so each user has at most 2 rows
-- per calendar day. `day` is a UTC calendar date so a global reset happens
-- at 00:00 UTC — the value shown to the user in the limit-page copy.
-- ============================================

CREATE TABLE IF NOT EXISTS public.demo_usage_daily (
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('image', 'video')),
  day         DATE NOT NULL,
  count       INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind, day)
);

CREATE INDEX IF NOT EXISTS idx_demo_usage_daily_day ON public.demo_usage_daily(day DESC);

-- ============================================
-- RPC: increment_demo_usage
-- Atomically upserts today's row and returns the NEW count (after +1).
-- Called by /api/demos/open — the endpoint reads the return value and
-- decides whether to redirect to the tunnel or the limit CTA page.
-- SECURITY DEFINER because RLS blocks direct writes for regular users;
-- the endpoint itself performs the auth check via createClient()+getUser()
-- and passes the trusted user_id in.
-- ============================================

CREATE OR REPLACE FUNCTION public.increment_demo_usage(
  p_user_id UUID,
  p_kind    TEXT,
  p_day     DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_kind NOT IN ('image', 'video') THEN
    RAISE EXCEPTION 'kind must be image or video, got %', p_kind;
  END IF;

  INSERT INTO public.demo_usage_daily (user_id, kind, day, count, updated_at)
  VALUES (p_user_id, p_kind, p_day, 1, now())
  ON CONFLICT (user_id, kind, day)
  DO UPDATE SET
    count = public.demo_usage_daily.count + 1,
    updated_at = now()
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;

-- ============================================
-- RLS
-- ============================================
ALTER TABLE public.demo_usage_daily ENABLE ROW LEVEL SECURITY;

-- Users can read their own rows (used by /api/demos/usage for the widget).
DROP POLICY IF EXISTS "demo_usage_daily_select_own" ON public.demo_usage_daily;
CREATE POLICY "demo_usage_daily_select_own"
  ON public.demo_usage_daily FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read everything (for operational visibility).
-- Depends on public.is_admin() defined in scripts/005_create_demo_feedback.sql.
DROP POLICY IF EXISTS "demo_usage_daily_admin_select_all" ON public.demo_usage_daily;
CREATE POLICY "demo_usage_daily_admin_select_all"
  ON public.demo_usage_daily FOR SELECT
  USING (public.is_admin());

-- No INSERT/UPDATE/DELETE policies for regular users: all writes go through
-- the increment_demo_usage RPC (SECURITY DEFINER) or the service_role key
-- used inside /api/demos/open. This prevents a signed-in user from resetting
-- their own counter or spoofing kind='image' when they're actually opening
-- the video demo.
