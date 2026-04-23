-- ============================================
-- TABLE: demo_feedback
-- Stores like/dislike votes for the online Pro demos
-- (Image FaceSwap Pro, Video FaceSwap Pro, ...)
-- ============================================

CREATE TABLE IF NOT EXISTS public.demo_feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  demo_id     TEXT NOT NULL,
  vote        TEXT NOT NULL CHECK (vote IN ('like', 'dislike')),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Hard-enforce one vote per user per demo at the database level.
  -- Even if the API or UI is bypassed, duplicate inserts will fail
  -- with Postgres unique-violation code 23505.
  UNIQUE (user_id, demo_id)
);

CREATE INDEX IF NOT EXISTS idx_demo_feedback_demo_id ON public.demo_feedback(demo_id);
CREATE INDEX IF NOT EXISTS idx_demo_feedback_user_id ON public.demo_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_feedback_created_at ON public.demo_feedback(created_at DESC);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE public.demo_feedback ENABLE ROW LEVEL SECURITY;

-- Helper: SECURITY DEFINER function to check admin role without RLS recursion.
-- Idempotent: safe to re-run even if you already created it in an earlier migration.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Users can read their own vote (used by the UI to show "Thanks for your feedback!")
DROP POLICY IF EXISTS "demo_feedback_select_own" ON public.demo_feedback;
CREATE POLICY "demo_feedback_select_own"
  ON public.demo_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert ONE vote of their own.
-- The UNIQUE (user_id, demo_id) constraint prevents duplicates.
DROP POLICY IF EXISTS "demo_feedback_insert_own" ON public.demo_feedback;
CREATE POLICY "demo_feedback_insert_own"
  ON public.demo_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read everything.
DROP POLICY IF EXISTS "demo_feedback_admin_select_all" ON public.demo_feedback;
CREATE POLICY "demo_feedback_admin_select_all"
  ON public.demo_feedback FOR SELECT
  USING (public.is_admin());

-- ==============================================
-- NOTE
-- No UPDATE policy on purpose: votes are immutable once submitted.
-- If you later want to allow users to change their vote, add:
--   CREATE POLICY "demo_feedback_update_own"
--     ON public.demo_feedback FOR UPDATE
--     USING (auth.uid() = user_id);
-- ==============================================
