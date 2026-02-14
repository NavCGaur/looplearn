import { Suspense } from 'react'
import { getLeaderboardData, getAvailableClasses } from '@/app/actions/leaderboard'
import { LeaderboardClient } from '@/components/leaderboard/leaderboard-client'
import { getUser } from '@/app/actions/auth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

function LeaderboardLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <LoadingSpinner size="xl" message="Loading leaderboard..." />
        </div>
    )
}

async function LeaderboardContent({ searchParams }: { searchParams: { class?: string } }) {
    const classFilter = searchParams.class ? parseInt(searchParams.class) : undefined
    const data = await getLeaderboardData(classFilter)
    const availableClasses = await getAvailableClasses()
    const userData = await getUser()

    return (
        <LeaderboardClient
            data={data}
            availableClasses={availableClasses}
            user={userData}
            profile={userData?.profile || null}
        />
    )
}

export default async function LeaderboardPage({
    searchParams,
}: {
    searchParams: { class?: string }
}) {
    return (
        <Suspense fallback={<LeaderboardLoading />}>
            <LeaderboardContent searchParams={searchParams} />
        </Suspense>
    )
}
