'use client'

import { useState } from 'react'
import { HomeworkPlan, HomeworkSubmissionStatus } from '@/app/actions/homework'
import { CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp, Phone } from 'lucide-react'
import { StudentPhoneModal } from './student-phone-modal'

interface Props {
    plan: HomeworkPlan
    submissions: HomeworkSubmissionStatus[]
}

const STATUS_CONFIG = {
    submitted: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Submitted' },
    pending:   { icon: Clock,        color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pending' },
    missing:   { icon: XCircle,      color: 'text-red-400',   bg: 'bg-red-50',   label: 'Missing' },
}

export function DailyTrackerTable({ plan, submissions }: Props) {
    const [expanded, setExpanded] = useState<string | null>(null)
    const [phoneModal, setPhoneModal] = useState<HomeworkSubmissionStatus | null>(null)

    const submitted = submissions.filter(s => s.status === 'submitted').length
    const total = submissions.length
    const pct = total > 0 ? Math.round((submitted / total) * 100) : 0

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                    <h3 className="font-bold text-gray-900 font-fredoka text-lg">
                        Class {plan.class_standard} — {plan.subject}
                        <span className="ml-2 text-sm font-normal text-gray-400">HW #{plan.hw_number}</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{plan.task_description}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                    <p className="text-2xl font-bold text-indigo-600">{submitted}/{total}</p>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 ml-auto">
                        <div
                            className="h-full rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Student rows */}
            <div className="divide-y divide-gray-50">
                {submissions.map(sub => {
                    const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.pending
                    const Icon = cfg.icon
                    const isOpen = expanded === sub.student_id

                    return (
                        <div key={sub.student_id}>
                            <div
                                className="flex items-center px-5 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer"
                                onClick={() => sub.ai_feedback
                                    ? setExpanded(isOpen ? null : sub.student_id)
                                    : undefined
                                }
                            >
                                {/* Status icon */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cfg.bg} shrink-0`}>
                                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                                </div>

                                {/* Name */}
                                <div className="ml-3 flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 text-sm truncate">
                                        {sub.display_name}
                                    </p>
                                    <p className={`text-xs ${cfg.color}`}>{cfg.label}
                                        {sub.submitted_at && ` · ${new Date(sub.submitted_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
                                    </p>
                                </div>

                                {/* Marks */}
                                {sub.marks_obtained != null && sub.max_marks != null && (
                                    <div className="mx-4 text-center shrink-0">
                                        <p className="text-sm font-bold text-gray-700">
                                            {sub.marks_obtained}/{sub.max_marks}
                                        </p>
                                        <p className="text-xs text-gray-400">marks</p>
                                    </div>
                                )}

                                {/* Phone button */}
                                <button
                                    onClick={e => { e.stopPropagation(); setPhoneModal(sub) }}
                                    title={sub.whatsapp_phone ? sub.whatsapp_phone : 'Add phone'}
                                    className={`mr-2 p-1.5 rounded-lg transition-colors ${
                                        sub.whatsapp_phone
                                            ? 'text-green-600 bg-green-50 hover:bg-green-100'
                                            : 'text-gray-300 bg-gray-50 hover:bg-gray-100'
                                    }`}
                                >
                                    <Phone className="w-3.5 h-3.5" />
                                </button>

                                {/* Expand arrow */}
                                {sub.ai_feedback && (
                                    <div className="text-gray-400 shrink-0">
                                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                )}
                            </div>

                            {/* Expanded AI feedback */}
                            {isOpen && sub.ai_feedback && (
                                <div className="px-5 pb-4 pt-1 bg-indigo-50/50 text-sm text-gray-700 whitespace-pre-line border-t border-indigo-100">
                                    <p className="text-xs font-semibold text-indigo-500 mb-1">AI Feedback</p>
                                    {sub.ai_feedback}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Phone modal */}
            {phoneModal && (
                <StudentPhoneModal
                    student={phoneModal}
                    onClose={() => setPhoneModal(null)}
                />
            )}
        </div>
    )
}
