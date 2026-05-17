const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
    console.log('Verifying science question insertion (Batch 16)...');

    const { count: totalCount } = await supabase.from('questions').select('*', { count: 'exact', head: true });

    const { count: scienceCount } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('subject', 'science');

    const { data: batchCountData, count: batchCount } = await supabase
        .from('questions')
        .select('id', { count: 'exact' })
        .eq('chapter', 'The Fundamental Unit of Life')
        .eq('class_standard', 9);

    console.log(`\nTOTAL_COUNT: ${totalCount}`);
    console.log(`SCIENCE_COUNT: ${scienceCount}`);
    console.log(`Questions in "The Fundamental Unit of Life" (Class 9): ${batchCount}`);

    // Expected: 557 (prev) + 71 (new) = 628
    if (totalCount >= 628) {
        console.log(`\nVerification SUCCESS: Total count is ${totalCount} (>= 628).`);
    } else {
        console.warn(`\nVerification NOTICE: Total count is ${totalCount} (expected at least 628).`);
    }

    if (batchCount >= 71) {
        console.log(`Verification SUCCESS: Found ${batchCount} questions for the chapter.`);
    } else {
        console.error(`Verification FAILED: Expected at least 71 questions, found ${batchCount}.`);
    }
}

verify();
