'use client'

import { useState, useRef, useCallback } from 'react'
import { submitHomeworkFromWeb, WebSubmitResult } from '@/app/actions/web-submit'
import { stitchImages } from '@/lib/utils/image-stitcher'

// ── Constants ──────────────────────────────────────────────────────────────
const MAX_IMAGES = 6
const CLASS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

// ── Friendly error messages ────────────────────────────────────────────────
function getFriendlyError(raw: string): string {
    const msg = raw.toLowerCase()
    if (msg.includes('json') || msg.includes('parse') || msg.includes('syntax'))
        return "AI couldn't read the sheet clearly — try a cleaner, well-lit photo."
    if (msg.includes('safety') || msg.includes('blocked'))
        return 'Image was flagged by the AI. Please make sure the photo shows only the answer sheet.'
    if (msg.includes('quota') || msg.includes('rate limit') || msg.includes('resource_exhausted'))
        return 'AI service is temporarily busy. Please try again in a few minutes.'
    if (msg.includes('timeout') || msg.includes('network'))
        return 'Network error — check your internet and try again.'
    return raw || 'Something went wrong. Please try again.'
}

// ── Helper to split mistakes into single-line points ────────────────────────
function parseMistakesLines(raw: string): string[] {
    if (!raw || raw.includes('Nothing — full marks!') || raw.includes('Nothing - full marks!')) return []
    const lines = raw
        .split(/(?:\r?\n|;\s*|\.\s+|\s+aur\s+)/i)
        .map(s => s.trim())
        .filter(s => s.length > 0)
    return lines.length > 0 ? lines : [raw]
}

// ── Dictation Results Panel ────────────────────────────────────────────────
function DictationResult({ result, onReset }: { result: NonNullable<WebSubmitResult['dictationResult']>; onReset: () => void }) {
    const percent = result.total_words > 0 ? Math.round((result.correct_count / result.total_words) * 100) : 0
    const scoreColor = percent >= 80 ? 'text-green-600' : percent >= 50 ? 'text-yellow-600' : 'text-red-500'
    const bgColor = percent >= 80 ? 'from-green-50 to-emerald-50 border-green-200' : percent >= 50 ? 'from-yellow-50 to-orange-50 border-yellow-200' : 'from-red-50 to-pink-50 border-red-200'
    const wrongWords = result.words.filter(w => !w.is_correct)

    return (
        <div className="space-y-5">
            {/* Score header */}
            <div className={`rounded-3xl border-2 bg-gradient-to-br ${bgColor} p-6 text-center`}>
                <div className="text-5xl mb-2">{percent >= 80 ? '🏆' : percent >= 50 ? '👍' : '📚'}</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Dictation Result</h2>
                {result.topic_detected && (
                    <p className="text-sm text-gray-500 mb-3">Topic: <span className="font-semibold text-gray-700">{result.topic_detected}</span></p>
                )}
                <div className="flex justify-center gap-8 mt-4">
                    <div className="text-center">
                        <div className={`text-4xl font-black ${scoreColor}`}>{result.score > 0 ? `+${result.score}` : result.score}</div>
                        <div className="text-xs text-gray-500 mt-1">Score</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-black text-green-600">{result.correct_count}</div>
                        <div className="text-xs text-gray-500 mt-1">Correct</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-black text-red-500">{result.wrong_count}</div>
                        <div className="text-xs text-gray-500 mt-1">Wrong</div>
                    </div>
                </div>
                <div className="mt-4 bg-white/60 rounded-full h-2.5 overflow-hidden">
                    <div
                        className={`h-2.5 rounded-full transition-all duration-700 ${percent >= 80 ? 'bg-green-500' : percent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <p className="text-sm text-gray-600 mt-2">{percent}% correct · {result.total_words} words</p>
            </div>

            {/* Wrong words only — numbered list */}
            {wrongWords.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                    <div className="text-3xl mb-1">🎉</div>
                    <p className="font-bold text-green-700">All words correct.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-red-100 overflow-hidden shadow-sm">
                    <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
                        <span className="text-red-500 text-base">✏️</span>
                        <h3 className="font-bold text-red-700 text-sm">Words to Correct ({wrongWords.length})</h3>
                    </div>
                    <div className="divide-y divide-red-50">
                        {wrongWords.map((w, i) => (
                            <div key={i} className="flex items-center gap-3 px-5 py-3">
                                <span className="text-sm font-black text-red-400 w-6 shrink-0">{i + 1}.</span>
                                <div className="flex-1 flex items-center gap-2 text-sm">
                                    <span className="font-medium text-red-600 line-through">{w.word_written}</span>
                                    <span className="text-gray-400">→</span>
                                    <span className="font-bold text-gray-900">{w.correct_spelling}</span>
                                </div>
                                <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full shrink-0">{w.marks}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={onReset}
                className="w-full py-3.5 border-2 border-indigo-200 text-indigo-700 font-semibold rounded-2xl hover:bg-indigo-50 transition-all"
            >
                📤 Submit Another Sheet
            </button>
        </div>
    )
}

// ── Homework Q&A Results Panel ─────────────────────────────────────────────
function HomeworkResult({ result, onReset }: { result: NonNullable<WebSubmitResult['homeworkResult']>; onReset: () => void }) {
    const percent = result.maxMarks > 0 ? Math.round((result.totalMarks / result.maxMarks) * 100) : 0
    const scoreColor = percent >= 75 ? 'text-green-600' : percent >= 50 ? 'text-yellow-600' : 'text-red-500'
    const bgColor = percent >= 75 ? 'from-green-50 to-emerald-50 border-green-200' : percent >= 50 ? 'from-yellow-50 to-orange-50 border-yellow-200' : 'from-red-50 to-pink-50 border-red-200'

    // Only show questions where marks were deducted
    const imperfectQuestions = result.questions.filter(q => q.marks_awarded < q.max_marks)
    const perfectCount = result.questions.length - imperfectQuestions.length

    return (
        <div className="space-y-5">
            {/* Score header */}
            <div className={`rounded-3xl border-2 bg-gradient-to-br ${bgColor} p-6 text-center`}>
                <div className="text-5xl mb-2">{percent >= 75 ? '🌟' : percent >= 50 ? '👍' : '📖'}</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Homework Result</h2>
                {result.detected_subject && (
                    <p className="text-sm text-gray-500 mb-1">
                        {result.detected_class} · <span className="font-medium">{result.detected_subject}</span>
                        {result.detected_chapter ? ` · ${result.detected_chapter}` : ''}
                    </p>
                )}
                <div className={`text-5xl font-black mt-3 ${scoreColor}`}>
                    {result.totalMarks} <span className="text-2xl text-gray-400 font-medium">/ {result.maxMarks}</span>
                </div>
                <div className="mt-3 bg-white/60 rounded-full h-2.5 overflow-hidden">
                    <div
                        className={`h-2.5 rounded-full transition-all duration-700 ${percent >= 75 ? 'bg-green-500' : percent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <p className="text-sm text-gray-600 mt-2">{percent}%</p>
            </div>

            {/* Perfect questions badge */}
            {perfectCount > 0 && imperfectQuestions.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 flex items-center gap-3">
                    <span className="text-xl">✅</span>
                    <p className="text-sm text-green-700 font-medium">
                        {perfectCount} question{perfectCount > 1 ? 's' : ''} answered correctly
                    </p>
                </div>
            )}

            {/* All perfect */}
            {imperfectQuestions.length === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                    <div className="text-3xl mb-1">🎉</div>
                    <p className="font-bold text-green-700">All questions answered correctly.</p>
                </div>
            )}

            {/* Only imperfect questions */}
            {imperfectQuestions.length > 0 && (
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Mistakes to Correct</p>
                    {imperfectQuestions.map((q) => (
                        <div key={q.question_number} className={`bg-white rounded-2xl border-l-4 ${
                            q.marks_awarded === 0 ? 'border-red-400' : 'border-orange-400'
                        } border border-gray-100 p-4 shadow-sm`}>
                            <div className="flex items-center justify-between mb-2.5">
                                <span className="font-bold text-gray-800 text-base">Q{q.question_number}</span>
                                <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                                    q.marks_awarded === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-700'
                                }`}>
                                    {q.marks_awarded} / {q.max_marks}
                                </span>
                            </div>
                            {/* Mistakes list — line by line */}
                            <div className="space-y-1.5">
                                {parseMistakesLines(q.what_was_wrong).map((line, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm text-red-700 font-medium">
                                        <span className="shrink-0">❌</span>
                                        <span>{line}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={onReset}
                className="w-full py-3.5 border-2 border-indigo-200 text-indigo-700 font-semibold rounded-2xl hover:bg-indigo-50 transition-all"
            >
                📤 Submit Another Sheet
            </button>
        </div>
    )
}

// ── Main Page Component ────────────────────────────────────────────────────
export function HomeworkSubmitPage() {
    const [studentName, setStudentName] = useState('')
    const [classStandard, setClassStandard] = useState<number | ''>('')
    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [stitchedPreview, setStitchedPreview] = useState<string | null>(null)
    const [stitching, setStitching] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState<WebSubmitResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFilesChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []).slice(0, MAX_IMAGES)
        if (!selected.length) return
        setFiles(selected)
        setStitchedPreview(null)
        setError(null)
        setPreviews(selected.map(f => URL.createObjectURL(f)))
        setStitching(true)
        try {
            const { base64 } = await stitchImages(selected)
            setStitchedPreview(`data:image/jpeg;base64,${base64}`)
        } catch {
            setError('Could not process your images. Please try selecting them again.')
        } finally {
            setStitching(false)
        }
    }, [])

    const removeFile = useCallback((index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index])
            return prev.filter((_, i) => i !== index)
        })
        setStitchedPreview(null)
    }, [])

    const handleSubmit = async () => {
        if (!studentName.trim()) return setError('Please enter your name.')
        if (!classStandard) return setError('Please select your class.')
        if (files.length === 0) return setError('Please upload at least one photo of your homework.')

        setError(null)
        setSubmitting(true)
        try {
            const { base64, mimeType } = await stitchImages(files)
            const res = await submitHomeworkFromWeb({
                studentName: studentName.trim(),
                classStandard: Number(classStandard),
                imageBase64: base64,
                imageMimeType: mimeType,
            })
            if (!res.success) {
                setError(getFriendlyError(res.error || ''))
            } else {
                setResult(res)
            }
        } catch (err: any) {
            setError(getFriendlyError(err.message || ''))
        } finally {
            setSubmitting(false)
        }
    }

    const handleReset = () => {
        setResult(null)
        setFiles([])
        setPreviews([])
        setStitchedPreview(null)
        setError(null)
        // Keep name & class filled for convenience
    }

    // ── Results View ─────────────────────────────────────────────────────
    if (result?.success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-8">
                <div className="max-w-lg mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="text-4xl mb-2">🎓</div>
                        <h1 className="text-2xl font-black text-indigo-700">LoopLearnX</h1>
                        <p className="text-gray-500 text-sm">Result for <span className="font-semibold text-gray-700">{studentName}</span> · Class {classStandard}</p>
                    </div>
                    {result.submissionType === 'dictation' && result.dictationResult && (
                        <DictationResult result={result.dictationResult} onReset={handleReset} />
                    )}
                    {result.submissionType === 'homework' && result.homeworkResult && (
                        <HomeworkResult result={result.homeworkResult} onReset={handleReset} />
                    )}
                </div>
            </div>
        )
    }

    // ── Upload View ───────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-8">
            <div className="max-w-lg mx-auto space-y-6">

                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-lg mb-4">
                        <span className="text-3xl">📚</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Homework Submit</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Upload your homework photo and get <span className="text-indigo-600 font-semibold">instant AI evaluation</span>
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
                        LoopLearnX AI is online
                    </div>
                </div>

                {/* Form card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            👤 Your Name
                        </label>
                        <input
                            id="student-name"
                            type="text"
                            value={studentName}
                            onChange={e => setStudentName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-800 placeholder-gray-400 text-sm transition-colors"
                            autoComplete="name"
                        />
                    </div>

                    {/* Class dropdown */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            🎓 Class
                        </label>
                        <select
                            id="class-select"
                            value={classStandard}
                            onChange={e => setClassStandard(e.target.value ? Number(e.target.value) : '')}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-800 text-sm transition-colors bg-white"
                        >
                            <option value="">Select your class...</option>
                            {CLASS_OPTIONS.map(c => (
                                <option key={c} value={c}>Class {c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Upload area */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            📸 Upload Homework Photo(s)
                        </label>
                        <p className="text-xs text-gray-400 mb-2">
                            Up to {MAX_IMAGES} photos · JPG, PNG, WEBP · Good lighting = better results
                        </p>
                        <div
                            onClick={() => inputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
                                ${files.length > 0
                                    ? 'border-indigo-400 bg-indigo-50'
                                    : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/40'
                                }`}
                        >
                            <div className="text-4xl mb-2">{files.length > 0 ? '✅' : '📷'}</div>
                            <p className="text-gray-600 font-medium text-sm">
                                {files.length > 0 ? `${files.length} photo(s) selected` : 'Tap to select photo(s)'}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">Works for dictation sheets and Q&A homework</p>
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={handleFilesChange}
                                className="hidden"
                                id="hw-file-input"
                            />
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {previews.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {previews.map((src, i) => (
                                <div key={i} className="relative group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={src} alt={`Page ${i + 1}`} className="w-20 h-28 object-cover rounded-xl border border-gray-200 shadow-sm" />
                                    <div className="absolute top-0 left-0 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-tl-xl rounded-br-xl">
                                        p{i + 1}
                                    </div>
                                    <button
                                        onClick={() => removeFile(i)}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                    >✕</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stitching indicator */}
                    {stitching && (
                        <div className="text-center py-2 text-gray-400 text-sm animate-pulse">
                            ⚙️ Processing image...
                        </div>
                    )}

                    {/* Preview accordion */}
                    {stitchedPreview && !stitching && (
                        <details className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                            <summary className="px-4 py-2.5 text-sm text-gray-600 cursor-pointer font-medium select-none">
                                👁️ Preview (what AI will see)
                            </summary>
                            <div className="max-h-64 overflow-y-auto">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={stitchedPreview} alt="Processed sheet" className="w-full" />
                            </div>
                        </details>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex gap-3">
                        <span className="text-xl shrink-0">⚠️</span>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Submit button */}
                <button
                    id="submit-btn"
                    onClick={handleSubmit}
                    disabled={submitting || stitching || files.length === 0}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-2xl text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {submitting ? '🔍 AI is evaluating your sheet...' : '🚀 Submit for Evaluation'}
                </button>

                {submitting && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700 text-center animate-pulse">
                        LoopLearnX AI is reading your handwriting and evaluating your answers. This takes 15–30 seconds...
                    </div>
                )}

                {/* Footer note */}
                <p className="text-center text-xs text-gray-400 pb-4">
                    Powered by LoopLearnX · Works for dictation sheets &amp; Q&amp;A homework
                </p>
            </div>
        </div>
    )
}
