'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { logSupabaseError } from '@/lib/utils/error-logger'

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
 */
export async function getLeaderboardData(classStandard?: number): Promise<ExamLeaderboardData> {
    const adminClient = createAdminClient()

    let query = adminClient
        .from('exam_scores')
        .select('id, student_name, class_standard, score, max_score, submission_type, submitted_at')
        .order('score', { ascending: false })
        .order('updated_at', { ascending: true }) // tie-break: earlier submission ranks higher

    if (classStandard) {
        query = query.eq('class_standard', classStandard)
    }

    const { data, error } = await query.limit(200)

    if (error) {
        logSupabaseError('Leaderboard error', error)
        return { leaderboard: [], hasError: true }
    }

    const entries = (data || []).map((row: any, index: number) => ({
        id: row.id,
        student_name: row.student_name,
        class_standard: row.class_standard,
        score: Number(row.score),
        max_score: Number(row.max_score) || 100,
        submission_type: row.submission_type || 'homework',
        submitted_at: row.submitted_at,
        rank: index + 1,
        class_rank: classStandard ? index + 1 : null,
        percent: row.max_score > 0 ? Math.round((Number(row.score) / Number(row.max_score)) * 100) : 0,
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
        // Delete all rows (service role bypasses RLS)
        const { error } = await adminClient
            .from('exam_scores')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // delete all

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
