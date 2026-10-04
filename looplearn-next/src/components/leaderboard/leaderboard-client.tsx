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

    // Always keep Teacher Controls visible
    const isTeacher = true

    const getMedalEmoji = (rank: number) => {
        if (rank === 1) return '🥇'
        if (rank === 2) return '🥈'
        if (rank === 3) return '🥉'
        return `#${rank}`
    }

    const getRankBg = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-sm'
        if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300'
        if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300'
        return 'bg-white border-gray-200 hover:bg-gray-50/80'
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
    const totalPointsSum = leaderboard.reduce((sum, e) => sum + e.score, 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Navbar user={user} profile={profile} />

            <div className="container mx-auto px-4 py-8 mt-20 max-w-5xl">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">🏆 Student Leaderboard</h1>
                    <p className="text-gray-500 text-sm font-medium">
                        Live score tracking · {leaderboard.length} student{leaderboard.length !== 1 ? 's' : ''} ranked
                    </p>
                </div>

                {/* Teacher Reset Panel */}
                {isTeacher && (
                    <div className="bg-white rounded-2xl shadow border border-red-100 p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                            <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                                <span>🔧 Teacher Controls</span>
                            </p>
                            <p className="text-xs text-gray-500">Reset removes all scores so students can start a fresh test.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {resetMsg && (
                                <span className="text-xs font-semibold text-gray-700">{resetMsg}</span>
                            )}
                            <button
                                onClick={handleReset}
                                disabled={resetPending}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                            >
                                {resetPending ? '⏳ Resetting…' : '🗑️ Reset Leaderboard'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Class filter */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-wider mb-3 text-gray-500">Filter by Class</h2>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleClassFilter(null)}
                            disabled={isPending}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                !availableClasses.length
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                            }`}
                        >
                            All Classes
                        </button>
                        {availableClasses.map((cls) => (
                            <button
                                key={cls}
                                onClick={() => handleClassFilter(cls)}
                                disabled={isPending}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-indigo-600 hover:text-white transition-all"
                            >
                                Class {cls}
                            </button>
                        ))}
                    </div>
                </div>

                {leaderboard.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
                        <p className="text-5xl mb-4">📋</p>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">No Scores Yet</h2>
                        <p className="text-gray-500 text-sm">
                            Students need to submit their test at{' '}
                            <a href="/submit" className="text-indigo-600 font-bold underline">looplearnx.com/submit</a>
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Leaderboard */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Podium — top 3 */}
                                {leaderboard.length >= 3 && (
                                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6">
                                        <div className="flex items-end justify-center gap-4">
                                            {/* 2nd Place */}
                                            <div className="flex flex-col items-center">
                                                <div className="text-4xl mb-2">🥈</div>
                                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center min-w-[95px] border border-white/20">
                                                    <p className="text-white font-bold text-sm truncate">{top3[1]?.student_name}</p>
                                                    <p className="text-white/80 text-xs mt-0.5 font-semibold">Class {top3[1]?.class_standard}</p>
                                                    <p className="text-white font-black text-2xl mt-1">{top3[1]?.score}</p>
                                                </div>
                                                <div className="h-16 w-24 bg-gray-400/80 rounded-t-xl mt-2" />
                                            </div>

                                            {/* 1st Place */}
                                            <div className="flex flex-col items-center -mt-4">
                                                <div className="text-5xl mb-2">🥇</div>
                                                <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3.5 text-center min-w-[110px] border border-white/30 shadow-lg">
                                                    <p className="text-white font-bold truncate text-base">{top3[0]?.student_name}</p>
                                                    <p className="text-white/90 text-xs mt-0.5 font-semibold">Class {top3[0]?.class_standard}</p>
                                                    <p className="text-white font-black text-3xl mt-1">{top3[0]?.score}</p>
                                                </div>
                                                <div className="h-24 w-24 bg-yellow-400 rounded-t-xl mt-2 shadow-md" />
                                            </div>

                                            {/* 3rd Place */}
                                            <div className="flex flex-col items-center">
                                                <div className="text-4xl mb-2">🥉</div>
                                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center min-w-[95px] border border-white/20">
                                                    <p className="text-white font-bold text-sm truncate">{top3[2]?.student_name}</p>
                                                    <p className="text-white/80 text-xs mt-0.5 font-semibold">Class {top3[2]?.class_standard}</p>
                                                    <p className="text-white font-black text-2xl mt-1">{top3[2]?.score}</p>
                                                </div>
                                                <div className="h-12 w-24 bg-amber-600/80 rounded-t-xl mt-2" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Full Rankings */}
                                <div className="p-4">
                                    <div className="grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wide px-3 mb-3">
                                        <span className="col-span-2">Rank</span>
                                        <span className="col-span-5">Student Name</span>
                                        <span className="col-span-3 text-center">Class</span>
                                        <span className="col-span-2 text-right">Score</span>
                                    </div>
                                    <div className="space-y-2">
                                        {leaderboard.map((entry) => (
                                            <div
                                                key={entry.id}
                                                className={`grid grid-cols-12 items-center gap-2 p-3.5 rounded-xl border transition-all ${getRankBg(entry.rank)}`}
                                            >
                                                {/* Rank */}
                                                <div className="col-span-2 flex items-center gap-1.5">
                                                    <span className="font-black text-base min-w-[24px]">
                                                        {entry.rank <= 3 ? getMedalEmoji(entry.rank) : (
                                                            <span className="text-sm text-gray-400 font-bold">#{entry.rank}</span>
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Name */}
                                                <div className="col-span-5 min-w-0">
                                                    <p className="font-bold text-gray-900 truncate text-base">{entry.student_name}</p>
                                                </div>

                                                {/* Class */}
                                                <div className="col-span-3 text-center">
                                                    <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full shadow-2xs">
                                                        Class {entry.class_standard}
                                                    </span>
                                                </div>

                                                {/* Score (Raw Number Only) */}
                                                <div className="col-span-2 text-right">
                                                    <span className="text-xl font-black text-indigo-600 font-mono">
                                                        {entry.score}
                                                    </span>
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
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <h2 className="text-xs font-bold uppercase tracking-wider mb-4 text-gray-500">📊 Overview</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                        <span className="text-sm text-gray-500 font-medium">Total Students</span>
                                        <span className="font-bold text-gray-900">{leaderboard.length}</span>
                                    </div>
                                    {leaderboard.length > 0 && (
                                        <>
                                            <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                                <span className="text-sm text-gray-500 font-medium">Top Score</span>
                                                <span className="font-black text-green-600 text-base">{leaderboard[0].score}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-sm text-gray-500 font-medium">Total Points Awarded</span>
                                                <span className="font-bold text-indigo-600">{totalPointsSum}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Top scorer spotlight */}
                            {leaderboard.length > 0 && (
                                <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-2xl shadow-sm p-5 text-white">
                                    <h2 className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">🌟 Current Leader</h2>
                                    <p className="text-2xl font-black truncate mt-1">{leaderboard[0].student_name}</p>
                                    <p className="text-white/90 text-xs font-semibold mt-0.5">Class {leaderboard[0].class_standard}</p>
                                    <p className="text-4xl font-black mt-3">
                                        {leaderboard[0].score} <span className="text-sm font-bold opacity-90">marks</span>
                                    </p>
                                </div>
                            )}

                            {/* Submit CTA */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-sm p-5 text-white">
                                <h2 className="text-sm font-bold mb-1">📝 Submit Answers</h2>
                                <p className="text-xs opacity-90 mt-1 mb-3">
                                    Submit your test paper to earn points and climb the class rankings!
                                </p>
                                <a
                                    href="/submit"
                                    className="block text-center bg-white text-indigo-700 font-bold text-sm py-2.5 px-4 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
                                >
                                    Submit Sheet →
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
