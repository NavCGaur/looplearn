import { getTodaySubmissionStatus } from '@/app/actions/homework'
import { HubTabBar } from '@/components/teacher/hub/hub-tab-bar'
import { DailyTrackerTable } from '@/components/teacher/hub/daily-tracker-table'

export const dynamic = 'force-dynamic'

const CLASSES = [6, 7, 8, 9, 10]
const SUBJECTS = ['Maths', 'Science', 'English', 'SST', 'Hindi']

export default async function TrackerPage() {
    // Fetch today's data for all class+subject combos that have a plan
    const results = await Promise.all(
        CLASSES.flatMap(cls =>
            SUBJECTS.map(sub => getTodaySubmissionStatus(cls, sub))
        )
    )
    // Only keep those that have a plan today
    const active = results.filter(r => r.plan !== null)

    const todayStr = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long',
        timeZone: 'Asia/Kolkata',
    })

    return (
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-gray-900">
                        Daily Tracker
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">{todayStr}</p>
                </div>
                <HubTabBar />
            </div>

            {active.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                    <p className="text-4xl mb-3">📅</p>
                    <p className="text-gray-500 font-medium">No homework scheduled for today.</p>
                    <p className="text-gray-400 text-sm mt-1">Add plans in the Weekly Planner.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {active.map(({ plan, submissions }) => (
                        <DailyTrackerTable
                            key={plan!.id}
                            plan={plan!}
                            submissions={submissions}
                        />
                    ))}
                </div>
            )}
        </main>
    )
}
