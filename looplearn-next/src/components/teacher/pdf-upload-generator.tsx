'use client'

import { useState, useRef, useCallback } from 'react'
import { generateQuestionsFromPDF, saveQuestionsToDatabase, type GeneratedQuestion, type Difficulty, type QuestionType } from '@/app/actions/ai'
import { FormulaText } from '@/components/ui/formula-text'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Science', 'History', 'Geography']
const CLASSES = [6, 7, 8, 9, 10, 11, 12]
const MAX_PDF_SIZE_MB = 10

export function PdfUploadGenerator() {
    // File state
    const [file, setFile] = useState<File | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form state
    const [subject, setSubject] = useState('Science')
    const [chapter, setChapter] = useState('')
    const [classStandard, setClassStandard] = useState(8)
    const [difficulty, setDifficulty] = useState<Difficulty>('medium')
    const [type, setType] = useState<QuestionType>('mcq')
    const [count, setCount] = useState(5)

    // UI state
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [questions, setQuestions] = useState<GeneratedQuestion[]>([])
    const [saving, setSaving] = useState(false)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    // ── File handling ────────────────────────────────────────────────────────
    const handleFile = useCallback((incoming: File) => {
        setError(null)
        if (incoming.type !== 'application/pdf') {
            setError('Only PDF files are supported.')
            return
        }
        if (incoming.size > MAX_PDF_SIZE_MB * 1024 * 1024) {
            setError(`PDF must be smaller than ${MAX_PDF_SIZE_MB} MB.`)
            return
        }
        setFile(incoming)
        // Auto-fill chapter from filename (strip extension)
        const name = incoming.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ')
        setChapter(name)
        setQuestions([])
    }, [])

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const dropped = e.dataTransfer.files[0]
        if (dropped) handleFile(dropped)
    }, [handleFile])

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0]
        if (picked) handleFile(picked)
    }

    // ── PDF → base64 → server action ─────────────────────────────────────────
    const handleGenerate = async () => {
        if (!file) { setError('Please upload a PDF first.'); return }
        if (!chapter) { setError('Please enter a chapter / topic name.'); return }

        setLoading(true)
        setError(null)
        setSuccessMsg(null)
        setQuestions([])

        try {
            // Read as base64 in browser
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => {
                    const result = reader.result as string
                    // result is "data:application/pdf;base64,<data>"
                    resolve(result.split(',')[1])
                }
                reader.onerror = reject
                reader.readAsDataURL(file)
            })

            const result = await generateQuestionsFromPDF(
                base64,
                subject,
                chapter,
                classStandard,
                difficulty,
                count,
                type
            )

            if (result.success && result.data) {
                setQuestions(result.data)
            } else {
                setError(result.error || 'Failed to generate questions from PDF.')
            }
        } catch (err) {
            setError('An unexpected error occurred.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // ── Save to DB (reuses existing action) ──────────────────────────────────
    const handleSave = async () => {
        setSaving(true)
        setError(null)
        try {
            const result = await saveQuestionsToDatabase(questions, {
                subject: subject.toLowerCase(),
                chapter,
                classStandard,
                difficulty
            })
            if (result.success) {
                setSuccessMsg(`✅ Successfully saved ${result.count} questions!`)
                setTimeout(() => { setQuestions([]); setSuccessMsg(null) }, 3000)
            } else {
                setError(result.errors?.join('\n') || 'Failed to save questions.')
            }
        } catch {
            setError('Error saving questions.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = (index: number) => {
        const updated = [...questions]
        updated.splice(index, 1)
        setQuestions(updated)
    }

    const handleUpdateQuestion = (index: number, field: keyof GeneratedQuestion, value: any) => {
        const updated = [...questions]
        updated[index] = { ...updated[index], [field]: value }
        setQuestions(updated)
    }

    const handleUpdateOption = (qIndex: number, optIndex: number, text: string) => {
        const updated = [...questions]
        if (updated[qIndex].options) {
            updated[qIndex].options![optIndex].text = text
            setQuestions(updated)
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-4xl mx-auto space-y-8">

            {/* ── Upload & Parameters Card ── */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2">
                    <span className="text-2xl">📄</span> Generate from Chapter PDF
                </h2>

                {/* Drag-and-drop zone */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={`
                        w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6
                        ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}
                        ${file ? 'border-green-400 bg-green-50' : ''}
                    `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={onFileChange}
                    />
                    {file ? (
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-4xl">✅</span>
                            <p className="font-semibold text-green-700">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); setChapter('') }}
                                className="text-xs text-red-500 hover:text-red-700 mt-1 underline"
                            >
                                Remove file
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                            <span className="text-4xl">📤</span>
                            <p className="font-semibold">Drag & drop a PDF here, or click to browse</p>
                            <p className="text-sm">Supports NCERT / any chapter PDF · Max {MAX_PDF_SIZE_MB} MB</p>
                        </div>
                    )}
                </div>

                {/* Parameters grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        >
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Class */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Class (Standard)</label>
                        <select
                            value={classStandard}
                            onChange={(e) => setClassStandard(Number(e.target.value))}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        >
                            {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                        </select>
                    </div>

                    {/* Question Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Question Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as QuestionType)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="mcq">Multiple Choice (MCQ)</option>
                            <option value="fillblank">Fill in the Blank</option>
                            <option value="truefalse">True / False</option>
                        </select>
                    </div>

                    {/* Difficulty */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    {/* Chapter name */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Chapter / Topic Name</label>
                        <input
                            type="text"
                            value={chapter}
                            onChange={(e) => setChapter(e.target.value)}
                            placeholder="e.g. Force and Pressure, Chemical Reactions…"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                        <p className="text-xs text-gray-400 mt-1">Auto-filled from filename — feel free to edit</p>
                    </div>

                    {/* Count slider */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Number of Questions: <span className="text-indigo-600 font-bold">{count}</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </div>

                {/* Generate button */}
                <button
                    onClick={handleGenerate}
                    disabled={loading || !file || !chapter}
                    className="mt-8 w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <LoadingSpinner size="sm" />
                            <span>Reading PDF & Generating Questions…</span>
                        </>
                    ) : (
                        <>
                            <span className="text-xl">✨</span> Generate Questions with Gemini
                        </>
                    )}
                </button>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 whitespace-pre-wrap">
                        🚨 {error}
                    </div>
                )}
            </div>

            {/* ── Generated Questions Review ── */}
            {questions.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800">
                            Generated Questions ({questions.length})
                        </h3>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setQuestions([])}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                            >
                                Discard All
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
                            >
                                {saving ? 'Saving…' : '💾 Save to Database'}
                            </button>
                        </div>
                    </div>

                    {successMsg && (
                        <div className="p-4 bg-green-100 text-green-800 rounded-xl border border-green-200 font-medium text-center">
                            {successMsg}
                        </div>
                    )}

                    <div className="space-y-6">
                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:border-indigo-100 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 mr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Question {qIndex + 1}</span>
                                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium capitalize">
                                                {q.question_type === 'fillblank' ? 'Fill Blank' : q.question_type === 'truefalse' ? 'T/F' : 'MCQ'}
                                            </span>
                                        </div>
                                        <textarea
                                            value={q.question_text}
                                            onChange={(e) => handleUpdateQuestion(qIndex, 'question_text', e.target.value)}
                                            className="w-full p-2 border border-gray-200 rounded-lg font-medium text-gray-800 focus:ring-2 focus:ring-indigo-100 outline-none"
                                            rows={2}
                                        />
                                        <div className="mt-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                                            <strong>Preview: </strong>
                                            <FormulaText>{q.question_text}</FormulaText>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(qIndex)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="Remove Question"
                                    >
                                        🗑️
                                    </button>
                                </div>

                                {/* Options / Answer */}
                                <div className="mb-4">
                                    {q.question_type === 'fillblank' ? (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Correct Answer</label>
                                            <div className="relative p-1 rounded-lg border border-green-200 bg-green-50">
                                                <div className="absolute top-2 right-2">
                                                    <span className="text-green-600 font-bold text-xs">✔ Answer</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={q.answer || ''}
                                                    onChange={(e) => handleUpdateQuestion(qIndex, 'answer', e.target.value)}
                                                    className="w-full p-2 pr-16 bg-transparent rounded border-none focus:ring-0 text-sm font-semibold text-green-900"
                                                    placeholder="Enter correct answer…"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options?.map((opt, optIndex) => (
                                                <div key={optIndex} className={`relative p-1 rounded-lg border ${opt.is_correct ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}>
                                                    <div className="absolute top-2 right-2">
                                                        {opt.is_correct && <span className="text-green-600 font-bold text-xs">✔ Correct</span>}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={opt.text}
                                                        onChange={(e) => handleUpdateOption(qIndex, optIndex, e.target.value)}
                                                        className={`w-full p-2 pr-16 bg-transparent rounded border-none focus:ring-0 text-sm ${opt.is_correct ? 'font-semibold text-green-900' : 'text-gray-600'}`}
                                                    />
                                                    <div className="px-2 pb-1 text-xs text-gray-500 truncate">
                                                        <FormulaText>{opt.text}</FormulaText>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Explanation */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Explanation</label>
                                    <input
                                        type="text"
                                        value={q.explanation}
                                        onChange={(e) => handleUpdateQuestion(qIndex, 'explanation', e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
