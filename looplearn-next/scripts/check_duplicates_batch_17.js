const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkDuplicates() {
    const jsonPath = path.join(__dirname, '../docs/SCIENCE_QUESTIONS.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const questions = data.questions;

    console.log(`Checking ${questions.length} questions for duplicates in Supabase...`);

    let duplicateCount = 0;
    const sampleSize = Math.min(questions.length, 5); // Check first 5 as a sample

    for (let i = 0; i < sampleSize; i++) {
        const q = questions[i];
        const { data: existing, error } = await supabase
            .from('questions')
            .select('id')
            .eq('question_text', q.question_text)
            .eq('chapter', q.chapter)
            .eq('class_standard', q.class_standard);

        if (existing && existing.length > 0) {
            console.log(`[DUPLICATE] Found: "${q.question_text.substring(0, 50)}..."`);
            duplicateCount++;
        }
    }

    if (duplicateCount === sampleSize) {
        console.log("ALL_SAMPLES_DUPLICATE");
    } else if (duplicateCount > 0) {
        console.log("SOME_SAMPLES_DUPLICATE");
    } else {
        console.log("NO_DUPLICATES_FOUND_IN_SAMPLE");
    }
}

checkDuplicates();
