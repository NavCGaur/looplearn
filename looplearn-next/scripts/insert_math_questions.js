const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEACHER_UUID = process.env.TEACHER_UUID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TEACHER_UUID) {
    console.error('Missing required environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function insertQuestions() {
    const jsonPath = path.join(__dirname, '../docs/MATHS_QUESTIONS.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const questions = jsonData.questions;

    console.log(`Found ${questions.length} questions to insert.`);

    for (const q of questions) {
        console.log(`Inserting question: "${q.question_text.substring(0, 50)}..."`);

        // 1. Insert Question
        const { data: qData, error: qError } = await supabase
            .from('questions')
            .insert({
                question_text: q.question_text,
                question_type: q.question_type,
                class_standard: q.class_standard,
                subject: q.subject,
                chapter: q.chapter,
                difficulty: q.difficulty,
                points: q.points,
                is_active: q.is_active,
                created_by: TEACHER_UUID
            })
            .select()
            .single();

        if (qError) {
            console.error('Error inserting question:', qError);
            continue;
        }

        const questionId = qData.id;
        console.log(`  -> Inserted ID: ${questionId}`);

        // 2. Insert Options (if MCQ/TF)
        if (q.options && q.options.length > 0) {
            const options = q.options.map(opt => ({
                question_id: questionId,
                option_text: opt.option_text,
                display_order: opt.display_order,
                is_correct: opt.is_correct,
                explanation: opt.explanation
            }));

            const { error: optError } = await supabase
                .from('question_options')
                .insert(options);

            if (optError) {
                console.error('  -> Error inserting options:', optError);
            } else {
                console.log(`  -> Inserted ${options.length} options.`);
            }
        }

        // 3. Insert Fill-Blank Answers (if FillBlank)
        if (q.fillblank_answers && q.fillblank_answers.length > 0) {
            const answers = q.fillblank_answers.map(ans => ({
                question_id: questionId,
                accepted_answer: ans.accepted_answer,
                is_case_sensitive: ans.is_case_sensitive,
                is_primary: ans.is_primary
            }));

            const { error: ansError } = await supabase
                .from('fillblank_answers')
                .insert(answers);

            if (ansError) {
                console.error('  -> Error inserting answers:', ansError);
            } else {
                console.log(`  -> Inserted ${answers.length} answers.`);
            }
        }
    }

    console.log('Done.');
}

insertQuestions();
