import { getStudentsList } from '@/app/actions/teacher-dashboard'
import { getStudentPerformanceHistory } from '@/app/actions/homework'
import { HubTabBar } from '@/components/teacher/hub/hub-tab-bar'
import { StudentPerformanceCards } from '@/components/teacher/hub/student-performance-cards'

export const dynamic = 'force-dynamic'

export default async function PerformancePage() {
    const students = await getStudentsList()

    // Load performance history for each student in parallel (max 50)
    const histories = await Promise.all(
        students.slice(0, 50).map(async st => ({
            student: st,
            history: (await getStudentPerformanceHistory(st.id)) as any,
        }))
    )

    return (
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-gray-900">
                        Student Performance
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Submission rates and marks trends across all students
                    </p>
                </div>
                <HubTabBar />
            </div>
            <StudentPerformanceCards data={histories} />
        </main>
    )
}
