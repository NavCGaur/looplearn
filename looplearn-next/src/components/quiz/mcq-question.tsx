'use client'

import { useState, useMemo } from 'react'
import type { QuizQuestion } from '@/types/db'
import { FormulaText } from '@/components/ui/formula-text'

interface MCQQuestionProps {
    question: QuizQuestion
    onAnswer: (answer: string, correct: boolean) => void
    answered: boolean
    selectedAnswer: string | null
}

export function MCQQuestion({ question, onAnswer, answered, selectedAnswer }: MCQQuestionProps) {
    const [hoveredOption, setHoveredOption] = useState<string | null>(null)

    // Shuffle options once per question using Fisher-Yates algorithm
    // This prevents answer patterns (e.g., correct answer always being option A)
    const options = useMemo(() => {
        const opts = question.question_options || []
        const shuffled = [...opts]
        // Fisher-Yates shuffle for truly random distribution
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
    }, [question.id]) // Re-shuffle only when question changes

    console.log('MCQ Question:', {
        questionId: question.id,
        questionText: question.question_text,
        optionsCount: options.length,
        options: question.question_options
    })

    const handleOptionClick = (optionId: string, isCorrect: boolean) => {
        if (answered) return
        onAnswer(optionId, isCorrect)
    }

    const getOptionStyle = (optionId: string, isCorrect: boolean) => {
        if (!answered) {
            // Before answering
            if (hoveredOption === optionId) {
                return 'border-primary-blue bg-primary-blue/10 scale-105'
            }
            return 'border-cloud-gray hover:border-primary-blue hover:bg-primary-blue/5'
        }

        // After answering
        if (selectedAnswer === optionId) {
            if (isCorrect) {
                return 'border-grassy-green bg-grassy-green/10 ring-4 ring-grassy-green/30'
            } else {
                return 'border-soft-red bg-soft-red/10 ring-4 ring-soft-red/30'
            }
        }

        // Show correct answer if user was wrong
        if (isCorrect && !answered) {
            return 'border-green-400 bg-green-50'
        }

        return 'border-gray-200 opacity-50'
    }

    return (
        <div>
            {/* Question Text */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-primary-blue/20 text-primary-blue text-sm font-fredoka font-semibold rounded-full">
                        {question.question_type === 'truefalse' ? 'True / False' : 'Multiple Choice'}
                    </span>
                    {question.difficulty && (
                        <span
                            className={`px-3 py-1 text-sm font-fredoka font-semibold rounded-full ${question.difficulty === 'easy'
                                ? 'bg-grassy-green/20 text-grassy-green'
                                : question.difficulty === 'medium'
                                    ? 'bg-sunshine-yellow/30 text-sunshine-yellow'
                                    : 'bg-soft-red/20 text-soft-red'
                                }`}
                        >
                            {question.difficulty}
                        </span>
                    )}
                </div>
                <h2 className="text-2xl font-fredoka font-bold text-foreground">
                    <FormulaText>{question.question_text}</FormulaText>
                </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
                {options.map((option, index) => (
                    <button
                        key={option.id}
                        onClick={() => handleOptionClick(option.id, option.is_correct)}
                        onMouseEnter={() => !answered && setHoveredOption(option.id)}
                        onMouseLeave={() => setHoveredOption(null)}
                        disabled={answered}
                        className={`w-full p-5 rounded-2xl border-2 text-left transition-all transform ${getOptionStyle(
                            option.id,
                            option.is_correct
                        )} ${!answered ? 'cursor-pointer' : 'cursor-default'}`}
                        style={{ minHeight: 'var(--touch-target-min)' }}
                    >
                        <div className="flex items-center gap-3">
                            {/* Option Letter */}
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-fredoka font-bold text-base ${answered && selectedAnswer === option.id
                                    ? option.is_correct
                                        ? 'bg-grassy-green text-white'
                                        : 'bg-soft-red text-white'
                                    : 'bg-cloud-gray text-foreground'
                                    }`}
                            >
                                {String.fromCharCode(65 + index)}
                            </div>

                            {/* Option Text */}
                            <div className="flex-1 text-foreground font-fredoka font-medium text-lg">
                                <FormulaText>{option.option_text}</FormulaText>
                            </div>

                            {/* Checkmark/X */}
                            {answered && selectedAnswer === option.id && (
                                <div className="text-2xl">
                                    {option.is_correct ? '✓' : '✗'}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
