'use server'

// ============================================================
// Web Homework Submit — Public Server Action
// Handles submissions from /submit (no auth required).
// Auto-detects: dictation sheet vs regular Q&A homework.
// Saves result to web_submissions table.
// ============================================================

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { evaluateDictationSheet, evaluateQuickPracticeSheet, DictationEvalResult } from './ai'

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
        questions: {
            question_number: number
            marks_awarded: number
            max_marks: number
            what_was_correct: string
            what_was_wrong: string
            suggestion: string
        }[]
    }
    error?: string
}

// ── Simple heuristic: does the image look like a dictation sheet?
// We let Gemini decide as part of the dictation eval — if topic_detected
// or words are found, it's a dictation. We try dictation first, then
// fall back to the Q&A evaluator if it fails or returns 0 words.
// ──────────────────────────────────────────────────────────────────────

export async function submitHomeworkFromWeb(params: WebSubmitParams): Promise<WebSubmitResult> {
    const { studentName, classStandard, imageBase64, imageMimeType } = params

    // Validate inputs
    if (!studentName?.trim()) {
        return { success: false, error: 'Student name is required.' }
    }
    if (!classStandard || classStandard < 1 || classStandard > 12) {
        return { success: false, error: 'Please select a valid class.' }
    }
    if (!imageBase64) {
        return { success: false, error: 'No image provided.' }
    }

    const adminClient = createAdminClient()
    const imageData = [{ base64: imageBase64, mimeType: imageMimeType }]

    // ── Step 1: Upload image to Supabase Storage ──────────────────────
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

    // ── Step 2: Try dictation evaluator first ─────────────────────────
    const dictResult = await evaluateDictationSheet(imageData)

    if (dictResult.success && dictResult.data && dictResult.data.total_words >= 3) {
        // Looks like a dictation sheet
        const data = dictResult.data

        // Save to DB
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
        } catch (e: any) {
            console.warn('[WebSubmit] DB insert failed (non-fatal):', e.message)
        }

        return {
            success: true,
            submissionType: 'dictation',
            dictationResult: data,
        }
    }

    // ── Step 3: Fall back to Q&A / Quick Practice evaluator ──────────
    const hwResult = await evaluateQuickPracticeSheet(imageBase64, imageMimeType, 'hinglish')

    if (!hwResult.success || !hwResult.data) {
        // Save error to DB
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

    // Save to DB
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
    } catch (e: any) {
        console.warn('[WebSubmit] DB insert failed (non-fatal):', e.message)
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
