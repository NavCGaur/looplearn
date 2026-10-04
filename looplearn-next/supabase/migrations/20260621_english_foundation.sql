-- ============================================================
-- LoopLearn: English Foundation Curriculum & Versioning Schema
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Create curriculum_modules table
CREATE TABLE IF NOT EXISTS curriculum_modules (
    id                          TEXT PRIMARY KEY, -- e.g., 'ef_pilot_v1_w1'
    grammar_pattern             TEXT NOT NULL,    -- e.g., 'I am ___'
    target_vocabulary          JSONB NOT NULL DEFAULT '[]', -- e.g., ["happy", "sad", "tired"]
    evaluation_prompt_version   TEXT NOT NULL DEFAULT 'v1',  -- tracks version of the prompt
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on curriculum_modules
ALTER TABLE curriculum_modules ENABLE ROW LEVEL SECURITY;

-- Anyone can read curriculum modules
CREATE POLICY "Anyone can read curriculum modules"
    ON curriculum_modules FOR SELECT
    USING (true);

-- Teachers/admins can manage curriculum modules
CREATE POLICY "Teachers manage curriculum modules"
    ON curriculum_modules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('teacher', 'admin')
        )
    );

-- 2. Add columns to homework_plans
ALTER TABLE homework_plans 
    ADD COLUMN IF NOT EXISTS curriculum_mode TEXT DEFAULT 'cbse_standard' CHECK (curriculum_mode IN ('cbse_standard', 'english_foundation')),
    ADD COLUMN IF NOT EXISTS curriculum_module_id TEXT REFERENCES curriculum_modules(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS assessment_type TEXT DEFAULT 'weekly_practice' CHECK (assessment_type IN ('baseline', 'weekly_practice', 'post_test'));

-- 3. Add columns to homework_submissions
ALTER TABLE homework_submissions
    ADD COLUMN IF NOT EXISTS curriculum_module_id TEXT REFERENCES curriculum_modules(id) ON DELETE SET NULL;

-- 4. Seed curriculum modules
INSERT INTO curriculum_modules (id, grammar_pattern, target_vocabulary, evaluation_prompt_version) VALUES
('ef_pilot_v1_w0', 'Baseline Assessment (Free Writing)', '[]', 'v1'),
('ef_pilot_v1_w1', 'I am ___', '["happy", "sad", "hungry", "tired", "angry"]', 'v1'),
('ef_pilot_v1_w2', 'I have ___', '["book", "pen", "bag", "pencil", "bottle"]', 'v1'),
('ef_pilot_v1_w3', 'This is ___', '["school", "house", "classroom", "playground", "garden"]', 'v1'),
('ef_pilot_v1_w4', 'I like ___', '["mango", "apple", "banana", "milk", "cricket"]', 'v1')
ON CONFLICT (id) DO NOTHING;
