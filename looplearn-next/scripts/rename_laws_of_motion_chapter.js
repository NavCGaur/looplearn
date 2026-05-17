const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function renameChapter() {
    const OLD_NAME = 'Laws Of Motion';
    const NEW_NAME = 'Force and Laws of Motion';

    console.log(`\nFinding questions with chapter: "${OLD_NAME}"...`);

    // First, preview what will be changed
    const { data: preview, error: fetchError } = await supabase
        .from('questions')
        .select('id, question_text, chapter, class_standard, subject')
        .eq('chapter', OLD_NAME);

    if (fetchError) {
        console.error('Error fetching questions:', fetchError);
        return;
    }

    if (!preview || preview.length === 0) {
        console.log(`No questions found with chapter "${OLD_NAME}". Nothing to update.`);
        return;
    }

    console.log(`\nFound ${preview.length} question(s) to rename:`);
    preview.forEach(q => {
        console.log(`  ID: ${q.id}`);
        console.log(`  Text: ${q.question_text?.substring(0, 80)}...`);
        console.log(`  Class: ${q.class_standard} | Subject: ${q.subject}`);
        console.log('');
    });

    // Perform the update
    const { data: updated, error: updateError } = await supabase
        .from('questions')
        .update({ chapter: NEW_NAME })
        .eq('chapter', OLD_NAME)
        .select('id, chapter');

    if (updateError) {
        console.error('Error updating chapter:', updateError);
        return;
    }

    console.log(`✅ Successfully renamed ${updated?.length} question(s):`);
    updated?.forEach(q => console.log(`  ID: ${q.id} → chapter: "${q.chapter}"`));

    // Verify final state
    console.log('\n--- Verification: Chapter counts for Science ---');
    const { data: verify } = await supabase
        .from('questions')
        .select('chapter')
        .eq('subject', 'science')
        .eq('is_active', true);

    const counts = {};
    verify?.forEach(q => {
        const ch = q.chapter || 'NULL';
        counts[ch] = (counts[ch] || 0) + 1;
    });

    Object.entries(counts)
        .filter(([ch]) => ch.toLowerCase().includes('motion'))
        .sort()
        .forEach(([ch, count]) => console.log(`  "${ch}" => ${count} questions`));
}

renameChapter();
