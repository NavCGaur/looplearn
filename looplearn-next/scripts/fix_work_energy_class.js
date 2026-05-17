const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function update() {
    console.log('Updating "Work and Energy" questions from Class 8 to Class 9...');

    const { data, error } = await supabase
        .from('questions')
        .update({ class_standard: 9 })
        .eq('chapter', 'Work and Energy')
        .eq('class_standard', 8)
        .select();

    if (error) {
        console.error('Error updating data:', error);
        return;
    }

    console.log(`Successfully updated ${data.length} questions to Class 9.`);
}

update();
