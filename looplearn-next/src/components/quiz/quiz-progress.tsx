'use client'

interface QuizProgressProps {
    current: number
    total: number
    progress: number
    points: number
}

export function QuizProgress({ current, total, progress, points }: QuizProgressProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-4 mt-10">
            {/* Stats Row */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-600">
                        Question {current} of {total}
                    </span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-bold rounded-full">
                        ⭐ {points} pts
                    </span>
                </div>
                <span className="text-sm font-semibold text-gray-600">
                    {Math.round(progress)}%
                </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                >
                    {/* Animated shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
                </div>
            </div>
        </div>
    )
}
