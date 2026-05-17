-- Add answer_explanation column to questions table
-- This stores the detailed explanation for the correct answer/solution.

ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS answer_explanation TEXT;
