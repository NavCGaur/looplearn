
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExplanations() {
    console.log('Checking explanation coverage...');

    // 1. Check questions table for answer_explanation
    const { count: totalQuestions, error: countError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error counting questions:', countError);
        return;
    }

    const { count: questionsWithExplanation, error: qError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .not('answer_explanation', 'is', null)
        .neq('answer_explanation', '');

    if (qError) {
        console.error('Error counting questions with explanations:', qError);
        return;
    }

    console.log(`\nQuestions Table:`);
    console.log(`Total Questions: ${totalQuestions}`);
    console.log(`With 'answer_explanation': ${questionsWithExplanation} (${((questionsWithExplanation / totalQuestions) * 100).toFixed(1)}%)`);

    // 2. Check question_options table for explanation
    const { count: totalOptions, error: optCountError } = await supabase
        .from('question_options')
        .select('*', { count: 'exact', head: true });

    if (optCountError) {
        console.error('Error counting options:', optCountError);
        return;
    }

    const { count: optionsWithExplanation, error: optError } = await supabase
        .from('question_options')
        .select('*', { count: 'exact', head: true })
        .not('explanation', 'is', null)
        .neq('explanation', '');

    if (optError) {
        console.error('Error counting options with explanations:', optError);
        return;
    }

    console.log(`\nQuestion Options Table:`);
    console.log(`Total Options: ${totalOptions}`);
    console.log(`With 'explanation': ${optionsWithExplanation} (${((optionsWithExplanation / totalOptions) * 100).toFixed(1)}%)`);
}

checkExplanations();
