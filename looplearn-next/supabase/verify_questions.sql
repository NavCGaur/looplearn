-- CHECK 1: Total Questions
SELECT count(*) as total_questions FROM questions;

-- CHECK 2: Recent Questions (Check if recent saves worked)
SELECT 
    id, 
    left(question_text, 30) as text_preview, 
    created_by, 
    question_type,
    is_active,
    created_at
FROM questions 
ORDER BY created_at DESC 
LIMIT 5;

-- CHECK 3: Options for those questions (Check if options are saving)
SELECT 
    question_id, 
    count(*) as option_count 
FROM question_options 
WHERE question_id IN (
    SELECT id FROM questions ORDER BY created_at DESC LIMIT 5
)
GROUP BY question_id;

-- CHECK 4: Your User ID (run this to compare with created_by)
SELECT auth.uid() as my_user_id;
