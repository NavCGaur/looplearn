-- ============================================================
-- LoopLearnX: Generic Teaching Engine Database Schema
-- Abstraction of Cohorts, Curriculum Programs, Weeks, Phases
-- ============================================================

-- 1. Create cohorts table
CREATE TABLE IF NOT EXISTS cohorts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    class_standard  INTEGER NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cohorts" ON cohorts FOR SELECT USING (true);
CREATE POLICY "Teachers manage cohorts" ON cohorts FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- Add cohort_id to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL;

-- 2. Create curriculum_programs table
CREATE TABLE IF NOT EXISTS curriculum_programs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL, -- e.g., "English Foundation", "Class 7 Maths"
    subject       TEXT NOT NULL, -- e.g., "English", "Maths", "Science"
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE curriculum_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read curriculum_programs" ON curriculum_programs FOR SELECT USING (true);
CREATE POLICY "Teachers manage curriculum_programs" ON curriculum_programs FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- 3. Create curriculum_versions table
CREATE TABLE IF NOT EXISTS curriculum_versions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id    UUID REFERENCES curriculum_programs(id) ON DELETE CASCADE,
    version_code  TEXT NOT NULL, -- e.g., "Pilot_v1", "CBSE_2026"
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (program_id, version_code)
);

ALTER TABLE curriculum_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read curriculum_versions" ON curriculum_versions FOR SELECT USING (true);
CREATE POLICY "Teachers manage curriculum_versions" ON curriculum_versions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- 4. Create curriculum_weeks table
CREATE TABLE IF NOT EXISTS curriculum_weeks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id      UUID REFERENCES curriculum_versions(id) ON DELETE CASCADE,
    week_number     INTEGER NOT NULL,
    theme           TEXT NOT NULL, -- e.g., "I am / He is / She is / They are"
    status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'published')),
    weekly_assets   JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. target_vocabulary, game_words, homework_prompt
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (version_id, week_number)
);

ALTER TABLE curriculum_weeks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read curriculum_weeks" ON curriculum_weeks FOR SELECT USING (true);
CREATE POLICY "Teachers manage curriculum_weeks" ON curriculum_weeks FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- 5. Create curriculum_phases table
CREATE TABLE IF NOT EXISTS curriculum_phases (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id               UUID REFERENCES curriculum_weeks(id) ON DELETE CASCADE,
    phase_number          INTEGER NOT NULL, -- e.g. 1 to 7
    phase_name            TEXT NOT NULL, -- e.g., "Introduction", "Guided Practice", "Assessment"
    instructional_content JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g., timeline, teacher_script, expected_answers
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (week_id, phase_number)
);

ALTER TABLE curriculum_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read curriculum_phases" ON curriculum_phases FOR SELECT USING (true);
CREATE POLICY "Teachers manage curriculum_phases" ON curriculum_phases FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- 6. Create cohort_active_progress table
CREATE TABLE IF NOT EXISTS cohort_active_progress (
    cohort_id       UUID PRIMARY KEY REFERENCES cohorts(id) ON DELETE CASCADE,
    active_week_id  UUID REFERENCES curriculum_weeks(id) ON DELETE SET NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cohort_active_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cohort_active_progress" ON cohort_active_progress FOR SELECT USING (true);
CREATE POLICY "Teachers manage cohort_active_progress" ON cohort_active_progress FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- 7. Add generic schema link columns to homework_plans and submissions
ALTER TABLE homework_plans 
    ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS curriculum_week_id UUID REFERENCES curriculum_weeks(id) ON DELETE SET NULL;

ALTER TABLE homework_submissions
    ADD COLUMN IF NOT EXISTS curriculum_week_id UUID REFERENCES curriculum_weeks(id) ON DELETE SET NULL;
