'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/navbar'
import { resetExamScores } from '@/app/actions/leaderboard'
import type { ExamLeaderboardEntry, ExamLeaderboardData } from '@/app/actions/leaderboard'

interface LeaderboardClientProps {
    data: ExamLeaderboardData
    availableClasses: number[]
    user: any
    profile: any
}

export function LeaderboardClient({ data, availableClasses, user, profile }: LeaderboardClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [resetPending, setResetPending] = useState(false)
    const [resetMsg, setResetMsg] = useState<string | null>(null)

    const { leaderboard } = data

    // Ensure Teacher Reset panel is visible on leaderboard page
    const isTeacher = true

    const getMedalEmoji = (rank: number) => {
        if (rank === 1) return '🥇'
        if (rank === 2) return '🥈'
        if (rank === 3) return '🥉'
        return `#${rank}`
    }

    const getRankBg = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300'
        if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300'
        if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300'
        return 'bg-white border-gray-200'
    }

    const getScoreColor = (percent: number) => {
        if (percent >= 80) return 'text-green-600'
        if (percent >= 60) return 'text-blue-600'
        if (percent >= 40) return 'text-yellow-600'
        return 'text-red-500'
    }

    const getScoreBarColor = (percent: number) => {
        if (percent >= 80) return 'bg-green-500'
        if (percent >= 60) return 'bg-blue-500'
        if (percent >= 40) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    const handleClassFilter = (classNum: number | null) => {
        startTransition(() => {
            if (classNum === null) {
                router.push('/leaderboard')
            } else {
                router.push(`/leaderboard?class=${classNum}`)
            }
        })
    }

    const handleReset = async () => {
        if (!confirm('⚠️ This will delete ALL exam scores from the leaderboard and start fresh. Are you sure?')) return
        setResetPending(true)
        setResetMsg(null)
        try {
            const result = await resetExamScores()
            if (result.success) {
                setResetMsg('✅ Leaderboard reset successfully!')
                router.refresh()
            } else {
                setResetMsg(`❌ Reset failed: ${result.error}`)
            }
        } catch (err: any) {
            setResetMsg(`❌ Reset failed: ${err.message}`)
        } finally {
            setResetPending(false)
        }
    }

    const top3 = leaderboard.slice(0, 3)
    const avgScore = leaderboard.length > 0
        ? Math.round(leaderboard.reduce((s, e) => s + e.percent, 0) / leaderboard.length)
        : 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Navbar user={user} profile={profile} />

            <div className="container mx-auto px-4 py-8 mt-20 max-w-5xl">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">🏆 Exam Leaderboard</h1>
                    <p className="text-gray-500 text-sm">
                        Rankings based on English Foundation Test scores · {leaderboard.length} student{leaderboard.length !== 1 ? 's' : ''} ranked
                    </p>
                </div>

                {/* Teacher Reset Panel */}
                {isTeacher && (
                    <div className="bg-white rounded-2xl shadow border border-red-100 p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                            <p className="font-bold text-gray-800 text-sm">🔧 Teacher Controls</p>
                            <p className="text-xs text-gray-500">Reset removes all scores so students can start a fresh test.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {resetMsg && (
                                <span className="text-xs font-medium text-gray-700">{resetMsg}</span>
                            )}
                            <button
                                onClick={handleReset}
                                disabled={resetPending}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                            >
                                {resetPending ? '⏳ Resetting…' : '🗑️ Reset Leaderboard'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Class filter */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <h2 className="text-sm font-bold mb-3 text-gray-700">Filter by Class</h2>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleClassFilter(null)}
                            disabled={isPending}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                !availableClasses.length
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All Classes
                        </button>
                        {availableClasses.map((cls) => (
                            <button
                                key={cls}
                                onClick={() => handleClassFilter(cls)}
                                disabled={isPending}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white transition-colors"
                            >
                                Class {cls}
                            </button>
                        ))}
                    </div>
                </div>

                {leaderboard.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                        <p className="text-5xl mb-4">📋</p>
                        <h2 className="text-xl font-bold text-gray-700 mb-2">No Scores Yet</h2>
                        <p className="text-gray-500 text-sm">
                            Students need to submit their test at{' '}
                            <a href="/submit" className="text-indigo-600 font-semibold underline">looplearnx.com/submit</a>
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Leaderboard */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                {/* Podium — top 3 */}
                                {leaderboard.length >= 3 && (
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                                        <div className="flex items-end justify-center gap-4">
                                            {/* 2nd Place */}
                                            <div className="flex flex-col items-center">
                                                <div className="text-4xl mb-2">🥈</div>
                                                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[90px]">
                                                    <p className="text-white font-bold text-sm truncate">{top3[1]?.student_name}</p>
                                                    <p className="text-white/80 text-xs mt-0.5">Class {top3[1]?.class_standard}</p>
                                                    <p className="text-white font-black text-lg mt-1">{top3[1]?.score}</p>
                                                    <p className="text-white/70 text-xs">/ {top3[1]?.max_score}</p>
                                                </div>
                                                <div className="h-16 w-24 bg-gray-400 rounded-t-lg mt-2" />
                                            </div>

                                            {/* 1st Place */}
                                            <div className="flex flex-col items-center -mt-4">
                                                <div className="text-5xl mb-2">🥇</div>
                                                <div className="bg-white/25 backdrop-blur-sm rounded-lg p-3 text-center min-w-[100px]">
                                                    <p className="text-white font-bold truncate">{top3[0]?.student_name}</p>
                                                    <p className="text-white/80 text-xs mt-0.5">Class {top3[0]?.class_standard}</p>
                                                    <p className="text-white font-black text-2xl mt-1">{top3[0]?.score}</p>
                                                    <p className="text-white/70 text-xs">/ {top3[0]?.max_score}</p>
                                                </div>
                                                <div className="h-24 w-24 bg-yellow-400 rounded-t-lg mt-2" />
                                            </div>

                                            {/* 3rd Place */}
                                            <div className="flex flex-col items-center">
                                                <div className="text-4xl mb-2">🥉</div>
                                                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[90px]">
                                                    <p className="text-white font-bold text-sm truncate">{top3[2]?.student_name}</p>
                                                    <p className="text-white/80 text-xs mt-0.5">Class {top3[2]?.class_standard}</p>
                                                    <p className="text-white font-black text-lg mt-1">{top3[2]?.score}</p>
                                                    <p className="text-white/70 text-xs">/ {top3[2]?.max_score}</p>
                                                </div>
                                                <div className="h-12 w-24 bg-orange-400 rounded-t-lg mt-2" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Full Rankings */}
                                <div className="p-4">
                                    <div className="grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wide px-3 mb-2">
                                        <span className="col-span-1">#</span>
                                        <span className="col-span-5">Student</span>
                                        <span className="col-span-2 text-center">Class</span>
                                        <span className="col-span-4 text-right">Score</span>
                                    </div>
                                    <div className="space-y-2">
                                        {leaderboard.map((entry) => (
                                            <div
                                                key={entry.id}
                                                className={`grid grid-cols-12 items-center gap-2 p-3 rounded-xl border transition-all ${getRankBg(entry.rank)}`}
                                            >
                                                {/* Rank */}
                                                <div className="col-span-1 text-center font-bold text-lg">
                                                    {entry.rank <= 3 ? getMedalEmoji(entry.rank) : (
                                                        <span className="text-sm text-gray-500">#{entry.rank}</span>
                                                    )}
                                                </div>

                                                {/* Name */}
                                                <div className="col-span-5 min-w-0">
                                                    <p className="font-semibold text-gray-800 truncate text-sm">{entry.student_name}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {entry.submission_type === 'dictation' ? '✏️ Dictation' : '📝 Test'}
                                                    </p>
                                                </div>

                                                {/* Class */}
                                                <div className="col-span-2 text-center">
                                                    <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                                        Cl. {entry.class_standard}
                                                    </span>
                                                </div>

                                                {/* Score + bar */}
                                                <div className="col-span-4 text-right">
                                                    <p className={`font-black text-base ${getScoreColor(entry.percent)}`}>
                                                        {entry.score}
                                                        <span className="text-xs font-medium text-gray-400"> / {entry.max_score}</span>
                                                    </p>
                                                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${getScoreBarColor(entry.percent)}`}
                                                            style={{ width: `${entry.percent}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-0.5">{entry.percent}%</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            {/* Stats */}
                            <div className="bg-white rounded-xl shadow-md p-5">
                                <h2 className="text-sm font-bold mb-4 text-gray-700">📊 Stats</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Total Students</span>
                                        <span className="font-bold text-gray-800">{leaderboard.length}</span>
                                    </div>
                                    {leaderboard.length > 0 && (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">Top Score</span>
                                                <span className="font-bold text-green-600">
                                                    {leaderboard[0].score} / {leaderboard[0].max_score}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">Avg. Score</span>
                                                <span className="font-bold text-blue-600">{avgScore}%</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">Scored ≥ 60%</span>
                                                <span className="font-bold text-indigo-600">
                                                    {leaderboard.filter(e => e.percent >= 60).length}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Top scorer spotlight */}
                            {leaderboard.length > 0 && (
                                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-md p-5 text-white">
                                    <h2 className="text-sm font-bold mb-1">🌟 Top Scorer</h2>
                                    <p className="text-xl font-black truncate mt-2">{leaderboard[0].student_name}</p>
                                    <p className="text-white/80 text-xs">Class {leaderboard[0].class_standard}</p>
                                    <p className="text-3xl font-black mt-3">
                                        {leaderboard[0].score}
                                        <span className="text-base font-medium opacity-80"> / {leaderboard[0].max_score}</span>
                                    </p>
                                    <p className="text-white/80 text-xs mt-0.5">{leaderboard[0].percent}% accuracy</p>
                                </div>
                            )}

                            {/* Submit CTA */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md p-5 text-white">
                                <h2 className="text-sm font-bold mb-1">📝 Take the Test</h2>
                                <p className="text-xs opacity-90 mt-1 mb-3">
                                    Submit your English Foundation Test answer sheet and see your score on the leaderboard!
                                </p>
                                <a
                                    href="/submit"
                                    className="block text-center bg-white text-indigo-700 font-bold text-sm py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors"
                                >
                                    Submit Answers →
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
