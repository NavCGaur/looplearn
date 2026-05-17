const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEACHER_UUID = process.env.TEACHER_UUID;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function exportDuplicates() {
    console.log('Fetching questions...');
    const { data, error } = await supabase
        .from('questions')
        .select('id, question_text, created_at')
        .eq('created_by', TEACHER_UUID);

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    // Group by question_text
    const groups = {};
    data.forEach(q => {
        if (!groups[q.question_text]) {
            groups[q.question_text] = [];
        }
        groups[q.question_text].push(q);
    });

    // Filter for duplicates
    const duplicates = [];
    for (const [text, questions] of Object.entries(groups)) {
        if (questions.length > 1) {
            duplicates.push({
                question_text: text,
                count: questions.length,
                ids: questions.map(q => ({ id: q.id, created_at: q.created_at }))
            });
        }
    }

    // Write to file
    const outputPath = path.join(__dirname, '../docs/duplicate_questions.json');
    fs.writeFileSync(outputPath, JSON.stringify({
        total_duplicates_found: duplicates.length,
        duplicates: duplicates
    }, null, 2));

    console.log(`Found ${duplicates.length} sets of duplicates.`);
    console.log(`Exported to: ${outputPath}`);
}

exportDuplicates();
