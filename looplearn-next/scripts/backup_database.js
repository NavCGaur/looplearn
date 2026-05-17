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

// List of tables to backup (based on schema)
const TABLES = [
    'profiles',
    'questions',
    'question_options',
    'fillblank_answers',
    'user_progress',
    // Add any other tables if necessary
];

async function backupDatabase() {
    console.log('Starting full database backup...');
    const backupData = {};

    for (const table of TABLES) {
        console.log(`Fetching table: ${table}...`);

        // Fetch all rows (using pagination if needed, but for now assuming reasonable size or using basic select)
        // Supabase JS defaults to 1000 rows. We should likely loop if there are more, 
        // but for this specific request with ~200 questions, simple select is fine for now.
        // To be safe, let's bump limit.

        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(10000); // Reasonable limit for now

        if (error) {
            console.error(`Error fetching ${table}:`, error);
            backupData[table] = { error: error.message };
        } else {
            console.log(`  -> Retrieved ${data.length} rows.`);
            backupData[table] = data;
        }
    }

    // Write to file
    const filename = 'FullBackup-2026-02-15.json';
    const outputPath = path.join(__dirname, '../docs', filename);

    // Ensure docs dir exists
    if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath));
    }

    fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2));

    console.log(`\nBackup completed successfully.`);
    console.log(`Saved to: ${outputPath}`);
}

backupDatabase();
