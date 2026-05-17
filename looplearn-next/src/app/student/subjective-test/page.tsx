import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAvailableSubjectiveTests } from '@/app/actions/subjective'
import Link from 'next/link'

const TYPE_ICON: Record<string, string> = {
    mathematics: '📐',
    science: '🔬',
    physics: '⚡',
    chemistry: '🧪',
    biology: '🌱',
}

export default async function StudentSubjectiveTestsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const result = await getAvailableSubjectiveTests()
    const tests = result.data || []

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">✍️ Answer Evaluation</h1>
                        <p className="text-sm text-gray-500">Upload handwritten answers · Get AI feedback instantly</p>
                    </div>
                    <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        ← Dashboard
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                {tests.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">📭</div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">No tests available yet</h2>
                        <p className="text-gray-500 text-sm">Your teacher hasn&apos;t created any subjective tests for your class yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">{tests.length} test{tests.length !== 1 ? 's' : ''} available for your class</p>

                        {tests.map((test: any) => (
                            <Link
                                key={test.id}
                                href={`/student/subjective-test/${test.id}`}
                                className="block bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-violet-300 transition-all p-5 group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{TYPE_ICON[test.subject] || '📝'}</span>
                                        <div>
                                            <p className="font-semibold text-gray-800 group-hover:text-violet-700 transition-colors">{test.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {test.subject.charAt(0).toUpperCase() + test.subject.slice(1)}
                                                {test.chapter ? ` · ${test.chapter}` : ''}
                                                {' · '}{test.subjective_questions?.length || 0} questions
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <span className="inline-block bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-semibold">
                                            {test.total_marks} marks
                                        </span>
                                        {test.already_submitted && (
                                            <p className="text-xs text-green-600 mt-1 font-medium">✅ Submitted</p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
