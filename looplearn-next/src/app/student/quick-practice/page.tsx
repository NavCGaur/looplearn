import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QuickPracticeUploader } from '@/components/student/quick-practice-uploader'
import Link from 'next/link'

export default async function QuickPracticePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">📝 Quick Practice</h1>
                        <p className="text-sm text-gray-500">
                            Write questions + answers on paper · Photograph it · Get instant AI feedback
                        </p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        ← Dashboard
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-2xl">

                {/* What is this? */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white">
                    <h2 className="text-lg font-bold mb-2">How Quick Practice works</h2>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                            <div className="text-3xl mb-1">✏️</div>
                            <p className="font-semibold">Write</p>
                            <p className="opacity-80 text-xs mt-0.5">Solve questions on paper in the format shown</p>
                        </div>
                        <div>
                            <div className="text-3xl mb-1">📷</div>
                            <p className="font-semibold">Photograph</p>
                            <p className="opacity-80 text-xs mt-0.5">Take a clear, well-lit photo of your sheet</p>
                        </div>
                        <div>
                            <div className="text-3xl mb-1">🤖</div>
                            <p className="font-semibold">Get Feedback</p>
                            <p className="opacity-80 text-xs mt-0.5">AI Examiner grades like a real CBSE examiner</p>
                        </div>
                    </div>
                </div>

                {/* AI disclaimer */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                    <p className="font-semibold mb-1">⚠️ AI Grading Note</p>
                    <p>
                        This uses LoopLearnX AI Reviewer to read your handwriting and evaluate answers. Results may vary for very
                        messy writing or if the format is not followed. Your teacher can always re-check if needed.
                    </p>
                </div>

                {/* Uploader */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <QuickPracticeUploader />
                </div>
            </main>
        </div>
    )
}
