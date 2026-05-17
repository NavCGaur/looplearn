'use client'

import { useState } from 'react'
import { toggleAssignmentActive, getAssignmentSubmissions, getAssignmentPaperUrl, getStudentAnswerImageUrl } from '@/app/actions/assignments'
import { formatDate, formatDateTime } from '@/lib/date-utils'
import { FileText, Users, Clock, Loader2, ChevronDown, ChevronRight, Eye, ImageIcon, Copy, CheckCircle2, Link, BookOpen, ChevronUp } from 'lucide-react'
import { QuickPracticeResult } from '@/components/dashboard/quick-practice-result'

export function AssignmentsListClient({ initialAssignments }: { initialAssignments: any[] }) {
    const [assignments, setAssignments] = useState(initialAssignments)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [submissions, setSubmissions] = useState<Record<string, any[]>>({})
    const [loadingSubs, setLoadingSubs] = useState<string | null>(null)
    const [paperUrl, setPaperUrl] = useState<string | null>(null)
    const [loadingPaper, setLoadingPaper] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setAssignments(prev => prev.map(a => a.id === id ? { ...a, is_active: !currentStatus } : a))
        const res = await toggleAssignmentActive(id, !currentStatus)
        if (!res.success) {
            // Revert on failure
            setAssignments(prev => prev.map(a => a.id === id ? { ...a, is_active: currentStatus } : a))
            alert('Failed to update status: ' + res.error)
        }
    }

    const loadSubmissions = async (assignmentId: string) => {
        if (expandedId === assignmentId) {
            setExpandedId(null)
            return
        }

        setExpandedId(assignmentId)
        if (!submissions[assignmentId]) {
            setLoadingSubs(assignmentId)
            const res = await getAssignmentSubmissions(assignmentId)
            if (res.success) {
                setSubmissions(prev => ({ ...prev, [assignmentId]: res.data }))
            }
            setLoadingSubs(null)
        }
    }

    const viewPaperUrl = async (path: string, id: string) => {
        setLoadingPaper(id)
        const res = await getAssignmentPaperUrl(path)
        if (res.success && res.url) {
            window.open(res.url, '_blank')
        }
        setLoadingPaper(null)
    }

    const copyStudentLink = async (id: string) => {
        const url = `${window.location.origin}/student/assignments/${id}`
        await navigator.clipboard.writeText(url)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    if (assignments.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No assignments yet</h3>
                <p className="text-gray-500 mt-1">Upload a question paper from the dashboard to get started.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {assignments.map(a => (
                <div key={a.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => loadSubmissions(a.id)}
                    >
                        <div className="flex items-start gap-4 flex-1">
                            <div className={`p-3 rounded-xl ${a.is_active ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{a.title}</h3>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
                                    <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium">{a.subject}</span>
                                    <span>Class {a.class_standard}</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {formatDate(a.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-gray-600" title="Submissions">
                                <Users className="w-4 h-4" />
                                <span className="font-bold">{a.submission_count}</span>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer" onClick={e => e.stopPropagation()}>
                                <span className={`text-sm font-medium ${a.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                                    {a.is_active ? 'Active' : 'Closed'}
                                </span>
                                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input
                                        type="checkbox"
                                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
                                        checked={a.is_active}
                                        onChange={() => handleToggleActive(a.id, a.is_active)}
                                        style={{ transform: a.is_active ? 'translateX(100%)' : 'translateX(0)', borderColor: a.is_active ? '#3b82f6' : '#e5e7eb' }}
                                    />
                                    <label className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${a.is_active ? 'bg-blue-500' : 'bg-gray-200'}`}></label>
                                </div>
                            </label>

                            <button
                                onClick={(e) => { e.stopPropagation(); copyStudentLink(a.id) }}
                                className={`p-2 rounded-lg transition-colors ${copiedId === a.id
                                    ? 'text-green-600 bg-green-50'
                                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                                title="Copy student submission link"
                            >
                                {copiedId === a.id ? <CheckCircle2 className="w-5 h-5" /> : <Link className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); viewPaperUrl(a.question_paper_path, a.id) }}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Question Paper"
                                disabled={loadingPaper === a.id}
                            >
                                {loadingPaper === a.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
                            </button>

                            {expandedId === a.id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                        </div>
                    </div>

                    {expandedId === a.id && (
                        <div className="border-t border-gray-100 bg-gray-50/50">

                            {/* ── Extracted Questions panel ────────────────────── */}
                            {(() => {
                                console.log('[DEBUG] assignment questions_json:', a.id, JSON.stringify(a.questions_json))
                                return null
                            })()}
                            <ExtractedQuestionsPanel questions={a.questions_json?.questions ?? []} />

                            {/* ── Student Submissions ──────────────────────────── */}
                            <div className="p-5">
                                <h4 className="font-bold text-gray-700 mb-4">
                                    Student Submissions ({a.submission_count})
                                </h4>

                                {loadingSubs === a.id ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {submissions[a.id]?.length > 0 ? (
                                            submissions[a.id].map(sub => (
                                                <SubmissionCard key={sub.id} sub={sub} />
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-4 text-sm">No submissions yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

// ─── Extracted Questions Panel ────────────────────────────────────────────────
function ExtractedQuestionsPanel({ questions }: { questions: { q_number: number; question_text: string; marks: number }[] }) {
    const [open, setOpen] = useState(false)
    const totalMarks = questions.reduce((s, q) => s + (q.marks || 0), 0)
    const hasQuestions = questions.length > 0

    return (
        <div className="border-b border-gray-100">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-blue-50/60 transition-colors text-left"
            >
                <span className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <BookOpen className="w-4 h-4" />
                    AI-Extracted Questions
                    {hasQuestions ? (
                        <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                            {questions.length} Q · {totalMarks} marks
                        </span>
                    ) : (
                        <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                            Not extracted
                        </span>
                    )}
                </span>
                {open
                    ? <ChevronUp className="w-4 h-4 text-blue-500" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {open && (
                <div className="px-5 pb-4">
                    {!hasQuestions ? (
                        <p className="text-sm text-amber-600 bg-amber-50 rounded-xl border border-amber-100 px-4 py-3">
                            Questions were not extracted for this assignment. Re-upload the question paper to enable this feature.
                        </p>
                    ) : (
                        <div className="rounded-xl border border-blue-100 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-blue-50 text-blue-700">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold w-10">#</th>
                                        <th className="px-3 py-2 text-left font-semibold">Question</th>
                                        <th className="px-3 py-2 text-right font-semibold w-16">Marks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-50 bg-white">
                                    {questions.map((q, i) => (
                                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-3 py-2 text-gray-400 font-medium">{q.q_number}</td>
                                            <td className="px-3 py-2 text-gray-700">{q.question_text}</td>
                                            <td className="px-3 py-2 text-right">
                                                <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium text-xs">
                                                    {q.marks}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 border-t border-blue-100">
                                    <tr>
                                        <td colSpan={2} className="px-3 py-2 text-xs text-gray-400">
                                            Extracted by AI — verify against original paper
                                        </td>
                                        <td className="px-3 py-2 text-right font-bold text-gray-700 text-sm">{totalMarks}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function SubmissionCard({ sub }: { sub: any }) {
    const [expanded, setExpanded] = useState(false)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [loadingImage, setLoadingImage] = useState(false)

    const viewImage = async () => {
        if (!sub.answer_image_path) return
        if (imageUrl) {
            window.open(imageUrl, '_blank')
            return
        }

        setLoadingImage(true)
        const res = await getStudentAnswerImageUrl(sub.answer_image_path)
        if (res.success && res.url) {
            setImageUrl(res.url)
            window.open(res.url, '_blank')
        }
        setLoadingImage(false)
    }

    const scorePct = sub.max_marks > 0 ? (sub.total_marks / sub.max_marks) * 100 : 0
    const isError = sub.status === 'error'

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(!expanded)}
            >
                <div>
                    <p className="font-bold text-gray-900">{sub.profiles?.display_name || 'Unknown Student'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {formatDateTime(sub.submitted_at)}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {isError ? (
                        <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Error</span>
                    ) : (
                        <div className="text-right">
                            <span className="text-lg font-bold" style={{ color: scorePct >= 80 ? '#16a34a' : scorePct >= 50 ? '#ca8a04' : '#dc2626' }}>
                                {sub.total_marks} / {sub.max_marks}
                            </span>
                        </div>
                    )}

                    <button
                        onClick={(e) => { e.stopPropagation(); viewImage() }}
                        disabled={!sub.answer_image_path || loadingImage}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="View Answer Sheet"
                    >
                        {loadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                    </button>

                    {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
            </div>

            {expanded && !isError && sub.gemini_response && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <QuickPracticeResult
                        result={{
                            detected_class: 'N/A',
                            detected_subject: 'N/A',
                            detected_chapter: 'N/A',
                            totalMarks: sub.total_marks,
                            maxMarks: sub.max_marks,
                            questions: sub.gemini_response,
                            presentation_notes: []
                        }}
                    />
                </div>
            )}

            {expanded && isError && (
                <div className="p-4 border-t border-gray-100 bg-red-50">
                    <p className="text-sm text-red-700 font-medium">Evaluation Failed: {sub.error_message}</p>
                </div>
            )}
        </div>
    )
}
