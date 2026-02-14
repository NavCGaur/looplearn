'use client'

import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/navbar'

interface LeaderboardEntry {
    id: string
    display_name: string
    points: number
    rank: number
    class_rank: number | null
    class_standard: number | null
    role: string
}

interface LeaderboardData {
    leaderboard: LeaderboardEntry[]
    currentUser: LeaderboardEntry | null
    userRank: number | null
}

interface LeaderboardClientProps {
    data: LeaderboardData
    availableClasses: number[]
    user: any
    profile: any
}

export function LeaderboardClient({ data, availableClasses, user, profile }: LeaderboardClientProps) {
    const router = useRouter()
    const { leaderboard, currentUser, userRank } = data

    // Get selected class from current user if available
    const selectedClass = profile?.class_standard

    const handleClassFilter = (classNum: number | null) => {
        if (classNum === null) {
            router.push('/leaderboard')
        } else {
            router.push(`/leaderboard?class=${classNum}`)
        }
    }

    const getMedalEmoji = (rank: number) => {
        if (rank === 1) return '🥇'
        if (rank === 2) return '🥈'
        if (rank === 3) return '🥉'
        return `#${rank}`
    }

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-600'
        if (rank === 2) return 'text-gray-500'
        if (rank === 3) return 'text-orange-600'
        return 'text-gray-700'
    }

    const getRankBg = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300'
        if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300'
        if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300'
        return 'bg-white border-gray-200'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Navbar */}
            <Navbar user={user} profile={profile} />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 mt-20">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <h2 className="text-sm font-bold mb-3">Filter by Class</h2>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleClassFilter(null)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${!selectedClass
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All Classes
                        </button>
                        {availableClasses.map((classNum) => (
                            <button
                                key={classNum}
                                onClick={() => handleClassFilter(classNum)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${selectedClass === classNum
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Class {classNum}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Leaderboard */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            {/* Top 3 Podium */}
                            {leaderboard.length >= 3 && (
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                                    <div className="flex items-end justify-center gap-4">
                                        {/* 2nd Place */}
                                        <div className="flex flex-col items-center">
                                            <div className="text-4xl mb-2">🥈</div>
                                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[100px]">
                                                <p className="text-white font-bold text-sm truncate">
                                                    {leaderboard[1].display_name}
                                                </p>
                                                <p className="text-white/90 text-xs mt-1">
                                                    {leaderboard[1].points} pts
                                                </p>
                                            </div>
                                            <div className="h-16 w-24 bg-gray-400 rounded-t-lg mt-2"></div>
                                        </div>

                                        {/* 1st Place */}
                                        <div className="flex flex-col items-center -mt-4">
                                            <div className="text-5xl mb-2">🥇</div>
                                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[100px]">
                                                <p className="text-white font-bold truncate">
                                                    {leaderboard[0].display_name}
                                                </p>
                                                <p className="text-white/90 text-xs mt-1">
                                                    {leaderboard[0].points} pts
                                                </p>
                                            </div>
                                            <div className="h-24 w-24 bg-yellow-400 rounded-t-lg mt-2"></div>
                                        </div>

                                        {/* 3rd Place */}
                                        <div className="flex flex-col items-center">
                                            <div className="text-4xl mb-2">🥉</div>
                                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[100px]">
                                                <p className="text-white font-bold text-sm truncate">
                                                    {leaderboard[2].display_name}
                                                </p>
                                                <p className="text-white/90 text-xs mt-1">
                                                    {leaderboard[2].points} pts
                                                </p>
                                            </div>
                                            <div className="h-12 w-24 bg-orange-400 rounded-t-lg mt-2"></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Full Rankings */}
                            <div className="p-4">
                                <div className="space-y-2">
                                    {leaderboard.map((entry, index) => {
                                        const rank = selectedClass ? entry.class_rank || index + 1 : entry.rank
                                        const isCurrentUser = currentUser?.id === entry.id

                                        return (
                                            <div
                                                key={entry.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${isCurrentUser
                                                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                                                    : getRankBg(rank)
                                                    }`}
                                            >
                                                {/* Rank */}
                                                <div className={`text-xl font-bold w-12 text-center ${getRankColor(rank)}`}>
                                                    {getMedalEmoji(rank)}
                                                </div>

                                                {/* User Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-800 truncate flex items-center gap-2">
                                                        {entry.display_name}
                                                        {isCurrentUser && (
                                                            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                                                You
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {entry.role === 'student' && entry.class_standard
                                                            ? `Class ${entry.class_standard}`
                                                            : 'Teacher'}
                                                    </p>
                                                </div>

                                                {/* Points */}
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-800">{entry.points}</p>
                                                    <p className="text-xs text-gray-600">points</p>
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {leaderboard.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-4xl mb-3">🏆</p>
                                            <p className="text-gray-600">No rankings yet. Be the first!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Your Rank Card */}
                        {currentUser && userRank && (
                            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md p-4 text-white">
                                <h2 className="text-base font-bold mb-3">Your Rank</h2>
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                                    <p className="text-3xl font-bold mb-1">{getMedalEmoji(userRank)}</p>
                                    <p className="text-sm opacity-90">
                                        {selectedClass ? 'Class Rank' : 'Global Rank'}
                                    </p>
                                    <p className="text-2xl font-bold mt-2">{currentUser.points} pts</p>
                                </div>
                            </div>
                        )}

                        {/* Stats Card */}
                        <div className="bg-white rounded-xl shadow-md p-4">
                            <h2 className="text-base font-bold mb-3">Leaderboard Stats</h2>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Total Players</span>
                                    <span className="text-sm font-bold text-gray-800">{leaderboard.length}</span>
                                </div>
                                {leaderboard.length > 0 && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">Top Score</span>
                                            <span className="text-sm font-bold text-gray-800">
                                                {leaderboard[0].points} pts
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">Average Score</span>
                                            <span className="text-sm font-bold text-gray-800">
                                                {Math.round(
                                                    leaderboard.reduce((sum, e) => sum + e.points, 0) /
                                                    leaderboard.length
                                                )}{' '}
                                                pts
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Motivation Card */}
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md p-4 text-white">
                            <h2 className="text-base font-bold mb-1">💪 Keep Climbing!</h2>
                            <p className="text-xs opacity-90">
                                {currentUser && userRank
                                    ? userRank === 1
                                        ? "You're at the top! Defend your position!"
                                        : `${userRank - 1} ${userRank - 1 === 1 ? 'person' : 'people'} ahead of you. Keep going!`
                                    : 'Start earning points to join the leaderboard!'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
