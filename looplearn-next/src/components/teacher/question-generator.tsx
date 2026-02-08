'use client'

import { useState } from 'react'
import { generateQuestions, saveQuestionsToDatabase, type GeneratedQuestion, type Difficulty, type QuestionType } from '@/app/actions/ai'
import { FormulaText } from '@/components/ui/formula-text'
import { useRouter } from 'next/navigation'

const SUBJECTS = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Science', 'History', 'Geography'
]

const CLASSES = [6, 7, 8, 9, 10, 11, 12]

export function QuestionGenerator() {
    const router = useRouter()

    // Form State
    const [subject, setSubject] = useState('Science')
    const [chapter, setChapter] = useState('')
    const [classStandard, setClassStandard] = useState(8)
    const [difficulty, setDifficulty] = useState<Difficulty>('medium')
    const [type, setType] = useState<QuestionType>('mcq')
    const [count, setCount] = useState(5)

    // UI State
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [questions, setQuestions] = useState<GeneratedQuestion[]>([])
    const [saving, setSaving] = useState(false)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    const handleGenerate = async () => {
        if (!chapter) {
            setError('Please enter a chapter or topic')
            return
        }

        setLoading(true)
        setError(null)
        setSuccessMsg(null)
        setQuestions([])

        try {
            const result = await generateQuestions(subject, chapter, classStandard, difficulty, count, type)

            if (result.success && result.data) {
                setQuestions(result.data)
            } else {
                setError(result.error || 'Failed to generate questions')
            }
        } catch (err) {
            setError('An unexpected error occurred')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

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
                setSuccessMsg(`Successfully saved ${result.count} questions!`)
                // Clear questions after delay to encourage new batch
                setTimeout(() => {
                    setQuestions([])
                    setSuccessMsg(null)
                }, 3000)
            } else {
                if (result.errors && result.errors.length > 0) {
                    setError(result.errors.join('\n'))
                } else {
                    setError('Failed to save questions to database (Unknown error)')
                }
            }
        } catch (err) {
            setError('Error saving questions')
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = (index: number) => {
        const newQuestions = [...questions]
        newQuestions.splice(index, 1)
        setQuestions(newQuestions)
    }

    const handleUpdateQuestion = (index: number, field: keyof GeneratedQuestion, value: any) => {
        const newQuestions = [...questions]
        newQuestions[index] = { ...newQuestions[index], [field]: value }
        setQuestions(newQuestions)
    }

    const handleUpdateOption = (qIndex: number, optIndex: number, text: string) => {
        const newQuestions = [...questions]
        if (newQuestions[qIndex].options) {
            newQuestions[qIndex].options![optIndex].text = text
            setQuestions(newQuestions)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2">
                    <span className="text-2xl">⚡</span> AI Question Generator
                </h2>

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
                            <option value="mcq">Multiple Choice</option>
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

                    {/* Chapter */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Topic / Chapter Name</label>
                        <input
                            type="text"
                            value={chapter}
                            onChange={(e) => setChapter(e.target.value)}
                            placeholder="e.g. Force and Pressure, Chemical Reactions..."
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Count */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Number of Questions: <span className="text-indigo-600 font-bold">{count}</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={loading || !chapter}
                    className="mt-8 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="animate-spin text-xl">✨</span> Generating Questions...
                        </>
                    ) : (
                        <>
                            <span className="text-xl">🚀</span> Generate with Gemini
                        </>
                    )}
                </button>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 whitespace-pre-wrap">
                        🚨 {error}
                    </div>
                )}
            </div>

            {/* Results Section */}
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
                                {saving ? 'Saving...' : '💾 Save to Database'}
                            </button>
                        </div>
                    </div>

                    {successMsg && (
                        <div className="p-4 bg-green-100 text-green-800 rounded-xl border border-green-200 font-medium text-center">
                            ✅ {successMsg}
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
                                        {/* Formula Preview */}
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

                                {/* Options / Answer Display */}
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
                                                    placeholder="Enter correct answer..."
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
                                                    {/* Option Formula Preview */}
                                                    <div className="px-2 pb-1 text-xs text-gray-500 truncate">
                                                        <FormulaText>{opt.text}</FormulaText>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

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
