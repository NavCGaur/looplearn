'use client'

import { useState } from 'react'
import { createAssignment } from '@/app/actions/assignments'
import { X, Upload, FileImage, Loader2, CheckCircle2, Plus, FileText } from 'lucide-react'

interface UploadAssignmentModalProps {
    isOpen: boolean
    onClose: () => void
}

const CLASSES = [6, 7, 8, 9, 10]
const SUBJECTS = ['Maths', 'Science', 'English', 'SST', 'Hindi']
const MAX_IMAGE_PAGES = 8

const ACCEPTED_TYPES = {
    'application/pdf': { label: 'PDF', icon: '📄', ext: '.pdf' },
    'image/jpeg': { label: 'JPG', icon: '🖼️', ext: '.jpg' },
    'image/png': { label: 'PNG', icon: '🖼️', ext: '.png' },
    'image/webp': { label: 'WebP', icon: '🖼️', ext: '.webp' },
}

type UploadMode = 'pdf' | 'images'

export function UploadAssignmentModal({ isOpen, onClose }: UploadAssignmentModalProps) {
    const [title, setTitle] = useState('')
    const [subject, setSubject] = useState(SUBJECTS[1])
    const [classStd, setClassStd] = useState<number>(9)
    const [uploadMode, setUploadMode] = useState<UploadMode>('pdf')

    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [imageFiles, setImageFiles] = useState<File[]>([])

    const [isLoading, setIsLoading] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState('')
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (!f) return
        if (f.type !== 'application/pdf') { setError('Please select a PDF file.'); return }
        setPdfFile(f)
        setError(null)
    }

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return
        const newFiles = Array.from(e.target.files)
        if (imageFiles.length + newFiles.length > MAX_IMAGE_PAGES) {
            setError(`You can upload up to ${MAX_IMAGE_PAGES} pages only.`)
            return
        }
        setImageFiles(prev => [...prev, ...newFiles])
        setError(null)
    }

    const removeImagePage = (idx: number) => setImageFiles(prev => prev.filter((_, i) => i !== idx))

    const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const dataUrl = reader.result as string
                resolve({ base64: dataUrl.split(',')[1], mimeType: file.type || 'image/jpeg' })
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return setError('Please enter a title')

        const sourceFile = uploadMode === 'pdf' ? pdfFile : imageFiles[0]
        if (!sourceFile) return setError(uploadMode === 'pdf' ? 'Please select a PDF file' : 'Please upload at least one page')

        setIsLoading(true)
        setLoadingStatus(uploadMode === 'pdf' ? 'Uploading PDF...' : 'Uploading question paper...')
        setError(null)

        try {
            // For PDF: use the PDF directly. For images: use first page (server handles extraction)
            const { base64, mimeType } = await fileToBase64(sourceFile)

            setLoadingStatus('Analyzing paper with AI... ✨')

            const res = await createAssignment({
                title: title.trim(),
                subject,
                classStandard: classStd,
                paperBase64: base64,
                mimeType,
            })

            if (res.success) {
                onClose()
                window.location.reload()
            } else {
                setError(res.error || 'Failed to create assignment')
                setIsLoading(false)
                setLoadingStatus('')
            }
        } catch (err: any) {
            setError(err.message)
            setIsLoading(false)
            setLoadingStatus('')
        }
    }

    const hasPaperSelected = uploadMode === 'pdf' ? !!pdfFile : imageFiles.length > 0

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 font-fredoka">Upload Assignment</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Science Ch.9 — Force & Laws"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            maxLength={50}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                            <select
                                value={classStd}
                                onChange={(e) => setClassStd(Number(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Upload mode toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Question Paper Format</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => { setUploadMode('pdf'); setPdfFile(null); setImageFiles([]); setError(null) }}
                                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${uploadMode === 'pdf'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                <FileText className="w-4 h-4" /> PDF
                            </button>
                            <button
                                type="button"
                                onClick={() => { setUploadMode('images'); setPdfFile(null); setImageFiles([]); setError(null) }}
                                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${uploadMode === 'images'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                <FileImage className="w-4 h-4" /> Photos
                            </button>
                        </div>
                    </div>

                    {/* PDF upload */}
                    {uploadMode === 'pdf' && (
                        <div>
                            {pdfFile ? (
                                <div className="flex items-center justify-between px-4 py-3 bg-blue-50 rounded-xl border border-blue-200">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-blue-800 truncate max-w-[200px]">{pdfFile.name}</p>
                                            <p className="text-xs text-blue-600">{(pdfFile.size / 1024).toFixed(0)} KB</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setPdfFile(null)} className="text-red-400 hover:text-red-600 p-1 rounded transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={handlePdfChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <FileText className="h-9 w-9 text-gray-400" />
                                        <span className="text-sm text-gray-600 font-medium">Upload PDF</span>
                                        <span className="text-xs text-gray-400">All pages included automatically</span>
                                    </div>
                                </div>
                            )}
                            <p className="mt-1.5 text-xs text-gray-500">
                                📐 Diagrams, graphs and math equations in PDF are fully visible to AI
                            </p>
                        </div>
                    )}

                    {/* Photo upload */}
                    {uploadMode === 'images' && (
                        <div>
                            {imageFiles.length > 0 && (
                                <div className="mb-2 space-y-1">
                                    {imageFiles.map((f, i) => (
                                        <div key={i} className="flex items-center justify-between px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                                            <div className="flex items-center gap-2">
                                                <FileImage className="w-4 h-4 text-blue-500 shrink-0" />
                                                <span className="text-sm text-blue-800 truncate max-w-[200px]">Page {i + 1}: {f.name}</span>
                                            </div>
                                            <button type="button" onClick={() => removeImagePage(i)} className="text-red-400 hover:text-red-600 p-1 rounded transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {imageFiles.length < MAX_IMAGE_PAGES && (
                                <div className="flex justify-center px-6 pt-4 pb-5 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImagesChange}
                                        multiple
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        {imageFiles.length === 0 ? (
                                            <Upload className="h-8 w-8 text-gray-400" />
                                        ) : (
                                            <Plus className="h-8 w-8 text-blue-400" />
                                        )}
                                        <span className="text-sm text-gray-600">
                                            {imageFiles.length === 0 ? 'Upload question paper photos' : 'Add more pages'}
                                        </span>
                                        <span className="text-xs text-gray-400">Up to {MAX_IMAGE_PAGES} pages • PNG, JPG, WebP</span>
                                    </div>
                                </div>
                            )}
                            {imageFiles.length > 0 && (
                                <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    AI will extract all questions from your photos
                                </p>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !hasPaperSelected}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {loadingStatus}
                            </>
                        ) : (
                            'Upload & Assign to Class'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
