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

    // Refresh the materialized view to get latest rankings
    // Note: This requires elevated permissions, so we'll skip it for now
    // In production, you'd run this on a schedule (e.g., every 5 minutes)

    let query = supabase
        .from('leaderboard_cache')
        .select('*')
        .order('points', { ascending: false })

    // If classStandard is provided, filter by class
    if (classStandard) {
        query = query.eq('class_standard', classStandard)
    }

    const { data: leaderboard, error } = await query.limit(100)

    if (error) {
        logSupabaseError('Leaderboard error', error)
        return {
            leaderboard: [],
            currentUser: null,
            userRank: null,
        }
    }

    // Find current user in leaderboard
    const currentUserEntry = user ? leaderboard?.find(entry => entry.id === user.id) : null
    const userRank = currentUserEntry ? (classStandard ? currentUserEntry.class_rank : currentUserEntry.rank) : null

    return {
        leaderboard: leaderboard || [],
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
