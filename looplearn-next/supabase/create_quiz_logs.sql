-- Create table for detailed answer logs
CREATE TABLE IF NOT EXISTS quiz_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  given_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  question_type TEXT NOT NULL,
  
  -- Metrics
  time_taken_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_question_id FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_quiz_logs_user ON quiz_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_logs_question ON quiz_logs(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_logs_time ON quiz_logs(time_taken_seconds);

-- Enable RLS
ALTER TABLE quiz_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert own logs"
  ON quiz_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own logs"
  ON quiz_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view all logs"
  ON quiz_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );
