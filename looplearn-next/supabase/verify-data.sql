-- Verify questions exist in the database
-- Run this in Supabase SQL Editor

-- Check if questions table has data
SELECT 
  id,
  question_text,
  question_type,
  class_standard,
  subject,
  is_active
FROM questions
ORDER BY created_at DESC;

-- Check question_options
SELECT 
  qo.id,
  q.question_text,
  qo.option_text,
  qo.is_correct,
  qo.display_order
FROM question_options qo
JOIN questions q ON q.id = qo.question_id
ORDER BY q.question_text, qo.display_order;

-- Check fillblank_answers
SELECT 
  fa.id,
  q.question_text,
  fa.accepted_answer,
  fa.is_primary
FROM fillblank_answers fa
JOIN questions q ON q.id = fa.question_id
ORDER BY q.question_text;

-- Summary count
SELECT 
  'questions' as table_name,
  COUNT(*) as count
FROM questions
UNION ALL
SELECT 
  'question_options',
  COUNT(*)
FROM question_options
UNION ALL
SELECT 
  'fillblank_answers',
  COUNT(*)
FROM fillblank_answers;
