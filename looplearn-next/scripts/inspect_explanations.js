
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpExamples() {
    const { data: questions } = await supabase
        .from('questions')
        .select(`
      id,
      question_text,
      answer_explanation,
      question_options (
        option_text,
        is_correct,
        explanation
      )
    `)
        .is('answer_explanation', null)
        .limit(5);

    console.log(JSON.stringify(questions, null, 2));
}

dumpExamples();
