import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QuestionGenerator } from '@/components/teacher/question-generator'
import Link from 'next/link'

export default async function GeneratorPage() {
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
        // Not a teacher? Redirect to dashboard
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Teacher Dashboard</h1>
                        <p className="text-sm text-gray-500">AI Content Generation Tools</p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Question Generator</h2>
                    <p className="text-gray-600">
                        Create high-quality quiz content in seconds using loopLearn AI.
                        Just specify the topic and level, and let the AI do the heavy lifting.
                    </p>
                </div>

                {/* PDF Mode Banner */}
                <Link
                    href="/teacher/generator/pdf"
                    className="group flex items-center gap-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 mb-4 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all text-white"
                >
                    <span className="text-4xl">📄</span>
                    <div className="flex-1">
                        <p className="font-bold text-lg">Generate from Chapter PDF</p>
                        <p className="text-violet-200 text-sm">
                            Upload a PDF and Gemini will read it and create questions directly from the content — no typing needed.
                        </p>
                    </div>
                    <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                </Link>

                {/* Subjective Evaluator Banner */}
                <Link
                    href="/teacher/subjective-test"
                    className="group flex items-center gap-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 mb-8 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all text-white"
                >
                    <span className="text-4xl">✍️</span>
                    <div className="flex-1">
                        <p className="font-bold text-lg">New: AI Answer Evaluator</p>
                        <p className="text-emerald-100 text-sm">
                            Students upload handwritten answers — Gemini grades them stepwise with marks &amp; feedback, like a real examiner.
                        </p>
                    </div>
                    <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                </Link>

                <QuestionGenerator />

            </main>
        </div>
    )
}
