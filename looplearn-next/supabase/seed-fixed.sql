-- Updated seed data with 'science' as subject
-- Run this to replace existing questions

-- First, delete old questions
DELETE FROM questions;

-- Insert questions with 'science' subject
INSERT INTO questions (question_text, question_type, class_standard, subject, chapter, difficulty, points) VALUES
  -- MCQ Questions
  ('What is the chemical formula for water?', 'mcq', 8, 'science', 'Chemical Reactions', 'easy', 10),
  ('Which gas is essential for photosynthesis?', 'mcq', 8, 'science', 'Photosynthesis', 'easy', 10),
  ('What is the SI unit of force?', 'mcq', 8, 'science', 'Force and Motion', 'medium', 15),
  
  -- Fill-in-the-blank Questions
  ('The powerhouse of the cell is called ___', 'fillblank', 9, 'science', 'Cell Structure', 'medium', 15),
  ('The chemical symbol for gold is ___', 'fillblank', 8, 'science', 'Elements', 'easy', 10),
  ('Newton''s ___ law states that every action has an equal and opposite reaction', 'fillblank', 9, 'science', 'Laws of Motion', 'medium', 15);

-- Add MCQ options
INSERT INTO question_options (question_id, option_text, display_order, is_correct) VALUES
  -- Water formula
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the chemical formula%' LIMIT 1), '$H_2O$', 1, true),
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the chemical formula%' LIMIT 1), '$H_3O$', 2, false),
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the chemical formula%' LIMIT 1), '$HO_2$', 3, false),
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the chemical formula%' LIMIT 1), '$H_2O_2$', 4, false),

  -- Photosynthesis gas
  ((SELECT id FROM questions WHERE question_text LIKE 'Which gas is essential%' LIMIT 1), 'Carbon Dioxide ($CO_2$)', 1, true),
  ((SELECT id FROM questions WHERE question_text LIKE 'Which gas is essential%' LIMIT 1), 'Oxygen ($O_2$)', 2, false),
  ((SELECT id FROM questions WHERE question_text LIKE 'Which gas is essential%' LIMIT 1), 'Nitrogen ($N_2$)', 3, false),
  ((SELECT id FROM questions WHERE question_text LIKE 'Which gas is essential%' LIMIT 1), 'Hydrogen ($H_2$)', 4, false),

  -- SI unit of force
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the SI unit of force%' LIMIT 1), 'Newton (N)', 1, true),
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the SI unit of force%' LIMIT 1), 'Joule (J)', 2, false),
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the SI unit of force%' LIMIT 1), 'Watt (W)', 3, false),
  ((SELECT id FROM questions WHERE question_text LIKE 'What is the SI unit of force%' LIMIT 1), 'Pascal (Pa)', 4, false);

-- Add fill-in-the-blank answers
INSERT INTO fillblank_answers (question_id, accepted_answer, is_case_sensitive, is_primary) VALUES
  -- Mitochondria
  ((SELECT id FROM questions WHERE question_text LIKE 'The powerhouse of the cell%' LIMIT 1), 'mitochondria', false, true),
  ((SELECT id FROM questions WHERE question_text LIKE 'The powerhouse of the cell%' LIMIT 1), 'mitochondrion', false, false),
  
  -- Gold symbol
  ((SELECT id FROM questions WHERE question_text LIKE 'The chemical symbol for gold%' LIMIT 1), 'Au', true, true),
  
  -- Newton's law
  ((SELECT id FROM questions WHERE question_text LIKE 'Newton''s ___ law%' LIMIT 1), 'third', false, true),
  ((SELECT id FROM questions WHERE question_text LIKE 'Newton''s ___ law%' LIMIT 1), '3rd', false, false),
  ((SELECT id FROM questions WHERE question_text LIKE 'Newton''s ___ law%' LIMIT 1), 'Third', false, false);

-- Verify
SELECT 
  q.question_text,
  q.subject,
  q.question_type,
  COUNT(DISTINCT qo.id) as option_count,
  COUNT(DISTINCT fa.id) as answer_count
FROM questions q
LEFT JOIN question_options qo ON q.id = qo.question_id
LEFT JOIN fillblank_answers fa ON q.id = fa.question_id
GROUP BY q.id, q.question_text, q.subject, q.question_type
ORDER BY q.created_at DESC;
