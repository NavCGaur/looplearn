'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, BookOpen, Star, AlertCircle, BarChart3, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import type { Subject, Chapter } from '@/app/actions/analytics-engine'

interface SubjectCardProps {
    subject: Subject
}

export function SubjectCard({ subject }: SubjectCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    // Find chapters with struggles to auto-expand or highlight
    const chaptersWithStruggles = Object.values(subject.chapters).filter(c => c.struggleCount > 0)

    // Calculate colors based on accuracy (0-1 scale)
    const getPerformanceColor = (quality: number) => {
        if (quality >= 0.8) return 'text-green-600 bg-green-50 border-green-200'
        if (quality >= 0.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        return 'text-red-600 bg-red-50 border-red-200'
    }

    const getProgressColor = (mastery: number) => {
        if (mastery >= 80) return 'bg-green-500'
        if (mastery >= 50) return 'bg-yellow-500'
        return 'bg-blue-500'
    }

    const masteryPercentage = subject.attempted > 0 ? Math.round((subject.mastered / subject.attempted) * 100) : 0

    return (
        <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div
                className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl", getPerformanceColor(subject.accuracy))}>
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-fredoka font-bold text-lg text-gray-800 capitalize">{subject.name}</h3>
                            <p className="text-sm text-gray-500 font-medium">
                                {subject.attempted} Questions Attempted
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:block text-right">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mastery</p>
                            <div className="flex items-center gap-2">
                                <span className={cn("font-bold text-lg", masteryPercentage >= 80 ? 'text-green-600' : 'text-blue-600')}>
                                    {masteryPercentage}%
                                </span>
                            </div>
                        </div>

                        <div className="hidden sm:block text-right">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Accuracy</p>
                            <div className="flex items-center gap-1">
                                <span className={cn("font-bold text-lg", subject.accuracy >= 0.8 ? 'text-green-600' : 'text-yellow-600')}>
                                    {Math.round(subject.accuracy * 100)}%
                                </span>
                            </div>
                        </div>

                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                </div>

                {/* Progress Bar for Subject */}
                <div className="mt-4">
                    <Progress value={masteryPercentage} className="h-2" indicatorClassName={getProgressColor(masteryPercentage)} />
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-slate-50 border-t border-slate-100"
                    >
                        <div className="p-4 space-y-3">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Chapter Breakdown</h4>

                            {Object.values(subject.chapters).length === 0 ? (
                                <p className="text-sm text-gray-400 italic text-center py-4">No chapters practiced yet.</p>
                            ) : (
                                <div className="grid gap-3">
                                    {Object.values(subject.chapters).map((chapter) => {
                                        const chapMastery = chapter.attempted > 0 ? Math.round((chapter.mastered / chapter.attempted) * 100) : 0

                                        return (
                                            <div key={chapter.name} className="bg-white p-3 rounded-lg border border-slate-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("w-2 h-10 rounded-full", getPerformanceColor(chapter.accuracy).split(' ')[1])} />
                                                        <div>
                                                            <p className="font-semibold text-gray-800 text-sm">{chapter.name !== 'General' ? chapter.name : 'General Practice'}</p>
                                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                                <span className="flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" /> {chapter.mastered} Mastered
                                                                </span>
                                                                {chapter.struggleCount > 0 && (
                                                                    <span className="flex items-center gap-1 text-red-500 font-medium">
                                                                        <AlertCircle className="w-3 h-3" /> {chapter.struggleCount} struggles
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right min-w-[80px]">
                                                        <div className="text-sm font-bold text-gray-700">{chapMastery}%</div>
                                                        <Progress value={chapMastery} className="h-1.5 w-20 mt-1" indicatorClassName={getProgressColor(chapMastery)} />
                                                    </div>
                                                </div>

                                                {/* Struggling Questions List */}
                                                {chapter.strugglingQuestions && chapter.strugglingQuestions.length > 0 && (
                                                    <div className="mt-3 bg-red-50/50 rounded-lg p-3 border border-red-100">
                                                        <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            Areas for Review:
                                                        </p>
                                                        <ul className="space-y-1">
                                                            {chapter.strugglingQuestions.map((q) => (
                                                                <li key={q.id} className="text-xs text-red-600/90 pl-2 border-l-2 border-red-200 line-clamp-1">
                                                                    {q.text}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}
