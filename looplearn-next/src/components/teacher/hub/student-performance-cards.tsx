'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Submission {
    marks_obtained: number | null
    max_marks: number | null
    submitted_at: string | null
    homework_plans: {
        subject: string
        hw_number: number
    } | null
}

interface StudentData {
    student: {
        id: string
        display_name: string | null
        class_standard: number | null
        points: number
        whatsapp_phone?: string | null
    }
    history: Submission[]
}

function getSubmissionRate(history: Submission[]): number {
    if (!history.length) return 0
    const submitted = history.filter(h => h.marks_obtained != null).length
    return Math.round((submitted / history.length) * 100)
}

function getAvgScore(history: Submission[]): number | null {
    const scored = history.filter(h => h.marks_obtained != null && h.max_marks != null && h.max_marks > 0)
    if (!scored.length) return null
    const pcts = scored.map(h => (h.marks_obtained! / h.max_marks!) * 100)
    return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
}

function getTrend(history: Submission[]): 'up' | 'down' | 'flat' | null {
    const scored = history
        .filter(h => h.marks_obtained != null && h.max_marks != null && h.max_marks > 0)
        .slice(0, 4) // Last 4
    if (scored.length < 2) return null
    const pcts = scored.map(h => (h.marks_obtained! / h.max_marks!) * 100)
    const first = pcts[pcts.length - 1]
    const last = pcts[0]
    if (last - first > 5) return 'up'
    if (first - last > 5) return 'down'
    return 'flat'
}

// Mini sparkline using SVG
function Sparkline({ history }: { history: Submission[] }) {
    const scored = history
        .filter(h => h.marks_obtained != null && h.max_marks != null && h.max_marks > 0)
        .slice(0, 8)
        .reverse()
    if (scored.length < 2) return <div className="w-16 h-6 bg-gray-100 rounded" />

    const pcts = scored.map(h => (h.marks_obtained! / h.max_marks!) * 100)
    const min = Math.min(...pcts)
    const max = Math.max(...pcts)
    const range = max - min || 1
    const W = 64, H = 24, pad = 2
    const xs = pcts.map((_, i) => pad + (i / (pcts.length - 1)) * (W - pad * 2))
    const ys = pcts.map(p => H - pad - ((p - min) / range) * (H - pad * 2))
    const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')

    return (
        <svg width={W} height={H} className="overflow-visible">
            <polyline
                points={xs.map((x, i) => `${x},${ys[i]}`).join(' ')}
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            {xs.map((x, i) => (
                <circle key={i} cx={x} cy={ys[i]} r="2" fill="#6366f1" />
            ))}
        </svg>
    )
}

export function StudentPerformanceCards({ data }: { data: StudentData[] }) {
    if (!data.length) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-gray-500 font-medium">No students registered yet.</p>
            </div>
        )
    }

    // Sort by class then name
    const sorted = [...data].sort((a, b) => {
        const classDiff = (a.student.class_standard ?? 0) - (b.student.class_standard ?? 0)
        if (classDiff !== 0) return classDiff
        return (a.student.display_name ?? '').localeCompare(b.student.display_name ?? '')
    })

    // Group by class
    const byClass = new Map<number, StudentData[]>()
    for (const d of sorted) {
        const cls = d.student.class_standard ?? 0
        const arr = byClass.get(cls) ?? []
        arr.push(d)
        byClass.set(cls, arr)
    }

    return (
        <div className="space-y-6">
            {[...byClass.entries()].map(([cls, students]) => (
                <div key={cls} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                        <h2 className="font-bold text-indigo-700 font-fredoka text-lg">Class {cls}</h2>
                        <span className="text-xs text-indigo-400">{students.length} students</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {students.map(({ student, history }) => {
                            const rate = getSubmissionRate(history)
                            const avg = getAvgScore(history)
                            const trend = getTrend(history)
                            const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
                            const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-400' : 'text-gray-400'

                            return (
                                <div key={student.id} className="flex items-center px-5 py-4 gap-4 hover:bg-gray-50/40">
                                    {/* Avatar */}
                                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                                        {(student.display_name ?? '?')[0].toUpperCase()}
                                    </div>

                                    {/* Name + phone */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 text-sm truncate">
                                            {student.display_name ?? 'Unknown'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {student.whatsapp_phone
                                                ? `📱 ${student.whatsapp_phone}`
                                                : '❌ No phone'}
                                        </p>
                                    </div>

                                    {/* Submission rate */}
                                    <div className="text-center w-16 shrink-0">
                                        <p className="text-sm font-bold text-gray-700">{rate}%</p>
                                        <p className="text-xs text-gray-400">submitted</p>
                                    </div>

                                    {/* Avg score */}
                                    <div className="text-center w-16 shrink-0">
                                        {avg != null ? (
                                            <>
                                                <p className="text-sm font-bold text-gray-700">{avg}%</p>
                                                <p className="text-xs text-gray-400">avg score</p>
                                            </>
                                        ) : (
                                            <p className="text-xs text-gray-300">—</p>
                                        )}
                                    </div>

                                    {/* Sparkline */}
                                    <div className="shrink-0 hidden sm:block">
                                        <Sparkline history={history} />
                                    </div>

                                    {/* Trend */}
                                    {trend && (
                                        <div className={`shrink-0 ${trendColor}`}>
                                            <TrendIcon className="w-4 h-4" />
                                        </div>
                                    )}

                                    {/* HW count */}
                                    <div className="text-center w-12 shrink-0">
                                        <p className="text-sm font-bold text-gray-700">{history.length}</p>
                                        <p className="text-xs text-gray-400">HWs</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}
