'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceRoleClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export interface TeacherStats {
    totalQuestions: number
    publishedQuestions: number
    draftQuestions: number
    questionsBySubject: Record<string, number>
    questionsByDifficulty: Record<string, number>
    recentActivity: any[]
}

/**
 * Get dashboard data for teacher
 */
export async function getTeacherDashboardData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Verify teacher role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        redirect('/auth/complete-profile')
    }

    if (profile.role !== 'teacher' && profile.role !== 'admin') {
        return null // Not a teacher
    }

    // Get basic stats
    const { count: totalQuestions } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id)

    const { count: publishedQuestions } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id)
        .eq('is_active', true)

    // Get questions by subject aggregation
    const { data: subjectStats } = await supabase
        .from('questions')
        .select('subject')
        .eq('created_by', user.id)

    // Process aggregations manually since simple selects are safer across different PG setups without complex RPCs
    const questionsBySubject: Record<string, number> = {}
    const questionsByDifficulty: Record<string, number> = {}

    // Get full data for local aggregation (efficient for reasonable dataset sizes)
    const { data: allQuestions } = await supabase
        .from('questions')
        .select('subject, difficulty, is_active, created_at')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

    if (allQuestions) {
        allQuestions.forEach(q => {
            // Subject count
            const subject = q.subject || 'Uncategorized'
            questionsBySubject[subject] = (questionsBySubject[subject] || 0) + 1

            // Difficulty count
            const difficulty = q.difficulty || 'Unspecified'
            questionsByDifficulty[difficulty] = (questionsByDifficulty[difficulty] || 0) + 1
        })
    }

    // Recent activity (last 5 created questions)
    const { data: recentActivity } = await supabase
        .from('questions')
        .select('id, question_text, subject, created_at, is_active')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

    const stats: TeacherStats = {
        totalQuestions: totalQuestions || 0,
        publishedQuestions: publishedQuestions || 0,
        draftQuestions: (totalQuestions || 0) - (publishedQuestions || 0),
        questionsBySubject,
        questionsByDifficulty,
        recentActivity: recentActivity || []
    }

    return {
        user: {
            id: user.id,
            email: user.email,
            name: profile.display_name,
            role: profile.role,
        },
        stats
    }
}

/**
 * Get list of all students (for teacher view)
 * In a real app, this should be filtered by class/school
 */
export async function getStudentsList() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Check permissions
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
        return []
    }

    // Fetch students
    // Use admin client to ensure we can list all profiles
    // (Profiles RLS allows viewing all, but just to be safe and consistent)
    const { data: students } = await supabase
        .from('profiles')
        .select('id, display_name, class_standard, points, created_at, last_active_at, offline_access_enabled')
        .eq('role', 'student')
        .order('points', { ascending: false })
        .limit(100) // Safety limit

    return students || []
}

/**
 * Toggle offline access for a specific student.
 * Only teachers/admins can call this.
 */
export async function toggleOfflineAccess(studentId: string, enabled: boolean): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Verify caller is teacher or admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
        return { error: 'Not authorized' }
    }

    // Use service role client to bypass RLS for updating other users' profiles
    const adminClient = createServiceRoleClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    const { error } = await adminClient
        .from('profiles')
        .update({ offline_access_enabled: enabled })
        .eq('id', studentId)
        .eq('role', 'student') // Safety: only update students

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
