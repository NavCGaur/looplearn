'use server'

// ============================================================
// Subjective Test Server Actions — LoopLearn
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { evaluateSubjectiveAnswers, evaluateQuickPracticeSheet, SubjectiveQuestionInput } from './ai'
import { createNotification } from './notifications'

// Service role client — bypasses RLS; safe because this runs server-side only
function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
export interface SubjectiveTestPayload {
    title: string
    subject: string
    chapter?: string
    class_standard: number
    instructions?: string
    feedback_language?: 'english' | 'hinglish'
    questions: {
        question_number: number
        question_text: string
        question_type: 'short_answer' | 'long_answer' | 'numerical' | 'theorem' | 'diagram'
        max_marks: number
        marking_rubric?: string
        model_answer?: string
    }[]
}

// ─────────────────────────────────────────
// TEACHER: Create a new subjective test
// ─────────────────────────────────────────
export async function createSubjectiveTest(payload: SubjectiveTestPayload) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
            throw new Error('Only teachers can create tests')
        }

        const totalMarks = payload.questions.reduce((sum, q) => sum + q.max_marks, 0)

        // 1. Insert the test header
        const { data: test, error: testError } = await supabase
            .from('subjective_tests')
            .insert({
                title: payload.title,
                subject: payload.subject,
                chapter: payload.chapter || null,
                class_standard: payload.class_standard,
                instructions: payload.instructions || null,
                feedback_language: payload.feedback_language || 'english',
                total_marks: totalMarks,
                created_by: user.id,
                is_active: true,
            })
            .select()
            .single()

        if (testError || !test) {
            throw new Error(testError?.message || 'Failed to create test')
        }

        // 2. Insert all questions
        const questionsToInsert = payload.questions.map(q => ({
            test_id: test.id,
            question_number: q.question_number,
            question_text: q.question_text,
            question_type: q.question_type,
            max_marks: q.max_marks,
            marking_rubric: q.marking_rubric || null,
            model_answer: q.model_answer || null,
        }))

        const { error: qError } = await supabase
            .from('subjective_questions')
            .insert(questionsToInsert)

        if (qError) {
            // Rollback test on question insert failure
            await supabase.from('subjective_tests').delete().eq('id', test.id)
            throw new Error(`Failed to save questions: ${qError.message}`)
        }

        return { success: true, testId: test.id }
    } catch (error: any) {
        console.error('createSubjectiveTest error:', error)
        return { success: false, error: error.message }
    }
}

// ─────────────────────────────────────────
// TEACHER: Get all tests created by them (with submission count)
// ─────────────────────────────────────────
export async function getMySubjectiveTests() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { data: tests, error } = await supabase
            .from('subjective_tests')
            .select(`
                id, title, subject, chapter, class_standard, total_marks,
                instructions, is_active, created_at,
                subjective_questions ( id, max_marks ),
                subjective_submissions ( id, total_marks_awarded, status )
            `)
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)

        return { success: true, data: tests || [] }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// ─────────────────────────────────────────
// STUDENT: Get available tests for their class
// ─────────────────────────────────────────
export async function getAvailableSubjectiveTests() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Must be logged in')

        const { data: profile } = await supabase
            .from('profiles')
            .select('class_standard')
            .eq('id', user.id)
            .single()

        if (!profile?.class_standard) throw new Error('Class not set in profile')

        const { data: tests, error } = await supabase
            .from('subjective_tests')
            .select(`
                id, title, subject, chapter, class_standard,
                total_marks, instructions, created_at,
                subjective_questions ( question_number, question_text, question_type, max_marks )
            `)
            .eq('class_standard', profile.class_standard)
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)

        // For each test, also check if the student already submitted
        const testIds = (tests || []).map(t => t.id)
        let submissionMap: Record<string, boolean> = {}

        if (testIds.length > 0) {
            const { data: submissions } = await supabase
                .from('subjective_submissions')
                .select('test_id, status')
                .eq('student_id', user.id)
                .in('test_id', testIds)

                ; (submissions || []).forEach(s => {
                    submissionMap[s.test_id] = true
                })
        }

        const testsWithStatus = (tests || []).map(t => ({
            ...t,
            already_submitted: !!submissionMap[t.id],
        }))

        return { success: true, data: testsWithStatus }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// ─────────────────────────────────────────
// STUDENT: Get a single test with questions
// ─────────────────────────────────────────
export async function getSubjectiveTestById(testId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Must be logged in')

        const { data: test, error } = await supabase
            .from('subjective_tests')
            .select(`
                id, title, subject, chapter, class_standard,
                total_marks, instructions, created_at,
                subjective_questions (
                    id, question_number, question_text,
                    question_type, max_marks, marking_rubric
                )
            `)
            .eq('id', testId)
            .single()

        if (error || !test) throw new Error('Test not found')

        // Sort questions by number
        test.subjective_questions.sort((a: any, b: any) => a.question_number - b.question_number)

        // Check if student already submitted
        const { data: existing } = await supabase
            .from('subjective_submissions')
            .select('id, status, evaluation_result, total_marks_awarded, submitted_at')
            .eq('test_id', testId)
            .eq('student_id', user.id)
            .single()

        return { success: true, data: test, existingSubmission: existing || null }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// ─────────────────────────────────────────
// STUDENT: Submit answers and evaluate with Gemini
// ─────────────────────────────────────────
export async function submitAndEvaluate(params: {
    testId: string
    imageBase64: string
    imageMimeType: 'image/jpeg' | 'image/png' | 'image/webp'
}) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Must be logged in')

        const { testId, imageBase64, imageMimeType } = params

        // 1. Fetch test + questions
        const { data: test, error: testError } = await supabase
            .from('subjective_tests')
            .select(`
                id, subject, class_standard, total_marks, feedback_language,
                subjective_questions (
                    question_number, question_text, question_type,
                    max_marks, marking_rubric
                )
            `)
            .eq('id', testId)
            .single()

        if (testError || !test) throw new Error('Test not found')

        // 2. Guard: block if student already has an evaluated submission (Fix #1)
        const { data: existingEval } = await supabase
            .from('subjective_submissions')
            .select('id, status')
            .eq('test_id', testId)
            .eq('student_id', user.id)
            .eq('status', 'evaluated')
            .maybeSingle()

        if (existingEval) {
            throw new Error('You have already submitted and received results for this test. Contact your teacher if you need a re-evaluation.')
        }

        // Fix #2: Clean up any previous pending/error rows for this student+test
        const adminSupabase = createAdminClient()
        await adminSupabase
            .from('subjective_submissions')
            .delete()
            .eq('test_id', testId)
            .eq('student_id', user.id)
            .in('status', ['pending', 'error'])

        // Create a fresh pending submission record
        const { data: submission, error: subError } = await adminSupabase
            .from('subjective_submissions')
            .insert({
                test_id: testId,
                student_id: user.id,
                status: 'pending',
                submitted_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (subError || !submission) {
            throw new Error('Failed to create submission record')
        }

        // 3. Prepare questions for Gemini
        const questions: SubjectiveQuestionInput[] = (test.subjective_questions as any[])
            .sort((a, b) => a.question_number - b.question_number)
            .map(q => ({
                question_number: q.question_number,
                question_text: q.question_text,
                question_type: q.question_type,
                max_marks: q.max_marks,
                marking_rubric: q.marking_rubric,
            }))

        // 4. Call Gemini to evaluate
        const evalResult = await evaluateSubjectiveAnswers(
            imageBase64,
            imageMimeType,
            questions,
            test.subject,
            test.class_standard,
            (test.feedback_language as 'english' | 'hinglish') || 'english'
        )

        if (!evalResult.success || !evalResult.data) {
            // Mark submission as error
            await adminSupabase
                .from('subjective_submissions')
                .update({ status: 'error', error_message: evalResult.error || 'Evaluation failed' })
                .eq('id', submission.id)

            return { success: false, error: evalResult.error || 'Evaluation failed' }
        }

        // 5. Save evaluation results
        await adminSupabase
            .from('subjective_submissions')
            .update({
                status: 'evaluated',
                evaluation_result: evalResult.data,
                total_marks_awarded: evalResult.totalMarks || 0,
            })
            .eq('id', submission.id)

        return {
            success: true,
            submissionId: submission.id,
            evaluationResult: evalResult.data,
            totalMarks: evalResult.totalMarks,
            maxMarks: evalResult.maxMarks,
        }

    } catch (error: any) {
        console.error('submitAndEvaluate error:', error)
        return { success: false, error: error.message }
    }
}

// ─────────────────────────────────────────────────────────────────────────
// STUDENT: Quick Practice — self-written answer sheet
// No teacher test required. Gemini reads questions and answers from image.
// Results are stored: image → Supabase Storage, metadata → DB table.
// ─────────────────────────────────────────────────────────────────────────
export async function submitQuickPractice(params: {
    imageBase64: string
    imageMimeType: 'image/jpeg' | 'image/png' | 'image/webp'
    feedbackLanguage?: 'english' | 'hinglish'
}) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Must be logged in')

        const feedbackLanguage = params.feedbackLanguage || 'hinglish'

        // 1. Call Gemini to evaluate the answer sheet
        const result = await evaluateQuickPracticeSheet(
            params.imageBase64,
            params.imageMimeType,
            feedbackLanguage
        )

        if (!result.success || !result.data) {
            // Still save a failure row so the teacher can see error rates
            const adminSupabase = createAdminClient()
            await adminSupabase.from('quick_practice_submissions').insert({
                student_id: user.id,
                feedback_language: feedbackLanguage,
                status: 'error',
            })
            return { success: false, error: result.error || 'Evaluation failed' }
        }

        const evalData = result.data

        // 2. Upload processed image to Supabase Storage (non-fatal if fails)
        let imagePath: string | null = null
        try {
            // Convert base64 → Uint8Array for upload
            const binaryStr = atob(params.imageBase64)
            const bytes = new Uint8Array(binaryStr.length)
            for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
            const filename = `${timestamp}-${Math.random().toString(36).slice(2, 8)}.jpg`
            const storagePath = `${user.id}/${filename}`

            const { error: uploadError } = await supabase.storage
                .from('quick-practice-sheets')
                .upload(storagePath, bytes, {
                    contentType: 'image/jpeg',
                    upsert: false,
                })

            if (!uploadError) {
                imagePath = storagePath
                console.log('QuickPractice: image saved →', storagePath)
            } else {
                console.warn('QuickPractice: image upload failed (non-fatal):', uploadError.message)
            }
        } catch (uploadErr: any) {
            console.warn('QuickPractice: image upload exception (non-fatal):', uploadErr.message)
        }

        // 3. Save evaluation row to DB (non-fatal if fails)
        try {
            const adminSupabase = createAdminClient()
            await adminSupabase.from('quick_practice_submissions').insert({
                student_id: user.id,
                image_path: imagePath,
                detected_class: evalData.detected_class,
                detected_subject: evalData.detected_subject,
                detected_chapter: evalData.detected_chapter,
                total_marks: evalData.totalMarks,
                max_marks: evalData.maxMarks,
                feedback_language: feedbackLanguage,
                gemini_response: evalData.questions,
                status: 'ok',
            })
        } catch (dbErr: any) {
            console.warn('QuickPractice: DB insert failed (non-fatal):', dbErr.message)
        }

        return { success: true, data: evalData }

    } catch (error: any) {
        console.error('submitQuickPractice error:', error)
        return { success: false, error: error.message }
    }
}

// ─────────────────────────────────────────────────────────────────────────
// TEACHER: Quick Practice review actions
// ─────────────────────────────────────────────────────────────────────────

/** Fetch all quick practice submissions (teacher/admin only). */
export async function getQuickPracticeSubmissions() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Confirm teacher/admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || !['teacher', 'admin'].includes(profile.role)) {
            throw new Error('Unauthorised')
        }

        // Use admin client to bypass RLS — teacher is already verified above
        const adminSupabase = createAdminClient()

        const { data: submissions, error } = await adminSupabase
            .from('quick_practice_submissions')
            .select(`
                id, student_id, submitted_at,
                image_path,
                detected_class, detected_subject, detected_chapter,
                total_marks, max_marks, feedback_language,
                gemini_response,
                teacher_flag, teacher_note, status
            `)
            .order('submitted_at', { ascending: false })
            .limit(200)

        if (error) throw error

        // Fetch student profiles separately (student_id → auth.users, not profiles directly)
        const studentIds = [...new Set((submissions || []).map(s => s.student_id))]
        let profileMap: Record<string, { display_name: string | null }> = {}

        if (studentIds.length > 0) {
            const { data: profiles } = await adminSupabase
                .from('profiles')
                .select('id, display_name')
                .in('id', studentIds)

            for (const p of profiles || []) {
                profileMap[p.id] = { display_name: p.display_name }
            }
        }

        // Merge: attach profile data to each submission
        const data = (submissions || []).map(s => ({
            ...s,
            profiles: profileMap[s.student_id] || { display_name: null }
        }))

        return { success: true, data }
    } catch (error: any) {
        console.error('getQuickPracticeSubmissions error:', error)
        return { success: false, error: error.message, data: [] }
    }
}

/** Generate a 60-minute signed URL for viewing a stored answer sheet image. */
export async function getQuickPracticeImageUrl(imagePath: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase.storage
            .from('quick-practice-sheets')
            .createSignedUrl(imagePath, 3600) // 1 hour
        if (error) throw error
        return { success: true, url: data.signedUrl }
    } catch (error: any) {
        return { success: false, url: null, error: error.message }
    }
}

/** Teacher flags / unflags a submission and optionally adds a note. */
export async function flagQuickPracticeSubmission(params: {
    submissionId: string
    flagged: boolean
    note?: string
}) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
            .from('quick_practice_submissions')
            .update({
                teacher_flag: params.flagged,
                teacher_note: params.note ?? null,
            })
            .eq('id', params.submissionId)

        if (error) throw error

        // Notify the student when teacher saves a note (non-fatal)
        if (params.note && params.note.trim()) {
            try {
                const adminSupabase = createAdminClient()
                const { data: sub } = await adminSupabase
                    .from('quick_practice_submissions')
                    .select('student_id, detected_subject, detected_chapter')
                    .eq('id', params.submissionId)
                    .single()

                if (sub?.student_id) {
                    const subject = [sub.detected_subject, sub.detected_chapter].filter(Boolean).join(' — ') || 'your practice sheet'
                    await createNotification({
                        userId: sub.student_id,
                        title: 'Teacher reviewed your practice sheet 👨‍🏫',
                        message: `Your ${subject} sheet has been reviewed. Check your feedback!`,
                        type: 'teacher_note',
                        link: '/student/quick-practice',
                        metadata: { submissionId: params.submissionId },
                    })
                }
            } catch (notifErr: any) {
                console.warn('Notification send failed (non-fatal):', notifErr.message)
            }
        }

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
