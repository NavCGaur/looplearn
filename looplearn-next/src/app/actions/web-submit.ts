'use server'

// ============================================================
// Web Homework Submit — Public Server Action
// Handles submissions from /submit (no auth required).
// Students explicitly choose: 'dictation' | 'homework'
// Saves result to web_submissions table & accumulates leaderboard scores.
// ============================================================

import { headers } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { evaluateDictationSheet, evaluateQuickPracticeSheet, DictationEvalResult, QuestionEvalResult } from './ai'

function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export interface WebSubmitParams {
    studentName: string
    classStandard: number
    imageBase64: string
    imageMimeType: 'image/jpeg' | 'image/png' | 'image/webp'
    submissionType: 'dictation' | 'homework'  // Student now explicitly tells us
}

export interface WebSubmitResult {
    success: boolean
    submissionType?: 'dictation' | 'homework'
    dictationResult?: DictationEvalResult
    homeworkResult?: {
        detected_class: string
        detected_subject: string
        detected_chapter: string
        totalMarks: number
        maxMarks: number
        questions: QuestionEvalResult[]
    }
    error?: string
}

// ── IP Rate Limiter ────────────────────────────────────────────────────────
const ipSubmissionLog = new Map<string, number[]>()
const RATE_WINDOW_MS = 2 * 60 * 1000  // 2 minutes
const RATE_LIMIT = 3                   // max submissions per window

function checkIpRateLimit(ip: string): { allowed: boolean; waitSeconds: number } {
    const now = Date.now()
    const timestamps = (ipSubmissionLog.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS)
    if (timestamps.length >= RATE_LIMIT) {
        const oldestInWindow = timestamps[0]
        const waitMs = RATE_WINDOW_MS - (now - oldestInWindow)
        return { allowed: false, waitSeconds: Math.ceil(waitMs / 1000) }
    }
    timestamps.push(now)
    ipSubmissionLog.set(ip, timestamps)
    return { allowed: true, waitSeconds: 0 }
}

export async function submitHomeworkFromWeb(params: WebSubmitParams): Promise<WebSubmitResult> {
    const { studentName, classStandard, imageBase64, imageMimeType, submissionType } = params

    // ── Input validation ──────────────────────────────────────────────────
    if (!studentName?.trim()) {
        return { success: false, error: 'Student name is required.' }
    }
    if (!classStandard || classStandard < 1 || classStandard > 12) {
        return { success: false, error: 'Please select a valid class.' }
    }
    if (!imageBase64) {
        return { success: false, error: 'No image provided.' }
    }
    if (submissionType !== 'dictation' && submissionType !== 'homework') {
        return { success: false, error: 'Please select a submission type (Dictation or Homework).' }
    }

    // ── IP rate limit check ───────────────────────────────────────────────
    let clientIp = 'unknown'
    try {
        const headerList = await headers()
        clientIp =
            headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
            headerList.get('x-real-ip') ??
            'unknown'
    } catch {
        // headers() can fail outside request context in dev, ignore
    }
    const rateCheck = checkIpRateLimit(clientIp)
    if (!rateCheck.allowed) {
        return {
            success: false,
            error: `Too many submissions. Please wait ${rateCheck.waitSeconds} seconds before trying again.`,
        }
    }

    const adminClient = createAdminClient()
    const imageData = [{ base64: imageBase64, mimeType: imageMimeType }]

    // ── Step 1: Upload image to Supabase Storage (non-fatal) ─────────────
    let imagePath: string | null = null
    try {
        const binaryStr = atob(imageBase64)
        const bytes = new Uint8Array(binaryStr.length)
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)

        const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        const filename = `web/${ts}-${Math.random().toString(36).slice(2, 8)}.jpg`

        const { error: uploadErr } = await adminClient.storage
            .from('assignment-papers')
            .upload(filename, bytes, { contentType: 'image/jpeg', upsert: false })

        if (!uploadErr) {
            imagePath = filename
        } else {
            console.warn('[WebSubmit] Image upload failed (non-fatal):', uploadErr.message)
        }
    } catch (e: any) {
        console.warn('[WebSubmit] Image upload exception (non-fatal):', e.message)
    }

    // ── Step 2: Route to the correct evaluator based on explicit user choice ──
    if (submissionType === 'dictation') {
        const dictResult = await evaluateDictationSheet(imageData)

        if (!dictResult.success || !dictResult.data) {
            try {
                await adminClient.from('web_submissions').insert({
                    student_name: studentName.trim(),
                    class_standard: classStandard,
                    submission_type: 'dictation',
                    image_path: imagePath,
                    status: 'error',
                    error_message: dictResult.error || 'Dictation evaluation failed',
                })
            } catch (_) {}
            return {
                success: false,
                error: dictResult.error || 'Could not evaluate the dictation sheet. Please ensure the photo is clear.',
            }
        }

        const data = dictResult.data

        // Save to web_submissions — log error but still return result to student
        try {
            await adminClient.from('web_submissions').insert({
                student_name: studentName.trim(),
                class_standard: classStandard,
                submission_type: 'dictation',
                image_path: imagePath,
                ai_result: data,
                score: data.score,
                max_score: data.total_words,
                total_words: data.total_words,
                status: 'ok',
            })
        } catch (dbErr: any) {
            console.error('[WebSubmit] DB insert failed for dictation result:', dbErr.message)
        }

        // Upsert into exam_scores leaderboard (accumulate score on multiple test submissions)
        try {
            const { data: existingDictScore } = await adminClient
                .from('exam_scores')
                .select('score, max_score')
                .eq('student_name', studentName.trim())
                .eq('class_standard', classStandard)
                .maybeSingle()

            const cumulativeScore = (existingDictScore?.score ? Number(existingDictScore.score) : 0) + (data.score || 0)
            const cumulativeMax = (existingDictScore?.max_score ? Number(existingDictScore.max_score) : 0) + (data.total_words || 1)

            await adminClient.from('exam_scores').upsert({
                student_name: studentName.trim(),
                class_standard: classStandard,
                score: cumulativeScore,
                max_score: cumulativeMax,
                submission_type: 'dictation',
                updated_at: new Date().toISOString(),
            }, { onConflict: 'student_name,class_standard' })
        } catch (scoreErr: any) {
            console.warn('[WebSubmit] exam_scores upsert failed (non-fatal):', scoreErr.message)
        }

        return {
            success: true,
            submissionType: 'dictation',
            dictationResult: data,
        }
    }

    // ── Step 3: Q&A Homework evaluation ───────────────────────────────────
    const hwResult = await evaluateQuickPracticeSheet(imageBase64, imageMimeType, 'hinglish')

    if (!hwResult.success || !hwResult.data) {
        try {
            await adminClient.from('web_submissions').insert({
                student_name: studentName.trim(),
                class_standard: classStandard,
                submission_type: 'homework',
                image_path: imagePath,
                status: 'error',
                error_message: hwResult.error || 'Evaluation failed',
            })
        } catch (_) {}

        return {
            success: false,
            error: hwResult.error || 'Could not evaluate this sheet. Please make sure the photo is clear and well-lit.',
        }
    }

    const evalData = hwResult.data

    // Save to web_submissions — log error but still return result to student
    try {
        await adminClient.from('web_submissions').insert({
            student_name: studentName.trim(),
            class_standard: classStandard,
            submission_type: 'homework',
            image_path: imagePath,
            ai_result: evalData,
            score: evalData.totalMarks,
            max_score: evalData.maxMarks,
            status: 'ok',
        })
    } catch (dbErr: any) {
        console.error('[WebSubmit] DB insert failed for homework result:', dbErr.message)
    }

    // Upsert into exam_scores leaderboard (accumulate score on multiple test submissions)
    try {
        const { data: existingHwScore } = await adminClient
            .from('exam_scores')
            .select('score, max_score')
            .eq('student_name', studentName.trim())
            .eq('class_standard', classStandard)
            .maybeSingle()

        const cumulativeScore = (existingHwScore?.score ? Number(existingHwScore.score) : 0) + (evalData.totalMarks || 0)
        const cumulativeMax = (existingHwScore?.max_score ? Number(existingHwScore.max_score) : 0) + (evalData.maxMarks || 100)

        await adminClient.from('exam_scores').upsert({
            student_name: studentName.trim(),
            class_standard: classStandard,
            score: cumulativeScore,
            max_score: cumulativeMax,
            submission_type: 'homework',
            updated_at: new Date().toISOString(),
        }, { onConflict: 'student_name,class_standard' })
    } catch (scoreErr: any) {
        console.warn('[WebSubmit] exam_scores upsert failed (non-fatal):', scoreErr.message)
    }

    return {
        success: true,
        submissionType: 'homework',
        homeworkResult: {
            detected_class: evalData.detected_class,
            detected_subject: evalData.detected_subject,
            detected_chapter: evalData.detected_chapter,
            totalMarks: evalData.totalMarks,
            maxMarks: evalData.maxMarks,
            questions: evalData.questions,
        },
    }
}

// ── Teacher Dashboard Action ──────────────────────────────────────────────
export interface WebSubmissionRecord {
    id: string
    created_at: string
    student_name: string
    class_standard: number
    submission_type: 'dictation' | 'homework'
    image_path: string | null
    image_url: string | null
    ai_result: any
    score: number | null
    max_score: number | null
    total_words: number | null
    status: 'ok' | 'error'
    error_message: string | null
}

export async function getWebSubmissionsAction(): Promise<{ success: boolean; data?: WebSubmissionRecord[]; error?: string }> {
    try {
        const adminClient = createAdminClient()
        const { data, error } = await adminClient
            .from('web_submissions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200)

        if (error) {
            console.error('[WebSubmit] getWebSubmissionsAction error:', error.message)
            return { success: false, error: error.message }
        }

        const records: WebSubmissionRecord[] = await Promise.all((data || []).map(async (sub: any) => {
            let imageUrl: string | null = null
            if (sub.image_path) {
                const { data: signedData } = await adminClient.storage
                    .from('assignment-papers')
                    .createSignedUrl(sub.image_path, 86400) // 24 hours
                imageUrl = signedData?.signedUrl || null
            }

            return {
                id: sub.id,
                created_at: sub.created_at,
                student_name: sub.student_name,
                class_standard: sub.class_standard,
                submission_type: sub.submission_type,
                image_path: sub.image_path,
                image_url: imageUrl,
                ai_result: sub.ai_result,
                score: sub.score,
                max_score: sub.max_score,
                total_words: sub.total_words,
                status: sub.status,
                error_message: sub.error_message,
            }
        }))

        return { success: true, data: records }
    } catch (err: any) {
        console.error('[WebSubmit] getWebSubmissionsAction exception:', err.message)
        return { success: false, error: err.message }
    }
}
