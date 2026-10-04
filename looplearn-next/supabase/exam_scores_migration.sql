-- ============================================================
-- exam_scores table — stores English foundation test scores
-- submitted via /submit (no auth required).
-- One row per student (upserted on re-submission, keeps latest score).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.exam_scores (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name    TEXT NOT NULL,
    class_standard  INTEGER NOT NULL CHECK (class_standard BETWEEN 1 AND 12),
    score           NUMERIC(6,2) NOT NULL DEFAULT 0,
    max_score       NUMERIC(6,2) NOT NULL DEFAULT 100,
    submission_type TEXT NOT NULL DEFAULT 'homework',
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_name, class_standard)
);

-- Performance indices
CREATE INDEX IF NOT EXISTS exam_scores_class_idx  ON public.exam_scores (class_standard);
CREATE INDEX IF NOT EXISTS exam_scores_score_idx  ON public.exam_scores (score DESC);
CREATE INDEX IF NOT EXISTS exam_scores_date_idx   ON public.exam_scores (submitted_at DESC);

-- RLS: allow public reads, deny writes from client (only service role writes)
ALTER TABLE public.exam_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read exam_scores" ON public.exam_scores;
CREATE POLICY "Public can read exam_scores"
    ON public.exam_scores
    FOR SELECT
    USING (true);

-- No client-side write policy → only service role (admin client) can INSERT/UPDATE/DELETE
