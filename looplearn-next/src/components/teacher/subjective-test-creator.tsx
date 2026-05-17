'use client'

import { useState } from 'react'
import { createSubjectiveTest, SubjectiveTestPayload } from '@/app/actions/subjective'

const SUBJECTS = ['mathematics', 'science', 'physics', 'chemistry', 'biology'] as const
const CLASSES = [6, 7, 8, 9, 10, 11, 12] as const
const QUESTION_TYPES = [
    { value: 'numerical', label: '🔢 Numerical / Calculation', hint: 'Steps: Given, Formula, Substitution, Answer with units' },
    { value: 'theorem', label: '📐 Theorem / Proof', hint: 'Steps: Statement, Each step, Conclusion' },
    { value: 'diagram', label: '🖼️ Diagram Drawing', hint: 'Check: Diagram present, Labels correct' },
    { value: 'short_answer', label: '📝 Short Answer', hint: 'Check: Key points, accuracy, completeness' },
    { value: 'long_answer', label: '📄 Long Answer', hint: 'Check: Introduction, all points, examples, conclusion' },
] as const

interface QuestionDraft {
    question_number: number
    question_text: string
    question_type: 'short_answer' | 'long_answer' | 'numerical' | 'theorem' | 'diagram'
    max_marks: number
    marking_rubric: string
    model_answer: string
}

function defaultQuestion(num: number): QuestionDraft {
    return {
        question_number: num,
        question_text: '',
        question_type: 'numerical',
        max_marks: 5,
        marking_rubric: '',
        model_answer: '',
    }
}

export function SubjectiveTestCreator({ onSuccess }: { onSuccess?: (testId: string) => void }) {
    const [title, setTitle] = useState('')
    const [subject, setSubject] = useState<string>('science')
    const [chapter, setChapter] = useState('')
    const [classStandard, setClassStandard] = useState<number>(9)
    const [instructions, setInstructions] = useState('')
    const [feedbackLanguage, setFeedbackLanguage] = useState<'english' | 'hinglish'>('english')
    const [questions, setQuestions] = useState<QuestionDraft[]>([defaultQuestion(1)])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const updateQuestion = (index: number, field: keyof QuestionDraft, value: any) => {
        setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q))
    }

    const addQuestion = () => {
        if (questions.length >= 6) return
        setQuestions(prev => [...prev, defaultQuestion(prev.length + 1)])
    }

    const removeQuestion = (index: number) => {
        if (questions.length <= 1) return
        setQuestions(prev =>
            prev.filter((_, i) => i !== index).map((q, i) => ({ ...q, question_number: i + 1 }))
        )
    }

    const totalMarks = questions.reduce((sum, q) => sum + (q.max_marks || 0), 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!title.trim()) return setError('Please enter a test title')
        if (questions.some(q => !q.question_text.trim())) return setError('All questions must have text')

        setLoading(true)
        try {
            const payload: SubjectiveTestPayload = {
                title: title.trim(),
                subject,
                chapter: chapter.trim() || undefined,
                class_standard: classStandard,
                instructions: instructions.trim() || undefined,
                feedback_language: feedbackLanguage,
                questions,
            }

            const result = await createSubjectiveTest(payload)
            if (!result.success) {
                setError(result.error || 'Failed to create test')
            } else {
                setSuccess(true)
                onSuccess?.(result.testId!)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Created Successfully!</h2>
                <p className="text-gray-500">Students in Class {classStandard} can now access this test.</p>
                <button
                    onClick={() => { setSuccess(false); setTitle(''); setQuestions([defaultQuestion(1)]) }}
                    className="mt-6 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                    Create Another Test
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Test Metadata */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    <span>📋</span> Test Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Work & Energy — Chapter Test"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                        <select
                            value={classStandard}
                            onChange={e => setClassStandard(Number(e.target.value))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                        >
                            {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                        <select
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                        >
                            {SUBJECTS.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chapter (optional)</label>
                        <input
                            type="text"
                            value={chapter}
                            onChange={e => setChapter(e.target.value)}
                            placeholder="e.g. Work and Energy"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                        <div className="px-4 py-2.5 bg-violet-50 border border-violet-200 rounded-lg text-violet-800 font-semibold">
                            {totalMarks} marks
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions for students (optional)</label>
                        <textarea
                            value={instructions}
                            onChange={e => setInstructions(e.target.value)}
                            rows={2}
                            placeholder="e.g. Attempt all questions. Show all steps clearly. Draw diagrams wherever required."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                        />
                    </div>

                    {/* Language Toggle */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Language</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setFeedbackLanguage('english')}
                                className={`flex-1 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${feedbackLanguage === 'english'
                                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                🇬🇧 English
                                <p className="text-xs font-normal mt-0.5 opacity-70">Standard CBSE feedback</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFeedbackLanguage('hinglish')}
                                className={`flex-1 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${feedbackLanguage === 'hinglish'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                🇮🇳 Hinglish
                                <p className="text-xs font-normal mt-0.5 opacity-70">Hindi + English mix (Roman script)</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span>❓</span> Questions
                </h3>
                {questions.map((q, index) => (
                    <QuestionCard
                        key={index}
                        question={q}
                        index={index}
                        onUpdate={(field, value) => updateQuestion(index, field, value)}
                        onRemove={() => removeQuestion(index)}
                        canRemove={questions.length > 1}
                    />
                ))}

                {questions.length < 6 && (
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all font-medium"
                    >
                        + Add Question (max 6)
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    ⚠️ {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? '⏳ Creating Test...' : `✅ Create Test (${totalMarks} marks)`}
            </button>
        </form>
    )
}

function QuestionCard({
    question, index, onUpdate, onRemove, canRemove
}: {
    question: QuestionDraft
    index: number
    onUpdate: (field: keyof QuestionDraft, value: any) => void
    onRemove: () => void
    canRemove: boolean
}) {
    const [showRubric, setShowRubric] = useState(false)
    const qType = QUESTION_TYPES.find(t => t.value === question.question_type)

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center font-bold text-sm">
                        Q{question.question_number}
                    </span>
                    <span className="text-sm font-medium text-gray-600">{qType?.label}</span>
                </div>
                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-gray-400 hover:text-red-500 transition-colors text-lg"
                        title="Remove question"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {/* Question Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                    <textarea
                        value={question.question_text}
                        onChange={e => onUpdate('question_text', e.target.value)}
                        rows={3}
                        placeholder="Type the question exactly as it appears in the exam..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                        <select
                            value={question.question_type}
                            onChange={e => onUpdate('question_type', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                        >
                            {QUESTION_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">{qType?.hint}</p>
                    </div>
                    {/* Marks */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                        <input
                            type="number"
                            min={1}
                            max={20}
                            value={question.max_marks}
                            onChange={e => onUpdate('max_marks', Number(e.target.value))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                        />
                    </div>
                </div>

                {/* Rubric (collapsible) */}
                <div>
                    <button
                        type="button"
                        onClick={() => setShowRubric(v => !v)}
                        className="text-sm text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1 transition-colors"
                    >
                        {showRubric ? '▼' : '▶'} Marking Rubric (optional but recommended)
                    </button>
                    {showRubric && (
                        <textarea
                            value={question.marking_rubric}
                            onChange={e => onUpdate('marking_rubric', e.target.value)}
                            rows={2}
                            placeholder={`e.g. "1 mark for Given section, 1 for formula, 2 for calculation steps, 1 for unit"`}
                            className="mt-2 w-full px-4 py-2.5 border border-violet-200 bg-violet-50 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none resize-none text-sm"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
