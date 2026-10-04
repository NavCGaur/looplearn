import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getLeaderboardData, getAvailableClasses } from '@/app/actions/leaderboard'
import { LeaderboardClient } from '@/components/leaderboard/leaderboard-client'
import { getUser } from '@/app/actions/auth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata: Metadata = {
    title: 'Leaderboard — LoopLearnX',
    description: 'See top student scores from the English Foundation Test. Track performance by class and rank.',
}

function LeaderboardLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <LoadingSpinner size="xl" message="Loading leaderboard..." />
        </div>
    )
}

async function LeaderboardContent({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
    const params = await searchParams
    const classFilter = params.class ? parseInt(params.class) : undefined
    const data = await getLeaderboardData(classFilter)
    const availableClasses = await getAvailableClasses()
    const userData = await getUser()

    return (
        <LeaderboardClient
            data={data}
            availableClasses={availableClasses}
            user={userData || null}
            profile={userData?.profile || null}
        />
    )
}

export default async function LeaderboardPage({
    searchParams,
}: {
    searchParams: Promise<{ class?: string }>
}) {
    return (
        <Suspense fallback={<LeaderboardLoading />}>
            <LeaderboardContent searchParams={searchParams} />
        </Suspense>
    )
}
