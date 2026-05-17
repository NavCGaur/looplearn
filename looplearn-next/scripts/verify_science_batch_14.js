const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEACHER_UUID = 'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
    console.log('Verifying science question insertion (Batch 14)...');

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
        .eq('chapter', 'Keeping Time with the Skies')
        .eq('class_standard', 8);

    console.log(`\nTotal Questions: ${qCount?.length}`);
    console.log(`Total Science Questions: ${scienceCount?.length}`);
    console.log(`Questions in chapter "Keeping Time with the Skies" (Class 8): ${batchCount?.length}`);

    if (batchCount?.length === 25) {
        console.log('\nVerification SUCCESS: 25 questions found in the target chapter.');
    } else {
        console.log(`\nVerification FAILED: Expected 25 questions, but found ${batchCount?.length}.`);
    }
}

verify();
