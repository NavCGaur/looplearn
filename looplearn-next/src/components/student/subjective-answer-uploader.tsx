'use client'

import { useState, useRef, useCallback } from 'react'
import { submitAndEvaluate } from '@/app/actions/subjective'
import type { QuestionEvalResult } from '@/app/actions/ai'

interface Question {
    id: string
    question_number: number
    question_text: string
    question_type: string
    max_marks: number
}

interface Props {
    testId: string
    questions: Question[]
    subject: string
    totalMarks: number
}

// ── Friendly error messages ────────────────────────────────────────────────
// Maps raw server/AI error strings into actionable, student-friendly messages.
function getFriendlyError(raw: string): string {
    const msg = raw.toLowerCase()

    // Re-submission blocked (Fix #1)
    if (msg.includes('already submitted') || msg.includes('re-evaluation')) {
        return 'You have already submitted this test. Your previous result is shown above. Contact your teacher if you need a re-check.'
    }
    // Gemini JSON parse / truncation
    if (msg.includes('json') || msg.includes('parse') || msg.includes('unexpected token') || msg.includes('syntax')) {
        return "Gemini's response was incomplete — this usually means the answer image was too large or unclear. Try uploading a cleaner, well-lit photo and submit again."
    }
    // Gemini safety / content block
    if (msg.includes('safety') || msg.includes('blocked') || msg.includes('harm')) {
        return 'Your image was flagged by the AI safety filter. Make sure the photo shows only your answer sheet and try again.'
    }
    // API key / quota
    if (msg.includes('api key') || msg.includes('quota') || msg.includes('rate limit') || msg.includes('resource_exhausted')) {
        return 'The AI service is temporarily unavailable (quota limit reached). Please try again in a few minutes or contact your teacher.'
    }
    // Network / timeout
    if (msg.includes('timeout') || msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
        return 'Network error — please check your internet connection and try again.'
    }
    // Image processing failure
    if (msg.includes('canvas') || msg.includes('blob') || msg.includes('image')) {
        return 'Could not process your image. Please try a different photo (JPG or PNG) and make sure it is not corrupted.'
    }
    // Test not found
    if (msg.includes('test not found')) {
        return 'This test could not be found. It may have been removed by your teacher. Please go back and select another test.'
    }
    // Generic fallback — still show the original if we have no specific match
    return raw || 'An unexpected error occurred. Please try again or contact your teacher.'
}

// ── Image processing constants ─────────────────────────────────────────────
const MAX_IMAGES = 2        // keep payload small to avoid Gemini response truncation
const OUTPUT_WIDTH = 1200   // max canvas width (images narrower than this won't be upscaled)
const JPEG_QUALITY = 0.72   // lower quality is fine for grayscale text; saves ~20% size
const CONTRAST_FACTOR = 1.5 // 1.0 = no change; 1.5 = moderately punchy handwriting

/**
 * Stitch multiple images vertically into one JPEG.
 * Applies grayscale + contrast boost to make handwriting crisper and
 * dramatically reduce file size (color photos → grayscale text can cut
 * JPEG size by 50-60%, reducing Gemini token usage and response truncation risk).
 */
async function stitchImages(files: File[]): Promise<{ base64: string; mimeType: 'image/jpeg' }> {
    const imgs = await Promise.all(
        files.map(
            file =>
                new Promise<HTMLImageElement>((resolve, reject) => {
                    const img = new Image()
                    img.onload = () => resolve(img)
                    img.onerror = reject
                    img.src = URL.createObjectURL(file)
                })
        )
    )

    // Use natural width if it's already narrower than OUTPUT_WIDTH (no upscaling blurs)
    const WIDTH = Math.min(OUTPUT_WIDTH, Math.max(...imgs.map(img => img.naturalWidth)))
    const totalHeight = imgs.reduce((sum, img) => {
        const scale = WIDTH / img.naturalWidth
        return sum + Math.round(img.naturalHeight * scale)
    }, 0)

    const canvas = document.createElement('canvas')
    canvas.width = WIDTH
    canvas.height = totalHeight
    const ctx = canvas.getContext('2d')!

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, WIDTH, totalHeight)

    let y = 0
    for (const img of imgs) {
        const scale = WIDTH / img.naturalWidth
        const h = Math.round(img.naturalHeight * scale)
        ctx.drawImage(img, 0, y, WIDTH, h)
        y += h
    }

    // ── Grayscale + contrast enhancement ─────────────────────────────────────
    // Handwriting is black on white — color data is noise. Grayscale removes it.
    // Contrast boost makes ink lines darker and paper brighter, helping Gemini
    // read even slightly faded handwriting with much higher accuracy.
    const imageData = ctx.getImageData(0, 0, WIDTH, totalHeight)
    const data = imageData.data
    const mid = 128
    for (let i = 0; i < data.length; i += 4) {
        // Perceptual grayscale (matches human vision weighting)
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        // Apply contrast: push values away from mid-gray
        const contrasted = Math.min(255, Math.max(0, CONTRAST_FACTOR * (gray - mid) + mid))
        data[i] = data[i + 1] = data[i + 2] = contrasted
        // alpha (data[i+3]) unchanged
    }
    ctx.putImageData(imageData, 0, 0)
    // ─────────────────────────────────────────────────────────────────────────

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            blob => {
                if (!blob) return reject(new Error('Canvas toBlob failed'))
                const reader = new FileReader()
                reader.onload = () => {
                    const dataUrl = reader.result as string
                    const base64 = dataUrl.split(',')[1]
                    resolve({ base64, mimeType: 'image/jpeg' })
                }
                reader.onerror = reject
                reader.readAsDataURL(blob)
            },
            'image/jpeg',
            JPEG_QUALITY
        )
    })
}

export function SubjectiveAnswerUploader({ testId, questions, subject, totalMarks }: Props) {
    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [stitchedPreview, setStitchedPreview] = useState<string | null>(null)
    const [stitching, setStitching] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState<{
        evalResults: QuestionEvalResult[]
        totalMarks: number
        maxMarks: number
    } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFilesChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []).slice(0, MAX_IMAGES)
        if (selected.length === 0) return

        setFiles(selected)
        setStitchedPreview(null)
        setError(null)

        // Generate per-image previews
        const thumbs = selected.map(f => URL.createObjectURL(f))
        setPreviews(thumbs)

        // Auto-stitch + process
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
        setFiles(prev => {
            const next = prev.filter((_, i) => i !== index)
            return next
        })
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index])
            return prev.filter((_, i) => i !== index)
        })
        setStitchedPreview(null)
    }, [])

    const handleSubmit = async () => {
        if (files.length === 0) return setError('Please upload at least one image of your answer.')
        setError(null)
        setSubmitting(true)

        try {
            const { base64, mimeType } = await stitchImages(files)
            const res = await submitAndEvaluate({ testId, imageBase64: base64, imageMimeType: mimeType })

            if (!res.success) {
                setError(getFriendlyError(res.error || ''))
            } else {
                setResult({
                    evalResults: res.evaluationResult!,
                    totalMarks: res.totalMarks!,
                    maxMarks: res.maxMarks!,
                })
            }
        } catch (err: any) {
            setError(getFriendlyError(err.message || ''))
        } finally {
            setSubmitting(false)
        }
    }

    if (result) {
        return <EvaluationResult result={result} questions={questions} />
    }

    return (
        <div className="space-y-6">
            {/* Upload area */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📸 Upload Your Answer Sheet(s)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                    Upload up to <strong>{MAX_IMAGES} images</strong> (one per page). Images are auto-converted to
                    grayscale and optimised before sending — keep handwriting clear and use good lighting.
                </p>
                <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all"
                >
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-600 font-medium">Click to select images</p>
                    <p className="text-gray-400 text-sm">JPG, PNG, WEBP · Max {MAX_IMAGES} pages</p>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFilesChange}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Thumbnails */}
            {previews.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">{previews.length} page(s) selected:</p>
                    <div className="flex flex-wrap gap-3">
                        {previews.map((src, i) => (
                            <div key={i} className="relative group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={src}
                                    alt={`Page ${i + 1}`}
                                    className="w-24 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                                />
                                <div className="absolute top-0 left-0 bg-black/50 text-white text-xs px-1 rounded-tl-lg rounded-br-lg">
                                    p{i + 1}
                                </div>
                                <button
                                    onClick={() => removeFile(i)}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stitched preview */}
            {stitching && (
                <div className="text-center py-4 text-gray-500 text-sm animate-pulse">⚙️ Combining pages...</div>
            )}
            {stitchedPreview && !stitching && (
                <details className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                    <summary className="text-sm text-gray-600 cursor-pointer font-medium">
                        👁️ Preview combined image (what Gemini will see)
                    </summary>
                    <div className="mt-3 max-h-96 overflow-y-auto rounded-lg border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={stitchedPreview} alt="Stitched answer sheet" className="w-full" />
                    </div>
                </details>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
                    <p className="font-semibold text-red-700 mb-1">⚠️ Something went wrong</p>
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={submitting || files.length === 0 || stitching}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed text-lg"
            >
                {submitting
                    ? '🤖 Gemini is evaluating your answers... (~20-30s)'
                    : `🚀 Submit for Evaluation`}
            </button>

            {submitting && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 text-center animate-pulse">
                    Gemini is reading your handwritten answers and evaluating each question stepwise. Please wait...
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────
// Evaluation Result Display
// ─────────────────────────────────────────
function EvaluationResult({
    result,
    questions,
}: {
    result: { evalResults: QuestionEvalResult[]; totalMarks: number; maxMarks: number }
    questions: { question_number: number; question_text: string; max_marks: number }[]
}) {
    const percentage = Math.round((result.totalMarks / result.maxMarks) * 100)
    const color = percentage >= 70 ? 'green' : percentage >= 40 ? 'yellow' : 'red'

    const colorMap = {
        green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', badge: 'bg-green-600' },
        yellow: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', badge: 'bg-yellow-500' },
        red: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', badge: 'bg-red-600' },
    }[color]

    // Extract overall_comment from first question item if present
    const overallComment = result.evalResults[0]?.overall_comment

    return (
        <div className="space-y-6">
            {/* Score header */}
            <div className={`rounded-2xl border-2 ${colorMap.border} ${colorMap.bg} p-6 text-center`}>
                <div className={`text-5xl font-black ${colorMap.text} mb-1`}>
                    {result.totalMarks} / {result.maxMarks}
                </div>
                <div className={`inline-block px-4 py-1 ${colorMap.badge} text-white rounded-full font-semibold text-sm mt-1`}>
                    {percentage}%
                </div>
                <p className="text-gray-500 mt-3 text-sm">
                    {percentage >= 70 ? '🎉 Great work! Keep it up.' : percentage >= 40 ? '💪 Good effort! Review the feedback below.' : '📚 Keep practicing. Focus on the suggestions below.'}
                </p>
                {overallComment && (
                    <div className="mt-4 pt-4 border-t border-current/20">
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">🤖 Examiner&apos;s Overall Comment</p>
                        <p className={`text-sm italic ${colorMap.text} opacity-80`}>&ldquo;{overallComment}&rdquo;</p>
                    </div>
                )}
            </div>

            {/* Per-question results */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 text-lg">Question-wise Feedback</h3>
                {result.evalResults.map((r, i) => {
                    const q = questions.find(q => q.question_number === r.question_number)
                    const qPct = Math.round((r.marks_awarded / r.max_marks) * 100)
                    const qColor = qPct >= 70 ? '#16a34a' : qPct >= 40 ? '#ca8a04' : '#dc2626'

                    return (
                        <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Question header */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center font-bold text-sm text-gray-700">
                                        Q{r.question_number}
                                    </span>
                                    <span className="text-sm text-gray-600 font-medium line-clamp-2 max-w-xs">
                                        {q?.question_text}
                                    </span>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                    <span className="text-lg font-bold" style={{ color: qColor }}>
                                        {r.marks_awarded}
                                    </span>
                                    <span className="text-gray-400 font-normal text-sm"> / {r.max_marks}</span>
                                </div>
                            </div>

                            {/* Marks bar */}
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-2 rounded-full transition-all"
                                        style={{ width: `${qPct}%`, backgroundColor: qColor }}
                                    />
                                </div>
                            </div>

                            {/* Feedback body */}
                            <div className="p-4 space-y-3">
                                {r.what_was_correct && (
                                    <div className="flex gap-3">
                                        <span className="text-green-500 text-lg shrink-0">✅</span>
                                        <div>
                                            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">What you did right</p>
                                            <p className="text-sm text-gray-700">{r.what_was_correct}</p>
                                        </div>
                                    </div>
                                )}
                                {r.what_was_wrong && (
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
                                {r.diagram_present !== undefined && (
                                    <div className="flex gap-2 text-xs text-gray-500">
                                        <span>{r.diagram_present ? '✔️ Diagram drawn' : '✗ No diagram found'}</span>
                                        {r.diagram_present && (
                                            <span>· {r.diagram_labeled ? '✔️ Labels correct' : '✗ Labels missing/incorrect'}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
