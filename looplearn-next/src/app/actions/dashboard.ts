'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Get dashboard data for the current user
 */
export async function getDashboardData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        redirect('/auth/complete-profile')
    }

    // Get total questions answered
    const { count: totalAnswered } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    // Get questions due for review today
    const { count: dueToday } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .lte('next_review_date', new Date().toISOString())

    // Get mastered questions (repetitions >= 3)
    const { count: mastered } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('repetitions', 3)

    // Get learning questions (repetitions < 3)
    const { count: learning } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .lt('repetitions', 3)

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentProgress } = await supabase
        .from('user_progress')
        .select('last_reviewed, last_quality')
        .eq('user_id', user.id)
        .gte('last_reviewed', sevenDaysAgo.toISOString())
        .order('last_reviewed', { ascending: false })
        .limit(100)

    // Calculate streak (consecutive days with activity)
    const streak = calculateStreak(recentProgress || [])

    // Get user's rank (from leaderboard)
    const { data: leaderboard } = await supabase
        .from('leaderboard_cache')
        .select('rank, class_rank')
        .eq('id', user.id)
        .single()

    // Get upcoming reviews (next 7 days)
    const sevenDaysLater = new Date()
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

    const { data: upcomingReviews } = await supabase
        .from('user_progress')
        .select(`
            next_review_date,
            questions (
                id,
                question_text,
                subject,
                difficulty
            )
        `)
        .eq('user_id', user.id)
        .gte('next_review_date', new Date().toISOString())
        .lte('next_review_date', sevenDaysLater.toISOString())
        .order('next_review_date', { ascending: true })
        .limit(10)

    return {
        user: {
            id: user.id,
            email: user.email,
            name: profile.display_name,
            role: profile.role,
            class: profile.class_standard,
            points: profile.points,
        },
        stats: {
            totalAnswered: totalAnswered || 0,
            dueToday: dueToday || 0,
            mastered: mastered || 0,
            learning: learning || 0,
            streak,
            globalRank: leaderboard?.rank || null,
            classRank: leaderboard?.class_rank || null,
        },
        upcomingReviews: upcomingReviews || [],
    }
}

/**
 * Calculate consecutive days streak
 */
function calculateStreak(progress: any[]): number {
    if (!progress || progress.length === 0) return 0

    const dates = progress
        .map(p => new Date(p.last_reviewed).toDateString())
        .filter((date, index, self) => self.indexOf(date) === index) // Unique dates
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Descending

    let streak = 0
    const today = new Date().toDateString()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    // Check if there's activity today or yesterday
    if (dates[0] !== today && dates[0] !== yesterday.toDateString()) {
        return 0
    }

    // Count consecutive days
    for (let i = 0; i < dates.length; i++) {
        const expectedDate = new Date()
        expectedDate.setDate(expectedDate.getDate() - i)

        if (dates[i] === expectedDate.toDateString()) {
            streak++
        } else {
            break
        }
    }

    return streak
}
