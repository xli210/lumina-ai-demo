-- ============================================
-- My faces: reference photos a person chose to keep, to use again in Nano FaceStudio Online and
-- Nano HeadSwap Pro without uploading them each time.
--
-- Saved only when the person presses "Save to My faces" and confirms a sentence that says the photo
-- is kept privately until they delete it; `consented_at` records that moment. Deleting a face in the
-- tool deletes the row and both stored files (the photo and its thumbnail) at once.
--
-- The files live in the R2 bucket the site already signs for (R2_DOWNLOADS_*), under
-- saved-faces/<user id>/<face id>.jpg and <face id>_t.jpg. A row is written first (confirmed_at null),
-- the browser uploads to a signed address, then the site checks the file is there and sets
-- confirmed_at. Only confirmed rows are listed; unconfirmed ones older than a day are removed when the
-- list is next read.
--
-- ON DELETE CASCADE removes the rows with the account, not the files: deleting an account by hand
-- must also delete saved-faces/<user id>/ in R2 (docs/my-faces.md).
--
-- Written and read only by the server (service role): lib/saved-faces-server.ts. Safe to run again.
-- ============================================

CREATE TABLE IF NOT EXISTS public.saved_faces (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  object_key    TEXT        NOT NULL UNIQUE,
  thumb_key     TEXT        NOT NULL UNIQUE,
  bytes         INTEGER     CHECK (bytes IS NULL OR bytes > 0),
  width         INTEGER     CHECK (width IS NULL OR width > 0),
  height        INTEGER     CHECK (height IS NULL OR height > 0),
  source        TEXT        NOT NULL CHECK (source IN ('facestudio', 'headswap-pro')),
  consented_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at  TIMESTAMPTZ,
  last_used_at  TIMESTAMPTZ,
  use_count     INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS saved_faces_user_idx ON public.saved_faces (user_id, created_at DESC);

ALTER TABLE public.saved_faces ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.saved_faces FROM anon, authenticated;

-- How it is used:
--
--   SELECT count(*) FILTER (WHERE confirmed_at IS NOT NULL) AS faces,
--          count(DISTINCT user_id) FILTER (WHERE confirmed_at IS NOT NULL) AS people,
--          count(*) FILTER (WHERE use_count > 0) AS used_again,
--          sum(use_count) AS uses
--   FROM public.saved_faces;
