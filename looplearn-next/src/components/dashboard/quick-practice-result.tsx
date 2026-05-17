import { QuickPracticeEvalResult } from '@/app/actions/ai'

interface QuickPracticeResultProps {
    result: QuickPracticeEvalResult
    onReset?: () => void
}

export function QuickPracticeResult({ result, onReset }: QuickPracticeResultProps) {
    const { questions, totalMarks, maxMarks, detected_class, detected_subject, detected_chapter } = result
    const percentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0
    const color = percentage >= 70 ? 'green' : percentage >= 40 ? 'yellow' : 'red'

    const colorMap = {
        green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', badge: 'bg-green-600' },
        yellow: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', badge: 'bg-yellow-500' },
        red: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-600' },
    }[color]

    const overallComment = questions[0]?.overall_comment

    return (
        <div className="space-y-6">
            {/* Detected info pill — only shown when at least one value is meaningful */}
            {(detected_class && detected_class !== 'Unknown') || (detected_subject && detected_subject !== 'Unknown') ? (
                <div className="flex flex-wrap gap-2">
                    {[detected_class, detected_subject, detected_chapter].filter(v => v && v !== 'Unknown').map((v, i) => (
                        <span key={i} className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                            {v}
                        </span>
                    ))}
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">📍 AI-detected from your sheet</span>
                </div>
            ) : null}

            {/* Score header */}
            <div className={`rounded-2xl border-2 ${colorMap.border} ${colorMap.bg} p-6 text-center`}>
                <div className={`text-5xl font-black ${colorMap.text} mb-1`}>{totalMarks} / {maxMarks}</div>
                <div className={`inline-block px-4 py-1 ${colorMap.badge} text-white rounded-full font-semibold text-sm mt-1`}>
                    {percentage}%
                </div>
                <p className="text-gray-500 mt-3 text-sm">
                    {percentage >= 70 ? '🎉 Great work! Keep it up.' : percentage >= 40 ? '💪 Good effort! Review the feedback below.' : '📚 Keep practicing. Focus on the suggestions below.'}
                </p>
                {overallComment && (
                    <div className="mt-4 pt-4 border-t border-current/20">
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">🎓 AI Examiner&apos;s Overall Comment</p>
                        <p className={`text-sm italic ${colorMap.text} opacity-80`}>&ldquo;{overallComment}&rdquo;</p>
                    </div>
                )}
            </div>


            {/* Per-question feedback */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 text-lg">Question-wise Feedback</h3>
                {questions.map((r: any, i: number) => {
                    const qPct = r.max_marks > 0 ? Math.round((r.marks_awarded / r.max_marks) * 100) : 0
                    const qColor = qPct >= 70 ? '#16a34a' : qPct >= 40 ? '#ca8a04' : '#dc2626'

                    return (
                        <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                                <span className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center font-bold text-sm text-gray-700">
                                    Q{r.question_number}
                                </span>
                                <div className="text-right">
                                    <span className="text-lg font-bold" style={{ color: qColor }}>{r.marks_awarded}</span>
                                    <span className="text-gray-400 font-normal text-sm"> / {r.max_marks}</span>
                                </div>
                            </div>

                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-2 rounded-full transition-all" style={{ width: `${qPct}%`, backgroundColor: qColor }} />
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                {r.marks_awarded > 0 && r.what_was_correct && (
                                    <div className="flex gap-3">
                                        <span className="text-green-500 text-lg shrink-0">✅</span>
                                        <div>
                                            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">What you did right</p>
                                            <p className="text-sm text-gray-700">{r.what_was_correct}</p>
                                        </div>
                                    </div>
                                )}
                                {r.what_was_wrong && r.marks_awarded < r.max_marks && !r.what_was_wrong.toLowerCase().startsWith('nothing') && (
                                    <div className="flex gap-3">
                                        <span className="text-red-500 text-lg shrink-0">❌</span>
                                        <div>
                                            <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-0.5">Where you lost marks</p>
                                            <p className="text-sm text-gray-700">{r.what_was_wrong}</p>
                                        </div>
                                    </div>
                                )}
                                {r.suggestion && (
                                    <div className="flex gap-3">
                                        <span className="text-blue-500 text-lg shrink-0">💡</span>
                                        <div>
                                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-0.5">How to improve</p>
                                            <p className="text-sm text-gray-700">{r.suggestion}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Presentation tips — collapsible, below questions so it doesn't steal focus */}
            {result.presentation_notes && result.presentation_notes.length > 0 && (
                <details className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none">
                        <span className="text-sm font-semibold text-amber-800">✍️ Presentation Tips ({result.presentation_notes.length})</span>
                        <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Tap to expand</span>
                    </summary>
                    <div className="px-4 pb-4">
                        <p className="text-xs text-amber-600 mb-3">
                            These are <strong>NOT</strong> deducted from your marks — coaching tips for neater handwriting:
                        </p>
                        <ul className="space-y-2">
                            {result.presentation_notes.map((note: string, i: number) => (
                                <li key={i} className="flex gap-2 text-sm text-amber-900">
                                    <span className="shrink-0 mt-0.5">📌</span>
                                    <span>{note}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </details>
            )}

            {/* Try another */}
            {onReset && (
                <button
                    onClick={onReset}
                    className="w-full py-3 border-2 border-violet-300 text-violet-700 font-semibold rounded-xl hover:bg-violet-50 transition-colors"
                >
                    📝 Evaluate Another Sheet
                </button>
            )}
        </div>
    )
}
