const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx !== -1) env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
});

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
);

async function seed() {
    const verbsPath = path.join(__dirname, '../src/lib/challenge/data/verbs.json');
    const verbs = JSON.parse(fs.readFileSync(verbsPath, 'utf8'));
    console.log(`Loaded ${verbs.length} verbs from ${verbsPath}`);

    // Test table access
    const { data: testData, error: testErr } = await supabase.from('verb_challenge_words').select('id').limit(1);
    if (testErr) {
        console.error('Error connecting to verb_challenge_words table:', testErr.message);
        console.log('Please make sure you have executed supabase/migrations/20261020_verb_challenge.sql in Supabase SQL Editor.');
        return;
    }

    console.log('Table found! Upserting 200 verbs in batches of 50...');
    const chunkSize = 50;
    for (let i = 0; i < verbs.length; i += chunkSize) {
        const chunk = verbs.slice(i, i + chunkSize);
        const { error } = await supabase.from('verb_challenge_words').upsert(chunk, { onConflict: 'id' });
        if (error) {
            console.error(`Error inserting batch ${i / chunkSize + 1}:`, error.message);
            return;
        }
        console.log(`Batch ${i / chunkSize + 1} (${chunk.length} items) upserted.`);
    }

    console.log('✅ Seeding complete!');
}

seed().catch(console.error);
