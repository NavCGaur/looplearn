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

async function verify() {
    console.log('Verifying insertion...');

    // 1. Check total questions for this teacher
    const { count, error: countError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', TEACHER_UUID);

    if (countError) {
        console.error('Error counting questions:', countError);
        return;
    }
    console.log(`Total questions for Teacher ${TEACHER_UUID}: ${count}`);

    // 2. Fetch last 5 questions
    const { data: questions, error: qError } = await supabase
        .from('questions')
        .select('id, question_text, created_at')
        .eq('created_by', TEACHER_UUID)
        .order('created_at', { ascending: false })
        .limit(5);

    if (qError) {
        console.error('Error fetching questions:', qError);
        return;
    }

    console.log('\nLast 5 Questions:');
    for (const q of questions) {
        console.log(`- [${q.id}] ${q.question_text.substring(0, 50)}... (${q.created_at})`);

        // Check options
        const { count: optCount, error: optError } = await supabase
            .from('question_options')
            .select('*', { count: 'exact', head: true })
            .eq('question_id', q.id);

        // Check fillblank answers
        const { count: ansCount, error: ansError } = await supabase
            .from('fillblank_answers')
            .select('*', { count: 'exact', head: true })
            .eq('question_id', q.id);

        if (optCount > 0) console.log(`  -> ${optCount} Options`);
        if (ansCount > 0) console.log(`  -> ${ansCount} FillBlank Answers`);
    }
}

verify();
