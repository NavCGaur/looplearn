/**
 * run_web_submissions_migration.js
 * Creates the web_submissions table via Supabase REST API
 */
require('dotenv').config({ path: '.env.local' })
const https = require('https')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// We'll use the Supabase Management API to run SQL directly
// via a raw query through the REST API
const sql = `
CREATE TABLE IF NOT EXISTS public.web_submissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    student_name    TEXT NOT NULL,
    class_standard  INTEGER NOT NULL CHECK (class_standard BETWEEN 1 AND 12),
    submission_type TEXT NOT NULL CHECK (submission_type IN ('dictation', 'homework')),
    image_path      TEXT,
    ai_result       JSONB,
    score           NUMERIC,
    max_score       NUMERIC,
    total_words     INTEGER,
    status          TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'error')),
    error_message   TEXT
);
CREATE INDEX IF NOT EXISTS web_submissions_created_at_idx ON public.web_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS web_submissions_class_idx ON public.web_submissions (class_standard);
ALTER TABLE public.web_submissions DISABLE ROW LEVEL SECURITY;
`

async function run() {
    const { createClient } = require('@supabase/supabase-js')
    const client = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

    // Try inserting a test row first to see if table exists
    const { error: checkError } = await client.from('web_submissions').select('id').limit(1)
    if (!checkError) {
        console.log('✅ web_submissions table already exists!')
        return
    }

    console.log('Table does not exist yet. Trying to create via SQL API...')
    
    // Use Supabase's SQL endpoint directly
    const url = new URL('/rest/v1/sql', SUPABASE_URL)
    
    const result = await fetch(url.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'apikey': SERVICE_KEY,
        },
        body: JSON.stringify({ query: sql })
    })
    
    const text = await result.text()
    console.log('Status:', result.status)
    console.log('Response:', text.slice(0, 500))
    
    if (result.ok) {
        console.log('✅ Migration succeeded!')
    } else {
        console.log('⚠️  SQL API not available. Please run this SQL manually in Supabase Dashboard > SQL Editor:')
        console.log('━'.repeat(60))
        console.log(sql)
        console.log('━'.repeat(60))
    }
}

run().catch(console.error)
