const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkMotionChapters() {
    console.log('Checking exact chapter names in DB for Science subject...\n');

    // Get all distinct chapter names for Science
    const { data, error } = await supabase
        .from('questions')
        .select('chapter, class_standard')
        .eq('subject', 'science')
        .eq('is_active', true);

    if (error) {
        console.error('Error:', error);
        return;
    }

    // Count questions per chapter
    const chapterCounts = {};
    data.forEach(q => {
        const key = `[class=${q.class_standard}] "${q.chapter}"`;
        chapterCounts[key] = (chapterCounts[key] || 0) + 1;
    });

    console.log('=== ALL SCIENCE CHAPTER NAMES (exact DB values) ===');
    Object.entries(chapterCounts).sort().forEach(([chapter, count]) => {
        console.log(`  ${chapter}  => ${count} questions`);
    });

    // Now simulate what Fuse.js does when searching for "Motion"
    const Fuse = require('fuse.js');
    const rawChapters = [...new Set(data.map(q => q.chapter).filter(Boolean))];

    console.log('\n=== FUSE.JS SEARCH FOR "Motion" (threshold: 0.2) ===');
    const fuse02 = new Fuse(rawChapters, { includeScore: true, threshold: 0.2 });
    const results02 = fuse02.search('Motion');
    console.log('Matched chapters:', results02.map(r => `"${r.item}" (score: ${r.score?.toFixed(4)})`));

    console.log('\n=== FUSE.JS SEARCH FOR "Laws of Motion" (threshold: 0.2) ===');
    const results02b = fuse02.search('Laws of Motion');
    console.log('Matched chapters:', results02b.map(r => `"${r.item}" (score: ${r.score?.toFixed(4)})`));

    console.log('\n=== FUSE.JS SEARCH FOR "Motion" (threshold: 0.3) ===');
    const fuse03 = new Fuse(rawChapters, { includeScore: true, threshold: 0.3 });
    const results03 = fuse03.search('Motion');
    console.log('Matched chapters:', results03.map(r => `"${r.item}" (score: ${r.score?.toFixed(4)})`));

    // Test exact case-insensitive match
    console.log('\n=== EXACT CASE-INSENSITIVE MATCH FOR "Motion" ===');
    const exact = rawChapters.filter(c => c.toLowerCase() === 'motion');
    console.log('Exact matches:', exact);
}

checkMotionChapters();
