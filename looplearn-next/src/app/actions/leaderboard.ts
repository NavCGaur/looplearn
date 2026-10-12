'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { logSupabaseError } from '@/lib/utils/error-logger'
import { formatStudentName } from '@/lib/utils/format-name'

function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export interface ExamLeaderboardEntry {
    id: string
    student_name: string
    class_standard: number
    score: number
    max_score: number
    submission_type: string
    submitted_at: string
    rank: number
    class_rank: number | null
    percent: number
}

export interface ExamLeaderboardData {
    leaderboard: ExamLeaderboardEntry[]
    hasError?: boolean
}

/**
 * Get leaderboard data from exam_scores table
 * Aggregates student scores case-insensitively so differences in casing (e.g. "Anuj raturi" vs "ANUJ Raturi")
 * are automatically merged into a single student record with their combined score.
 */
export async function getLeaderboardData(classStandard?: number): Promise<ExamLeaderboardData> {
    const adminClient = createAdminClient()

    let query = adminClient
        .from('exam_scores')
        .select('id, student_name, class_standard, score, max_score, submission_type, submitted_at, updated_at')
        .order('score', { ascending: false })
        .order('updated_at', { ascending: true })

    if (classStandard) {
        query = query.eq('class_standard', classStandard)
    }

    const { data, error } = await query.limit(500)

    if (error) {
        logSupabaseError('Leaderboard error', error)
        return { leaderboard: [], hasError: true }
    }

    // Aggregate case-insensitively by (student_name, class_standard)
    const aggregatedMap = new Map<string, {
        id: string
        student_name: string
        class_standard: number
        score: number
        max_score: number
        submission_type: string
        submitted_at: string
    }>()

    for (const row of (data || [])) {
        const formattedName = formatStudentName(row.student_name)
        const key = `${formattedName.toLowerCase()}_${row.class_standard}`

        if (!aggregatedMap.has(key)) {
            aggregatedMap.set(key, {
                id: row.id,
                student_name: formattedName,
                class_standard: Number(row.class_standard),
                score: Number(row.score) || 0,
                max_score: Number(row.max_score) || 100,
                submission_type: row.submission_type || 'homework',
                submitted_at: row.submitted_at || row.updated_at,
            })
        } else {
            const existing = aggregatedMap.get(key)!
            existing.score += Number(row.score) || 0
            existing.max_score += Number(row.max_score) || 0
            if (row.submitted_at && new Date(row.submitted_at) > new Date(existing.submitted_at)) {
                existing.submitted_at = row.submitted_at
                existing.submission_type = row.submission_type || existing.submission_type
            }
        }
    }

    // Sort descending by total cumulative score
    const entries = Array.from(aggregatedMap.values())
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({
            id: entry.id,
            student_name: entry.student_name,
            class_standard: entry.class_standard,
            score: Math.round(entry.score * 100) / 100,
            max_score: Math.round(entry.max_score * 100) / 100,
            submission_type: entry.submission_type,
            submitted_at: entry.submitted_at,
            rank: index + 1,
            class_rank: classStandard ? index + 1 : null,
            percent: entry.max_score > 0 ? Math.round((entry.score / entry.max_score) * 100) : 0,
        }))

    return { leaderboard: entries }
}

/**
 * Get available classes that have submitted exam scores
 */
export async function getAvailableClasses(): Promise<number[]> {
    const adminClient = createAdminClient()

    const { data } = await adminClient
        .from('exam_scores')
        .select('class_standard')
        .not('class_standard', 'is', null)
        .order('class_standard', { ascending: true })

    const classes = [...new Set((data || []).map((r: any) => r.class_standard))]
    return classes.filter((c): c is number => c !== null)
}

/**
 * Reset all exam scores (teacher action — clean slate)
 */
export async function resetExamScores(): Promise<{ success: boolean; error?: string }> {
    try {
        const adminClient = createAdminClient()
        const { error } = await adminClient
            .from('exam_scores')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000')

        if (error) {
            console.error('[resetExamScores]', error.message)
            return { success: false, error: error.message }
        }
        return { success: true }
    } catch (err: any) {
        console.error('[resetExamScores] exception:', err.message)
        return { success: false, error: err.message }
    }
}
