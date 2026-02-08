-- ============================================
-- SEED DATA for LoopLearn
-- Sample questions for testing
-- ============================================

-- Note: You'll need a teacher account first
-- Create one manually in Supabase Dashboard → Authentication
-- Then update their profile role to 'teacher'

-- Sample Class 8 Science Questions
INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points) VALUES
  -- MCQ Questions
  ('What is the chemical formula for water?', 'mcq', 8, 'chemistry', 'Chemical Reactions', 'easy', 10),
  ('Which gas is essential for photosynthesis?', 'mcq', 8, 'biology', 'Photosynthesis', 'easy', 10),
  ('What is the SI unit of force?', 'mcq', 8, 'physics', 'Force and Motion', 'medium', 15),
  
  -- Fill-in-the-blank Questions
  ('The powerhouse of the cell is called ___', 'fillblank', 9, 'biology', 'Cell Structure', 'medium', 15),
  ('The chemical symbol for gold is ___', 'fillblank', 8, 'chemistry', 'Elements', 'easy', 10),
  ('Newton''s ___ law states that every action has an equal and opposite reaction', 'fillblank', 9, 'physics', 'Laws of Motion', 'medium', 15);

-- Get question IDs for options (adjust UUIDs after running above)
-- You can query: SELECT id, question_text FROM questions ORDER BY created_at DESC LIMIT 6;

-- Sample MCQ Options for "What is the chemical formula for water?"
-- Replace 'question-uuid-1' with actual UUID from questions table
INSERT INTO question_options (question_id, option_text, display_order, is_correct) VALUES
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the chemical formula%' LIMIT 1), '$H_2O$', 1, true),
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the chemical formula%' LIMIT 1), '$H_3O$', 2, false),
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the chemical formula%' LIMIT 1), '$HO_2$', 3, false),
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the chemical formula%' LIMIT 1), '$H_2O_2$', 4, false);

-- Sample MCQ Options for "Which gas is essential for photosynthesis?"
INSERT INTO question_options (question_id, option_text, display_order, is_correct) VALUES
  ((SELECT id FROM questions WHERE question_text LIKE 'Which gas is essential%' LIMIT 1), 'Carbon Dioxide ($CO_2$)', 1, true),
  ((SELECT id FROM questions WHERE question_text LIKE 'Which gas is essential%' LIMIT 1), 'Oxygen ($O_2$)', 2, false),
  ((SELECT id FROM questions WHERE question_text LIKE 'Which gas is essential%' LIMIT 1), 'Nitrogen ($N_2$)', 3, false),
  ((SELECT id FROM questions WHERE question_text LIKE 'Which gas is essential%' LIMIT 1), 'Hydrogen ($H_2$)', 4, false);

-- Sample MCQ Options for "What is the SI unit of force?"
INSERT INTO question_options (question_id, option_text, display_order, is_correct) VALUES
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the SI unit of force%' LIMIT 1), 'Newton (N)', 1, true),
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the SI unit of force%' LIMIT 1), 'Joule (J)', 2, false),
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the SI unit of force%' LIMIT 1), 'Watt (W)', 3, false),
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the SI unit of force%' LIMIT 1), 'Pascal (Pa)', 4, false);

-- Fill-in-the-blank Answers
INSERT INTO fillblank_answers (question_id, accepted_answer, is_case_sensitive, is_primary) VALUES
  -- Mitochondria (accept multiple spellings)
  ((SELECT id FROM questions WHERE question_text LIKE 'The powerhouse of the cell%' LIMIT 1), 'mitochondria', false, true),
  ((SELECT id FROM questions WHERE question_text LIKE 'The powerhouse of the cell%' LIMIT 1), 'mitochondrion', false, false),
  
  -- Gold symbol
  ((SELECT id FROM questions WHERE question_text LIKE 'The chemical symbol for gold%' LIMIT 1), 'Au', true, true),
  
  -- Newton's Third Law
  ((SELECT id FROM questions WHERE question_text LIKE 'Newton''s ___ law%' LIMIT 1), 'third', false, true),
  ((SELECT id FROM questions WHERE question_text LIKE 'Newton''s ___ law%' LIMIT 1), '3rd', false, false),
  ((SELECT id FROM questions WHERE question_text LIKE 'Newton''s ___ law%' LIMIT 1), 'Third', false, false);

-- Verify seed data
SELECT 
  q.question_text,
  q.question_type,
  COUNT(DISTINCT qo.id) as option_count,
  COUNT(DISTINCT fa.id) as answer_count
FROM questions q
LEFT JOIN question_options qo ON q.id = qo.question_id
LEFT JOIN fillblank_answers fa ON q.id = fa.question_id
GROUP BY q.id, q.question_text, q.question_type
ORDER BY q.created_at DESC;
