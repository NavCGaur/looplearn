-- ============================================================
-- Assignment Mode — LoopLearn
-- Teacher uploads question papers; students submit answers only
-- ============================================================

-- ── assignments ──────────────────────────────────────────────────────────────
CREATE TABLE assignments (
    id                      uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id              uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title                   text NOT NULL,              -- e.g. "Science Ch.9 — Force & Laws"
    subject                 text,                       -- e.g. "Science"
    class_standard          integer,                    -- e.g. 8
    question_paper_path     text NOT NULL,              -- Supabase Storage path
    is_active               boolean DEFAULT true NOT NULL,
    created_at              timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_assignments_teacher   ON assignments (teacher_id);
CREATE INDEX idx_assignments_class     ON assignments (class_standard, is_active);

-- ── assignment_submissions ────────────────────────────────────────────────────
CREATE TABLE assignment_submissions (
    id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id       uuid REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
    student_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    answer_image_path   text,                           -- Supabase Storage path
    gemini_response     jsonb,                          -- QuestionEvalResult[]
    total_marks         numeric(5,1),
    max_marks           numeric(5,1),
    status              text NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'error')),
    error_message       text,
    submitted_at        timestamptz DEFAULT now() NOT NULL,
    UNIQUE (assignment_id, student_id)                  -- one submission per student per assignment
);

CREATE INDEX idx_assignment_subs_assignment ON assignment_submissions (assignment_id);
CREATE INDEX idx_assignment_subs_student    ON assignment_submissions (student_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Students: read active assignments for any class (teacher sets class filter in action)
CREATE POLICY "Students can read active assignments"
    ON assignments FOR SELECT
    USING (is_active = true);

-- Teachers: full control over their own assignments
CREATE POLICY "Teachers can manage own assignments"
    ON assignments FOR ALL
    USING (auth.uid() = teacher_id)
    WITH CHECK (auth.uid() = teacher_id);

-- Students: insert + read their own submissions
CREATE POLICY "Students can insert own submissions"
    ON assignment_submissions FOR INSERT
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can read own submissions"
    ON assignment_submissions FOR SELECT
    USING (auth.uid() = student_id);

-- Authenticated: insert for server-side (server actions)
CREATE POLICY "Authenticated can insert assignment_submissions"
    ON assignment_submissions FOR INSERT
    WITH CHECK (true);

-- ── Storage notes (run in Supabase dashboard) ─────────────────────────────────
-- Create bucket: assignment-papers (private)
-- Policy: authenticated users can upload (teacher uploads their paper)
-- Policy: authenticated users can read (server action fetches for Gemini)
