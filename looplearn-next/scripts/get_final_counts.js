const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function counts() {
    const { count: total } = await supabase.from('questions').select('*', { count: 'exact', head: true });
    const { count: science } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('subject', 'science');
    const { count: math } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('subject', 'mathematics');

    console.log(`TOTAL_COUNT: ${total}`);
    console.log(`SCIENCE_COUNT: ${science}`);
    console.log(`MATH_COUNT: ${math}`);
}

counts();
