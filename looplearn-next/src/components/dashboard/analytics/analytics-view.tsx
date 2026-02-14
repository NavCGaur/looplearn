'use client'

import { StudentAnalytics } from '@/app/actions/analytics-engine'
import { SubjectCard } from './subject-card'
import { TrendingUp, Award, BrainCircuit } from 'lucide-react'

interface AnalyticsViewProps {
    data: StudentAnalytics
}

export function AnalyticsView({ data }: AnalyticsViewProps) {
    const subjects = Object.values(data.subjects)

    // Calculate overall stats
    const totalQuestions = subjects.reduce((acc, sub) => acc + sub.attempted, 0)
    const totalMastered = subjects.reduce((acc, sub) => acc + sub.mastered, 0)
    const overallMastery = totalQuestions > 0 ? Math.round((totalMastered / totalQuestions) * 100) : 0

    // Find strongest subject
    const strongestSubject = subjects.reduce((prev, current) => {
        return (prev.avgQuality > current.avgQuality) ? prev : current
    }, subjects[0])

    return (
        <div className="space-y-8">
            {/* Header / Summary Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold font-fredoka text-gray-800">
                            Analytics for <span className="text-blue-600">{data.studentName}</span>
                        </h2>
                        <p className="text-gray-500">Class {data.className} • Comprehensive Performance Report</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Overall Mastery</p>
                                <p className="text-xl font-bold text-gray-800">{overallMastery}%</p>
                            </div>
                        </div>

                        {strongestSubject && (
                            <div className="bg-green-50 px-4 py-3 rounded-xl border border-green-100 flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <Award className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Strongest Subject</p>
                                    <p className="text-xl font-bold text-gray-800">{strongestSubject.name}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold font-fredoka text-gray-800 flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-indigo-500" />
                    Subject Breakdown
                </h3>

                {subjects.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        <p className="text-gray-400 font-medium">No analytics data available yet.</p>
                        <p className="text-sm text-gray-400 mt-1">Start practicing questions to see your improvements!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {subjects.map(subject => (
                            <SubjectCard key={subject.name} subject={subject} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
