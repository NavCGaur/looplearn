-- ==========================================
-- Migrate Class 9 Subjects to 'Science'
-- ==========================================

-- The user wants to consolidate Physics, Chemistry, and Biology into 'Science' for Class 9 only.

UPDATE questions
SET subject = 'science'
WHERE class_standard = 9 
  AND subject IN ('physics', 'chemistry', 'biology');

-- Verification query (optional - you can run this to check)
-- SELECT count(*) FROM questions WHERE class_standard = 9 AND subject IN ('physics', 'chemistry', 'biology');
-- Should be 0 after update.
