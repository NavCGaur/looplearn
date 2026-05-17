'use client'

import { useState } from 'react'
import Link from 'next/link'
import { QuizSelectorModal } from '@/components/quiz/quiz-selector-modal'
import { DashboardNavbar } from './dashboard-navbar'
import { OfflineDownloadButton } from './offline-download-button'
import { formatDate } from '@/lib/date-utils'

interface DashboardData {
    user: {
        id: string
        email: string | undefined
        name: string
        role: string
        class: number | null
        points: number
        offlineAccessEnabled: boolean
    }
    stats: {
        totalAnswered: number
        dueToday: number
        mastered: number
        learning: number
        streak: number
        globalRank: number | null
        classRank: number | null
    }
    upcomingReviews: any[]
    assignments: any[]
}

export function DashboardClient({ data }: { data: DashboardData }) {
    const { user, stats, upcomingReviews, assignments } = data
    const [showQuizSelector, setShowQuizSelector] = useState(false)


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            {/* Header */}
            <DashboardNavbar user={user} />

            <div className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-fredoka font-bold text-gray-800 mb-2">
                        Welcome back, {user.name}! 👋
                    </h1>
                    <p className="text-lg text-gray-600 font-medium font-fredoka">
                        Ready to learn something new today?
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Due Today */}
                    <div className="bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl p-5 text-white shadow-xl">
                        <div className="text-3xl mb-2">🔥</div>
                        <div className="text-4xl font-fredoka font-bold mb-1">{stats.dueToday}</div>
                        <div className="text-base font-fredoka font-medium opacity-90">Due Today</div>
                    </div>

                    {/* Streak */}
                    <div className="bg-gradient-to-br from-loop-yellow to-loop-yellow/80 rounded-2xl p-5 text-white shadow-xl">
                        <div className="text-3xl mb-2">⚡</div>
                        <div className="text-4xl font-fredoka font-bold mb-1">{stats.streak}</div>
                        <div className="text-base font-fredoka font-medium opacity-90">Day Streak</div>
                    </div>

                    {/* Mastered */}
                    <div className="bg-gradient-to-br from-loop-green to-loop-green/80 rounded-2xl p-5 text-white shadow-xl">
                        <div className="text-3xl mb-2">✅</div>
                        <div className="text-4xl font-fredoka font-bold mb-1">{stats.mastered}</div>
                        <div className="text-base font-fredoka font-medium opacity-90">Mastered</div>
                    </div>

                    {/* Total Points */}
                    <div className="bg-gradient-to-br from-loop-blue to-loop-blue/80 rounded-2xl p-5 text-white shadow-xl">
                        <div className="text-3xl mb-2">⭐</div>
                        <div className="text-4xl font-fredoka font-bold mb-1">{user.points}</div>
                        <div className="text-base font-fredoka font-medium opacity-90">Total Points</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-md p-5">
                            <h2 className="text-xl font-fredoka font-bold mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowQuizSelector(true)}
                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-blue-200"
                                >
                                    <span className="text-2xl">📚</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-sm">Start Quiz</h3>
                                        <p className="text-xs text-gray-600">Choose subject & chapter</p>
                                    </div>
                                </button>

                                <Link
                                    href="/quiz?review=true"
                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-orange-200"
                                >
                                    <span className="text-2xl">🔄</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-sm">Review Due</h3>
                                        <p className="text-xs text-gray-600">{stats.dueToday} questions</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/leaderboard"
                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-yellow-200"
                                >
                                    <span className="text-2xl">🏆</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-sm">Leaderboard</h3>
                                        <p className="text-xs text-gray-600">See your ranking</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/dashboard/analytics"
                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-emerald-200"
                                >
                                    <span className="text-2xl">📊</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-sm">Analytics</h3>
                                        <p className="text-xs text-gray-600">Track your progress</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/dashboard/profile"
                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-purple-200"
                                >
                                    <span className="text-2xl">👤</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-sm">Profile</h3>
                                        <p className="text-xs text-gray-600">View your stats</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/spacehangman"
                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-cyan-200"
                                >
                                    <span className="text-2xl">🚀</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-sm">Space Hangman</h3>
                                        <p className="text-xs text-gray-600">Learn &amp; Play</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/student/subjective-test"
                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-teal-200"
                                >
                                    <span className="text-2xl">✍️</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-sm">Answer Evaluator</h3>
                                        <p className="text-xs text-gray-600">Upload &amp; get AI feedback</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/student/quick-practice"
                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-violet-200"
                                >
                                    <span className="text-2xl">📝</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-sm">Quick Practice</h3>
                                        <p className="text-xs text-gray-600">Self-written Q&amp;A · Instant marks</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Open Assignments Section */}
                        {assignments && assignments.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-5 border border-indigo-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <span className="text-xl">📋</span> Sample Paper Solutions
                                    </h2>
                                </div>
                                <div className="space-y-3">
                                    {assignments.map(assignment => {
                                        const isDone = assignment.submission?.status === 'ok'

                                        return (
                                            <div key={assignment.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{assignment.title}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded font-medium text-gray-600">{assignment.subject}</span>
                                                        <span className="text-xs text-gray-400">
                                                            {formatDate(assignment.created_at)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {isDone ? (
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                                                            {assignment.submission.total_marks} / {assignment.submission.max_marks} Marks
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Link
                                                        href={`/student/assignments/${assignment.id}`}
                                                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shrink-0 text-center"
                                                    >
                                                        Submit Solution →
                                                    </Link>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Progress Overview */}
                        <div className="bg-white rounded-xl shadow-md p-5">
                            <h2 className="text-lg font-bold mb-3">Learning Progress</h2>
                            <div className="space-y-3">
                                {/* Total Answered */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-700">Total Questions</span>
                                        <span className="text-xs font-bold text-gray-900">{stats.totalAnswered}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                            style={{ width: `${Math.min((stats.totalAnswered / 100) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Mastered */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-700">Mastered</span>
                                        <span className="text-xs font-bold text-green-600">{stats.mastered}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                                            style={{ width: `${stats.totalAnswered > 0 ? (stats.mastered / stats.totalAnswered) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Learning */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-700">Still Learning</span>
                                        <span className="text-xs font-bold text-orange-600">{stats.learning}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-500 to-yellow-600"
                                            style={{ width: `${stats.totalAnswered > 0 ? (stats.learning / stats.totalAnswered) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Rank Card */}
                        {(stats.globalRank || stats.classRank) && (
                            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-md p-4 text-white">
                                <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                                    <span>🏆</span>
                                    Your Ranking
                                </h2>
                                <div className="space-y-2">
                                    {stats.globalRank && (
                                        <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                                            <p className="text-xs opacity-90">Global Rank</p>
                                            <p className="text-xl font-bold">#{stats.globalRank}</p>
                                        </div>
                                    )}
                                    {stats.classRank && (
                                        <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                                            <p className="text-xs opacity-90">Class Rank</p>
                                            <p className="text-xl font-bold">#{stats.classRank}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Upcoming Reviews */}
                        <div className="bg-white rounded-xl shadow-md p-4">
                            <h2 className="text-base font-bold mb-3">Upcoming Reviews</h2>
                            {upcomingReviews.length > 0 ? (
                                <div className="space-y-2">
                                    {upcomingReviews.slice(0, 5).map((review: any, index: number) => (
                                        <div key={index} className="p-2 bg-gray-50 rounded-lg">
                                            <p className="text-xs font-medium text-gray-800 line-clamp-2">
                                                {review.questions?.question_text || 'Question'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(review.next_review_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 text-center py-3">
                                    No upcoming reviews. Start a quiz to add questions!
                                </p>
                            )}
                        </div>

                        {/* Motivation */}
                        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md p-4 text-white">
                            <h2 className="text-base font-bold mb-1">💪 Keep Going!</h2>
                            <p className="text-xs opacity-90">
                                {stats.streak > 0
                                    ? `Amazing ${stats.streak} day streak! Don't break it!`
                                    : 'Start your learning streak today!'}
                            </p>
                        </div>

                        {/* Offline Download — shown only when teacher has enabled it */}
                        {user.offlineAccessEnabled && (
                            <OfflineDownloadButton />
                        )}
                    </div>
                </div>
            </div>

            {/* Quiz Selector Modal */}
            <QuizSelectorModal
                isOpen={showQuizSelector}
                onClose={() => setShowQuizSelector(false)}
                userClass={user.class || 9}
            />
        </div>
    )
}
