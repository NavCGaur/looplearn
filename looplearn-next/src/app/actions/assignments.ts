'use server'

// ============================================================
// Assignment Server Actions — LoopLearn
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { evaluateAssignmentAnswers, extractQuestionsFromPaper } from './ai'
import { createNotification } from './notifications'

// Service role client — bypasses RLS; safe because this runs server-side only
function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

// ─────────────────────────────────────────────────────────────────────────
// TEACHER ACTIONS
// ─────────────────────────────────────────────────────────────────────────

export async function createAssignment(params: {
    title: string
    subject: string
    classStandard: number
    paperBase64: string   // base64 of image or PDF
    mimeType: string
}) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // 1. Upload question paper to storage (image or PDF)
        const bytes = Buffer.from(params.paperBase64, 'base64')
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        const ext = params.mimeType === 'application/pdf' ? 'pdf' : 'jpg'
        const filename = `${timestamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const storagePath = `${user.id}/${filename}`

        const { error: uploadError } = await supabase.storage
            .from('assignment-papers')
            .upload(storagePath, bytes, { contentType: params.mimeType, upsert: false })

        if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`)

        // 2. Insert DB row first so we have the ID
        const { data, error } = await supabase
            .from('assignments')
            .insert({
                teacher_id: user.id,
                title: params.title,
                subject: params.subject,
                class_standard: params.classStandard,
                question_paper_path: storagePath,
                is_active: true,
            })
            .select('id')
            .single()

        if (error) throw error

        // 3. Extract questions from paper image (non-blocking — failure doesn't stop assignment creation)
        try {
            const extract = await extractQuestionsFromPaper([{
                base64: params.paperBase64,
                mimeType: params.mimeType
            }])
            if (extract.success && extract.data) {
                await supabase
                    .from('assignments')
                    .update({ questions_json: extract.data })
                    .eq('id', data.id)
            } else {
                console.warn('Question extraction failed (non-fatal):', extract.error)
            }
        } catch (e) {
            console.warn('Question extraction exception (non-fatal):', e)
        }

        return { success: true, assignmentId: data.id }

    } catch (error: any) {
        console.error('createAssignment error:', error)
        return { success: false, error: error.message }
    }
}

export async function getAssignmentsForTeacher() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, data: [] }

        // Fetch assignments + count of submissions via subquery/join
        const { data, error } = await supabase
            .from('assignments')
            .select(`
                *,
                submissions:assignment_submissions(count)
            `)
            .eq('teacher_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Transform for easier client usage
        const formatted = (data || []).map(a => ({
            ...a,
            submission_count: a.submissions?.[0]?.count ?? 0
        }))

        return { success: true, data: formatted }
    } catch (error: any) {
        return { success: false, error: error.message, data: [] }
    }
}

export async function toggleAssignmentActive(assignmentId: string, isActive: boolean) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('assignments')
            .update({ is_active: isActive })
            .eq('id', assignmentId)

        if (error) throw error
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/** Generate signed URL to view the question paper image */
export async function getAssignmentPaperUrl(imagePath: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase.storage
            .from('assignment-papers')
            .createSignedUrl(imagePath, 3600) // 1 hour
        if (error) throw error
        return { success: true, url: data.signedUrl }
    } catch (error: any) {
        return { success: false, url: null, error: error.message }
    }
}

/** Generate signed URL for a student's submitted answer image (stored in quick-practice-sheets) */
export async function getStudentAnswerImageUrl(imagePath: string) {
    try {
        const adminSupabase = createAdminClient()
        const { data, error } = await adminSupabase.storage
            .from('quick-practice-sheets')
            .createSignedUrl(imagePath, 3600) // 1 hour
        if (error) throw error
        return { success: true, url: data.signedUrl }
    } catch (error: any) {
        return { success: false, url: null, error: error.message }
    }
}

export async function getAssignmentSubmissions(assignmentId: string) {
    try {
        const adminSupabase = createAdminClient()
        const { data: submissions, error } = await adminSupabase
            .from('assignment_submissions')
            .select(`
                *,
                assignment:assignments(teacher_id, title)
            `)
            .eq('assignment_id', assignmentId)
            .order('submitted_at', { ascending: false })

        if (error) throw error

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

        const data = (submissions || []).map(s => ({
            ...s,
            profiles: profileMap[s.student_id] || { display_name: null }
        }))

        return { success: true, data }
    } catch (error: any) {
        return { success: false, error: error.message, data: [] }
    }
}

// ─────────────────────────────────────────────────────────────────────────
// STUDENT ACTIONS
// ─────────────────────────────────────────────────────────────────────────

export async function getActiveAssignmentsForStudent(classStandard: number) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, data: [] }

        // Fetch active assignments for this class
        const { data: assignments, error: astErr } = await supabase
            .from('assignments')
            .select('*')
            .eq('is_active', true)
            .eq('class_standard', classStandard)
            .order('created_at', { ascending: false })

        if (astErr) throw astErr

        // Fetch user's existing submissions to mark them as 'done'
        const assignmentIds = (assignments || []).map(a => a.id)
        let subMap: Record<string, { id: string; status: string; total_marks: number | null; max_marks: number | null }> = {}

        if (assignmentIds.length > 0) {
            const { data: subs } = await supabase
                .from('assignment_submissions')
                .select('id, assignment_id, status, total_marks, max_marks')
                .eq('student_id', user.id)
                .in('assignment_id', assignmentIds)

            for (const s of subs || []) {
                subMap[s.assignment_id] = s
            }
        }

        const data = (assignments || []).map(a => ({
            ...a,
            submission: subMap[a.id] || null
        }))

        return { success: true, data }

    } catch (error: any) {
        return { success: false, error: error.message, data: [] }
    }
}

export async function submitAssignmentSolution(params: {
    assignmentId: string
    answerImages: { base64: string; mimeType: string }[]  // one entry per page, no stitching
    feedbackLanguage: 'english' | 'hinglish'
}) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // 1. Get assignment with questions_json
        const { data: assignment, error: astErr } = await supabase
            .from('assignments')
            .select('*')
            .eq('id', params.assignmentId)
            .single()

        if (astErr || !assignment) throw new Error('Assignment not found')

        // 2. Build questions text from stored JSON (fast — no Gemini call needed)
        let questionsText: string
        if (assignment.questions_json && Array.isArray(assignment.questions_json.questions)) {
            // Two-step OCR path: use pre-extracted questions as clean text
            questionsText = assignment.questions_json.questions
                .map((q: { q_number: number; question_text: string; marks: number }) =>
                    `Q${q.q_number} (${q.marks} mark${q.marks !== 1 ? 's' : ''}): ${q.question_text}`
                )
                .join('\n')
        } else {
            // Fallback: download paper image and describe it as a note
            // (for old assignments that don't have questions_json yet)
            const adminSupabase = createAdminClient()
            const { data: paperBlob } = await adminSupabase.storage
                .from('assignment-papers')
                .download(assignment.question_paper_path)
            if (paperBlob) {
                const paperBuffer = await paperBlob.arrayBuffer()
                const paperBase64 = Buffer.from(paperBuffer).toString('base64')
                // Re-extract on the fly for backward compat
                const extract = await extractQuestionsFromPaper([{ base64: paperBase64, mimeType: 'image/jpeg' }])
                if (extract.success && extract.data) {
                    questionsText = extract.data.questions
                        .map((q) => `Q${q.q_number} (${q.marks} mark${q.marks !== 1 ? 's' : ''}): ${q.question_text}`)
                        .join('\n')
                } else {
                    throw new Error('Could not read question paper. Please ask your teacher to re-upload.')
                }
            } else {
                throw new Error('Could not access question paper.')
            }
        }

        // 3. Evaluate: text questions + separate answer images (no stitching)
        const evalRes = await evaluateAssignmentAnswers(
            questionsText,
            params.answerImages,
            params.feedbackLanguage
        )

        // If Gemini failed, return error WITHOUT saving — student can retry
        if (!evalRes.success || !evalRes.data) {
            return {
                success: false,
                error: evalRes.error || 'AI evaluation failed. Please try uploading your images again.'
            }
        }

        const { data: evalData } = evalRes

        if (!evalData.questions || evalData.questions.length === 0) {
            return {
                success: false,
                error: '⚠️ Gemini could not find any answers in the uploaded images. Make sure you uploaded your answer sheet and that your question numbers are clearly written (e.g. Q1, Q2).'
            }
        }

        // 4. Save student's first answer image to storage as a reference
        let imagePath = null
        try {
            const firstImg = params.answerImages[0]
            const bytes = Buffer.from(firstImg.base64, 'base64')
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
            const filename = `assignment-${params.assignmentId}-${timestamp}.jpg`
            const storagePath = `${user.id}/${filename}`
            const { error: uploadError } = await supabase.storage
                .from('quick-practice-sheets')
                .upload(storagePath, bytes, { contentType: firstImg.mimeType, upsert: false })
            if (!uploadError) imagePath = storagePath
        } catch (e) { console.warn('Answer upload failed:', e) }

        // 5. Save to DB (only on success with valid questions)
        await supabase.from('assignment_submissions').insert({
            assignment_id: params.assignmentId,
            student_id: user.id,
            answer_image_path: imagePath,
            gemini_response: evalData.questions,
            total_marks: evalData.totalMarks,
            max_marks: evalData.maxMarks,
            status: 'ok',
        })

        // 6. Notify teacher
        try {
            await createNotification({
                userId: assignment.teacher_id,
                title: 'New assignment submission 📝',
                message: `A student submitted a solution for "${assignment.title}"`,
                type: 'submission',
                link: `/teacher/assignments`
            })
        } catch (e) { /* ignore */ }

        return { success: true, data: evalData }

    } catch (error: any) {
        console.error('submitAssignmentSolution error:', error)
        return { success: false, error: error.message }
    }
}

