import { getLeaderboardData } from '@/app/actions/leaderboard';
import { LeaderboardClient } from './LeaderboardSectionClient';

const LeaderboardSection = async () => {
    // Fetch real leaderboard data
    const { leaderboard } = await getLeaderboardData()

    // Get top 5 for homepage display
    const topFive = leaderboard.slice(0, 5)

    return (
        <LeaderboardClient
            topFive={topFive}
            totalCount={leaderboard.length}
        />
    );
};

export default LeaderboardSection;
