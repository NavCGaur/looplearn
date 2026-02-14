'use client'

import Link from 'next/link'

interface QuizResultProps {
    score: number
    totalQuestions: number
    points: number
    timeTaken: number
    isGuest: boolean
    onRestart?: () => void
    onLoadMore?: () => void
    onExit?: () => void
}

export function QuizResult({ score, totalQuestions, points, timeTaken, isGuest, onRestart, onLoadMore, onExit }: QuizResultProps) {
    const percentage = Math.round((score / totalQuestions) * 100)
    const minutes = Math.floor(timeTaken / 60)
    const seconds = timeTaken % 60

    const getMessage = () => {
        if (percentage === 100) return { emoji: '🏆', text: 'Perfect Score!', color: 'text-yellow-600' }
        if (percentage >= 80) return { emoji: '🎉', text: 'Excellent!', color: 'text-green-600' }
        if (percentage >= 60) return { emoji: '👍', text: 'Good Job!', color: 'text-blue-600' }
        if (percentage >= 40) return { emoji: '💪', text: 'Keep Practicing!', color: 'text-orange-600' }
        return { emoji: '📚', text: 'Keep Learning!', color: 'text-purple-600' }
    }

    const message = getMessage()

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-8xl mb-4 animate-bounce">{message.emoji}</div>
                    <h1 className={`text-4xl font-bold mb-2 ${message.color}`}>{message.text}</h1>
                    <p className="text-gray-600">Quiz Complete!</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                        <div className="text-4xl font-bold text-blue-600">{score}/{totalQuestions}</div>
                        <div className="text-sm text-gray-600 mt-1">Correct Answers</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                        <div className="text-4xl font-bold text-green-600">{percentage}%</div>
                        <div className="text-sm text-gray-600 mt-1">Accuracy</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 text-center">
                        <div className="text-4xl font-bold text-yellow-600">⭐ {points}</div>
                        <div className="text-sm text-gray-600 mt-1">Points Earned</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                        <div className="text-4xl font-bold text-purple-600">
                            {minutes}:{seconds.toString().padStart(2, '0')}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Time Taken</div>
                    </div>
                </div>

                {/* Guest Signup Prompt */}
                {isGuest && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                        <h3 className="text-xl font-bold mb-2">🎯 Save Your Progress!</h3>
                        <p className="text-blue-100 mb-4">
                            Sign up now to track your learning, earn badges, and compete on the leaderboard!
                        </p>
                        <Link
                            href="/auth/signup"
                            className="block w-full bg-white text-blue-600 font-bold py-3 rounded-lg text-center hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                            Create Free Account
                        </Link>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    {isGuest ? (
                        <>
                            <span>🔄</span> Try Quiz Again
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onRestart}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg cursor-pointer"
                            >
                                Try Another Quiz
                            </button>
                            <Link
                                href="/dashboard"
                                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-xl text-center transition-colors cursor-pointer"
                            >
                                Back to Dashboard
                            </Link>
                        </>
                    )}
                </div>

                {/* Encouragement */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    {percentage >= 80 ? (
                        <p>🌟 Amazing work! You&apos;re mastering this topic!</p>
                    ) : (
                        <p>💡 Review the questions and try again to improve your score!</p>
                    )}
                </div>
            </div>
        </div>
    )
}
