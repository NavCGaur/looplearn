import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAnalyticsDashboard } from '@/app/actions/analytics'
import { AnalyticsDashboardClient } from '@/components/teacher/analytics-dashboard-client'

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Check if user is a teacher
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, display_name')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
        redirect('/dashboard')
    }

    // Fetch analytics data
    const analyticsData = await getAnalyticsDashboard({ timeRange: '30' })

    if (!analyticsData) {
        redirect('/dashboard')
    }

    return <AnalyticsDashboardClient initialData={analyticsData} teacherName={profile.display_name} />
}
