import { getWeeklyPlan } from '@/app/actions/homework'
import { HubTabBar } from '@/components/teacher/hub/hub-tab-bar'
import { WeeklyPlannerGrid } from '@/components/teacher/hub/weekly-planner-grid'

export const dynamic = 'force-dynamic'

// Returns the ISO date string of the nearest Monday (upcoming or today)
function getNextMonday(offset = 0): string {
    const d = new Date()
    const day = d.getDay()
    const diff = day === 0 ? 1 : (8 - day) % 7 || 7
    d.setDate(d.getDate() + diff - 7 + offset * 7) // 0=this week, 1=next week
    // Clamp to Monday of current week if today is Mon-Sat
    const monday = new Date(d)
    const todayDay = new Date().getDay()
    if (todayDay >= 1 && todayDay <= 6) {
        const curr = new Date()
        curr.setDate(curr.getDate() - (curr.getDay() - 1))
        return curr.toISOString().split('T')[0]
    }
    // Sunday → next Monday
    const next = new Date()
    next.setDate(next.getDate() + 1)
    return next.toISOString().split('T')[0]
}

export default async function PlannerPage({
    searchParams,
}: {
    searchParams: Promise<{ week?: string }>
}) {
    const params = await searchParams
    const weekStart = params.week ?? getNextMonday()
    const plans = await getWeeklyPlan(weekStart)

    return (
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-gray-900">
                        Teacher Hub
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Plan homework, track submissions, monitor student progress
                    </p>
                </div>
                <HubTabBar />
            </div>
            <WeeklyPlannerGrid weekStart={weekStart} initialPlans={plans} />
        </main>
    )
}
