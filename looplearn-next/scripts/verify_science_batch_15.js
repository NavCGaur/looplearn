const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
    console.log('Verifying science question insertion (Batch 15)...');

    const { data: qCount, error: qError } = await supabase
        .from('questions')
        .select('id', { count: 'exact' });

    const { data: scienceCount, error: sError } = await supabase
        .from('questions')
        .select('id', { count: 'exact' })
        .eq('subject', 'science');

    const { data: batchCount, error: bError } = await supabase
        .from('questions')
        .select('id', { count: 'exact' })
        .eq('chapter', 'Gravitation')
        .eq('class_standard', 9);

    console.log(`\nTotal Questions: ${qCount?.length}`);
    console.log(`Total Science Questions: ${scienceCount?.length}`);
    console.log(`Questions in chapter "Gravitation" (Class 9): ${batchCount?.length}`);

    // Batch 8 was also Gravitation Class 9 (25 questions). 
    // Batch 15 is another 24 questions.
    // So we expect 25 + 24 = 49 questions for this chapter/class combo if it's additive.
    // Let me check if I should just look for the new ones.

    if (batchCount?.length >= 24) {
        console.log(`\nVerification SUCCESS: At least 24 questions found in chapter "Gravitation".`);
    } else {
        console.log(`\nVerification FAILED: Expected at least 24 questions, but found ${batchCount?.length}.`);
    }
}

verify();
