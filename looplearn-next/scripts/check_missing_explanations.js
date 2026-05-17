
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMissingExplanations() {
    console.log('Checking for questions with NO explanation source...');

    // Fetch all active questions with their options
    const { data: questions, error } = await supabase
        .from('questions')
        .select(`
      id,
      question_text,
      answer_explanation,
      question_options (
        id,
        option_text,
        is_correct,
        explanation
      )
    `)
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching questions:', error);
        return;
    }

    let total = questions.length;
    let missingBoth = 0;
    let hasQuestionExpl = 0;
    let hasOptionExpl = 0;

    questions.forEach(q => {
        const qExpl = q.answer_explanation && q.answer_explanation.trim() !== '';

        // Find correct option
        const correctOpt = q.question_options.find(o => o.is_correct);
        const oExpl = correctOpt && correctOpt.explanation && correctOpt.explanation.trim() !== '';

        if (qExpl) hasQuestionExpl++;
        if (oExpl) hasOptionExpl++;

        if (!qExpl && !oExpl) {
            missingBoth++;
        }
    });

    console.log(`\nAnalysis of ${total} Active Questions:`);
    console.log(`- Questions with 'answer_explanation': ${hasQuestionExpl}`);
    console.log(`- Questions where Correct Option has 'explanation': ${hasOptionExpl}`);
    console.log(`------------------------------------------------`);
    console.log(`- TOTAL MISSING BOTH: ${missingBoth} (${((missingBoth / total) * 100).toFixed(1)}%)`);

    if (missingBoth > 0) {
        console.log(`\nThese ${missingBoth} questions will show the fallback message.`);
    }
}

checkMissingExplanations();
