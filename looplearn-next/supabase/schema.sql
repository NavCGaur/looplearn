-- ============================================
-- LoopLearn Database Schema for Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (User Data)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
  class_standard INT CHECK (class_standard BETWEEN 6 AND 12),
  points INT DEFAULT 0,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for leaderboard queries
CREATE INDEX idx_profiles_points ON profiles(points DESC);
CREATE INDEX idx_profiles_class_points ON profiles(class_standard, points DESC);

-- ============================================
-- 2. QUESTIONS TABLE (Content)
-- ============================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'fillblank', 'truefalse')),
  
  -- Classification
  class_standard INT NOT NULL CHECK (class_standard BETWEEN 6 AND 12),
  subject TEXT NOT NULL CHECK (subject IN ('mathematics', 'physics', 'chemistry', 'biology', 'science')),
  chapter TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  
  -- Metadata
  points INT DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for quiz loading
CREATE INDEX idx_questions_quiz_lookup ON questions(class_standard, subject, is_active);
CREATE INDEX idx_questions_active ON questions(is_active) WHERE is_active = true;

-- ============================================
-- 3. QUESTION_OPTIONS TABLE (MCQ Options)
-- ============================================
CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  option_text TEXT NOT NULL,
  display_order INT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  explanation TEXT,
  
  UNIQUE(question_id, display_order)
);

-- Index for fetching options with question
CREATE INDEX idx_question_options_question ON question_options(question_id, display_order);

-- ============================================
-- 4. FILLBLANK_ANSWERS TABLE
-- ============================================
CREATE TABLE fillblank_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  accepted_answer TEXT NOT NULL,
  is_case_sensitive BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  
  UNIQUE(question_id, accepted_answer)
);

-- Index for answer lookup
CREATE INDEX idx_fillblank_question ON fillblank_answers(question_id);

-- ============================================
-- 5. USER_PROGRESS TABLE (SRS Tracking)
-- ============================================
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- SM-2 Algorithm fields
  ease_factor NUMERIC(3,2) DEFAULT 2.5 CHECK (ease_factor >= 1.3),
  interval_days NUMERIC(6,2) DEFAULT 0,
  repetitions INT DEFAULT 0,
  last_quality INT CHECK (last_quality BETWEEN 0 AND 3),
  
  -- Timestamps
  next_review_date TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, question_id)
);

-- Indexes for SRS queries
CREATE INDEX idx_user_progress_due ON user_progress(user_id, next_review_date);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);

-- ============================================
-- 6. LEADERBOARD_CACHE (Materialized View)
-- ============================================
CREATE MATERIALIZED VIEW leaderboard_cache AS
  SELECT 
    id,
    display_name as name,
    points,
    class_standard,
    ROW_NUMBER() OVER (ORDER BY points DESC) as rank,
    ROW_NUMBER() OVER (PARTITION BY class_standard ORDER BY points DESC) as class_rank
  FROM profiles
  WHERE role = 'student' AND points > 0
  ORDER BY points DESC;

-- Unique index for concurrent refresh
CREATE UNIQUE INDEX idx_leaderboard_cache_id ON leaderboard_cache(id);
CREATE INDEX idx_leaderboard_cache_class ON leaderboard_cache(class_standard, class_rank);

-- Function to refresh leaderboard (call manually or via cron)
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_cache;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE fillblank_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read all, update own
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- QUESTIONS: Students read (class <= their class), Teachers full access
CREATE POLICY "Students read questions for their class or below"
  ON questions FOR SELECT
  USING (
    is_active = true 
    AND class_standard <= (
      SELECT class_standard FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Teachers create questions"
  ON questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers update own questions"
  ON questions FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- QUESTION_OPTIONS: Readable with questions
CREATE POLICY "Users read options for active questions"
  ON question_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = question_options.question_id 
      AND questions.is_active = true
    )
  );

CREATE POLICY "Teachers manage options"
  ON question_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      JOIN profiles ON profiles.id = auth.uid()
      WHERE questions.id = question_options.question_id
      AND (questions.created_by = auth.uid() OR profiles.role = 'admin')
    )
  );

-- FILLBLANK_ANSWERS: Same as options
CREATE POLICY "Users read fillblank answers"
  ON fillblank_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = fillblank_answers.question_id 
      AND questions.is_active = true
    )
  );

CREATE POLICY "Teachers manage fillblank answers"
  ON fillblank_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      JOIN profiles ON profiles.id = auth.uid()
      WHERE questions.id = fillblank_answers.question_id
      AND (questions.created_by = auth.uid() OR profiles.role = 'admin')
    )
  );

-- USER_PROGRESS: Users manage own progress only
CREATE POLICY "Users view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, display_name)
  VALUES (NEW.id, 'student', NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample questions (run after creating a teacher account)
-- INSERT INTO questions (question_text, question_type, class_standard, subject, difficulty) VALUES
-- ('What is the chemical formula for water? $H_2O$ or $H_3O$?', 'mcq', 8, 'chemistry', 'easy'),
-- ('The powerhouse of the cell is called ___', 'fillblank', 9, 'biology', 'medium');
