-- ============================================================
-- LoopLearn: WhatsApp Bridge + Homework Automation Migration
-- Run in Supabase SQL Editor
-- ============================================================

-- ── 1. Extend profiles table ─────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS parent_phone   TEXT;

-- Index for fast phone-number lookup on every WhatsApp message
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_phone
  ON profiles(whatsapp_phone)
  WHERE whatsapp_phone IS NOT NULL;

-- ── 2. homework_plans ────────────────────────────────────────
-- Teacher fills this every Sunday for the coming week.
CREATE TABLE IF NOT EXISTS homework_plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_standard  INT  NOT NULL CHECK (class_standard BETWEEN 6 AND 12),
  subject         TEXT NOT NULL,
  day_of_week     INT  NOT NULL CHECK (day_of_week BETWEEN 1 AND 6), -- 1=Mon 6=Sat
  week_start      DATE NOT NULL,  -- Always a Monday
  hw_number       INT  NOT NULL,  -- Running homework number e.g. HW#5
  task_description TEXT NOT NULL,
  due_time        TIME DEFAULT '18:00:00',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_standard, subject, week_start, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_homework_plans_lookup
  ON homework_plans(class_standard, subject, week_start);
CREATE INDEX IF NOT EXISTS idx_homework_plans_hw_number
  ON homework_plans(hw_number, class_standard);

-- ── 3. homework_submissions ──────────────────────────────────
-- One row per student per homework plan.
-- Upserted on duplicate — latest submission wins.
CREATE TABLE IF NOT EXISTS homework_submissions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id          UUID NOT NULL REFERENCES homework_plans(id) ON DELETE CASCADE,
  student_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_type  TEXT NOT NULL DEFAULT 'whatsapp'
                     CHECK (submission_type IN ('whatsapp', 'app')),
  image_path       TEXT,          -- Storage path of submitted image
  marks_obtained   NUMERIC(5,2),
  max_marks        NUMERIC(5,2),
  ai_feedback      TEXT,          -- Short Hinglish summary for dashboard
  raw_ai_response  JSONB,         -- Full Gemini response for debugging
  status           TEXT NOT NULL DEFAULT 'submitted'
                     CHECK (status IN ('submitted', 'pending', 'missing', 'error')),
  submitted_at     TIMESTAMPTZ DEFAULT NOW(),
  evaluated_at     TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, student_id)      -- Upsert target: keep latest
);

CREATE INDEX IF NOT EXISTS idx_hw_submissions_student
  ON homework_submissions(student_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_hw_submissions_plan
  ON homework_submissions(plan_id, status);
CREATE INDEX IF NOT EXISTS idx_hw_submissions_date
  ON homework_submissions(submitted_at::date);

-- ── 4. reminder_logs ─────────────────────────────────────────
-- Audit trail so we never send duplicate reminders.
CREATE TABLE IF NOT EXISTS reminder_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_id     UUID REFERENCES homework_plans(id) ON DELETE SET NULL,
  type        TEXT NOT NULL
                CHECK (type IN ('7am_task', '5pm_reminder', '8pm_flag', 'sunday_weekly', 'eod_teacher')),
  sent_at     TIMESTAMPTZ DEFAULT NOW(),
  phone       TEXT,          -- Phone number the message was sent to
  success     BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_student_date
  ON reminder_logs(student_id, sent_at::date, type);

-- ── 5. RLS Policies ──────────────────────────────────────────
ALTER TABLE homework_plans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs        ENABLE ROW LEVEL SECURITY;

-- homework_plans: teachers full access, students read their class+subject
CREATE POLICY "Teachers manage homework plans"
  ON homework_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Students read their class plans"
  ON homework_plans FOR SELECT
  USING (
    class_standard = (
      SELECT class_standard FROM profiles WHERE id = auth.uid()
    )
  );

-- homework_submissions: teachers see all, students see own
CREATE POLICY "Teachers view all submissions"
  ON homework_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Students view own submissions"
  ON homework_submissions FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students insert own submissions"
  ON homework_submissions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- reminder_logs: teachers only
CREATE POLICY "Teachers view reminder logs"
  ON reminder_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- ── 6. updated_at trigger ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_homework_plans_updated_at
  BEFORE UPDATE ON homework_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER set_homework_submissions_updated_at
  BEFORE UPDATE ON homework_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
