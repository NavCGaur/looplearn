'use client'

import { useState, useTransition } from 'react'
import { CohortAnalytics } from '@/app/actions/planner_actions'
import { ACTIVE_PILOT_SCHEDULE, PhaseDayMapping } from '@/config/planner-config'
import { publishActiveWeek, approveWeek, saveWeekDraft } from '@/app/actions/planner_actions'
import { 
    BookOpen, CheckCircle, AlertTriangle, Play, HelpCircle, 
    Sparkles, RefreshCw, FileText, Check, ChevronRight, 
    ArrowRight, MessageSquare, ClipboardList, PenTool 
} from 'lucide-react'

interface FoundationPlannerProps {
    cohort: any
    activeWeek: any
    phases: any[]
    analytics: CohortAnalytics
}

export function FoundationPlanner({ cohort, activeWeek, phases, analytics }: FoundationPlannerProps) {
    const [selectedPhaseNum, setSelectedPhaseNum] = useState<number>(1)
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState<string>(activeWeek?.status || 'draft')
    const [themeText, setThemeText] = useState<string>(activeWeek?.theme || '')
    const [editing, setEditing] = useState<boolean>(false)
    const [showWhy, setShowWhy] = useState<boolean>(false)

    const selectedPhase = phases.find(p => p.phase_number === selectedPhaseNum)
    const selectedSchedule = ACTIVE_PILOT_SCHEDULE.find(s => s.phaseNumber === selectedPhaseNum)

    const handleApprove = () => {
        startTransition(async () => {
            const res = await approveWeek(activeWeek.id)
            if (res.success) setStatus('approved')
        })
    }

    const handlePublish = () => {
        startTransition(async () => {
            const res = await publishActiveWeek(cohort.id, activeWeek.id)
            if (res.success) setStatus('published')
        })
    }

    return (
        <div className="space-y-6">
            {/* 1. Header cockpit info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            English Foundation
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                            status === 'published' ? 'bg-green-50 text-green-700' :
                            status === 'approved' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                            ● {status.toUpperCase()}
                        </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold font-fredoka text-gray-800">
                        Week {activeWeek?.week_number || 1}: {themeText}
                    </h2>
                    <p className="text-sm text-gray-400">
                        Cohort: <span className="font-semibold text-gray-600">{cohort.name}</span> (Class {cohort.class_standard}) | {analytics.total_students} Students
                    </p>
                </div>

                {/* Workflow actions */}
                <div className="flex items-center gap-3">
                    {status === 'draft' && (
                        <button
                            onClick={handleApprove}
                            disabled={isPending}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-2"
                        >
                            {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Approve Lesson Plan
                        </button>
                    )}
                    {status === 'approved' && (
                        <button
                            onClick={handlePublish}
                            disabled={isPending}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-5 py-2.5 rounded-2xl shadow-sm transition-all flex items-center gap-2"
                        >
                            {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            Publish & Deploy to Cohort
                        </button>
                    )}
                    {status === 'published' && (
                        <span className="bg-green-50 text-green-700 font-semibold text-sm px-5 py-2.5 rounded-2xl flex items-center gap-2 border border-green-200">
                            ✓ Published to WhatsApp & Mobile Apps
                        </span>
                    )}
                </div>
            </div>

            {/* 2. Main content area: Tab + Main info + Right analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 2A. Day Tabs (Tuesday to Monday) */}
                <div className="lg:col-span-3 space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Instructional Cycle</p>
                    <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
                        {ACTIVE_PILOT_SCHEDULE.map(schedule => {
                            const isActive = selectedPhaseNum === schedule.phaseNumber
                            return (
                                <button
                                    key={schedule.phaseNumber}
                                    onClick={() => setSelectedPhaseNum(schedule.phaseNumber)}
                                    className={`w-full text-left px-4 py-3 rounded-2xl border transition-all flex items-center justify-between gap-3 min-w-[150px] ${
                                        isActive 
                                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold shadow-sm' 
                                            : 'border-gray-100 bg-white hover:bg-gray-50 text-gray-500'
                                    }`}
                                >
                                    <div className="space-y-0.5">
                                        <p className="text-xs text-gray-400 font-normal">Phase {schedule.phaseNumber}: {schedule.phaseName}</p>
                                        <p className="text-sm font-semibold">{schedule.label}</p>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-1 text-indigo-600' : 'text-gray-300'}`} />
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* 2B. Daily Plan Card */}
                <div className="lg:col-span-6 space-y-6">
                    {selectedPhase && selectedSchedule ? (
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                            
                            {/* Goals / timelines */}
                            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                <div className="space-y-1">
                                    <h3 className="font-fredoka font-bold text-lg text-gray-800">
                                        {selectedSchedule.label} — {selectedPhase.phase_name}
                                    </h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                        <ClipboardList className="w-4 h-4 text-indigo-500" />
                                        {selectedPhase.instructional_content.goal}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-lg">
                                        {selectedPhase.instructional_content.timeline}
                                    </span>
                                </div>
                            </div>

                            {/* Hinglish script prompter card */}
                            {selectedPhase.instructional_content.teacher_script && (
                                <div className="bg-indigo-50/30 rounded-2xl p-5 border border-indigo-50/50 space-y-3">
                                    <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
                                        <MessageSquare className="w-4 h-4" />
                                        Teacher script (Hinglish/Hindi explanation)
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed italic">
                                        "{selectedPhase.instructional_content.teacher_script}"
                                    </p>
                                </div>
                            )}

                            {/* Board Illustration / Tasks */}
                            {selectedPhase.instructional_content.board_work && (
                                <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-2">
                                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                        <span>Blackboard Work</span>
                                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-indigo-400 border border-slate-700">Visual</span>
                                    </div>
                                    <pre className="font-mono text-xs text-green-400 bg-slate-950 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                        {selectedPhase.instructional_content.board_work}
                                    </pre>
                                </div>
                            )}

                            {/* Oral Practice questions */}
                            {selectedPhase.instructional_content.oral_practice && (
                                <div className="border-t border-gray-50 pt-4 space-y-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Oral Interaction Prompts</h4>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start gap-2">
                                        <PenTool className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                                        {selectedPhase.instructional_content.oral_practice}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-100">
                            No phase contents loaded.
                        </div>
                    )}
                </div>

                {/* 2C. Sidebar Analytics & Student progress */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* AI Recommendations */}
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-5 text-white space-y-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                                <Sparkles className="w-4 h-4 text-yellow-400" />
                                AI Insight & Recommendation
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                analytics.ai_recommendation.confidence === 'High' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                analytics.ai_recommendation.confidence === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                                {analytics.ai_recommendation.confidence} Confidence
                            </span>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-bold leading-snug">{analytics.ai_recommendation.text}</p>
                            <p className="text-xs text-slate-300 leading-relaxed">{analytics.ai_recommendation.why}</p>
                        </div>

                        <button 
                            onClick={() => setShowWhy(!showWhy)}
                            className="text-[10px] text-indigo-300 hover:text-white font-semibold flex items-center gap-1 transition-colors"
                        >
                            <HelpCircle className="w-3 h-3" /> {showWhy ? 'Hide evidence' : 'Why this recommendation?'}
                        </button>

                        {showWhy && (
                            <div className="bg-slate-950/60 rounded-xl p-3 text-[11px] text-slate-300 border border-slate-800 space-y-1">
                                <span className="font-bold text-white">Supporting Evidence:</span>
                                {analytics.common_mistakes.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-0.5">
                                        {analytics.common_mistakes.map((m, idx) => (
                                            <li key={idx}>
                                                {m.count} student(s) wrote: <span className="text-red-400 italic">"{m.mistake}"</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>Low sample size or no baseline error patterns detected in submissions yet.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Common Cohort Mistakes Card */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Frequent Mistakes
                        </h4>
                        
                        {analytics.common_mistakes.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.common_mistakes.slice(0, 3).map((m, idx) => (
                                    <div key={idx} className="text-xs space-y-1 p-2 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex justify-between text-gray-500">
                                            <span className="font-semibold">Mistake:</span>
                                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded-full font-bold">
                                                {m.count} Students
                                            </span>
                                        </div>
                                        <p className="text-red-500 font-mono">❌ {m.mistake}</p>
                                        <p className="text-green-600 font-mono">✅ {m.correction}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic">No repetitive mistakes flagged this week.</p>
                        )}
                    </div>

                    {/* Student Progress Cards */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Student Progress Status</p>
                        <div className="space-y-2">
                            {analytics.students.map(student => (
                                <div key={student.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold text-gray-800">{student.display_name}</p>
                                        <p className="text-[11px] text-gray-400 truncate max-w-[150px]" title={student.active_error_details}>
                                            {student.active_error_details}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            student.status === 'Ready' ? 'bg-green-50 text-green-700' :
                                            student.status === 'Needs Practice' ? 'bg-amber-50 text-amber-700' :
                                            'bg-red-50 text-red-700'
                                        }`}>
                                            {student.status}
                                        </span>
                                        <span className="text-[9px] text-gray-400">Sub: {student.last_submitted}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
