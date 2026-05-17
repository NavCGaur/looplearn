import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SyncAnswer {
    questionId: string
    givenAnswer: string
    isCorrect: boolean
    questionType: string
    timeTaken: number
    answeredAt: string
    pointsEarned: number
}

interface SyncProgressUpdate {
    questionId: string
    easeFactor: number
    intervalDays: number
    repetitions: number
    nextReviewDate: string
    lastQuality: number
}

interface SyncRequestBody {
    answers: SyncAnswer[]
    progressUpdates: SyncProgressUpdate[]
    totalPoints: number
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const body: SyncRequestBody = await request.json()
        const { answers, progressUpdates, totalPoints } = body

        if (!answers || answers.length === 0) {
            return NextResponse.json({ synced: 0, pointsEarned: 0 })
        }

        // 1. Bulk insert quiz_logs
        const quizLogRows = answers.map((a) => ({
            user_id: user.id,
            question_id: a.questionId,
            given_answer: a.givenAnswer,
            is_correct: a.isCorrect,
            question_type: a.questionType,
            time_taken_seconds: a.timeTaken,
            error_type: null,
            // Use the client timestamp for when it was answered offline
            created_at: a.answeredAt,
        }))

        const { error: logError } = await supabase
            .from('quiz_logs')
            .insert(quizLogRows)

        if (logError) {
            console.error('[sync] Error inserting quiz_logs:', logError)
            // Don't fail the whole sync for log errors — progress + points are more important
        }

        // 2. Bulk upsert user_progress (SRS data)
        const progressRows = progressUpdates.map((p) => ({
            user_id: user.id,
            question_id: p.questionId,
            ease_factor: p.easeFactor,
            interval_days: p.intervalDays,
            repetitions: p.repetitions,
            last_quality: p.lastQuality,
            next_review_date: p.nextReviewDate,
            last_reviewed: new Date().toISOString(),
        }))

        const { error: progressError } = await supabase
            .from('user_progress')
            .upsert(progressRows, { onConflict: 'user_id,question_id' })

        if (progressError) {
            console.error('[sync] Error upserting user_progress:', progressError)
        }

        // 3. Award points
        let finalPoints = 0
        if (totalPoints > 0) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('points')
                .eq('id', user.id)
                .single()

            if (profile) {
                const newPoints = (profile.points || 0) + totalPoints
                await supabase
                    .from('profiles')
                    .update({
                        points: newPoints,
                        last_active_at: new Date().toISOString(),
                    })
                    .eq('id', user.id)
                finalPoints = totalPoints
            }
        }

        return NextResponse.json({
            synced: answers.length,
            pointsEarned: finalPoints,
        })
    } catch (err) {
        console.error('[sync] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
