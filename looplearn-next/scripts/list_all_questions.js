const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEACHER_UUID = process.env.TEACHER_UUID;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function listAll() {
    const { data, error } = await supabase
        .from('questions')
        .select('id, question_text, created_at')
        .eq('created_by', TEACHER_UUID)
        .order('created_at', { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Found ${data.length} questions.`);
    data.forEach((q, i) => {
        console.log(`${i + 1}. [${q.id}] ${q.question_text.substring(0, 40)}...`);
    });
}

listAll();
