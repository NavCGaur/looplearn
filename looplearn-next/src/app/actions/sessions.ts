import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export interface SessionPage {
    page: number
    path: string
    status: 'ok' | 'cutoff' | 'unreadable' | 'poor_lighting' | 'questions_only' | 'answers_only' | 'needs_reupload'
    reason?: string | null
    mimeType?: string
}

export interface SubmissionSession {
    id: string
    student_id: string
    status: 'active' | 'processing' | 'needs_reupload' | 'completed' | 'failed'
    pages: SessionPage[]
    created_at: string
}

export async function getActiveSession(studentId: string): Promise<SubmissionSession | null> {
    const admin = createAdminClient()
    const { data, error } = await admin
        .from('whatsapp_submission_sessions')
        .select('*')
        .eq('student_id', studentId)
        .in('status', ['active', 'needs_reupload'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error || !data) return null
    return data as SubmissionSession
}

export async function createSession(studentId: string, firstPage: SessionPage): Promise<SubmissionSession> {
    const admin = createAdminClient()
    const { data, error } = await admin
        .from('whatsapp_submission_sessions')
        .insert({
            student_id: studentId,
            status: 'active',
            pages: [firstPage]
        })
        .select()
        .single()

    if (error) throw new Error(`Failed to create session: ${error.message}`)
    return data as SubmissionSession
}

export async function addPageToSession(sessionId: string, newPage: SessionPage): Promise<void> {
    const admin = createAdminClient()
    const { data } = await admin
        .from('whatsapp_submission_sessions')
        .select('pages')
        .eq('id', sessionId)
        .single()

    const currentPages = (data?.pages || []) as SessionPage[]
    newPage.page = currentPages.length + 1
    currentPages.push(newPage)

    await admin
        .from('whatsapp_submission_sessions')
        .update({ pages: currentPages })
        .eq('id', sessionId)
}

export async function updateSessionStatus(
    sessionId: string,
    status: 'active' | 'processing' | 'needs_reupload' | 'completed' | 'failed',
    pages?: SessionPage[]
): Promise<void> {
    const admin = createAdminClient()
    const updatePayload: any = { status }
    if (pages) {
        updatePayload.pages = pages
    }
    await admin
        .from('whatsapp_submission_sessions')
        .update(updatePayload)
        .eq('id', sessionId)
}

export async function checkStudentLockout(studentId: string): Promise<{ locked: boolean; remainingHours?: number }> {
    const admin = createAdminClient()
    const { data, error } = await admin
        .from('whatsapp_submission_sessions')
        .select('created_at, status')
        .eq('student_id', studentId)
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error || !data) return { locked: false }

    const failedAt = new Date(data.created_at).getTime()
    const sixHoursMs = 6 * 60 * 60 * 1000
    const now = Date.now()
    if (now - failedAt < sixHoursMs) {
        const remaining = Math.ceil((failedAt + sixHoursMs - now) / (1000 * 60 * 60))
        return { locked: true, remainingHours: remaining }
    }
    return { locked: false }
}
