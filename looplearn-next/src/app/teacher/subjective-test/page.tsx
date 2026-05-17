import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubjectiveTestCreator } from '@/components/teacher/subjective-test-creator'
import { getMySubjectiveTests } from '@/app/actions/subjective'
import Link from 'next/link'

export default async function SubjectiveTestPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
        redirect('/dashboard')
    }

    const testsResult = await getMySubjectiveTests()
    const tests = testsResult.data || []

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">AI Answer Evaluator</h1>
                        <p className="text-sm text-gray-500">Create subjective tests · Gemini grades handwritten answers</p>
                    </div>
                    <Link
                        href="/teacher/generator"
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        ← Generator
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">

                {/* Existing Tests Summary */}
                {tests.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Tests ({tests.length})</h2>
                        <div className="space-y-3">
                            {tests.map((test: any) => {
                                const submissionCount = test.subjective_submissions?.length || 0
                                const avgScore = submissionCount > 0
                                    ? Math.round(
                                        test.subjective_submissions.reduce((s: number, sub: any) => s + (sub.total_marks_awarded || 0), 0) / submissionCount
                                    )
                                    : null

                                return (
                                    <div key={test.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-800">{test.title}</p>
                                            <p className="text-sm text-gray-500">
                                                Class {test.class_standard} · {test.subject} · {test.total_marks} marks
                                                {test.chapter ? ` · ${test.chapter}` : ''}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-violet-700">
                                                {submissionCount} submission{submissionCount !== 1 ? 's' : ''}
                                            </p>
                                            {avgScore !== null && (
                                                <p className="text-xs text-gray-500">Avg: {avgScore}/{test.total_marks}</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* Creator */}
                <section>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Create New Test</h2>
                        <p className="text-gray-500 text-sm">
                            Add 1–6 questions. Students upload handwritten answers and Gemini evaluates them stepwise — like a real CBSE examiner.
                        </p>
                    </div>
                    <SubjectiveTestCreator />
                </section>
            </main>
        </div>
    )
}
