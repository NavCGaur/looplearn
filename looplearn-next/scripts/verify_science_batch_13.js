const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEACHER_UUID = process.env.TEACHER_UUID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TEACHER_UUID) {
    console.error('Missing required environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
    console.log('Verifying science question insertion (Batch 13)...');

    // 1. Check Total Count
    const { count, error: countError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', TEACHER_UUID);

    if (countError) {
        console.error('Error fetching overall count:', countError);
        return;
    }

    console.log(`\nTotal Questions for Teacher: ${count}`);

    // 2. Check Science Questions Specifically
    const { count: scienceCount, error: scienceError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', TEACHER_UUID)
        .ilike('subject', 'science');

    console.log(`Total Science Questions: ${scienceCount} (Expected: ~411)`);

    // 3. Check for the specific chapter
    const chapter = 'Work and Energy';

    const { count: chCount, error: chError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', TEACHER_UUID)
        .ilike('chapter', chapter);

    if (chError) {
        console.error(`Error fetching count for chapter "${chapter}":`, chError);
    } else {
        console.log(`Questions in chapter "${chapter}": ${chCount} (Expected: 27)`);
    }

    // 4. Verify class_standard is 8
    const { count: class8Count, error: classError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', TEACHER_UUID)
        .eq('class_standard', 8)
        .ilike('chapter', chapter);

    console.log(`Questions in chapter "${chapter}" for Class 8: ${class8Count} (Expected: 27)`);
}

verify();
