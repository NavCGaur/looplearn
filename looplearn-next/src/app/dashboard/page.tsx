import { getDashboardData } from '@/app/actions/dashboard'
import { getTeacherDashboardData } from '@/app/actions/teacher-dashboard'
import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { TeacherDashboardClient } from '@/components/dashboard/teacher-dashboard-client'

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string }>
}) {
    const params = await searchParams
    const isStudentView = params?.view === 'student'

    // First, get basic user info to determine role
    // We can reuse getDashboardData for this since it returns role
    const studentData = await getDashboardData()
    const isTeacher = studentData.user.role === 'teacher' || studentData.user.role === 'admin'

    // If teacher and NOT explicitly asking for student view, show teacher dashboard
    if (isTeacher && !isStudentView) {
        const teacherData = await getTeacherDashboardData()

        // Fallback to student dashboard if fetching teacher data fails (shouldn't happen given logic)
        if (teacherData) {
            return <TeacherDashboardClient data={teacherData} />
        }
    }

    // Default to student dashboard
    return <DashboardClient data={studentData} />
}
