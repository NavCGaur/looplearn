'use client'

import { useState } from 'react'
import type { QuizQuestion } from '@/types/database'
import { FormulaText } from '@/components/ui/formula-text'
import { fuzzyMatchAnswer } from '@/lib/utils/fuzzy-match'

interface FillBlankQuestionProps {
    question: QuizQuestion
    onAnswer: (answer: string, correct: boolean) => void
    answered: boolean
    userAnswer: string | null
}

export function FillBlankQuestion({ question, onAnswer, answered, userAnswer }: FillBlankQuestionProps) {
    const [input, setInput] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (answered || !input.trim()) return

        const acceptedAnswers = question.fillblank_answers?.map(a => a.accepted_answer) || []
        const isCorrect = fuzzyMatchAnswer(input, acceptedAnswers, 0.2)

        onAnswer(input, isCorrect)
    }

    const correctAnswer = question.fillblank_answers?.find(a => a.is_primary)?.accepted_answer ||
        question.fillblank_answers?.[0]?.accepted_answer

    return (
        <div>
            {/* Question Text */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        Fill in the Blank
                    </span>
                    {question.difficulty && (
                        <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${question.difficulty === 'easy'
                                ? 'bg-green-100 text-green-700'
                                : question.difficulty === 'medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                        >
                            {question.difficulty}
                        </span>
                    )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                    <FormulaText>{question.question_text}</FormulaText>
                </h2>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Answer
                    </label>
                    <input
                        id="answer"
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={answered}
                        placeholder="answer here"
                        className={`w-full px-4 py-3 text-lg border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all ${answered
                            ? userAnswer && fuzzyMatchAnswer(userAnswer, question.fillblank_answers?.map(a => a.accepted_answer) || [], 0.2)
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                            : 'border-gray-300'
                            }`}
                        autoComplete="off"
                        autoFocus
                    />
                </div>

                {!answered && (
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        Check Answer
                    </button>
                )}
            </form>


        </div>
    )
}
