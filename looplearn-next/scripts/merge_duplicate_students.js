const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ehuebdfnhqmscbyjtzzo.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVodWViZGZuaHFtc2NieWp0enpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI2NTAxMCwiZXhwIjoyMDg1ODQxMDEwfQ.if5kRbTvvtW8VvsiE2IB20dxcLRFXafz10A1S-21j7g'

const supabase = createClient(supabaseUrl, serviceRoleKey)

function formatStudentName(name) {
    if (!name) return ''
    return name
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

async function mergeDuplicateStudents() {
    console.log('Fetching all exam_scores rows...')
    const { data: rows, error } = await supabase
        .from('exam_scores')
        .select('*')
        .order('score', { ascending: false })

    if (error) {
        console.error('Error fetching exam_scores:', error)
        return
    }

    console.log(`Fetched ${rows.length} rows.`)

    // Group rows by formattedName.toLowerCase() + '_' + class_standard
    const groups = new Map()

    for (const row of rows) {
        const formattedName = formatStudentName(row.student_name)
        const key = `${formattedName.toLowerCase()}_${row.class_standard}`

        if (!groups.has(key)) {
            groups.set(key, [])
        }
        groups.get(key).push(row)
    }

    for (const [key, groupRows] of groups.entries()) {
        const formattedName = formatStudentName(groupRows[0].student_name)
        const classStandard = groupRows[0].class_standard

        if (groupRows.length > 1) {
            console.log(`\nFound duplicate group for "${formattedName}" (Class ${classStandard}) with ${groupRows.length} entries:`)
            let totalScore = 0
            let totalMaxScore = 0
            let latestSubmittedAt = groupRows[0].submitted_at || groupRows[0].updated_at
            let bestSubmissionType = groupRows[0].submission_type || 'homework'

            groupRows.forEach(r => {
                console.log(`  - [${r.id}] Name: "${r.student_name}" | Score: ${r.score} | Max: ${r.max_score}`)
                totalScore += Number(r.score) || 0
                totalMaxScore += Number(r.max_score) || 0
                const date = r.submitted_at || r.updated_at
                if (date && (!latestSubmittedAt || new Date(date) > new Date(latestSubmittedAt))) {
                    latestSubmittedAt = date
                    bestSubmissionType = r.submission_type || bestSubmissionType
                }
            })

            // Keep the first row as primary, delete duplicates first
            const primary = groupRows[0]
            const toDelete = groupRows.slice(1)

            console.log(`  -> Deleting ${toDelete.length} duplicates first...`)
            for (const dup of toDelete) {
                const { error: delErr } = await supabase
                    .from('exam_scores')
                    .delete()
                    .eq('id', dup.id)

                if (delErr) {
                    console.error(`  Error deleting duplicate [${dup.id}]:`, delErr.message)
                } else {
                    console.log(`  Deleted duplicate row [${dup.id}]`)
                }
            }

            console.log(`  -> Consolidating into [${primary.id}] as "${formattedName}": Score=${totalScore}, Max=${totalMaxScore}`)

            // Update primary
            const { error: updateErr } = await supabase
                .from('exam_scores')
                .update({
                    student_name: formattedName,
                    score: totalScore,
                    max_score: totalMaxScore,
                    submission_type: bestSubmissionType,
                    updated_at: new Date().toISOString()
                })
                .eq('id', primary.id)

            if (updateErr) {
                console.error(`  Error updating primary [${primary.id}]:`, updateErr.message)
                continue
            }
        } else {
            // Single row: check if student_name needs formatting to Title Case
            const row = groupRows[0]
            if (row.student_name !== formattedName) {
                console.log(`\nUpdating single row [${row.id}]: "${row.student_name}" -> "${formattedName}"`)
                const { error: updateErr } = await supabase
                    .from('exam_scores')
                    .update({ student_name: formattedName })
                    .eq('id', row.id)

                if (updateErr) {
                    console.error(`  Error updating row [${row.id}]:`, updateErr.message)
                } else {
                    console.log(`  Successfully updated to "${formattedName}"`)
                }
            }
        }
    }

    console.log('\nConsolidation complete! Verifying final exam_scores...')
    const { data: finalRows } = await supabase
        .from('exam_scores')
        .select('*')
        .order('score', { ascending: false })

    console.log(`Final count: ${finalRows.length} records.`)
    finalRows.forEach((r, idx) => {
        console.log(`Rank ${idx + 1}: "${r.student_name}" | Class ${r.class_standard} | Score: ${r.score} / ${r.max_score}`)
    })
}

mergeDuplicateStudents()
