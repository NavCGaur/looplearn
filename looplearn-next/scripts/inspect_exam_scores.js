const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ehuebdfnhqmscbyjtzzo.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodWViZGZuaHFtc2NieWp0enpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI2NTAxMCwiZXhwIjoyMDg1ODQxMDEwfQ.if5kRbTvvtW8VvsiE2IB20dxcLRFXafz10A1S-21j7g'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function inspect() {
    const { data, error } = await supabase
        .from('exam_scores')
        .select('*')
        .order('score', { ascending: false })

    if (error) {
        console.error('Error fetching exam_scores:', error)
        return
    }

    console.log(`Total exam_scores rows: ${data.length}`)
    data.forEach(row => {
        console.log(`[${row.id}] Name: "${row.student_name}" | Class: ${row.class_standard} | Score: ${row.score} | Max: ${row.max_score}`)
    })
}

inspect()
