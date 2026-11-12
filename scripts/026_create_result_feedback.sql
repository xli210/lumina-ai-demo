-- ============================================
-- Result feedback: what people think of each result, per product, mode and job
--
-- From 2026-11-12 every finished result (Face Studio, HeadSwap Pro, Image Edit, Video FaceSwap) asks
-- "How was this result?" with Good / Not good, then optional reasons and a note. One row per
-- reservation (credit_holds.id), so a rating always belongs to one job the person paid for, and
-- `estimate` copies what the hold knew: the mode (fast, quality, head, face_swap, head_swap ...),
-- the Image Edit tool and steps, the GPU vendor of a video. `detail` is what the page added
-- (length, output size, watermark, variation). A second answer on the same job replaces the first.
--
-- `paid` is whether the account had bought credits when it answered, so free and paying
-- people can be read apart.
--
-- Written by app/api/result-feedback and app/api/facestudio-v/feedback (lib/result-feedback-server.ts).
-- Read at /admin/result-feedback. Server-side only (service role). Safe to run again.
-- ============================================

CREATE TABLE IF NOT EXISTS public.result_feedback (
  id          BIGSERIAL   PRIMARY KEY,
  hold_id     UUID        NOT NULL UNIQUE REFERENCES public.credit_holds(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service     TEXT        NOT NULL,
  mode        TEXT        NOT NULL,
  job_ref     TEXT        NOT NULL,
  rating      TEXT        NOT NULL CHECK (rating IN ('good', 'bad')),
  reasons     TEXT[]      NOT NULL DEFAULT '{}',
  note        TEXT        CHECK (note IS NULL OR char_length(note) <= 1000),
  paid        BOOLEAN     NOT NULL,
  estimate    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  detail      JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS result_feedback_service_mode_idx ON public.result_feedback (service, mode, created_at DESC);
CREATE INDEX IF NOT EXISTS result_feedback_created_idx ON public.result_feedback (created_at DESC);

ALTER TABLE public.result_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.result_feedback FROM anon, authenticated;

-- Per product and mode, last 14 days:
--
--   SELECT service, mode, paid, count(*) AS answers,
--          round(100.0 * count(*) FILTER (WHERE rating = 'good') / count(*)) AS good_pct
--   FROM public.result_feedback WHERE created_at > now() - interval '14 days'
--   GROUP BY 1, 2, 3 ORDER BY 1, 2, 3;
--
-- Reasons:
--
--   SELECT service, mode, rating, r AS reason, count(*)
--   FROM public.result_feedback, unnest(reasons) r
--   WHERE created_at > now() - interval '14 days'
--   GROUP BY 1, 2, 3, 4 ORDER BY 1, 2, 3, 5 DESC;
