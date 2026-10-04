import { getWebSubmissionsAction } from '@/app/actions/web-submit'
import { WebSubmissionsClient } from '@/components/teacher/web-submissions-client'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TeacherWebSubmissionsPage() {
    // Publicly accessible dashboard — no auth required
    const result = await getWebSubmissionsAction()
    const submissions = result.data || []

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🌐</span>
                            <h1 className="text-xl font-bold text-gray-900 font-fredoka">Web Submissions Dashboard</h1>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Real-time tracking for dictation word lists &amp; Q&amp;A homework submitted via /submit
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/teacher/hub/planner"
                            className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            ← Teacher Hub
                        </Link>
                        <a
                            href="/submit"
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        >
                            🚀 Public /submit Link
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <WebSubmissionsClient initialSubmissions={submissions} />
            </main>
        </div>
    )
}
