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

                <QuestionGenerator />

            </main>
        </div>
    )
}
