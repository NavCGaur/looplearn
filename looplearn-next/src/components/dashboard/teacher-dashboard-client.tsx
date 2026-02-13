'use client'

import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { TeacherStats } from '@/app/actions/teacher-dashboard'
import { LoopLearnXIcon } from '@/components/ui/brand-icons'
import { TeacherNavbar } from '@/components/dashboard/teacher-navbar'
import { Home } from 'lucide-react'
import {
    Users,
    BookOpen,
    Zap,
    TrendingUp,
    PlusCircle,
    Layout
} from 'lucide-react'

interface TeacherDashboardProps {
    data: {
        user: {
            id: string
            email: string | undefined
            name: string
            role: string
        }
        stats: TeacherStats
    }
}

export function TeacherDashboardClient({ data }: TeacherDashboardProps) {
    const { user, stats } = data

    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <TeacherNavbar user={user} />

            <main className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Welcome back, {user.name} 👋
                    </h2>
                    <p className="text-gray-600">
                        Here's what's happening with your students today.
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Total Questions</h3>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</div>
                            <div className="text-sm text-green-600 flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                +{stats.recentActivity.length} this week
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Active Content</h3>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Zap className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-2xl font-bold text-gray-900">{stats.publishedQuestions}</div>
                            <div className="text-sm text-gray-500">
                                {stats.draftQuestions} drafts pending
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 opacity-60">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Active Students</h3>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-2xl font-bold text-gray-900">--</div>
                            <div className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-500">Coming Soon</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 opacity-60">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Class Performance</h3>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-orange-600" />
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-2xl font-bold text-gray-900">--</div>
                            <div className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-500">Coming Soon</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Quick Actions */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link
                                    href="/teacher/generator"
                                    className="group p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-md hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Zap className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="font-bold">AI Generator</h3>
                                    </div>
                                    <p className="text-indigo-100 text-sm">
                                        Create high-quality questions instantly using AI assistance.
                                    </p>
                                </Link>

                                <Link
                                    href="/teacher/questions"
                                    className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Layout className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-800">Question Bank</h3>
                                    </div>
                                    <p className="text-gray-500 text-sm">
                                        Manage your existing questions, edit content, and organize topics.
                                    </p>
                                </Link>

                                <Link
                                    href="/teacher/analytics"
                                    className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <TrendingUp className="w-6 h-6 text-green-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-800">Analytics</h3>
                                    </div>
                                    <p className="text-gray-500 text-sm">
                                        View student performance insights and question effectiveness.
                                    </p>
                                </Link>

                                <Link
                                    href="/dashboard/teacher/students"
                                    className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Users className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-800">Students</h3>
                                    </div>
                                    <p className="text-gray-500 text-sm">
                                        View student list and individual performance analytics.
                                    </p>
                                </Link>
                            </div>
                        </section>

                        {/* Recent Activity */}
                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">Recent Questions</h2>
                                <Link href="/teacher/questions" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                    View All
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {stats.recentActivity.length > 0 ? (
                                    stats.recentActivity.map((activity) => (
                                        <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-gray-900 font-medium line-clamp-1">
                                                        {activity.question_text}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                                                            {activity.subject}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(activity.created_at).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 text-xs rounded-full ${activity.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {activity.is_active ? 'Active' : 'Draft'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        No questions created yet. Try the AI Generator!
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Analytics */}
                    <div className="space-y-6">
                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Subject Distribution</h2>
                            <div className="space-y-3">
                                {Object.entries(stats.questionsBySubject).length > 0 ? (
                                    Object.entries(stats.questionsBySubject)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([subject, count]) => (
                                            <div key={subject}>
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span className="capitalize text-gray-700">{subject}</span>
                                                    <span className="font-medium text-gray-900">{count}</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full"
                                                        style={{ width: `${(count / stats.totalQuestions) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-sm text-gray-500">No data available yet.</p>
                                )}
                            </div>
                        </section>

                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Difficulty Breakdown</h2>
                            <div className="flex items-center justify-center gap-4">
                                {['easy', 'medium', 'hard'].map(diff => (
                                    <div key={diff} className="text-center">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-2 ${diff === 'easy' ? 'bg-green-100 text-green-700' :
                                            diff === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {stats.questionsByDifficulty[diff] || 0}
                                        </div>
                                        <span className="text-xs text-gray-500 capitalize">{diff}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
