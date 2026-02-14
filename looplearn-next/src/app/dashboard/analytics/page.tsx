import { Suspense } from 'react'
import { getStudentAnalytics } from '@/app/actions/analytics-engine'
import { getDashboardData } from '@/app/actions/dashboard'
import { DashboardNavbar } from '@/components/dashboard/dashboard-navbar'
import { AnalyticsView } from '@/components/dashboard/analytics/analytics-view'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'My Analytics | LoopLearn',
    description: 'Track your learning progress and mastery.',
}

export default async function AnalyticsPage() {
    const analyticsData = await getStudentAnalytics()
    const dashboardData = await getDashboardData()
    const user = dashboardData.user

    if (!analyticsData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-800">Unable to load analytics</h2>
                    <p className="text-gray-500">Please try again later.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            {/* We'll rely on the shared Layout or the component's own header if we don't have a shared layout yet.
                Since DashboardClient and ProfileClient have their own headers, we might need one here too or rely on a layout.
                For now, I'll wrap it in a container and maybe duplicate the header or assume a layout will be added later.
                Actually, to match the style, I should probably use a Client Component wrapper that has the header, 
                OR just put the content here and hope the user navigates back via browser or I add a simple back button.
                
                Better: I'll repurpose the header from DashboardClient into a shared component later, 
                but for now, I'll add a simple header here to be consistent.
            */}

            <DashboardNavbar user={user} />

            <div className="container mx-auto px-4 py-8">
                <Suspense fallback={<LoadingSpinner size="lg" message="Analyzing your progress..." />}>
                    <AnalyticsView data={analyticsData} />
                </Suspense>
            </div>
        </div>
    )
}
