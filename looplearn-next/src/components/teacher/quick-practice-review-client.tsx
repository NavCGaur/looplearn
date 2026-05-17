'use client'

import { useState, useTransition } from 'react'
import { getQuickPracticeImageUrl, flagQuickPracticeSubmission } from '@/app/actions/subjective'
import type { QuestionEvalResult } from '@/app/actions/ai'

export interface Submission {
    id: string
    student_id: string
    submitted_at: string
    image_path: string | null
    detected_class: string | null
    detected_subject: string | null
    detected_chapter: string | null
    total_marks: number | null
    max_marks: number | null
    feedback_language: string | null
    gemini_response: QuestionEvalResult[] | null
    teacher_flag: boolean
    teacher_note: string | null
    status: string
    profiles: { display_name: string | null } | null
}

type FilterType = 'all' | 'flagged' | 'errors'

// ── WhatsApp class summary generator ─────────────────────────────────────────
function buildWhatsAppSummary(submissions: Submission[], todayOnly: boolean): string {
    const now = new Date()
    const todayStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

    const filtered = todayOnly
        ? submissions.filter(s => {
            const d = new Date(s.submitted_at)
            return d.getFullYear() === now.getFullYear() &&
                d.getMonth() === now.getMonth() &&
                d.getDate() === now.getDate()
        })
        : submissions

    const okSubs = filtered.filter(s => s.status === 'ok')
    if (okSubs.length === 0) return '📋 No evaluated submissions to summarize.'

    // Detect common subject/chapter from most recent batch
    const subjectLine = (() => {
        const subj = okSubs[0]?.detected_subject
        const chapter = okSubs[0]?.detected_chapter
        const cls = okSubs[0]?.detected_class
        return [cls, subj, chapter].filter(Boolean).join(' — ')
    })()

    let text = `📋 *Quick Practice Review*\n`
    if (subjectLine) text += `📚 ${subjectLine}\n`
    text += `📅 ${todayStr}\n\n`

    for (const sub of okSubs) {
        const name = sub.profiles?.display_name || `Student`
        const pct = sub.max_marks && sub.max_marks > 0
            ? Math.round(((sub.total_marks || 0) / sub.max_marks) * 100)
            : null
        const scoreEmoji = pct === null ? '' : pct >= 70 ? '✅' : pct >= 40 ? '⚠️' : '❌'
        const scoreStr = pct !== null ? ` — ${sub.total_marks}/${sub.max_marks} (${pct}%)` : ''

        text += `👤 *${name}*${scoreStr} ${scoreEmoji}\n`

        if (sub.gemini_response && sub.gemini_response.length > 0) {
            for (const q of sub.gemini_response) {
                if (q.teacher_summary) {
                    const qPct = q.max_marks > 0 ? (q.marks_awarded / q.max_marks) * 100 : 100
                    const dot = qPct >= 100 ? '  ✅' : qPct >= 60 ? '  ⚠️' : '  ❌'
                    text += `${dot} ${q.teacher_summary}\n`
                }
            }
        } else if (sub.status === 'error') {
            text += `  ⚠️ Evaluation failed for this sheet\n`
        }
        text += '\n'
    }

    text += `_Reviewed by LoopLearnX AI Reviewer_`
    return text.trim()
}

// ── Summary panel component ───────────────────────────────────────────────────
function WhatsAppSummaryPanel({ submissions }: { submissions: Submission[] }) {
    const [todayOnly, setTodayOnly] = useState(true)
    const [copied, setCopied] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    const summaryText = buildWhatsAppSummary(submissions, todayOnly)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(summaryText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
    }

    const lineCount = submissions.filter(s => {
        if (!todayOnly) return s.status === 'ok'
        const now = new Date()
        const d = new Date(s.submitted_at)
        return s.status === 'ok' &&
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate()
    }).length

    return (
        <div className="bg-green-50 border border-green-200 rounded-2xl overflow-hidden mb-6">
            <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl shrink-0">
                        💬
                    </div>
                    <div>
                        <p className="font-bold text-green-900 text-sm">WhatsApp Class Summary</p>
                        <p className="text-xs text-green-700">
                            Copy formatted summary · paste in your class group · done
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Today toggle */}
                    <div className="flex items-center gap-1.5 bg-white border border-green-200 rounded-lg px-3 py-1.5">
                        <button
                            onClick={() => setTodayOnly(true)}
                            className={`text-xs font-medium px-2 py-0.5 rounded ${todayOnly ? 'bg-green-600 text-white' : 'text-gray-500'}`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setTodayOnly(false)}
                            className={`text-xs font-medium px-2 py-0.5 rounded ${!todayOnly ? 'bg-green-600 text-white' : 'text-gray-500'}`}
                        >
                            All
                        </button>
                    </div>
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-lg">
                        {lineCount} student{lineCount !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={() => setShowPreview(p => !p)}
                        className="text-xs px-3 py-1.5 border border-green-300 text-green-700 bg-white rounded-lg hover:bg-green-50 transition-colors"
                    >
                        {showPreview ? 'Hide Preview' : '👁 Preview'}
                    </button>
                    <button
                        onClick={handleCopy}
                        className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-all ${copied
                            ? 'bg-green-700 text-white'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                    >
                        {copied ? '✅ Copied!' : '📋 Copy for WhatsApp'}
                    </button>
                </div>
            </div>

            {showPreview && (
                <div className="border-t border-green-200 bg-white p-4">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Preview (how it will look in WhatsApp):</p>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 border border-gray-200 rounded-xl p-3 max-h-64 overflow-y-auto leading-relaxed">
                        {summaryText}
                    </pre>
                </div>
            )}
        </div>
    )
}

// ── Main review client ────────────────────────────────────────────────────────
export function QuickPracticeReviewClient({ submissions }: { submissions: Submission[] }) {
    const [filter, setFilter] = useState<FilterType>('all')
    const [search, setSearch] = useState('')
    const [expanded, setExpanded] = useState<string | null>(null)
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
    const [loadingImage, setLoadingImage] = useState<string | null>(null)
    const [flagStates, setFlagStates] = useState<Record<string, boolean>>({})
    const [noteInputs, setNoteInputs] = useState<Record<string, string>>({})
    const [isPending, startTransition] = useTransition()

    const filtered = submissions.filter(s => {
        if (filter === 'flagged' && !(flagStates[s.id] ?? s.teacher_flag)) return false
        if (filter === 'errors' && s.status !== 'error') return false
        if (search) {
            const q = search.toLowerCase()
            const name = s.profiles?.display_name?.toLowerCase() || ''
            const subj = s.detected_subject?.toLowerCase() || ''
            const chapter = s.detected_chapter?.toLowerCase() || ''
            if (!name.includes(q) && !subj.includes(q) && !chapter.includes(q)) return false
        }
        return true
    })

    const handleViewImage = async (sub: Submission) => {
        if (!sub.image_path) return
        if (imageUrls[sub.id]) {
            setExpanded(prev => prev === sub.id ? null : sub.id)
            return
        }
        setLoadingImage(sub.id)
        const res = await getQuickPracticeImageUrl(sub.image_path)
        if (res.success && res.url) {
            setImageUrls(prev => ({ ...prev, [sub.id]: res.url! }))
        }
        setLoadingImage(null)
        setExpanded(sub.id)
    }

    const handleFlag = (sub: Submission) => {
        const currentFlagged = flagStates[sub.id] ?? sub.teacher_flag
        const note = noteInputs[sub.id] ?? sub.teacher_note ?? ''
        startTransition(async () => {
            const res = await flagQuickPracticeSubmission({
                submissionId: sub.id,
                flagged: !currentFlagged,
                note,
            })
            if (res.success) {
                setFlagStates(prev => ({ ...prev, [sub.id]: !currentFlagged }))
            }
        })
    }

    const scoreColor = (pct: number) =>
        pct >= 70 ? '#16a34a' : pct >= 40 ? '#ca8a04' : '#dc2626'

    return (
        <div className="space-y-4">

            {/* WhatsApp summary generator */}
            <WhatsAppSummaryPanel submissions={submissions} />

            {/* Filters + search */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex gap-2">
                    {(['all', 'flagged', 'errors'] as FilterType[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f
                                ? 'bg-violet-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {f === 'all' ? `All (${submissions.length})` : f === 'flagged' ? '🚩 Flagged' : '⚠️ Errors'}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Search by student, subject, chapter..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
                <span className="text-xs text-gray-400 shrink-0">{filtered.length} shown</span>
            </div>

            {/* Submission cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <p className="text-3xl mb-2">🔍</p>
                    <p>No submissions match your filter.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(sub => {
                        const isFlagged = flagStates[sub.id] ?? sub.teacher_flag
                        const pct = sub.max_marks && sub.max_marks > 0
                            ? Math.round(((sub.total_marks || 0) / sub.max_marks) * 100)
                            : null
                        const isExpanded = expanded === sub.id
                        const studentName = sub.profiles?.display_name || `Student (${sub.student_id.slice(0, 8)})`
                        const date = new Date(sub.submitted_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                        })

                        return (
                            <div
                                key={sub.id}
                                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isFlagged ? 'border-amber-300' : 'border-gray-200'}`}
                            >
                                {/* Card header */}
                                <div className="p-4 flex flex-wrap gap-3 items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                                            {studentName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-800 text-sm truncate">{studentName}</p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {[sub.detected_class, sub.detected_subject, sub.detected_chapter]
                                                    .filter(Boolean).join(' · ') || 'Unknown sheet'}
                                            </p>
                                            <p className="text-xs text-gray-400">{date}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        {sub.status === 'error' ? (
                                            <span className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-medium">Error</span>
                                        ) : pct !== null ? (
                                            <div className="text-right">
                                                <span className="text-lg font-black" style={{ color: scoreColor(pct) }}>
                                                    {sub.total_marks}/{sub.max_marks}
                                                </span>
                                                <span className="text-xs text-gray-400 ml-1">({pct}%)</span>
                                            </div>
                                        ) : null}

                                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">
                                            {sub.feedback_language === 'hinglish' ? '🇮🇳' : '🇬🇧'}
                                        </span>

                                        <button
                                            onClick={() => handleFlag(sub)}
                                            disabled={isPending}
                                            title={isFlagged ? 'Remove flag' : 'Flag as incorrect evaluation'}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isFlagged
                                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600'
                                                }`}
                                        >
                                            {isFlagged ? '🚩 Flagged' : '🏳 Flag'}
                                        </button>

                                        <button
                                            onClick={() => setExpanded(prev => prev === sub.id ? null : sub.id)}
                                            className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-200 transition-colors"
                                        >
                                            {isExpanded ? '▲ Less' : '▼ Details'}
                                        </button>
                                    </div>
                                </div>

                                {/* Teacher summary preview — visible without expanding */}
                                {sub.gemini_response && sub.gemini_response.some(q => q.teacher_summary) && !isExpanded && (
                                    <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                                        {sub.gemini_response.map((q, i) => q.teacher_summary ? (
                                            <span key={i} className="text-xs bg-gray-100 text-gray-600 rounded-lg px-2 py-1">
                                                {q.teacher_summary}
                                            </span>
                                        ) : null)}
                                    </div>
                                )}

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 p-4 space-y-5 bg-gray-50">

                                        {/* Image viewer */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <p className="text-sm font-semibold text-gray-700">📄 Answer Sheet Image</p>
                                                {sub.image_path && (
                                                    <button
                                                        onClick={() => handleViewImage(sub)}
                                                        disabled={loadingImage === sub.id}
                                                        className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                                    >
                                                        {loadingImage === sub.id
                                                            ? 'Loading…'
                                                            : imageUrls[sub.id]
                                                                ? 'Hide image'
                                                                : 'View image'}
                                                    </button>
                                                )}
                                                {!sub.image_path && (
                                                    <span className="text-xs text-gray-400">No image stored</span>
                                                )}
                                            </div>

                                            {imageUrls[sub.id] && (
                                                <div className="rounded-xl overflow-hidden border border-gray-200 bg-white max-h-[600px] overflow-y-auto">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={imageUrls[sub.id]}
                                                        alt="Student answer sheet"
                                                        className="w-full"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* AI Reviewer evaluation */}
                                        {sub.gemini_response && sub.gemini_response.length > 0 && (
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700 mb-3">🎓 AI Examiner&apos;s Evaluation</p>
                                                <div className="space-y-3">
                                                    {sub.gemini_response.map((q, i) => {
                                                        const qPct = q.max_marks > 0 ? Math.round((q.marks_awarded / q.max_marks) * 100) : 0
                                                        return (
                                                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <span className="w-7 h-7 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center font-bold text-xs">
                                                                        Q{q.question_number}
                                                                    </span>
                                                                    <span className="font-bold text-sm" style={{ color: scoreColor(qPct) }}>
                                                                        {q.marks_awarded} / {q.max_marks}
                                                                    </span>
                                                                </div>
                                                                <div className="h-1.5 bg-gray-100 rounded-full mb-3">
                                                                    <div className="h-1.5 rounded-full" style={{ width: `${qPct}%`, backgroundColor: scoreColor(qPct) }} />
                                                                </div>
                                                                {q.teacher_summary && (
                                                                    <p className="text-xs bg-blue-50 text-blue-800 px-2 py-1.5 rounded-lg mb-2 font-medium">
                                                                        📋 {q.teacher_summary}
                                                                    </p>
                                                                )}
                                                                {q.what_was_correct && (
                                                                    <p className="text-xs text-gray-600 mb-1.5">
                                                                        <span className="font-semibold text-green-700">✅ Correct:</span> {q.what_was_correct}
                                                                    </p>
                                                                )}
                                                                {q.what_was_wrong && q.marks_awarded < q.max_marks && !q.what_was_wrong.toLowerCase().startsWith('nothing') && (
                                                                    <p className="text-xs text-gray-600 mb-1.5">
                                                                        <span className="font-semibold text-red-700">❌ Wrong:</span> {q.what_was_wrong}
                                                                    </p>
                                                                )}
                                                                {q.suggestion && (
                                                                    <p className="text-xs text-gray-600">
                                                                        <span className="font-semibold text-blue-700">💡 Tip:</span> {q.suggestion}
                                                                    </p>
                                                                )}
                                                                {q.overall_comment && (
                                                                    <p className="text-xs text-violet-700 mt-2 italic border-t border-violet-100 pt-2">
                                                                        &ldquo;{q.overall_comment}&rdquo;
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Teacher note */}
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700 mb-2">📝 Your Note (optional)</p>
                                            <textarea
                                                value={noteInputs[sub.id] ?? sub.teacher_note ?? ''}
                                                onChange={e => setNoteInputs(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                                placeholder="e.g. AI was too strict on Q2 — student had the right method"
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                                            />
                                            <button
                                                onClick={() => handleFlag(sub)}
                                                disabled={isPending}
                                                className="mt-2 px-4 py-1.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
                                            >
                                                Save Note & {(flagStates[sub.id] ?? sub.teacher_flag) ? 'Unflag' : 'Flag'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
