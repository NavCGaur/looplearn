
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpAllMissing() {
    console.log('Fetching questions with missing explanations...');

    // Questions where answer_explanation is null/empty
    // AND correct option explanation is null/empty
    // Note: Easier to fetch all active and filter in JS due to relational query complexity
    const { data: questions, error } = await supabase
        .from('questions')
        .select(`
      id,
      question_text,
      subject,
      class_standard,
      answer_explanation,
      question_options (
        option_text,
        is_correct,
        explanation
      )
    `)
        .eq('is_active', true);

    if (error) {
        console.error(error);
        return;
    }

    const missing = questions.filter(q => {
        const qExpl = q.answer_explanation && q.answer_explanation.trim() !== '';
        const correctOpt = q.question_options.find(o => o.is_correct);
        const oExpl = correctOpt && correctOpt.explanation && correctOpt.explanation.trim() !== '';
        return !qExpl && !oExpl;
    });

    const simplified = missing.map(q => ({
        id: q.id,
        question: q.question_text,
        subject: q.subject,
        class: q.class_standard,
        correct_answer: q.question_options.find(o => o.is_correct)?.option_text || 'Unknown'
    }));

    fs.writeFileSync('docs/missing_explanations.json', JSON.stringify(simplified, null, 2));
    console.log(`Found ${missing.length} questions. Saved to docs/missing_explanations.json`);
}

dumpAllMissing();
