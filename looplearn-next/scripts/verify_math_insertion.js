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
    console.log('Verifying math question insertion...');

    // 1. Check Total Count
    const { count, error: countError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', TEACHER_UUID);

    if (countError) {
        console.error('Error fetching count:', countError);
        return;
    }

    console.log(`\nTotal Questions for Teacher: ${count}`);

    // 2. Check Math Questions Specifically
    const { count: mathCount, error: mathError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', TEACHER_UUID)
        .ilike('subject', 'mathematics'); // Case-insensitive just in case

    if (mathError) {
        console.error('Error fetching math count:', mathError);
    } else {
        console.log(`Total Mathematics Questions: ${mathCount}`);
    }

    // 3. Check specific chapter (Quadrilaterals)
    const { count: chapterCount, error: chError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', TEACHER_UUID)
        .ilike('chapter', 'Quadrilaterals');

    if (chError) {
        console.error('Error fetching chapter count:', chError);
    } else {
        console.log(`Total Quadrilaterals Questions: ${chapterCount}`);
    }
}

verify();
