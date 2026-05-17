-- ================================================================
-- Quick Practice Submissions Table + Storage RLS Policies
-- ================================================================
-- Run this in Supabase SQL editor (Dashboard → SQL Editor → New Query)
-- ================================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.quick_practice_submissions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submitted_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,

    -- Image stored in Supabase Storage bucket 'quick-practice-sheets'
    image_path          TEXT,                   -- e.g. "abc-uuid/2026-02-26-xyz.jpg"

    -- What Gemini auto-detected from the sheet header
    detected_class      TEXT,
    detected_subject    TEXT,
    detected_chapter    TEXT,

    -- Evaluation summary
    total_marks         NUMERIC(5,1),
    max_marks           NUMERIC(5,1),
    feedback_language   TEXT DEFAULT 'hinglish',

    -- Full Gemini JSON response (QuestionEvalResult[])
    gemini_response     JSONB,

    -- Teacher review fields
    teacher_flag        BOOLEAN DEFAULT FALSE,  -- teacher marked this as incorrect evaluation
    teacher_note        TEXT,                   -- teacher's comment

    -- Error tracking
    status              TEXT DEFAULT 'ok'       -- 'ok' | 'parse_error' | 'safety_block' | 'error'
);

-- 2. Row Level Security
ALTER TABLE public.quick_practice_submissions ENABLE ROW LEVEL SECURITY;

-- Students can insert their own submissions
CREATE POLICY "Students can insert own quick practice submissions"
    ON public.quick_practice_submissions
    FOR INSERT
    WITH CHECK (auth.uid() = student_id);

-- Students can read their own submissions
CREATE POLICY "Students can read own quick practice submissions"
    ON public.quick_practice_submissions
    FOR SELECT
    USING (auth.uid() = student_id);

-- Teachers and admins can read ALL submissions
CREATE POLICY "Teachers can read all quick practice submissions"
    ON public.quick_practice_submissions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('teacher', 'admin')
        )
    );

-- Teachers and admins can update (flag + note)
CREATE POLICY "Teachers can update quick practice submissions"
    ON public.quick_practice_submissions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('teacher', 'admin')
        )
    );

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_qp_submissions_student ON public.quick_practice_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_qp_submissions_submitted_at ON public.quick_practice_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_qp_submissions_flagged ON public.quick_practice_submissions(teacher_flag) WHERE teacher_flag = TRUE;

-- ================================================================
-- Storage bucket setup — run this separately in Supabase Storage UI
-- OR via SQL below (requires pg_storage extension, which Supabase has)
-- ================================================================

-- Create private bucket (only authenticated users can access their own files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'quick-practice-sheets',
    'quick-practice-sheets',
    FALSE,                          -- private bucket
    5242880,                        -- 5 MB max per file (grayscale JPEG is well under this)
    ARRAY['image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

-- Students can upload to their own folder
CREATE POLICY "Students upload to own folder"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'quick-practice-sheets'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Students can read their own files
CREATE POLICY "Students read own files"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'quick-practice-sheets'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Teachers and admins can read ALL files in the bucket
CREATE POLICY "Teachers read all quick practice sheets"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'quick-practice-sheets'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('teacher', 'admin')
        )
    );
