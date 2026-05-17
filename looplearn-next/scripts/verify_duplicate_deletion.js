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

async function verifyDeletion() {
    const jsonPath = path.join(__dirname, '../docs/duplicate_questions.json');
    if (!fs.existsSync(jsonPath)) {
        console.error('Duplicate questions file not found.');
        return;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const duplicates = data.duplicates || [];

    let failedDeletions = 0;
    let checkedCount = 0;

    console.log(`Verifying deletion for ${duplicates.length} duplicate sets...`);

    for (const group of duplicates) {
        if (group.ids.length < 2) continue;

        // Re-calculate which ones should have been deleted (all except the last one by created_at)
        group.ids.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const expectedDeleted = group.ids.slice(0, group.ids.length - 1);

        for (const item of expectedDeleted) {
            checkedCount++;
            const { data, error } = await supabase
                .from('questions')
                .select('id')
                .eq('id', item.id)
                .single();

            if (data) {
                console.error(`FAILURE: ID ${item.id} still exists!`);
                failedDeletions++;
            }
        }
    }

    if (failedDeletions === 0) {
        console.log(`SUCCESS: Verified ${checkedCount} IDs were deleted.`);
    } else {
        console.error(`FAILURE: ${failedDeletions} IDs still exist.`);
    }
}

verifyDeletion();
