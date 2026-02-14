'use server'

import { createClient } from '@/lib/supabase/server'
import { logSupabaseError } from '@/lib/utils/error-logger'

/**
 * Get leaderboard data
 */
export async function getLeaderboardData(classStandard?: number) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Query profiles directly for real-time data (better than materialized view)
    let query = supabase
        .from('profiles')
        .select('id, display_name, points, class_standard, role')
        .eq('role', 'student') // Only show students on leaderboard
        .order('points', { ascending: false })

    // If classStandard is provided, filter by class
    if (classStandard) {
        query = query.eq('class_standard', classStandard)
    }

    const { data: profiles, error } = await query.limit(100)

    if (error) {
        logSupabaseError('Leaderboard error', error)
        return {
            leaderboard: [],
            currentUser: null,
            userRank: null,
        }
    }

    // Add ranks to the leaderboard
    const leaderboard = (profiles || []).map((profile, index) => ({
        ...profile,
        rank: index + 1,
        class_rank: null as number | null, // Will be calculated if filtering by class
    }))

    // If filtering by class, recalculate class ranks
    if (classStandard) {
        leaderboard.forEach((entry, index) => {
            entry.class_rank = index + 1
        })
    }

    // Find current user in leaderboard
    const currentUserEntry = user ? leaderboard.find(entry => entry.id === user.id) || null : null
    const userRank = currentUserEntry ? (classStandard ? currentUserEntry.class_rank : currentUserEntry.rank) : null

    return {
        leaderboard,
        currentUser: currentUserEntry,
        userRank,
    }
}

/**
 * Get available classes for filtering
 */
export async function getAvailableClasses() {
    const supabase = await createClient()

    const { data } = await supabase
        .from('profiles')
        .select('class_standard')
        .not('class_standard', 'is', null)
        .order('class_standard', { ascending: true })

    // Get unique classes
    const classes = [...new Set(data?.map(p => p.class_standard) || [])]

    return classes.filter(c => c !== null) as number[]
}
