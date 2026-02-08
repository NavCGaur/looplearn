import { getLeaderboardData, getAvailableClasses } from '@/app/actions/leaderboard'
import { LeaderboardClient } from '@/components/leaderboard/leaderboard-client'

export default async function LeaderboardPage({
    searchParams,
}: {
    searchParams: { class?: string }
}) {
    const classFilter = searchParams.class ? parseInt(searchParams.class) : undefined
    const data = await getLeaderboardData(classFilter)
    const availableClasses = await getAvailableClasses()

    return (
        <LeaderboardClient
            data={data}
            availableClasses={availableClasses}
            selectedClass={classFilter}
        />
    )
}
