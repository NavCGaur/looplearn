const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEACHER_UUID = process.env.TEACHER_UUID;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkDuplicates() {
    const { data, error } = await supabase
        .from('questions')
        .select('question_text')
        .eq('created_by', TEACHER_UUID);

    if (error) {
        console.error(error);
        return;
    }

    // Count occurrences
    const counts = {};
    data.forEach(q => {
        counts[q.question_text] = (counts[q.question_text] || 0) + 1;
    });

    console.log('Duplicate Check:');
    let duplicateCount = 0;
    for (const [text, count] of Object.entries(counts)) {
        if (count > 1) {
            console.log(`[${count}x] "${text.substring(0, 50)}..."`);
            duplicateCount++;
        }
    }

    if (duplicateCount === 0) {
        console.log('No duplicates found.');
    } else {
        console.log(`\nFound ${duplicateCount} questions with duplicates.`);
    }
}

checkDuplicates();
