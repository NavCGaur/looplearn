'use client'

import { useState, useRef, useCallback } from 'react'
import { submitQuickPractice } from '@/app/actions/subjective'
import type { QuestionEvalResult, QuickPracticeEvalResult } from '@/app/actions/ai'
import { stitchImages } from '@/lib/utils/image-stitcher'
import { QuickPracticeResult } from '@/components/dashboard/quick-practice-result'

// ── Friendly error messages ────────────────────────────────────────────────
function getFriendlyError(raw: string): string {
    const msg = raw.toLowerCase()
    if (msg.includes('json') || msg.includes('parse') || msg.includes('syntax')) {
        return "Gemini's response was incomplete — try a cleaner, well-lit photo and submit again."
    }
    if (msg.includes('safety') || msg.includes('blocked') || msg.includes('harm')) {
        return 'Your image was flagged by the AI safety filter. Make sure the photo shows only your answer sheet.'
    }
    if (msg.includes('api key') || msg.includes('quota') || msg.includes('rate limit') || msg.includes('resource_exhausted')) {
        return 'The AI service is temporarily unavailable. Please try again in a few minutes.'
    }
    if (msg.includes('timeout') || msg.includes('fetch') || msg.includes('network')) {
        return 'Network error — please check your internet connection and try again.'
    }
    if (msg.includes('canvas') || msg.includes('blob')) {
        return 'Could not process your image. Please try a different photo (JPG or PNG).'
    }
    return raw || 'An unexpected error occurred. Please try again.'
}

// ── Image processing ───────────────────────────────────────────────────────
const MAX_IMAGES = 6

// ── Main uploader component ────────────────────────────────────────────────
export function QuickPracticeUploader() {
    const [feedbackLanguage, setFeedbackLanguage] = useState<'english' | 'hinglish'>('hinglish')
    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [stitchedPreview, setStitchedPreview] = useState<string | null>(null)
    const [stitching, setStitching] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState<QuickPracticeEvalResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFilesChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []).slice(0, MAX_IMAGES)
        if (selected.length === 0) return
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
        if (files.length === 0) return setError('Please upload at least one photo of your answer sheet.')
        setError(null)
        setSubmitting(true)
        try {
            const { base64, mimeType } = await stitchImages(files)
            const res = await submitQuickPractice({
                imageBase64: base64,
                imageMimeType: mimeType,
                feedbackLanguage,
            })
            if (!res.success || !res.data) {
                setError(getFriendlyError(res.error || ''))
            } else {
                setResult(res.data)
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
    }

    if (result) {
        return <QuickPracticeResult result={result} onReset={handleReset} />
    }

    return (
        <div className="space-y-6">
            {/* Format guide */}
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
                <p className="text-sm font-semibold text-violet-800 mb-3">📋 How to write your answer sheet</p>
                <div className="bg-white rounded-xl border border-violet-100 p-4 font-mono text-xs text-gray-700 leading-relaxed space-y-1">
                    <p className="text-gray-500 font-sans text-xs mb-2 font-medium">Write exactly like this on your paper:</p>
                    <p><span className="text-violet-600 font-bold">CLASS 9</span> &nbsp;&nbsp;&nbsp; <span className="text-blue-600 font-bold">SCIENCE</span> &nbsp;&nbsp;&nbsp; <span className="text-green-600 font-bold">Gravitation</span></p>
                    <p className="mt-2"><span className="text-gray-800 font-bold">Q1.</span> Define gravitational force. <span className="text-orange-600 font-bold">(3 marks)</span></p>
                    <p className="text-gray-600 pl-4">Ans: The force of attraction between any two objects...</p>
                    <p className="mt-1"><span className="text-gray-800 font-bold">Q2.</span> Calculate F if m₁=5kg, m₂=10kg, r=2m. <span className="text-orange-600 font-bold">(5 marks)</span></p>
                    <p className="text-gray-600 pl-4">Ans: Given: m₁=5kg, m₂=10kg, r=2m, G=6.67×10⁻¹¹...</p>
                </div>
                <p className="text-xs text-violet-600 mt-3">
                    ✅ Class + Subject + Chapter at top &nbsp;·&nbsp; ✅ Q1, Q2... with marks in brackets &nbsp;·&nbsp; ✅ Answer below each question
                </p>
            </div>

            {/* Language toggle */}
            <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Feedback Language</p>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setFeedbackLanguage('english')}
                        className={`flex-1 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${feedbackLanguage === 'english'
                            ? 'border-violet-500 bg-violet-50 text-violet-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                    >
                        🇬🇧 English
                    </button>
                    <button
                        type="button"
                        onClick={() => setFeedbackLanguage('hinglish')}
                        className={`flex-1 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${feedbackLanguage === 'hinglish'
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                    >
                        🇮🇳 Hinglish
                    </button>
                </div>
            </div>

            {/* Upload area */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📸 Upload Your Answer Sheet
                </label>
                <p className="text-xs text-gray-500 mb-3">
                    Up to <strong>{MAX_IMAGES} photos</strong> (one per page). Images are stitched and auto-processed for best AI reading.
                </p>
                <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all"
                >
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-600 font-medium">Click to select photo(s)</p>
                    <p className="text-gray-400 text-sm">JPG, PNG, WEBP · Up to {MAX_IMAGES} pages · Good lighting = better results</p>
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
                                <img src={src} alt={`Page ${i + 1}`} className="w-24 h-32 object-cover rounded-lg border border-gray-200 shadow-sm" />
                                <div className="absolute top-0 left-0 bg-black/50 text-white text-xs px-1 rounded-tl-lg rounded-br-lg">p{i + 1}</div>
                                <button
                                    onClick={() => removeFile(i)}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stitched preview */}
            {stitching && <div className="text-center py-3 text-gray-500 text-sm animate-pulse">⚙️ Processing image...</div>}
            {stitchedPreview && !stitching && (
                <details className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                    <summary className="text-sm text-gray-600 cursor-pointer font-medium">
                        👁️ Preview (what Gemini will see — high contrast grayscale)
                    </summary>
                    <div className="mt-3 max-h-96 overflow-y-auto rounded-lg border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={stitchedPreview} alt="Processed answer sheet" className="w-full" />
                    </div>
                </details>
            )}

            {/* Error */}
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
                {submitting ? '🔍 LoopLearnX AI Reviewer is evaluating... (~20-30s)' : '🚀 Submit for Evaluation'}
            </button>

            {submitting && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 text-center animate-pulse">
                    LoopLearnX AI Reviewer is reading your handwriting and grading each answer as a CBSE examiner. Please wait...
                </div>
            )}
        </div>
    )
}


