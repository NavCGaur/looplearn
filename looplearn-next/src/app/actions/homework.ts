// Plain server module (no 'use server' directive to allow direct imports in api routes)

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { evaluateQuickPracticeSheet, evaluateTextWithGemini, PreviousSubmissionContext, validateHomeworkPages } from './ai'
import { saveChatMessages, getChatWindow, getStudentMemory, isMemoryStale, updateStudentMemory } from './memory'
import { getActiveSession, createSession, addPageToSession, updateSessionStatus, SessionPage } from './sessions'

function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

// ── Types ────────────────────────────────────────────────────

export interface HomeworkPlan {
    id: string
    class_standard: number
    subject: string
    day_of_week: number
    week_start: string
    hw_number: number
    task_description: string
    due_time: string
}

export interface HomeworkSubmissionStatus {
    student_id: string
    display_name: string
    whatsapp_phone: string | null
    class_standard: number
    status: 'submitted' | 'pending' | 'missing'
    marks_obtained: number | null
    max_marks: number | null
    ai_feedback: string | null
    submitted_at: string | null
}

// ── Teacher: save weekly homework plan ───────────────────────

export async function saveHomeworkPlan(params: {
    class_standard: number
    subject: string
    day_of_week: number
    week_start: string   // ISO date string of Monday
    hw_number: number
    task_description: string
    due_time?: string
}): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Not authenticated' }

        const { error } = await supabase
            .from('homework_plans')
            .upsert({
                teacher_id: user.id,
                class_standard: params.class_standard,
                subject: params.subject,
                day_of_week: params.day_of_week,
                week_start: params.week_start,
                hw_number: params.hw_number,
                task_description: params.task_description,
                due_time: params.due_time ?? '18:00:00',
            }, {
                onConflict: 'class_standard,subject,week_start,day_of_week'
            })

        if (error) return { success: false, error: error.message }
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// ── Teacher: get weekly plan for planner view ────────────────

export async function getWeeklyPlan(weekStart: string): Promise<HomeworkPlan[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('homework_plans')
        .select('*')
        .eq('week_start', weekStart)
        .order('day_of_week', { ascending: true })

    if (error) return []
    return (data ?? []) as HomeworkPlan[]
}

// ── Teacher: get next HW number for class+subject ────────────

export async function getNextHwNumber(class_standard: number, subject: string): Promise<number> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('homework_plans')
        .select('hw_number')
        .eq('class_standard', class_standard)
        .eq('subject', subject)
        .order('hw_number', { ascending: false })
        .limit(1)
        .single()

    return (data?.hw_number ?? 0) + 1
}

// ── Teacher: today's submission status per student ───────────

export async function getTodaySubmissionStatus(
    class_standard: number,
    subject: string
): Promise<{ plan: HomeworkPlan | null; submissions: HomeworkSubmissionStatus[] }> {
    const supabase = await createClient()

    // Find today's plan
    const today = new Date()
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay() // 1=Mon, 6=Sat
    // Week start = most recent Monday
    const monday = new Date(today)
    monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
    const weekStart = monday.toISOString().split('T')[0]

    const { data: plan } = await supabase
        .from('homework_plans')
        .select('*')
        .eq('class_standard', class_standard)
        .eq('subject', subject)
        .eq('week_start', weekStart)
        .eq('day_of_week', dayOfWeek)
        .single()

    if (!plan) return { plan: null, submissions: [] }

    // Get all students in this class
    const { data: students } = await supabase
        .from('profiles')
        .select('id, display_name, whatsapp_phone, class_standard')
        .eq('role', 'student')
        .eq('class_standard', class_standard)

    if (!students?.length) return { plan: plan as HomeworkPlan, submissions: [] }

    // Get submissions for this plan
    const { data: subs } = await supabase
        .from('homework_submissions')
        .select('student_id, status, marks_obtained, max_marks, ai_feedback, submitted_at')
        .eq('plan_id', plan.id)

    const subsMap = new Map((subs ?? []).map(s => [s.student_id, s]))

    const submissions: HomeworkSubmissionStatus[] = students.map(st => {
        const sub = subsMap.get(st.id)
        return {
            student_id: st.id,
            display_name: st.display_name ?? 'Unknown',
            whatsapp_phone: st.whatsapp_phone ?? null,
            class_standard: st.class_standard,
            status: sub ? sub.status : 'pending',
            marks_obtained: sub?.marks_obtained ?? null,
            max_marks: sub?.max_marks ?? null,
            ai_feedback: sub?.ai_feedback ?? null,
            submitted_at: sub?.submitted_at ?? null,
        }
    })

    return { plan: plan as HomeworkPlan, submissions }
}

// ── Teacher: EOD data for WhatsApp report ────────────────────

export async function getEodReportData(): Promise<{
    class_standard: number
    subject: string
    hw_number: number
    submitted: number
    total: number
    missing_names: string[]
}[]> {
    const supabase = await createClient()

    const today = new Date()
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
    const weekStart = monday.toISOString().split('T')[0]

    const { data: plans } = await supabase
        .from('homework_plans')
        .select('id, class_standard, subject, hw_number')
        .eq('week_start', weekStart)
        .eq('day_of_week', dayOfWeek)

    if (!plans?.length) return []

    const results = []
    for (const plan of plans) {
        const { data: students } = await supabase
            .from('profiles')
            .select('id, display_name')
            .eq('role', 'student')
            .eq('class_standard', plan.class_standard)

        const { data: subs } = await supabase
            .from('homework_submissions')
            .select('student_id')
            .eq('plan_id', plan.id)
            .eq('status', 'submitted')

        const submittedIds = new Set((subs ?? []).map(s => s.student_id))
        const missing = (students ?? []).filter(s => !submittedIds.has(s.id))

        results.push({
            class_standard: plan.class_standard,
            subject: plan.subject,
            hw_number: plan.hw_number,
            submitted: subs?.length ?? 0,
            total: students?.length ?? 0,
            missing_names: missing.map(s => s.display_name ?? 'Unknown'),
        })
    }
    return results
}

// ── Teacher: student performance history ─────────────────────

export async function getStudentPerformanceHistory(studentId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('homework_submissions')
        .select(`
            id, marks_obtained, max_marks, ai_feedback, submitted_at, status,
            homework_plans (subject, hw_number, class_standard, task_description)
        `)
        .eq('student_id', studentId)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(30)

    return data ?? []
}

// ── WhatsApp Bridge: process incoming image submission ────────
// Called by /api/whatsapp/receive — uses admin client (no session)

export async function processWhatsAppSubmission(params: {
    phone: string          // Sender's phone number (no +)
    imageBase64: string    // Base64 of the submitted image
    mimeType: string       // e.g. 'image/jpeg'
}): Promise<{
    success: boolean
    feedbackText?: string
    error?: string
    studentName?: string
}> {
    const adminClient = createAdminClient()

    // 1. Lookup student by phone
    const { data: student, error: studentErr } = await adminClient
        .from('profiles')
        .select('id, display_name, class_standard, whatsapp_phone')
        .eq('whatsapp_phone', params.phone)
        .eq('role', 'student')
        .single()

    if (studentErr || !student) {
        return {
            success: false,
            error: 'unregistered',
        }
    }

    const name = student.display_name ?? 'Student'

    // 2. Upload image to Supabase Storage
    const timestamp = Date.now()
    const ext = params.mimeType.includes('png') ? 'png' : 'jpg'
    const storagePath = `whatsapp/${student.id}/${timestamp}.${ext}`
    const imageBytes = Buffer.from(params.imageBase64, 'base64')

    await adminClient.storage
        .from('assignment-papers')
        .upload(storagePath, imageBytes, {
            contentType: params.mimeType,
            upsert: false,
        })

    // 3. Manage multi-image submission session state machine
    const session = await getActiveSession(student.id)

    if (!session) {
        // No active session: Start a new submission session
        const firstPage: SessionPage = {
            page: 1,
            path: storagePath,
            status: 'ok',
            mimeType: params.mimeType
        }
        await createSession(student.id, firstPage)

        return {
            success: true,
            feedbackText: `✅ *Page 1 receive ho gayi.* \n\nAgar aur pages hain toh send kijiye, nahi toh review karke *DONE* type kijiye submit karne ke liye.`,
            studentName: name
        }
    } else {
        // Active session exists: Check for page corrections
        const firstReuploadPage = session.pages.find(p => p.status === 'needs_reupload')
        
        if (firstReuploadPage) {
            // Replace the first page requiring correction
            firstReuploadPage.path = storagePath
            firstReuploadPage.status = 'ok'
            firstReuploadPage.reason = null
            firstReuploadPage.mimeType = params.mimeType

            await updateSessionStatus(session.id, 'active', session.pages)

            const nextReuploadPage = session.pages.find(p => p.status === 'needs_reupload')
            if (nextReuploadPage) {
                return {
                    success: true,
                    feedbackText: `✅ *Page ${firstReuploadPage.page} ki replacement mil gayi.*\n\nAb please *Page ${nextReuploadPage.page}* ki clean replacement send kijiye.`,
                    studentName: name
                }
            } else {
                return {
                    success: true,
                    feedbackText: `✅ *Saare corrections receive ho gaye!*\n\nHomework evaluate karne ke liye please *DONE* type kijiye.`,
                    studentName: name
                }
            }
        } else {
            // Append as a new page
            const newPageNum = session.pages.length + 1
            await addPageToSession(session.id, {
                page: newPageNum,
                path: storagePath,
                status: 'ok',
                mimeType: params.mimeType
            })

            return {
                success: true,
                feedbackText: `✅ *Page ${newPageNum} receive ho gayi.*\n\nAgar aur pages hain toh send kijiye, nahi toh homework submit karne ke liye *DONE* type kijiye.`,
                studentName: name
            }
        }
    }
}

// ── Teacher: update student WhatsApp phone ───────────────────

export async function updateStudentPhone(
    studentId: string,
    phone: string | null
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const { data: callerProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (callerProfile?.role !== 'teacher' && callerProfile?.role !== 'admin') {
        return { success: false, error: 'Not authorized' }
    }

    const adminClient = createAdminClient()
    const { error } = await adminClient
        .from('profiles')
        .update({ whatsapp_phone: phone ?? null })
        .eq('id', studentId)
        .eq('role', 'student')

    if (error) return { success: false, error: error.message }
    return { success: true }
}

// ── Scheduler: get today's plans + student phones ────────────
// Called by /api/scheduler/trigger for morning task dispatch

export async function getTodayTaskMessages(): Promise<{
    phone: string
    message: string
}[]> {
    const adminClient = createAdminClient()
    const today = new Date()
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
    const weekStart = monday.toISOString().split('T')[0]

    const { data: plans } = await adminClient
        .from('homework_plans')
        .select('*')
        .eq('week_start', weekStart)
        .eq('day_of_week', dayOfWeek)

    if (!plans?.length) return []

    const messages: { phone: string; message: string }[] = []

    for (const plan of plans) {
        const { data: students } = await adminClient
            .from('profiles')
            .select('display_name, whatsapp_phone')
            .eq('role', 'student')
            .eq('class_standard', plan.class_standard)
            .not('whatsapp_phone', 'is', null)

        for (const st of students ?? []) {
            if (!st.whatsapp_phone) continue
            messages.push({
                phone: st.whatsapp_phone,
                message: `🌅 Good morning, ${st.display_name}!\n\n📚 Aaj ka homework:\n*${plan.subject} — HW #${plan.hw_number}*\n\n${plan.task_description}\n\n⏰ Submit by ${plan.due_time?.slice(0, 5) ?? '6:00 PM'} — photo bhejo is number pe!`,
            })
        }
    }
    return messages
}

// ── Scheduler: get reminder messages (5 PM) ──────────────────

export async function getPendingReminderMessages(): Promise<{
    phone: string
    message: string
    studentId: string
    planId: string
}[]> {
    const adminClient = createAdminClient()
    const today = new Date()
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
    const weekStart = monday.toISOString().split('T')[0]

    const { data: plans } = await adminClient
        .from('homework_plans')
        .select('id, class_standard, subject, hw_number')
        .eq('week_start', weekStart)
        .eq('day_of_week', dayOfWeek)

    if (!plans?.length) return []

    const messages: { phone: string; message: string; studentId: string; planId: string }[] = []

    for (const plan of plans) {
        const { data: students } = await adminClient
            .from('profiles')
            .select('id, display_name, whatsapp_phone')
            .eq('role', 'student')
            .eq('class_standard', plan.class_standard)
            .not('whatsapp_phone', 'is', null)

        const { data: submitted } = await adminClient
            .from('homework_submissions')
            .select('student_id')
            .eq('plan_id', plan.id)
            .eq('status', 'submitted')

        const submittedIds = new Set((submitted ?? []).map(s => s.student_id))

        for (const st of students ?? []) {
            if (!st.whatsapp_phone || submittedIds.has(st.id)) continue
            messages.push({
                phone: st.whatsapp_phone,
                studentId: st.id,
                planId: plan.id,
                message: `⏰ Reminder: ${st.display_name}, abhi tak ${plan.subject} HW #${plan.hw_number} submit nahi hua!\n\nJaldi karo — photo bhejo! 📸`,
            })
        }
    }
    return messages
}

// ── Scheduler: mark missing submissions (8 PM) ───────────────

export async function markMissingSubmissions(): Promise<number> {
    const adminClient = createAdminClient()
    const today = new Date()
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
    const weekStart = monday.toISOString().split('T')[0]

    const { data: plans } = await adminClient
        .from('homework_plans')
        .select('id, class_standard')
        .eq('week_start', weekStart)
        .eq('day_of_week', dayOfWeek)

    if (!plans?.length) return 0

    let count = 0
    for (const plan of plans) {
        const { data: students } = await adminClient
            .from('profiles')
            .select('id')
            .eq('role', 'student')
            .eq('class_standard', plan.class_standard)

        const { data: submitted } = await adminClient
            .from('homework_submissions')
            .select('student_id')
            .eq('plan_id', plan.id)
            .eq('status', 'submitted')

        const submittedIds = new Set((submitted ?? []).map(s => s.student_id))
        const missing = (students ?? []).filter(s => !submittedIds.has(s.id))

        for (const st of missing) {
            await adminClient
                .from('homework_submissions')
                .upsert({
                    plan_id: plan.id,
                    student_id: st.id,
                    status: 'missing',
                    submission_type: 'whatsapp',
                }, { onConflict: 'plan_id,student_id' })
            count++
        }
    }
    return count
}

// ── Scheduler: Sunday weekly summary messages ────────────────

export async function getWeeklySummaryMessages(weekStart: string): Promise<{
    phone: string
    message: string
}[]> {
    const adminClient = createAdminClient()

    const { data: plans } = await adminClient
        .from('homework_plans')
        .select('class_standard, subject, hw_number, day_of_week, task_description, due_time')
        .eq('week_start', weekStart)
        .order('day_of_week', { ascending: true })

    if (!plans?.length) return []

    // Group by class
    const byClass = new Map<number, typeof plans>()
    for (const p of plans) {
        const arr = byClass.get(p.class_standard) ?? []
        arr.push(p)
        byClass.set(p.class_standard, arr)
    }

    const days = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const messages: { phone: string; message: string }[] = []

    for (const [cls, clsPlans] of byClass) {
        const { data: students } = await adminClient
            .from('profiles')
            .select('display_name, whatsapp_phone')
            .eq('role', 'student')
            .eq('class_standard', cls)
            .not('whatsapp_phone', 'is', null)

        const planLines = clsPlans.map(p =>
            `${days[p.day_of_week]} — ${p.subject} HW #${p.hw_number}: ${p.task_description}`
        ).join('\n')

        for (const st of students ?? []) {
            if (!st.whatsapp_phone) continue
            messages.push({
                phone: st.whatsapp_phone,
                message: `📅 Is hafte ka homework schedule:\n\n${planLines}\n\nHar homework ki photo bhejo jab complete karo. All the best! 💪`,
            })
        }
    }
    return messages
}

// ── WhatsApp Bridge: process incoming text message ────────────
// Called by /api/whatsapp/receive for messageType === 'text'
// Handles utility commands, typed answers, and academic doubts

export async function processWhatsAppTextSubmission(params: {
    phone: string     // Student's phone number (no +)
    textBody: string  // Raw text from student's WhatsApp message
}): Promise<{
    success: boolean
    replyText: string
}> {
    const adminClient = createAdminClient()

    // 1. Lookup student by phone
    const { data: student, error: studentErr } = await adminClient
        .from('profiles')
        .select('id, display_name, class_standard, whatsapp_phone')
        .eq('whatsapp_phone', params.phone)
        .eq('role', 'student')
        .single()

    if (studentErr || !student) {
        return {
            success: false,
            replyText: '❌ Aapka number registered nahi hai. Apne teacher se contact karo.',
        }
    }

    const name = student.display_name ?? 'Student'
    const command = params.textBody.toLowerCase().trim()

    // 1.5. Utility command: DONE — process current multi-image submission
    if (command === 'done') {
        const session = await getActiveSession(student.id)
        if (!session) {
            return {
                success: true,
                replyText: `⚠️ Aapka koi active submission session nahi mila. Pehle answers ki photos bhejiye, phir *DONE* likhiye.`
            }
        }

        const remainingReupload = session.pages.find(p => p.status === 'needs_reupload')
        if (remainingReupload) {
            return {
                success: true,
                replyText: `⚠️ Aapka submission incomplete hai. Please *Page ${remainingReupload.page}* ki replacement photo bhejiye.`
            }
        }

        // Set session status to processing
        await updateSessionStatus(session.id, 'processing')

        // Fetch all images from storage and convert to base64
        const imagesToValidate: { base64: string; mimeType: string }[] = []
        for (const page of session.pages) {
            const { data, error } = await adminClient.storage
                .from('assignment-papers')
                .download(page.path)
            
            if (error || !data) {
                console.error(`[Session] Failed to download path ${page.path}:`, error?.message)
                continue
            }
            const buffer = Buffer.from(await data.arrayBuffer())
            imagesToValidate.push({
                base64: buffer.toString('base64'),
                mimeType: page.mimeType || 'image/jpeg'
            })
        }

        if (imagesToValidate.length === 0) {
            await updateSessionStatus(session.id, 'failed')
            return {
                success: true,
                replyText: `❌ Aapki photos load nahi ho payin. Please dobara bhej kar try kijiye.`
            }
        }

        // Run Gemini Validation Step
        const validation = await validateHomeworkPages(imagesToValidate)
        if (!validation.success) {
            await updateSessionStatus(session.id, 'failed')
            return {
                success: true,
                replyText: `⚠️ AI validation fail ho gaya. Please thodi der baad dobara *DONE* likh kar submit kijiye.`
            }
        }

        // Update pages validation status
        let hasErrors = false
        const updatedPages = session.pages.map((p, idx) => {
            const pageVal = validation.pages.find(v => v.page === p.page) || validation.pages[idx]
            if (pageVal && pageVal.status !== 'ok') {
                hasErrors = true
                p.status = pageVal.status as any
                p.reason = pageVal.reason || null
            } else {
                p.status = 'ok'
                p.reason = null
            }
            return p
        })

        if (hasErrors) {
            await updateSessionStatus(session.id, 'needs_reupload', updatedPages)
            
            const errorDetails = updatedPages
                .filter(p => p.status !== 'ok')
                .map(p => {
                    const statusLabel: Record<string, string> = {
                        cutoff: 'Cut-off / incomplete',
                        unreadable: 'Blurry / unreadable',
                        poor_lighting: 'Poor lighting',
                        questions_only: 'Only questions (no answers)',
                        answers_only: 'Only answers (no questions)',
                        invalid: 'Invalid homework image (not a question or answer sheet)'
                    }
                    return `• *Page ${p.page}*: ${statusLabel[p.status] || p.status} (${p.reason || 'adjust photo'})`
                }).join('\n')

            const readablePages = updatedPages
                .filter(p => p.status === 'ok')
                .map(p => p.page)
                .join(', ')

            const readLine = readablePages ? `Main pages ${readablePages} ko read kar paya.\n\n` : ''

            return {
                success: true,
                replyText: `⚠️ *Validation failed!*\n\n${readLine}Kuch pages mein problem aayi hai:\n${errorDetails}\n\n*Aapko poora homework dobara bhejne ki zaroorat nahi hai.* Bas upar bataye gaye pages ki new clean photo send kijiye.`
            }
        }

        // Validation Passed! Check scenarios (Questions-Only / Answers-Only / Completely Invalid)
        if (!validation.questionsFound && !validation.answersFound) {
            await updateSessionStatus(session.id, 'active') // keep active
            return {
                success: true,
                replyText: `❌ Mujhe is photo mein koi school questions ya answers nahi mile. Please school homework book ya question paper ki clean photo send kijiye.`
            }
        }

        if (validation.questionsFound && !validation.answersFound) {
            await updateSessionStatus(session.id, 'active') // keep active
            return {
                success: true,
                replyText: `📝 Main questions toh dekh pa raha hoon par aapke *answers* nahi mil rahe. Please answers likh kar page ki photo bhejiye!`
            }
        }

        if (validation.answers_only || (!validation.questionsFound && validation.answersFound)) {
            const confidence = validation.question_reconstruction_confidence ?? 1.0
            if (confidence < 0.85) {
                await updateSessionStatus(session.id, 'active') // keep active
                return {
                    success: true,
                    replyText: `🤔 Main aapke answers dekh pa raha hoon par confidently questions reconstruct nahi kar pa raha (Confidence: ${Math.round(confidence * 100)}%). Please questions ke sath photo bhejiye.`
                }
            }
        }

        // Proceed to evaluation
        const today = new Date()
        const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
        const monday = new Date(today)
        monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
        const weekStart = monday.toISOString().split('T')[0]

        const { data: plans } = await adminClient
            .from('homework_plans')
            .select('*')
            .eq('class_standard', student.class_standard)
            .eq('week_start', weekStart)
            .eq('day_of_week', dayOfWeek)

        const plan = plans?.[0] ?? null

        let previousSubmission: any = null
        if (plan) {
            const { data: prevSub } = await adminClient
                .from('homework_submissions')
                .select('marks_obtained, max_marks, ai_feedback')
                .eq('plan_id', plan.id)
                .eq('student_id', student.id)
                .single()
            if (prevSub?.marks_obtained != null) {
                previousSubmission = prevSub
            }
        }

        const base64List = imagesToValidate.map(img => img.base64)

        const evalResult = await evaluateQuickPracticeSheet(
            base64List,
            'image/jpeg',
            'hinglish',
            previousSubmission
        )

        if (!evalResult.success) {
            await updateSessionStatus(session.id, 'failed')
            return {
                success: true,
                replyText: `⚠️ Evaluation step failed. Please try again later by typing *DONE*.`
            }
        }

        const marksObtained = evalResult?.data?.totalMarks ?? null
        const maxMarks = evalResult?.data?.maxMarks ?? null
        const overallComment = evalResult?.data?.questions?.[0]?.overall_comment ?? null
        const aiFeedback = overallComment ?? evalResult?.data?.detected_subject ?? null

        if (plan) {
            await adminClient
                .from('homework_submissions')
                .upsert({
                    plan_id: plan.id,
                    student_id: student.id,
                    submission_type: 'whatsapp',
                    image_path: session.pages[0].path,
                    marks_obtained: marksObtained,
                    max_marks: maxMarks,
                    ai_feedback: aiFeedback,
                    raw_ai_response: evalResult as any,
                    status: 'submitted',
                    submitted_at: new Date().toISOString(),
                    evaluated_at: new Date().toISOString(),
                }, { onConflict: 'plan_id,student_id' })
        }

        await updateSessionStatus(session.id, 'completed')

        const subject = plan?.subject ?? ''
        const hwNum = plan ? `HW #${plan.hw_number}` : ''
        const marksLine = marksObtained != null && maxMarks != null
            ? `⭐ Marks: ${marksObtained}/${maxMarks}`
            : ''

        const questionFeedbacks = evalResult?.data?.questions?.map(q => {
            return `*Q${q.question_number}* (${q.marks_awarded}/${q.max_marks} Marks):\n` +
                   `✔️ *Correct:* ${q.what_was_correct}\n` +
                   `❌ *Improve:* ${q.what_was_wrong}\n` +
                   `💡 *Tip:* ${q.suggestion}`;
        }).join('\n\n') || '';

        const analysisSection = questionFeedbacks
            ? `📋 *Detailed Analysis:*\n${questionFeedbacks}`
            : `⚠️ Main questions ko theek se detect nahi kar paya. Please ensure questions are written clearly or contact your teacher.`

        const feedbackText = [
            `✅ *${name}, homework submit aur evaluate ho gaya!*`,
            subject ? `📚 ${subject}${hwNum ? ` — ${hwNum}` : ''}` : '',
            marksLine,
            '',
            overallComment ? `📝 *Overall Performance:* ${overallComment}` : '',
            '',
            analysisSection
        ].filter(Boolean).join('\n')

        return {
            success: true,
            replyText: feedbackText
        }
    }

    // 2. Utility command: HELP / greetings
    if (['help', 'hi', 'hello', 'helo', 'hey', 'start'].includes(command)) {
        return {
            success: true,
            replyText: `👋 Hello ${name}! Main hoon LoopLearn AI. 🤖\n\n` +
                `📚 *Mujhe use karo:*\n` +
                `✍️ Answers type karo — "Q1: HCF hai 15, Q2: LCM hai 45"\n` +
                `📸 Ya apne answers ki photo bhejo\n` +
                `🤔 Doubt pucho — "Photosynthesis kya hota hai?"\n` +
                `📋 *homework* likho — aaj ka task dekhne ke liye\n` +
                `📊 *status* likho — apne marks dekhne ke liye`,
        }
    }

    // 3. Utility command: STATUS / marks
    if (['status', 'marks', 'score', 'mera score'].includes(command)) {
        const today = new Date()
        const monday = new Date(today)
        monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
        const weekStart = monday.toISOString().split('T')[0]

        const { data: plans } = await adminClient
            .from('homework_plans')
            .select('id, subject, hw_number')
            .eq('class_standard', student.class_standard)
            .eq('week_start', weekStart)

        if (!plans?.length) {
            return {
                success: true,
                replyText: `📊 *${name}* — Class ${student.class_standard}\n\nIs hafte abhi koi homework assign nahi hua hai.`,
            }
        }

        const { data: subs } = await adminClient
            .from('homework_submissions')
            .select('plan_id, marks_obtained, max_marks, status')
            .eq('student_id', student.id)
            .in('plan_id', plans.map(p => p.id))

        const subsMap = new Map((subs ?? []).map(s => [s.plan_id, s]))
        const lines = plans.map(p => {
            const sub = subsMap.get(p.id)
            if (sub?.marks_obtained != null) {
                return `✅ ${p.subject} HW #${p.hw_number}: ${sub.marks_obtained}/${sub.max_marks} marks`
            }
            if (sub?.status === 'missing') return `❌ ${p.subject} HW #${p.hw_number}: Missing`
            return `⏳ ${p.subject} HW #${p.hw_number}: Pending`
        })

        const totalObtained = (subs ?? []).reduce((s, r) => s + (r.marks_obtained ?? 0), 0)
        const totalMax = (subs ?? []).reduce((s, r) => s + (r.max_marks ?? 0), 0)

        return {
            success: true,
            replyText: `📊 *${name}* — Class ${student.class_standard}\n` +
                `Is hafte ki progress:\n\n${lines.join('\n')}\n\n` +
                (totalMax > 0 ? `🏆 Total: ${totalObtained}/${totalMax} marks` : ''),
        }
    }

    // 4. Utility command: HOMEWORK / hw / task
    if (['homework', 'hw', 'task', 'aaj ka homework', 'aaj ka hw'].includes(command)) {
        const today = new Date()
        const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
        const monday = new Date(today)
        monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
        const weekStart = monday.toISOString().split('T')[0]

        const { data: plans } = await adminClient
            .from('homework_plans')
            .select('subject, hw_number, task_description, due_time')
            .eq('class_standard', student.class_standard)
            .eq('week_start', weekStart)
            .eq('day_of_week', dayOfWeek)

        if (!plans?.length) {
            return {
                success: true,
                replyText: `📋 Aaj ke liye koi homework assign nahi kiya gaya, ${name}! 🎉\nAram karo ya pichle topics revise karo.`,
            }
        }

        const hwLines = plans.map(p =>
            `📚 *${p.subject} — HW #${p.hw_number}*\n${p.task_description}\n⏰ Due: ${p.due_time?.slice(0, 5) ?? '18:00'}`
        ).join('\n\n')

        return {
            success: true,
            replyText: `📋 *Aaj ka homework, ${name}:*\n\n${hwLines}\n\nAnswers type karo ya photo bhejo! 💪`,
        }
    }

    // 5. Not a command — fetch context and send to Gemini for classification + response
    const today = new Date()
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
    const weekStart = monday.toISOString().split('T')[0]

    const { data: todayPlans } = await adminClient
        .from('homework_plans')
        .select('id, subject, hw_number, task_description')
        .eq('class_standard', student.class_standard)
        .eq('week_start', weekStart)
        .eq('day_of_week', dayOfWeek)

    // Fetch previous submissions for memory context
    const previousSubmissions: PreviousSubmissionContext[] = []
    if (todayPlans?.length) {
        const { data: prevSubs } = await adminClient
            .from('homework_submissions')
            .select('plan_id, marks_obtained, max_marks, ai_feedback')
            .eq('student_id', student.id)
            .in('plan_id', todayPlans.map(p => p.id))

        if (prevSubs?.length) {
            const planMap = new Map(todayPlans.map(p => [p.id, p]))
            for (const sub of prevSubs) {
                const plan = planMap.get(sub.plan_id)
                if (plan && sub.marks_obtained != null) {
                    previousSubmissions.push({
                        subject: plan.subject,
                        hw_number: plan.hw_number,
                        marks_obtained: sub.marks_obtained,
                        max_marks: sub.max_marks,
                        ai_feedback: sub.ai_feedback,
                    })
                }
            }
        }
    }

    // 6. Fetch Tier 1: Sliding window (last 6 chat messages for conversational continuity)
    const chatHistory = await getChatWindow(student.id, 6)

    // 7. Fetch Tier 2: Personalized learning profile
    //    If profile is stale (>48h), trigger an inline update using recent messages
    let learningProfile = await getStudentMemory(student.id)
    const memoryStale = await isMemoryStale(student.id)
    if (memoryStale && chatHistory.length > 0) {
        console.log(`[Memory] Profile stale for ${name} — triggering inline refresh`)
        const updateResult = await updateStudentMemory(
            student.id, name, learningProfile, chatHistory
        )
        if (updateResult.newProfile) learningProfile = updateResult.newProfile
    }

    // 8. Call Gemini — single call to classify + respond
    //    Inject both Tier 1 (conversational history) and Tier 2 (learning profile)
    const aiResult = await evaluateTextWithGemini({
        textBody: params.textBody,
        studentName: name,
        studentClass: student.class_standard,
        todayPlans: (todayPlans ?? []).map(p => ({
            subject: p.subject,
            task_description: p.task_description,
            hw_number: p.hw_number,
        })),
        previousSubmissions,
        language: 'hinglish',
        chatHistory,       // Tier 1: last 6 messages for conversational flow
        learningProfile,   // Tier 2: personalized learning facts
    })

    // 9. Save interaction to chat_messages (atomic batch insert)
    //    This is the input to the nightly summarization job
    if (aiResult.success) {
        // Fire-and-forget — don't await, don't block the reply
        saveChatMessages(student.id, params.textBody, aiResult.replyText).catch(e =>
            console.error('[Memory] saveChatMessages failed silently:', e.message)
        )
    }

    return {
        success: aiResult.success,
        replyText: aiResult.replyText,
    }
}
