'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveHomeworkPlan, getNextHwNumber, HomeworkPlan } from '@/app/actions/homework'
import { Loader2, Save, ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const CLASSES = [6, 7, 8, 9, 10]
const SUBJECTS = ['Maths', 'Science', 'English', 'SST', 'Hindi']

interface WeeklyPlannerGridProps {
    weekStart: string
    initialPlans: HomeworkPlan[]
}

interface CellState {
    task_description: string
    hw_number: number
    due_time: string
    saving: boolean
    saved: boolean
    error: string | null
}

type GridKey = `${number}-${string}-${number}` // class-subject-dayOfWeek

function makeKey(cls: number, subject: string, day: number): GridKey {
    return `${cls}-${subject}-${day}`
}

function getMonday(weekStart: string): Date {
    const d = new Date(weekStart)
    d.setUTCHours(0, 0, 0, 0)
    return d
}

function formatWeekLabel(weekStart: string): string {
    const mon = getMonday(weekStart)
    const sat = new Date(mon)
    sat.setDate(mon.getDate() + 5)
    return `${mon.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${sat.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

function shiftWeek(weekStart: string, delta: number): string {
    const d = getMonday(weekStart)
    d.setDate(d.getDate() + delta * 7)
    return d.toISOString().split('T')[0]
}

export function WeeklyPlannerGrid({ weekStart, initialPlans }: WeeklyPlannerGridProps) {
    const router = useRouter()
    const [, startTransition] = useTransition()

    // Build initial cell state from loaded plans
    const initCells = (): Record<GridKey, CellState> => {
        const map: Record<string, CellState> = {}
        for (const p of initialPlans) {
            const key = makeKey(p.class_standard, p.subject, p.day_of_week)
            map[key] = {
                task_description: p.task_description,
                hw_number: p.hw_number,
                due_time: p.due_time ?? '18:00',
                saving: false,
                saved: true,
                error: null,
            }
        }
        return map as Record<GridKey, CellState>
    }

    const [cells, setCells] = useState<Record<GridKey, CellState>>(initCells)
    const [activeCell, setActiveCell] = useState<GridKey | null>(null)

    const getCell = (key: GridKey): CellState =>
        cells[key] ?? { task_description: '', hw_number: 0, due_time: '18:00', saving: false, saved: false, error: null }

    const updateCell = (key: GridKey, patch: Partial<CellState>) =>
        setCells(prev => ({ ...prev, [key]: { ...getCell(key), ...patch } }))

    const handleSave = async (cls: number, subject: string, dayIndex: number) => {
        const day = dayIndex + 1
        const key = makeKey(cls, subject, day)
        const cell = getCell(key)
        if (!cell.task_description.trim()) return

        updateCell(key, { saving: true, error: null })

        // Auto-assign HW number if not set
        let hwNum = cell.hw_number
        if (!hwNum) {
            hwNum = await getNextHwNumber(cls, subject)
            updateCell(key, { hw_number: hwNum })
        }

        const res = await saveHomeworkPlan({
            class_standard: cls,
            subject,
            day_of_week: day,
            week_start: weekStart,
            hw_number: hwNum,
            task_description: cell.task_description.trim(),
            due_time: cell.due_time + ':00',
        })

        if (res.success) {
            updateCell(key, { saving: false, saved: true })
        } else {
            updateCell(key, { saving: false, error: res.error ?? 'Save failed' })
        }
    }

    const navigateWeek = (delta: number) => {
        const newWeek = shiftWeek(weekStart, delta)
        startTransition(() => router.push(`/teacher/hub/planner?week=${newWeek}`))
    }

    return (
        <div className="space-y-6">
            {/* Week header */}
            <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
                <button
                    onClick={() => navigateWeek(-1)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Prev Week
                </button>
                <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Week</p>
                    <p className="text-base font-bold text-gray-800">{formatWeekLabel(weekStart)}</p>
                </div>
                <button
                    onClick={() => navigateWeek(1)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    Next Week <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Grid: one section per class */}
            {CLASSES.map(cls => (
                <div key={cls} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
                        <h2 className="font-bold text-indigo-700 font-fredoka text-lg">Class {cls}</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 w-24">Subject</th>
                                    {DAYS.map(d => (
                                        <th key={d} className="text-center px-2 py-2 text-xs font-semibold text-gray-400 min-w-[140px]">{d}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {SUBJECTS.map(subject => (
                                    <tr key={subject} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-4 py-2 font-semibold text-gray-700">{subject}</td>
                                        {DAYS.map((_, dayIdx) => {
                                            const key = makeKey(cls, subject, dayIdx + 1)
                                            const cell = getCell(key)
                                            const isActive = activeCell === key
                                            return (
                                                <td key={dayIdx} className="px-2 py-2">
                                                    <div
                                                        className={`rounded-xl border transition-all ${
                                                            cell.saved && cell.task_description
                                                                ? 'border-green-200 bg-green-50'
                                                                : isActive
                                                                    ? 'border-indigo-300 bg-indigo-50'
                                                                    : 'border-gray-200 bg-gray-50'
                                                        }`}
                                                    >
                                                        <textarea
                                                            value={cell.task_description}
                                                            onFocus={() => setActiveCell(key)}
                                                            onBlur={() => setActiveCell(null)}
                                                            onChange={e => updateCell(key, {
                                                                task_description: e.target.value,
                                                                saved: false,
                                                            })}
                                                            placeholder="Add task…"
                                                            rows={2}
                                                            className="w-full bg-transparent px-2 py-1.5 text-xs text-gray-700 placeholder-gray-300 resize-none focus:outline-none"
                                                        />
                                                        {cell.task_description.trim() && (
                                                            <div className="flex items-center justify-between px-2 pb-1.5 gap-1">
                                                                <input
                                                                    type="time"
                                                                    value={cell.due_time}
                                                                    onChange={e => updateCell(key, { due_time: e.target.value, saved: false })}
                                                                    className="text-xs bg-transparent text-gray-400 w-20 focus:outline-none"
                                                                />
                                                                <button
                                                                    onClick={() => handleSave(cls, subject, dayIdx)}
                                                                    disabled={cell.saving}
                                                                    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg font-semibold transition-all ${
                                                                        cell.saved
                                                                            ? 'text-green-600 bg-green-100'
                                                                            : 'text-white bg-indigo-500 hover:bg-indigo-600'
                                                                    }`}
                                                                >
                                                                    {cell.saving ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                    ) : (
                                                                        <Save className="w-3 h-3" />
                                                                    )}
                                                                    {cell.saved ? 'Saved' : 'Save'}
                                                                </button>
                                                            </div>
                                                        )}
                                                        {cell.error && (
                                                            <p className="text-xs text-red-500 px-2 pb-1">{cell.error}</p>
                                                        )}
                                                    </div>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    )
}
