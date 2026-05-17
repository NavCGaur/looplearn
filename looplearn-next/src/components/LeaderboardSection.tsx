import { getLeaderboardData } from '@/app/actions/leaderboard';
import { LeaderboardClient } from './LeaderboardSectionClient';

const LeaderboardSection = async () => {
    // Fetch real leaderboard data
    const { leaderboard, hasError } = await getLeaderboardData()

    // Get top 5 for homepage display
    const topFive = leaderboard && leaderboard.length > 0 ? leaderboard.slice(0, 5) : []

    return (
        <LeaderboardClient
            topFive={topFive}
            totalCount={leaderboard ? leaderboard.length : 0}
            hasError={hasError || false}
        />
    );
};

export default LeaderboardSection;
