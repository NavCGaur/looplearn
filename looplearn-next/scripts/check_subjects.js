const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEACHER_UUID = process.env.TEACHER_UUID;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkSubjects() {
    console.log('Checking subjects for teacher:', TEACHER_UUID);

    const { data, error } = await supabase
        .from('questions')
        .select('subject, id')
        .eq('created_by', TEACHER_UUID);

    if (error) {
        console.error('Error:', error);
        return;
    }

    const counts = {};
    data.forEach(q => {
        const sub = q.subject || 'NULL';
        counts[sub] = (counts[sub] || 0) + 1;
    });

    console.log('Subject Counts:', counts);
}

checkSubjects();
