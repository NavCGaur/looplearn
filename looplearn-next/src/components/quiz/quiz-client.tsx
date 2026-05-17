'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import type { QuizQuestion } from '@/types/db'
import { updateProgress, awardPoints, logAnswer } from '@/app/actions/quiz'
import { logGuestAnswer } from '@/app/actions/guest'
import { logError } from '@/lib/utils/client-error-logger'
import { MCQQuestion } from '@/components/quiz/mcq-question'
import { FillBlankQuestion } from '@/components/quiz/fillblank-question'
import { QuizProgress } from '@/components/quiz/quiz-progress'
import { QuizResult } from '@/components/quiz/quiz-result'
import { FormulaText } from '@/components/ui/formula-text'
import { useIsOnline } from '@/lib/offline/network'
import { getQuestions, pushToQueue, updateProgressLocally } from '@/lib/offline/db'
import type { OfflineAnswer, CachedQuestion } from '@/lib/offline/db'

interface QuizClientProps {
    questions: QuizQuestion[]
    isGuest: boolean
    guestSessionId?: string
    subject: string
    classStandard: number
    chapter?: string
}

const SEEN_QUESTIONS_KEY = 'looplearn_seen_questions'

// ============================================================
// ⏱️  UNIVERSAL TIME LOCK
// Set to 0 to disable (e.g. during exams / test season).
// Set to a positive number (e.g. 10) to re-enable the delay.
// Last changed: 2026-03-13 — disabled for upcoming tests.
// ============================================================
const TIMELOCK_DURATION = 0  // seconds (0 = disabled)

// Simple SM-2 SRS calculation (mirrors server-side algorithm)
function calculateSRS(existing: { easeFactor: number; intervalDays: number; repetitions: number } | null, quality: 0 | 1 | 2 | 3) {
    const ef = existing?.easeFactor ?? 2.5
    const interval = existing?.intervalDays ?? 0
    const reps = existing?.repetitions ?? 0

    let newEF = ef + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02))
    if (newEF < 1.3) newEF = 1.3

    let newInterval: number
    let newReps: number

    if (quality < 2) {
        newInterval = 1
        newReps = 0
    } else {
        newReps = reps + 1
        if (reps === 0) newInterval = 1
        else if (reps === 1) newInterval = 6
        else newInterval = Math.round(interval * newEF)
    }

    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

    return {
        easeFactor: Math.round(newEF * 100) / 100,
        intervalDays: newInterval,
        repetitions: newReps,
        nextReviewDate: nextReviewDate.toISOString(),
        lastQuality: quality,
    }
}

export function QuizClient({ questions: initialQuestions, isGuest, guestSessionId, subject, classStandard, chapter }: QuizClientProps) {
    const router = useRouter()
    const isOnline = useIsOnline()
    const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [totalPoints, setTotalPoints] = useState(0)
    const [answered, setAnswered] = useState(false)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [isCorrect, setIsCorrect] = useState(false)
    const [quizFinished, setQuizFinished] = useState(false)
    const [startTime] = useState(new Date())
    const [questionStartTime, setQuestionStartTime] = useState(Date.now())
    const [showExplanation, setShowExplanation] = useState(false)
    const [explanationTimer, setExplanationTimer] = useState(0)
    const [canProceed, setCanProceed] = useState(true)
    const [isChecked, setIsChecked] = useState(false)

    const [canAnswer, setCanAnswer] = useState(TIMELOCK_DURATION === 0)
    const [timeLeft, setTimeLeft] = useState(TIMELOCK_DURATION)

    // Load questions from IndexedDB when offline and server returned none
    useEffect(() => {
        console.log('[QuizClient] Mounted. guestSessionId:', guestSessionId, 'isGuest:', isGuest)
    }, [guestSessionId, isGuest])

    // Load offline questions if needed
    useEffect(() => {
        if (!isOnline && !isGuest && questions.length === 0) {
            getQuestions(subject, classStandard)
                .then((cached) => {
                    if (cached.length > 0) {
                        // Shuffle and take 10
                        const shuffled = cached.sort(() => Math.random() - 0.5).slice(0, 10)
                        setQuestions(shuffled as unknown as QuizQuestion[])
                    }
                })
                .catch((err) => logError('Failed to load offline questions', err))
        }
    }, [isOnline, isGuest, questions.length, subject, classStandard])

    // Timer Effect for Question Reading
    useEffect(() => {
        setQuestionStartTime(Date.now())

        // If time lock is disabled, unlock immediately
        if (TIMELOCK_DURATION === 0) {
            setCanAnswer(true)
            setTimeLeft(0)
            return
        }

        // Reset lock state for new question
        setCanAnswer(false)
        setTimeLeft(TIMELOCK_DURATION)

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setCanAnswer(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        // Cleanup on unmount or next question
        return () => clearInterval(timer)
    }, [currentIndex])

    // Timer Effect for Explanation
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (showExplanation && explanationTimer > 0) {
            timer = setInterval(() => {
                setExplanationTimer((prev) => {
                    if (prev <= 1) {
                        setCanProceed(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => clearInterval(timer)
    }, [showExplanation, explanationTimer])

    // Handler for "I understand" checkbox
    const handleCheckboxChange = (checked: boolean) => {
        setIsChecked(checked)
        if (checked && explanationTimer > 5) {
            setExplanationTimer(5)
        }
    }

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

            // Update progress
            const timeTaken = Math.round((Date.now() - questionStartTime) / 1000)

            if (isGuest && isOnline && guestSessionId) {
                const res = await logGuestAnswer({
                    sessionId: guestSessionId,
                    questionId: currentQuestion.id,
                    givenAnswer: answer,
                    isCorrect: correct,
                    timeTakenSeconds: timeTaken
                })
                if (res.error) console.error('[Guest] logGuestAnswer failed:', res.error)
            } else if (!isGuest) {

                if (isOnline) {
                    // Online: call server actions as normal
                    await logAnswer({
                        questionId: currentQuestion.id,
                        givenAnswer: answer,
                        isCorrect: correct,
                        questionType: currentQuestion.question_type,
                        timeTaken
                    })
                    const quality = 3
                    await updateProgress({ questionId: currentQuestion.id, quality })
                    await awardPoints(points)
                } else {
                    // Offline: queue the answer for later sync
                    const srsUpdate = calculateSRS(null, 3)
                    const entry: OfflineAnswer = {
                        id: `${currentQuestion.id}-${Date.now()}`,
                        questionId: currentQuestion.id,
                        givenAnswer: answer,
                        isCorrect: correct,
                        questionType: currentQuestion.question_type,
                        timeTaken,
                        answeredAt: new Date().toISOString(),
                        pointsEarned: points,
                        srsUpdate,
                    }
                    await pushToQueue(entry).catch((e) => logError('Failed to queue answer', e))
                    await updateProgressLocally({
                        question_id: currentQuestion.id,
                        ease_factor: srsUpdate.easeFactor,
                        interval_days: srsUpdate.intervalDays,
                        repetitions: srsUpdate.repetitions,
                        next_review_date: srsUpdate.nextReviewDate,
                        last_reviewed: new Date().toISOString(),
                        last_quality: 3,
                    }).catch((e) => logError('Failed to update local progress', e))
                }
            }
        } else {
            // Wrong answer
            const explanation = currentQuestion.answer_explanation ||
                currentQuestion.question_options?.find(o => o.is_correct)?.explanation

            if (explanation) {
                setShowExplanation(true)
                setExplanationTimer(15)
                setCanProceed(false)
                setIsChecked(false)
            } else {
                setCanProceed(true)
            }

            const timeTaken = Math.round((Date.now() - questionStartTime) / 1000)

            if (isGuest && isOnline && guestSessionId) {
                const res = await logGuestAnswer({
                    sessionId: guestSessionId,
                    questionId: currentQuestion.id,
                    givenAnswer: answer,
                    isCorrect: correct,
                    timeTakenSeconds: timeTaken
                })
                if (res.error) console.error('[Guest] logGuestAnswer failed:', res.error)
            } else if (!isGuest) {

                if (isOnline) {
                    await logAnswer({
                        questionId: currentQuestion.id,
                        givenAnswer: answer,
                        isCorrect: correct,
                        questionType: currentQuestion.question_type,
                        timeTaken
                    })
                    await updateProgress({ questionId: currentQuestion.id, quality: 0 })
                } else {
                    const srsUpdate = calculateSRS(null, 0)
                    const entry: OfflineAnswer = {
                        id: `${currentQuestion.id}-${Date.now()}`,
                        questionId: currentQuestion.id,
                        givenAnswer: answer,
                        isCorrect: false,
                        questionType: currentQuestion.question_type,
                        timeTaken,
                        answeredAt: new Date().toISOString(),
                        pointsEarned: 0,
                        srsUpdate,
                    }
                    await pushToQueue(entry).catch((e) => logError('Failed to queue answer', e))
                    await updateProgressLocally({
                        question_id: currentQuestion.id,
                        ease_factor: srsUpdate.easeFactor,
                        interval_days: srsUpdate.intervalDays,
                        repetitions: srsUpdate.repetitions,
                        next_review_date: srsUpdate.nextReviewDate,
                        last_reviewed: new Date().toISOString(),
                        last_quality: 0,
                    }).catch((e) => logError('Failed to update local progress', e))
                }
            }
        }
    }

    const handleNext = () => {
        if (!canProceed) return

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setAnswered(false)
            setSelectedAnswer(null)
            setIsCorrect(false)
            setShowExplanation(false)
            setCanProceed(true)
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
        // Simple return to topic selection
        router.push('/#guest-access')
    }

    const handleExit = () => {
        // Go back to setup (Home page where GuestQuizSetup is)
        router.push('/#guest-access')
    }

    const handleRestart = () => {
        // Redirect registered users to dashboard to select another quiz
        router.push('/dashboard')
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Progress Bar */}
                <QuizProgress
                    current={currentIndex + 1}
                    total={questions.length}
                    progress={progress}
                    points={totalPoints}
                />

                {/* Time Lock Progress Bar */}
                {!canAnswer && (
                    <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-fredoka font-medium text-indigo-800 flex items-center gap-2">
                                <span>👓</span> Read question carefully
                            </span>
                            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                You can submit in {timeLeft}s
                            </span>
                        </div>
                        <div className="h-2 w-full bg-indigo-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-linear"
                                style={{ width: `${TIMELOCK_DURATION > 0 ? ((TIMELOCK_DURATION - timeLeft) / TIMELOCK_DURATION) * 100 : 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Question Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mt-6">
                    {['mcq', 'truefalse'].includes(currentQuestion.question_type) ? (
                        <MCQQuestion
                            key={currentQuestion.id}
                            question={currentQuestion}
                            onAnswer={handleAnswer}
                            answered={answered}
                            selectedAnswer={selectedAnswer}
                            disabled={!canAnswer}
                        />
                    ) : (
                        <FillBlankQuestion
                            key={currentQuestion.id}
                            question={currentQuestion}
                            onAnswer={handleAnswer}
                            answered={answered}
                            userAnswer={selectedAnswer}
                            disabled={!canAnswer}
                        />
                    )}

                    {/* Feedback & Next Button */}
                    {answered && (
                        <div className="mt-6 space-y-4">
                            {/* Standard Feedback OR Explanation Card */}
                            {showExplanation ? (
                                <div className="bg-white border-2 border-soft-red rounded-2xl overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-300">
                                    {/* Header */}
                                    <div className="bg-soft-red/10 p-4 border-b border-soft-red/20">
                                        <div className="flex items-center gap-2 text-soft-red font-bold text-xl">
                                            <span>❌</span> Incorrect Answer
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {/* Correct Answer Section */}
                                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                            <p className="text-sm text-green-700 font-bold uppercase mb-1">Correct Answer</p>
                                            <p className="text-lg font-fredoka font-medium text-green-900">
                                                {getCorrectAnswer(currentQuestion)}
                                            </p>
                                        </div>

                                        {/* Explanation Section */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-indigo-600 font-bold">
                                                <span>💡</span> Explanation
                                            </div>
                                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                                                <FormulaText>
                                                    {currentQuestion.answer_explanation ||
                                                        currentQuestion.question_options?.find(o => o.is_correct)?.explanation ||
                                                        "Review this topic to understand better."}
                                                </FormulaText>
                                            </p>
                                        </div>

                                        {/* Timer & Checkbox Control */}
                                        <div className="border-t pt-4">
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-medium">
                                                    <span>⏳</span>
                                                    {explanationTimer > 0
                                                        ? `Next question in ${explanationTimer} seconds`
                                                        : "You can proceed"}
                                                </div>

                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => handleCheckboxChange(e.target.checked)}
                                                            className="w-6 h-6 border-2 border-gray-300 rounded-lg text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all checked:scale-110"
                                                        />
                                                    </div>
                                                    <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors select-none">
                                                        I understand
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Standard Feedback for correct answer or no explanation */
                                <div
                                    className={`p-4 rounded-xl ${isCorrect
                                        ? 'bg-loop-green/10 border-2 border-loop-green'
                                        : 'bg-destructive/10 border-2 border-destructive'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{isCorrect ? '🎉' : '❌'}</span>
                                        <div>
                                            <p className={`font-fredoka font-bold text-lg ${isCorrect ? 'text-loop-green' : 'text-destructive'}`}>
                                                {isCorrect ? '🎉 Awesome!' : 'Incorrect'}
                                            </p>
                                            {!isCorrect && (
                                                <p className="text-sm text-foreground/70 font-fredoka mt-1">
                                                    The correct answer is: <strong>{getCorrectAnswer(currentQuestion)}</strong>
                                                </p>
                                            )}
                                            {isCorrect && (
                                                <p className="text-sm text-loop-green font-fredoka font-semibold mt-1">
                                                    +{currentQuestion.points || 10} points!
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Next Button */}
                            <button
                                onClick={handleNext}
                                disabled={!canProceed}
                                className={`w-full font-fredoka font-bold text-lg py-5 rounded-2xl transition-all shadow-xl
                                    ${canProceed
                                        ? 'bg-loop-blue hover:bg-loop-blue/90 text-white transform hover:scale-105 cursor-pointer'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                style={{ minHeight: 'var(--touch-target-min)' }}
                            >
                                {canProceed
                                    ? (currentIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz 🎊')
                                    : `Wait ${explanationTimer}s to continue...`
                                }
                            </button>
                        </div>
                    )}
                </div>

                {/* Guest Reminder */}
                {isGuest && (
                    <div className="mt-6 bg-loop-yellow/20 border-2 border-loop-yellow rounded-2xl p-4 text-center">
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
    if (['mcq', 'truefalse'].includes(question.question_type)) {
        const correct = question.question_options?.find(o => o.is_correct)
        return correct?.option_text || 'N/A'
    } else {
        const primary = question.fillblank_answers?.find(a => a.is_primary)
        return primary?.accepted_answer || question.fillblank_answers?.[0]?.accepted_answer || 'N/A'
    }
}
