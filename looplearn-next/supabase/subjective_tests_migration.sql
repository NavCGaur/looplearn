-- ============================================================
-- LoopLearn: Subjective Answer Evaluation Feature Migration
-- ============================================================
-- Run this in Supabase Dashboard > SQL Editor

-- ============================================================
-- 1. SUBJECTIVE_TESTS TABLE (Teacher creates a test)
-- ============================================================
CREATE TABLE IF NOT EXISTS subjective_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('mathematics', 'science', 'physics', 'chemistry', 'biology')),
  chapter TEXT,
  class_standard INT NOT NULL CHECK (class_standard BETWEEN 6 AND 12),
  total_marks INT NOT NULL DEFAULT 0,
  instructions TEXT, -- optional teacher notes shown to student
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subjective_tests_class ON subjective_tests(class_standard, subject);
CREATE INDEX IF NOT EXISTS idx_subjective_tests_active ON subjective_tests(is_active) WHERE is_active = true;

-- ============================================================
-- 2. SUBJECTIVE_QUESTIONS TABLE (Questions within a test)
-- ============================================================
CREATE TABLE IF NOT EXISTS subjective_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES subjective_tests(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'short_answer'
    CHECK (question_type IN ('short_answer', 'long_answer', 'numerical', 'theorem', 'diagram')),
  max_marks INT NOT NULL CHECK (max_marks > 0),
  -- Rubric tells Gemini what to look for when grading
  marking_rubric TEXT, -- e.g. "1 for Given, 1 for formula W=Fs, 2 for calculation, 1 for unit"
  model_answer TEXT,   -- Optional. Shown to student AFTER evaluation.
  UNIQUE(test_id, question_number)
);

CREATE INDEX IF NOT EXISTS idx_subjective_questions_test ON subjective_questions(test_id, question_number);

-- ============================================================
-- 3. SUBJECTIVE_SUBMISSIONS TABLE (Student upload + AI result)
-- ============================================================
CREATE TABLE IF NOT EXISTS subjective_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES subjective_tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  -- Status: pending -> evaluated | error
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'evaluated', 'error')),
  -- AI evaluation result: array of per-question results
  -- Each item: { question_number, marks_awarded, max_marks, what_was_correct,
  --              what_was_wrong, suggestion, diagram_present, diagram_labeled }
  evaluation_result JSONB,
  total_marks_awarded INT DEFAULT 0,
  error_message TEXT -- populated if status = 'error'
);

CREATE INDEX IF NOT EXISTS idx_subjective_submissions_student ON subjective_submissions(student_id, test_id);
CREATE INDEX IF NOT EXISTS idx_subjective_submissions_test ON subjective_submissions(test_id);


-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE subjective_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjective_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjective_submissions ENABLE ROW LEVEL SECURITY;

-- SUBJECTIVE_TESTS: Students can read active tests for their class
CREATE POLICY "Students read active subjective tests"
  ON subjective_tests FOR SELECT
  USING (
    is_active = true
    AND class_standard = (
      SELECT class_standard FROM profiles WHERE id = auth.uid()
    )
  );

-- Teachers can do everything on tests they created
CREATE POLICY "Teachers manage their subjective tests"
  ON subjective_tests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- SUBJECTIVE_QUESTIONS: Readable alongside test
CREATE POLICY "Anyone can read subjective questions for accessible tests"
  ON subjective_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM subjective_tests st
      WHERE st.id = subjective_questions.test_id
        AND (
          st.is_active = true
          OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher','admin'))
        )
    )
  );

CREATE POLICY "Teachers manage subjective questions"
  ON subjective_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- SUBJECTIVE_SUBMISSIONS
CREATE POLICY "Students insert own submissions"
  ON subjective_submissions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students read own submissions"
  ON subjective_submissions FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students update own submissions"
  ON subjective_submissions FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers read all submissions for their tests"
  ON subjective_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM subjective_tests st
      JOIN profiles p ON p.id = auth.uid()
      WHERE st.id = subjective_submissions.test_id
        AND (st.created_by = auth.uid() OR p.role = 'admin')
    )
  );
