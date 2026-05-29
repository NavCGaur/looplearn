const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '../.env.local');
let SUPABASE_URL = '';
let SUPABASE_SERVICE_ROLE_KEY = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const index = trimmed.indexOf('=');
            if (index !== -1) {
                const key = trimmed.substring(0, index).trim();
                const val = trimmed.substring(index + 1).trim();
                if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
                    SUPABASE_URL = val;
                } else if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
                    SUPABASE_SERVICE_ROLE_KEY = val;
                }
            }
        }
    });
} catch (e) {
    console.error('Error reading env file:', e);
    process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkSubmissionDetails() {
    console.log('Fetching latest submission for student NAVEEN (770a095e-8fc8-49e7-b212-cdd489761c2a)...');
    
    const { data: subs, error: subErr } = await supabase
        .from('homework_submissions')
        .select('*')
        .eq('student_id', '770a095e-8fc8-49e7-b212-cdd489761c2a')
        .order('created_at', { ascending: false })
        .limit(1);
        
    if (subErr) {
        console.error('Error fetching submission:', subErr);
        return;
    }
    
    if (subs.length === 0) {
        console.log('No submission found for NAVEEN.');
        return;
    }
    
    const sub = subs[0];
    console.log('\n--- Submission Overview ---');
    console.log(`ID: ${sub.id}`);
    console.log(`Status: ${sub.status}`);
    console.log(`Marks Obtained: ${sub.marks_obtained}`);
    console.log(`Max Marks: ${sub.max_marks}`);
    console.log(`AI Feedback: ${sub.ai_feedback}`);
    console.log(`Image Path: ${sub.image_path}`);
    
    console.log('\n--- Raw AI Response ---');
    console.log(JSON.stringify(sub.raw_ai_response, null, 2));
}

checkSubmissionDetails();
