const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function deleteDuplicates() {
    const jsonPath = path.join(__dirname, '../docs/duplicate_questions.json');
    if (!fs.existsSync(jsonPath)) {
        console.error('Duplicate questions file not found.');
        return;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const duplicates = data.duplicates || [];

    console.log(`Found ${duplicates.length} sets of duplicates.`);

    let totalDeleted = 0;

    for (const group of duplicates) {
        if (group.ids.length < 2) continue;

        // Sort by created_at ascending (oldest first)
        // We want to KEEP the NEWEST, so DELETE the OLDER ones.
        // Or user said "delete older created_at questions".
        // So we keep the one with the latest created_at.

        // Sorting: Oldest First
        group.ids.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        // The last one is the newest. All others are to be deleted.
        const toKeep = group.ids[group.ids.length - 1];
        const toDelete = group.ids.slice(0, group.ids.length - 1);

        console.log(`\nQuestion: "${group.question_text.substring(0, 50)}..."`);
        console.log(`  -> Keeping ID: ${toKeep.id} (Created: ${toKeep.created_at})`);

        for (const item of toDelete) {
            console.log(`  -> Deleting ID: ${item.id} (Created: ${item.created_at})`);

            const { error } = await supabase
                .from('questions')
                .delete()
                .eq('id', item.id);

            if (error) {
                console.error(`     Error deleting ${item.id}:`, error.message);
            } else {
                totalDeleted++;
            }
        }
    }

    console.log(`\nTotal duplicate questions deleted: ${totalDeleted}`);
}

deleteDuplicates();
