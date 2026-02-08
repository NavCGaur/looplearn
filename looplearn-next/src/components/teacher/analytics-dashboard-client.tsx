'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnalyticsDashboard, AnalyticsFilters } from '@/app/actions/analytics'
import { BarChart3, TrendingDown, Users, AlertTriangle, BookOpen } from 'lucide-react'

interface Props {
    initialData: AnalyticsDashboard
    teacherName: string
}

export function AnalyticsDashboardClient({ initialData, teacherName }: Props) {
    const [data, setData] = useState(initialData)
    const [filters, setFilters] = useState<AnalyticsFilters>({
        timeRange: '30',
        subject: '',
        difficulty: ''
    })

    const { overview, subjectBreakdown, topStrugglingQuestions } = data

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-800">
                                    Performance Analytics
                                </h1>
                                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                                    BETA
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Insights into student performance and question effectiveness
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                ← Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Time Range</label>
                            <select
                                value={filters.timeRange}
                                onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                                <option value="all">All time</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                            <select
                                value={filters.subject}
                                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Subjects</option>
                                <option value="mathematics">Mathematics</option>
                                <option value="physics">Physics</option>
                                <option value="chemistry">Chemistry</option>
                                <option value="biology">Biology</option>
                                <option value="science">Science</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Difficulty</label>
                            <select
                                value={filters.difficulty}
                                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Levels</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Active Students</h3>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{overview.activeStudents}</div>
                        <p className="text-xs text-gray-500 mt-1">Students with activity</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Avg Performance</h3>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <BarChart3 className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{overview.avgPerformance.toFixed(2)}</div>
                        <p className="text-xs text-gray-500 mt-1">Out of 3.0 quality score</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Struggling Questions</h3>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <TrendingDown className="w-5 h-5 text-orange-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{overview.strugglingQuestions}</div>
                        <p className="text-xs text-gray-500 mt-1">Struggle rate &gt; 50%</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">At-Risk Students</h3>
                            <div className="p-2 bg-red-50 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{overview.atRiskStudents}</div>
                        <p className="text-xs text-gray-500 mt-1">Avg quality &lt; 1.5</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Subject Performance */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Subject Performance</h2>
                            <div className="space-y-4">
                                {subjectBreakdown.length > 0 ? (
                                    subjectBreakdown.map((subject) => (
                                        <div key={subject.subject}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700 capitalize">
                                                    {subject.subject}
                                                </span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {subject.avgQuality.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                                                    style={{ width: `${(subject.avgQuality / 3) * 100}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {subject.totalQuestions} questions
                                                </span>
                                                <span className="text-xs text-green-600">
                                                    {subject.mastered} mastered
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No data available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top Struggling Questions */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">Top Struggling Questions</h2>
                                <Link
                                    href="/teacher/analytics/questions"
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    View All →
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {topStrugglingQuestions.length > 0 ? (
                                    topStrugglingQuestions.map((q) => (
                                        <div key={q.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                                                        {q.question_text}
                                                    </p>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                                                            {q.subject}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded capitalize ${q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                            q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                            {q.difficulty}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {q.total_attempts} attempts
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-lg font-bold text-red-600">
                                                        {q.avg_quality.toFixed(1)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">avg quality</div>
                                                    <div className="text-xs text-orange-600 mt-1">
                                                        {q.struggle_rate.toFixed(0)}% struggle
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>No performance data available yet.</p>
                                        <p className="text-sm mt-1">Students need to attempt your questions first.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
