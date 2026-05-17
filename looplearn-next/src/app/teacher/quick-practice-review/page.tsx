import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getQuickPracticeSubmissions } from '@/app/actions/subjective'
import { QuickPracticeReviewClient, type Submission } from '@/components/teacher/quick-practice-review-client'
import Link from 'next/link'

export default async function QuickPracticeReviewPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['teacher', 'admin'].includes(profile.role)) {
        redirect('/dashboard')
    }

    const result = await getQuickPracticeSubmissions()
    const rawSubmissions = result.data || []
    const submissions = rawSubmissions.map((sub: any) => ({
        ...sub,
        profiles: Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles
    })) as unknown as Submission[]

    // Summary metrics
    const okSubs = submissions.filter((s: any) => s.status === 'ok')
    const flagged = submissions.filter((s: any) => s.teacher_flag)
    const errorCount = submissions.filter((s: any) => s.status === 'error').length
    const avgPct = okSubs.length > 0
        ? Math.round(okSubs.reduce((sum: number, s: any) =>
            sum + (s.max_marks > 0 ? (s.total_marks / s.max_marks) * 100 : 0), 0) / okSubs.length)
        : null

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">📋 Quick Practice Review</h1>
                        <p className="text-sm text-gray-500">
                            View student submissions · See what Gemini evaluated · Flag incorrect gradings
                        </p>
                    </div>
                    <Link
                        href="/teacher/subjective-test"
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        ← Answer Evaluator
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-6xl">

                {/* Metrics strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
                        <p className="text-3xl font-black text-gray-800">{submissions.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Total Submissions</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
                        <p className="text-3xl font-black text-violet-700">{avgPct !== null ? `${avgPct}%` : '—'}</p>
                        <p className="text-xs text-gray-500 mt-1">Avg Score</p>
                    </div>
                    <div className={`rounded-xl border shadow-sm p-4 text-center ${flagged.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
                        <p className={`text-3xl font-black ${flagged.length > 0 ? 'text-amber-600' : 'text-gray-800'}`}>{flagged.length}</p>
                        <p className="text-xs text-gray-500 mt-1">🚩 Flagged</p>
                    </div>
                    <div className={`rounded-xl border shadow-sm p-4 text-center ${errorCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                        <p className={`text-3xl font-black ${errorCount > 0 ? 'text-red-600' : 'text-gray-800'}`}>{errorCount}</p>
                        <p className="text-xs text-gray-500 mt-1">⚠️ Errors</p>
                    </div>
                </div>

                {submissions.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">📭</div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">No submissions yet</h2>
                        <p className="text-gray-500 text-sm">Student quick practice results will appear here once they start submitting.</p>
                    </div>
                ) : (
                    <QuickPracticeReviewClient submissions={submissions} />
                )}
            </main>
        </div>
    )
}
