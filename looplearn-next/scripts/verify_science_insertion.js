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
    console.log('Verifying science question insertion...');

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

    // 2. Check Science Questions Specifically (Physics)
    const { count: physicsCount, error: physicsError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', TEACHER_UUID)
        .ilike('subject', 'physics');

    if (physicsError) {
        console.error('Error fetching physics count:', physicsError);
    } else {
        console.log(`Total Physics Questions: ${physicsCount}`);
    }

    // 3. Check Explanation Field Usage
    const { count: explanationCount, error: expError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', TEACHER_UUID)
        .not('answer_explanation', 'is', null);

    if (expError) {
        console.error('Error fetching explanation count:', expError);
    } else {
        console.log(`Questions with Explanation: ${explanationCount}`);
    }
}

verify();
