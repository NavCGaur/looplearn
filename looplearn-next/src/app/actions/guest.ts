'use server'

import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { logSupabaseError as logError } from '@/lib/utils/error-logger'

const GUEST_COOKIE_NAME = 'guest_session_id'

// Service role client — bypasses RLS; safe because this runs server-side only
function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function startGuestSession(params: {
    classStandard: number
    subject: string
    chapter?: string
}) {
    try {
        const supabase = createAdminClient()  // uses service role to bypass RLS

        const { data, error } = await supabase
            .from('guest_sessions')
            .insert({
                class_standard: params.classStandard,
                subject: params.subject,
                chapter: params.chapter || null
            })
            .select('session_id')
            .single()

        if (error) {
            logError('Failed to create guest session in DB', error)
            return { error: 'Failed to start session' }
        }

        // Also set as cookie as a secondary mechanism (e.g. for direct URL navigation)
        try {
            const cookieStore = await cookies()
            cookieStore.set(GUEST_COOKIE_NAME, data.session_id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60
            })
        } catch {
            // Cookie setting can fail in some edge cases; session ID is returned directly
        }

        return { success: true, sessionId: data.session_id }
    } catch (e) {
        logError('Exception in startGuestSession', e)
        return { error: 'An unexpected error occurred' }
    }
}

export async function logGuestAnswer(params: {
    sessionId: string       // Passed directly from the client — no cookie dependency
    questionId: string
    givenAnswer: string
    isCorrect: boolean
    timeTakenSeconds: number
}) {
    try {
        const supabase = createAdminClient()  // uses service role to bypass RLS

        let errorType: string | null = null

        // If incorrect, check for spelling error
        if (!params.isCorrect && params.givenAnswer) {
            const { data: question } = await supabase
                .from('questions')
                .select(`
                    question_type,
                    question_options (option_text, is_correct),
                    fillblank_answers (accepted_answer, is_primary)
                `)
                .eq('id', params.questionId)
                .single()

            if (question) {
                let correctAnswer = ''
                if (['mcq', 'truefalse'].includes(question.question_type) && question.question_options) {
                    const correctOpt = question.question_options.find((o: any) => o.is_correct)
                    if (correctOpt) correctAnswer = correctOpt.option_text
                } else if (question.question_type === 'fillblank' && question.fillblank_answers) {
                    const correctAns = question.fillblank_answers.find((a: any) => a.is_primary)
                    if (correctAns) correctAnswer = correctAns.accepted_answer
                    else if (question.fillblank_answers.length > 0) correctAnswer = question.fillblank_answers[0].accepted_answer
                }

                if (correctAnswer) {
                    const { isSpellingError } = await import('@/lib/utils/string-similarity')
                    if (isSpellingError(params.givenAnswer, correctAnswer)) {
                        errorType = 'spelling'
                    }
                }
            }
        }

        const { error } = await supabase
            .from('guest_quiz_logs')
            .insert({
                session_id: params.sessionId,
                question_id: params.questionId,
                given_answer: params.givenAnswer,
                is_correct: params.isCorrect,
                time_taken_seconds: params.timeTakenSeconds,
                error_type: errorType
            })

        if (error) {
            logError('Failed to log guest answer', error)
            return { error: 'Failed to log answer' }
        }

        return { success: true }
    } catch (e) {
        logError('Exception in logGuestAnswer', e)
        return { error: 'An unexpected error occurred' }
    }
}

export async function convertGuestSession(userId: string) {
    try {
        const cookieStore = await cookies()
        const storedSession = cookieStore.get(GUEST_COOKIE_NAME)

        if (!storedSession?.value) {
            return { success: false, message: 'No guest session to convert' }
        }

        const supabase = await createClient()

        const { error } = await supabase
            .from('guest_sessions')
            .update({ converted_to_user_id: userId })
            .eq('session_id', storedSession.value)

        if (error) {
            logError('Failed to convert guest session', error)
            return { error: 'Failed to convert session' }
        }

        cookieStore.delete(GUEST_COOKIE_NAME)
        return { success: true }
    } catch (e) {
        logError('Exception in convertGuestSession', e)
        return { error: 'An unexpected error occurred' }
    }
}
