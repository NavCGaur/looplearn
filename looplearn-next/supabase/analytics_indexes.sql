-- Analytics Performance Indexes
-- Add indexes to optimize analytics queries

-- Index for teacher's question analytics (question_id + quality metrics)
CREATE INDEX IF NOT EXISTS idx_user_progress_analytics 
  ON user_progress(question_id, last_quality, repetitions);

-- Index for time-based filtering
CREATE INDEX IF NOT EXISTS idx_user_progress_last_reviewed 
  ON user_progress(last_reviewed);

-- Composite index for common analytics queries
CREATE INDEX IF NOT EXISTS idx_user_progress_question_user
  ON user_progress(question_id, user_id, last_quality);

-- Index for question filtering by created_by (already exists in schema but adding for completeness)
-- CREATE INDEX IF NOT EXISTS idx_questions_created_by ON questions(created_by);
