import { getLeaderboardData } from '@/app/actions/leaderboard';
import { LeaderboardClient } from './LeaderboardSectionClient';

const LeaderboardSection = async () => {
    // Fetch real leaderboard data
    const { leaderboard, hasError } = await getLeaderboardData()

    // Get top 30 for homepage display
    const topStudents = leaderboard && leaderboard.length > 0 ? leaderboard.slice(0, 30) : []

    return (
        <LeaderboardClient
            topFive={topStudents}
            totalCount={leaderboard ? leaderboard.length : 0}
            hasError={hasError || false}
        />
    );
};

export default LeaderboardSection;
