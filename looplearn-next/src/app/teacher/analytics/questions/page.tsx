import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getQuestionPerformance } from '@/app/actions/analytics'
import { QuestionInsightsClient } from '@/components/teacher/question-insights-client'

export default async function QuestionInsightsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Check if user is a teacher
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
        redirect('/dashboard')
    }

    // Fetch question performance data
    const questions = await getQuestionPerformance({ timeRange: 'all' })

    return <QuestionInsightsClient questions={questions} />
}
