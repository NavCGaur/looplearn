'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitAssignmentSolution } from '@/app/actions/assignments'
import { Upload, X, Loader2, Sparkles, CheckCircle2, Eye } from 'lucide-react'
import { QuickPracticeResult } from '@/components/dashboard/quick-practice-result'

const MAX_IMAGES = 10

interface PreviewInfo {
    dataUrl: string
    originalKB: number
    compressedKB: number
}

interface AssignmentSubmitterProps {
    assignmentId: string
    existingSubmission: any | null
    assignmentTitle?: string
    assignmentSubject?: string
    classStandard?: number | null
}

export function AssignmentSubmitter({ assignmentId, existingSubmission, assignmentTitle, assignmentSubject, classStandard }: AssignmentSubmitterProps) {
    const router = useRouter()

    const [images, setImages] = useState<{ file: File; id: string }[]>([])
    const [previews, setPreviews] = useState<Record<string, PreviewInfo>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<any | null>(null)

    const [feedbackLanguage, setFeedbackLanguage] = useState<'english' | 'hinglish'>('hinglish')

    if (existingSubmission && existingSubmission.status === 'ok') {
        const submissionResult = {
            detected_class: classStandard ? `Class ${classStandard}` : '',
            detected_subject: assignmentSubject || '',
            detected_chapter: '',
            questions: existingSubmission.gemini_response,
            totalMarks: existingSubmission.total_marks,
            maxMarks: existingSubmission.max_marks,
            presentation_notes: []
        }
        return (
            <div className="p-6">
                <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                    <h3 className="font-bold text-green-800 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> Solution Submitted Successfully
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                        You have already submitted this assignment. Your AI evaluation is below.
                    </p>
                </div>
                <QuickPracticeResult result={submissionResult} />
            </div>
        )
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return
        setError(null)
        const newFiles = Array.from(e.target.files)
        if (images.length + newFiles.length > MAX_IMAGES) {
            setError(`You can only select up to ${MAX_IMAGES} images in total.`)
            return
        }
        const newImages = newFiles.map(file => ({ file, id: Math.random().toString(36).slice(2) }))
        setImages(prev => [...prev, ...newImages])
        // Kick off background compression preview for each new image
        newImages.forEach(({ file, id }) => generatePreview(file, id))
    }

    const removeImage = (idToRemove: string) => {
        setImages(prev => prev.filter(img => img.id !== idToRemove))
        setPreviews(prev => { const next = { ...prev }; delete next[idToRemove]; return next })
        setError(null)
    }

    // ─── Image compression pipeline ───────────────────────────────────────────
    // Grayscale + WebP at quality 0.82, max 1600px longest side.
    // A 4 MB phone photo → ~150 KB. Keeps maths symbols, subscripts, and diagram
    // lines sharp for Gemini while staying well within Next.js payload limits.
    const compressImage = (file: File): Promise<{ base64: string; mimeType: string }> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onerror = reject
            reader.onload = () => {
                const img = new Image()
                img.onerror = reject
                img.onload = () => {
                    const MAX_PX = 1600
                    const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height))
                    const w = Math.round(img.width * scale)
                    const h = Math.round(img.height * scale)

                    const canvas = document.createElement('canvas')
                    canvas.width = w
                    canvas.height = h
                    const ctx = canvas.getContext('2d')!

                    // Draw the image
                    ctx.drawImage(img, 0, 0, w, h)

                    // Convert to grayscale using luminance formula
                    const imageData = ctx.getImageData(0, 0, w, h)
                    const d = imageData.data
                    for (let i = 0; i < d.length; i += 4) {
                        // Weighted luminance (matches human perception of brightness)
                        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
                        d[i] = d[i + 1] = d[i + 2] = lum
                        // d[i + 3] = alpha — unchanged
                    }
                    ctx.putImageData(imageData, 0, 0)

                    // Export as WebP — falls back to JPEG on unsupported browsers
                    const preferWebP = canvas.toDataURL('image/webp', 0.82)
                    const isWebP = preferWebP.startsWith('data:image/webp')
                    const dataUrl = isWebP ? preferWebP : canvas.toDataURL('image/jpeg', 0.82)
                    const mimeType = isWebP ? 'image/webp' : 'image/jpeg'
                    const base64 = dataUrl.split(',')[1]
                    resolve({ base64, mimeType })
                }
                img.src = reader.result as string
            }
            reader.readAsDataURL(file)
        })

    // Background preview: run compressImage immediately after file selection
    // so the user can see the grayscale + size before hitting submit.
    const generatePreview = async (file: File, id: string) => {
        const originalKB = Math.round(file.size / 1024)
        try {
            const { base64, mimeType } = await compressImage(file)
            const mimePrefix = `data:${mimeType};base64,`
            const dataUrl = mimePrefix + base64
            const compressedKB = Math.round(base64.length * 0.75 / 1024)
            setPreviews(prev => ({ ...prev, [id]: { dataUrl, originalKB, compressedKB } }))
        } catch {
            // If preview fails, no big deal — compression still runs at submit time
        }
    }

    const handleSubmit = async () => {
        if (images.length === 0) {
            setError('Please select at least one image of your answer sheet.')
            return
        }

        setIsLoading(true)
        setLoadingStatus('Compressing images...')
        setError(null)

        try {
            // Compress each image individually — no stitching
            const answerImages = await Promise.all(images.map(img => compressImage(img.file)))

            setLoadingStatus(`Evaluating ${answerImages.length} page${answerImages.length > 1 ? 's' : ''} with AI...`)

            const res = await submitAssignmentSolution({
                assignmentId,
                answerImages,
                feedbackLanguage
            })

            if (res.success && res.data) {
                setResult(res.data)
                setImages([])
                router.refresh()
            } else {
                setError(res.error || 'Evaluation failed. Please try again.')
            }
        } catch (err: any) {
            console.error('Submission error:', err)
            setError(err.message || 'An unexpected error occurred.')
        } finally {
            setIsLoading(false)
            setLoadingStatus('')
        }
    }

    if (result) {
        return (
            <div className="p-6">
                <div className="mb-6 flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-200">
                    <div>
                        <h3 className="font-bold text-green-800 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-yellow-500" /> AI Evaluation Complete
                        </h3>
                    </div>
                </div>
                <QuickPracticeResult result={result} />
            </div>
        )
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold font-fredoka text-gray-900 mb-2">Upload Your Answer Sheet</h2>

            <div className="bg-blue-50/50 rounded-xl p-4 mb-6 border border-blue-100">
                <p className="text-sm text-blue-800 font-medium mb-2 flex items-center gap-2">
                    <span className="text-lg">💡</span> How to submit:
                </p>
                <div className="space-y-1.5 pl-6 text-sm text-gray-700">
                    <p className="flex items-start gap-2">
                        <span className="w-5 shrink-0 text-center font-bold text-blue-300">1.</span>
                        Write your <strong>Name</strong> and <strong>Class</strong> at the top of a fresh page.
                    </p>
                    <p className="flex items-start gap-2">
                        <span className="w-5 shrink-0 text-center font-bold text-blue-300">2.</span>
                        Write <strong>only your answers</strong> — no need to copy the questions. Number each answer to match the question (e.g. <strong>Q1</strong>, <strong>Q2</strong> or just <strong>1</strong>, <strong>2</strong>).
                    </p>
                    <p className="flex items-start gap-2">
                        <span className="w-5 shrink-0 text-center font-bold text-blue-300">3.</span>
                        Take clear, well-lit photos of all answer pages (up to {MAX_IMAGES}) and upload them here.
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((img, index) => {
                        const preview = previews[img.id]
                        return (
                            <div key={img.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50 group">
                                {preview ? (
                                    <img
                                        src={preview.dataUrl}
                                        alt={`Page ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    /* Still compressing — show raw image with spinner overlay */
                                    <>
                                        <img
                                            src={URL.createObjectURL(img.file)}
                                            alt={`Page ${index + 1}`}
                                            className="w-full h-full object-cover opacity-60"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                    </>
                                )}

                                {/* Page number badge */}
                                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md">
                                    Page {index + 1}
                                </div>

                                {/* Compressed size badge */}
                                {preview && (
                                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                                        <span className="bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <Eye className="w-2.5 h-2.5" />
                                            {preview.originalKB}KB → {preview.compressedKB}KB
                                        </span>
                                        {preview.compressedKB < preview.originalKB * 0.5 && (
                                            <span className="bg-green-600/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                {Math.round((1 - preview.compressedKB / preview.originalKB) * 100)}% smaller
                                            </span>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={() => removeImage(img.id)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    })}

                    {images.length < MAX_IMAGES && (
                        <label className={`
                            relative aspect-[3/4] rounded-xl border-2 border-dashed
                            flex flex-col items-center justify-center cursor-pointer transition-colors
                            ${images.length === 0 ? 'col-span-2 md:col-span-3 aspect-auto py-16 bg-blue-50/30 border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                                : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}
                        `}>
                            <Upload className={`mb-3 ${images.length === 0 ? 'w-10 h-10 text-blue-500' : 'w-6 h-6 text-gray-400'}`} />
                            <span className={`font-medium ${images.length === 0 ? 'text-blue-600 text-lg' : 'text-gray-500 text-sm'}`}>
                                {images.length === 0 ? 'Click to select photos' : 'Add another page'}
                            </span>
                            <span className="text-gray-400 text-xs mt-1">Up to {MAX_IMAGES} total</span>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                {images.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 w-full sm:w-auto mt-2">
                            <label htmlFor="hinglish-mode" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                                Feedback in Hinglish
                            </label>
                            <input
                                type="checkbox"
                                id="hinglish-mode"
                                checked={feedbackLanguage === 'hinglish'}
                                onChange={(e) => setFeedbackLanguage(e.target.checked ? 'hinglish' : 'english')}
                                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {loadingStatus || 'Processing...'}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Evaluate My Answers
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
