const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('Checking "Work and Energy" questions...');

    const { data, error } = await supabase
        .from('questions')
        .select('class_standard')
        .eq('chapter', 'Work and Energy');

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    const counts = {};
    data.forEach(row => {
        counts[row.class_standard] = (counts[row.class_standard] || 0) + 1;
    });

    console.log('Distribution of "Work and Energy" questions:');
    Object.keys(counts).forEach(cls => {
        console.log(`Class ${cls}: ${counts[cls]} questions`);
    });
}

check();
