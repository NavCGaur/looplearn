'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import type { QuizQuestion } from '@/types/db'
import { updateProgress, awardPoints } from '@/app/actions/quiz'
import { logError } from '@/lib/utils/client-error-logger'
import { MCQQuestion } from '@/components/quiz/mcq-question'
import { FillBlankQuestion } from '@/components/quiz/fillblank-question'
import { QuizProgress } from '@/components/quiz/quiz-progress'
import { QuizResult } from '@/components/quiz/quiz-result'

interface QuizClientProps {
    questions: QuizQuestion[]
    isGuest: boolean
    subject: string
    classStandard: number
    chapter?: string
}

const SEEN_QUESTIONS_KEY = 'looplearn_seen_questions'

export function QuizClient({ questions, isGuest, subject, classStandard, chapter }: QuizClientProps) {
    const router = useRouter()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [totalPoints, setTotalPoints] = useState(0)
    const [answered, setAnswered] = useState(false)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [isCorrect, setIsCorrect] = useState(false)
    const [quizFinished, setQuizFinished] = useState(false)
    const [startTime] = useState(new Date())

    const currentQuestion = questions[currentIndex]
    const progress = ((currentIndex + 1) / questions.length) * 100

    const handleAnswer = async (answer: string, correct: boolean) => {
        setSelectedAnswer(answer)
        setAnswered(true)
        setIsCorrect(correct)

        if (correct) {
            setScore(prev => prev + 1)
            const points = currentQuestion.points || 10
            setTotalPoints(prev => prev + points)

            // Small confetti for correct answer
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 }
            })

            // Update progress for registered users
            if (!isGuest) {
                const quality = 3 // "Easy" - can be made dynamic based on time taken
                await updateProgress({
                    questionId: currentQuestion.id,
                    quality
                })
                await awardPoints(points)
            }
        } else {
            // Wrong answer - reset SRS for registered users
            if (!isGuest) {
                await updateProgress({
                    questionId: currentQuestion.id,
                    quality: 0
                })
            }
        }
    }

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setAnswered(false)
            setSelectedAnswer(null)
            setIsCorrect(false)
        } else {
            // Quiz complete
            const completionBonus = 20
            setTotalPoints(prev => prev + completionBonus)

            if (!isGuest) {
                awardPoints(completionBonus)
            } else {
                // For guests, save seen question IDs to sessionStorage
                try {
                    const seenQuestions = JSON.parse(sessionStorage.getItem(SEEN_QUESTIONS_KEY) || '[]')
                    const currentQuestionIds = questions.map(q => q.id)
                    const updatedSeenQuestions = [...new Set([...seenQuestions, ...currentQuestionIds])]
                    sessionStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(updatedSeenQuestions))
                    console.log('Saved seen questions:', updatedSeenQuestions.length)
                } catch (error) {
                    logError('Error saving seen questions', error)
                }
            }

            setQuizFinished(true)

            // Big confetti for completion
            confetti({
                particleCount: 200,
                spread: 160,
                origin: { y: 0.6 }
            })
        }
    }

    const handleLoadMore = () => {
        // Load more questions from same chapter, excluding seen ones
        try {
            const seenQuestions = JSON.parse(sessionStorage.getItem(SEEN_QUESTIONS_KEY) || '[]')
            const params = new URLSearchParams({
                subject,
                class: classStandard.toString(),
                excludeIds: seenQuestions.join(','),
            })
            if (chapter) {
                params.set('chapter', chapter)
            }
            router.push(`/quiz?${params.toString()}`)
        } catch (error) {
            logError('Error loading more questions', error)
            router.refresh()
        }
    }

    const handleExit = () => {
        // Go back to setup (Home page where GuestQuizSetup is)
        router.push('/')
    }

    const handleRestart = () => {
        // Registered user restart - simple refresh for now, or redirect to dashboard
        router.refresh()
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No questions available</h2>
                    <p className="text-gray-600">Check back later for new content!</p>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    if (quizFinished) {
        const timeTaken = Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
        return (
            <QuizResult
                score={score}
                totalQuestions={questions.length}
                points={totalPoints}
                timeTaken={timeTaken}
                isGuest={isGuest}
                onRestart={handleRestart}
                onLoadMore={handleLoadMore}
                onExit={handleExit}
            />
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cloud-gray via-white to-primary-blue/10 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Progress Bar */}
                <QuizProgress
                    current={currentIndex + 1}
                    total={questions.length}
                    progress={progress}
                    points={totalPoints}
                />

                {/* Question Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mt-6">
                    {currentQuestion.question_type === 'mcq' ? (
                        <MCQQuestion
                            key={currentQuestion.id}
                            question={currentQuestion}
                            onAnswer={handleAnswer}
                            answered={answered}
                            selectedAnswer={selectedAnswer}
                        />
                    ) : (
                        <FillBlankQuestion
                            key={currentQuestion.id}
                            question={currentQuestion}
                            onAnswer={handleAnswer}
                            answered={answered}
                            userAnswer={selectedAnswer}
                        />
                    )}

                    {/* Feedback & Next Button */}
                    {answered && (
                        <div className="mt-6 space-y-4">
                            {/* Feedback Message */}
                            <div
                                className={`p-4 rounded-xl ${isCorrect
                                    ? 'bg-grassy-green/10 border-2 border-grassy-green'
                                    : 'bg-soft-red/10 border-2 border-soft-red'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{isCorrect ? '🎉' : '❌'}</span>
                                    <div>
                                        <p className={`font-fredoka font-bold text-lg ${isCorrect ? 'text-grassy-green' : 'text-soft-red'}`}>
                                            {isCorrect ? '🎉 Awesome!' : 'Incorrect'}
                                        </p>
                                        {!isCorrect && (
                                            <p className="text-sm text-foreground/70 font-fredoka mt-1">
                                                The correct answer is: <strong>{getCorrectAnswer(currentQuestion)}</strong>
                                            </p>
                                        )}
                                        {isCorrect && (
                                            <p className="text-sm text-grassy-green font-fredoka font-semibold mt-1">
                                                +{currentQuestion.points || 10} points!
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={handleNext}
                                className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white font-fredoka font-bold text-lg py-5 rounded-2xl transition-all transform hover:scale-105 shadow-xl cursor-pointer"
                                style={{ minHeight: 'var(--touch-target-min)' }}
                            >
                                {currentIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz 🎊'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Guest Reminder */}
                {isGuest && (
                    <div className="mt-6 bg-sunshine-yellow/20 border-2 border-sunshine-yellow rounded-2xl p-4 text-center">
                        <p className="text-sm font-fredoka text-foreground">
                            📝 <strong>Guest Mode:</strong> Your progress won't be saved.{' '}
                            <a href="/auth/signup" className="underline font-semibold cursor-pointer">
                                Sign up
                            </a>{' '}
                            to track your learning!
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

function getCorrectAnswer(question: QuizQuestion): string {
    if (question.question_type === 'mcq') {
        const correct = question.question_options?.find(o => o.is_correct)
        return correct?.option_text || 'N/A'
    } else {
        const primary = question.fillblank_answers?.find(a => a.is_primary)
        return primary?.accepted_answer || question.fillblank_answers?.[0]?.accepted_answer || 'N/A'
    }
}
