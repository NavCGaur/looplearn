import { Suspense } from 'react'
import { getStudentAnalytics } from '@/app/actions/analytics-engine'
import { AnalyticsView } from '@/components/dashboard/analytics/analytics-view'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { TeacherNavbar } from '@/components/dashboard/teacher-navbar'
import { createClient } from '@/lib/supabase/server'

// Correct usage of params in Next.js 15+ (ensure params is treated as async/awaitable if needed, or proper type)
// Actually in Next 14/15 Page props params is an object, but let's be safe.
export default async function StudentAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const analyticsData = await getStudentAnalytics(id)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get teacher profile for name
    const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user?.id)
        .single()

    const navbarUser = {
        name: profile?.display_name || user?.email || 'Teacher',
        email: user?.email
    }

    if (!analyticsData) {
        return (
            <div className="min-h-screen bg-gray-50">
                <TeacherNavbar user={navbarUser} />
                <div className="flex items-center justify-center p-4 min-h-[80vh]">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-800">Unable to load student data</h2>
                        <p className="text-gray-500">Student not found or access denied.</p>
                        <Link href="/dashboard/teacher/students" className="mt-4 text-blue-600 hover:underline block">
                            Back to Students
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <TeacherNavbar user={navbarUser} />
            <div className="p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <Link
                        href="/dashboard/teacher/students"
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Students List
                    </Link>

                    <Suspense fallback={<LoadingSpinner size="lg" message="Loading student analytics..." />}>
                        <AnalyticsView data={analyticsData} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
