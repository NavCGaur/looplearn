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

async function updateSubject() {
    console.log('Updating subject from "physics" to "science" for teacher:', TEACHER_UUID);

    // 1. Select the questions to be updated to confirm count
    const { count, error: countError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', TEACHER_UUID)
        .eq('subject', 'physics');

    if (countError) {
        console.error('Error counting physics questions:', countError);
        return;
    }

    console.log(`Found ${count} "physics" questions to update.`);

    if (count === 0) {
        console.log('No questions to update.');
        return;
    }

    // 2. Perform the update
    const { data, error: updateError } = await supabase
        .from('questions')
        .update({ subject: 'science' })
        .eq('created_by', TEACHER_UUID)
        .eq('subject', 'physics')
        .select();

    if (updateError) {
        console.error('Error updating questions:', updateError);
    } else {
        console.log(`Successfully updated ${data.length} questions to "science".`);
    }
}

updateSubject();
