'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS so we can insert notifications for any user
// Safe: this file is 'use server', never runs in the browser
function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export interface AppNotification {
    id: string
    user_id: string
    title: string
    message: string
    type: 'teacher_note' | 'submission' | 'achievement' | 'error' | 'system'
    is_read: boolean
    link: string | null
    metadata: Record<string, unknown> | null
    created_at: string
}

// ── Fetch notifications for the logged-in user ────────────────────────────────
export async function getNotifications(limit = 20) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, data: [], unreadCount: 0 }

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error

        const unreadCount = (data || []).filter(n => !n.is_read).length
        return { success: true, data: (data || []) as AppNotification[], unreadCount }
    } catch (error: any) {
        return { success: false, data: [], unreadCount: 0, error: error.message }
    }
}

// ── Mark a single notification as read ────────────────────────────────────────
export async function markNotificationRead(notificationId: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
        if (error) throw error
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// ── Mark all notifications as read ────────────────────────────────────────────
export async function markAllNotificationsRead() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false }

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false)

        if (error) throw error
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

// ── Internal helper: create a notification for any user ───────────────────────
// Used by other server actions (e.g. submitAssignmentSolution, flagQuickPracticeSubmission)
// Uses the admin client so we can insert for any user_id (bypasses RLS)
export async function createNotification(params: {
    userId: string
    title: string
    message: string
    type: AppNotification['type']
    link?: string
    metadata?: Record<string, unknown>
}) {
    try {
        const adminSupabase = createAdminClient()
        const { error } = await adminSupabase.from('notifications').insert({
            user_id: params.userId,
            title: params.title,
            message: params.message,
            type: params.type,
            link: params.link ?? null,
            metadata: params.metadata ?? null,
        })
        if (error) {
            console.warn('createNotification failed (non-fatal):', error.message)
        }
        return { success: !error }
    } catch (error: any) {
        console.warn('createNotification exception (non-fatal):', error.message)
        return { success: false }
    }
}
