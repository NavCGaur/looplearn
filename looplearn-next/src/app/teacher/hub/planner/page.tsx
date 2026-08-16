import Link from 'next/link'
import { getWeeklyPlan } from '@/app/actions/homework'
import { getActivePilotWeek, getPilotCohortAnalytics } from '@/app/actions/planner_actions'
import { HubTabBar } from '@/components/teacher/hub/hub-tab-bar'
import { WeeklyPlannerGrid } from '@/components/teacher/hub/weekly-planner-grid'
import { FoundationPlanner } from '@/components/teacher/hub/foundation-planner'
import { Sparkles, ClipboardList } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Returns the ISO date string of the nearest Monday (upcoming or today)
function getNextMonday(offset = 0): string {
    const d = new Date()
    const day = d.getDay()
    const diff = day === 0 ? 1 : (8 - day) % 7 || 7
    d.setDate(d.getDate() + diff - 7 + offset * 7) // 0=this week, 1=next week
    const monday = new Date(d)
    const todayDay = new Date().getDay()
    if (todayDay >= 1 && todayDay <= 6) {
        const curr = new Date()
        curr.setDate(curr.getDate() - (curr.getDay() - 1))
        return curr.toISOString().split('T')[0]
    }
    const next = new Date()
    next.setDate(next.getDate() + 1)
    return next.toISOString().split('T')[0]
}

export default async function PlannerPage({
    searchParams,
}: {
    searchParams: Promise<{ week?: string; mode?: string }>
}) {
    const params = await searchParams
    const weekStart = params.week ?? getNextMonday()
    const mode = params.mode ?? 'foundation' // Default to our new high-fidelity foundation prompter

    // Fetch data based on active planner mode
    const plans = await getWeeklyPlan(weekStart)
    const activeData = await getActivePilotWeek()
    let analytics = null

    if (activeData.activeWeek && activeData.cohort) {
        analytics = await getPilotCohortAnalytics(activeData.cohort.id, activeData.activeWeek.id)
    }

    return (
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
            {/* Header tab navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-gray-900">
                        Teacher Hub
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Plan lessons, guide classroom lectures, and view real-time student analytics
                    </p>
                </div>
                <HubTabBar />
            </div>

            {/* Mode selection tabs */}
            <div className="flex border-b border-gray-200">
                <Link
                    href={`/teacher/hub/planner?mode=foundation&week=${weekStart}`}
                    className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
                        mode === 'foundation'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <Sparkles className="w-4 h-4" /> English Foundation Cockpit
                </Link>
                <Link
                    href={`/teacher/hub/planner?mode=cbse&week=${weekStart}`}
                    className={`flex items-center gap-2 py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
                        mode === 'cbse'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <ClipboardList className="w-4 h-4" /> CBSE Class Homework Grid
                </Link>
            </div>

            {/* Main content render */}
            {mode === 'foundation' && activeData.activeWeek && analytics ? (
                <FoundationPlanner
                    cohort={activeData.cohort}
                    activeWeek={activeData.activeWeek}
                    phases={activeData.phases}
                    analytics={analytics}
                />
            ) : (
                <WeeklyPlannerGrid weekStart={weekStart} initialPlans={plans} />
            )}
        </main>
    )
}
