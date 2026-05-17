// Plain server module (no 'use server' directive to allow direct imports in api routes)

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { evaluateQuickPracticeSheet } from './ai'

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

    // 2. Find today's homework plan for this student's class
    //    Gemini will extract HW number/date from the image — we try to match it
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

    // Default to first plan for today if multiple subjects
    // (student's class may have multiple subjects today — use first)
    const plan = plans?.[0] ?? null

    // 3. Upload image to storage
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

    // 4. Evaluate with Gemini

    const evalResult = await evaluateQuickPracticeSheet(
        params.imageBase64,
        params.mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
        'hinglish'
    )

    const marksObtained = evalResult?.data?.totalMarks ?? null
    const maxMarks = evalResult?.data?.maxMarks ?? null
    const overallComment = evalResult?.data?.questions?.[0]?.overall_comment ?? null
    const aiFeedback = overallComment ?? evalResult?.data?.detected_subject ?? null

    // 5. Upsert submission (latest wins on duplicate)
    if (plan) {
        await adminClient
            .from('homework_submissions')
            .upsert({
                plan_id: plan.id,
                student_id: student.id,
                submission_type: 'whatsapp',
                image_path: storagePath,
                marks_obtained: marksObtained,
                max_marks: maxMarks,
                ai_feedback: aiFeedback,
                raw_ai_response: evalResult as any,
                status: 'submitted',
                submitted_at: new Date().toISOString(),
                evaluated_at: new Date().toISOString(),
            }, { onConflict: 'plan_id,student_id' })
    }

    // 6. Build WhatsApp feedback message
    const name = student.display_name ?? 'Student'
    const subject = plan?.subject ?? ''
    const hwNum = plan ? `HW #${plan.hw_number}` : ''
    const marksLine = marksObtained != null && maxMarks != null
        ? `⭐ Marks: ${marksObtained}/${maxMarks}`
        : ''
    const feedbackText = [
        `✅ ${name}, homework submit ho gaya!`,
        subject ? `📚 ${subject}${hwNum ? ` — ${hwNum}` : ''}` : '',
        marksLine,
        '',
        aiFeedback ?? '',
    ].filter(Boolean).join('\n')

    return {
        success: true,
        feedbackText,
        studentName: name,
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
