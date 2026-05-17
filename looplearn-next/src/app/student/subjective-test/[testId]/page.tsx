import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSubjectiveTestById } from '@/app/actions/subjective'
import { SubjectiveAnswerUploader } from '@/components/student/subjective-answer-uploader'
import Link from 'next/link'

const TYPE_LABEL: Record<string, string> = {
    numerical: '🔢 Numerical',
    theorem: '📐 Theorem/Proof',
    diagram: '🖼️ Diagram',
    short_answer: '📝 Short Answer',
    long_answer: '📄 Long Answer',
}

export default async function SubjectiveTestTakePage({
    params,
}: {
    params: Promise<{ testId: string }>
}) {
    const { testId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const res = await getSubjectiveTestById(testId)

    if (!res.success || !res.data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4">🚫</div>
                    <p className="text-xl font-semibold text-gray-700">Test not found</p>
                    <Link href="/student/subjective-test" className="mt-4 inline-block text-violet-600 hover:underline">
                        ← Back to Tests
                    </Link>
                </div>
            </div>
        )
    }

    const test = res.data
    const existing = res.existingSubmission

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{test.title}</h1>
                        <p className="text-sm text-gray-500">
                            {test.subject.charAt(0).toUpperCase() + test.subject.slice(1)}
                            {test.chapter ? ` · ${test.chapter}` : ''}
                            {' · Class '}{test.class_standard}
                            {' · '}{test.total_marks} marks
                        </p>
                    </div>
                    <Link href="/student/subjective-test" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        ← Tests
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-2xl">

                {/* Instructions */}
                {test.instructions && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
                        <p className="font-semibold mb-1">📋 Instructions:</p>
                        <p>{test.instructions}</p>
                    </div>
                )}

                {/* AI disclaimer */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                    <p className="font-semibold mb-1">⚠️ AI Grading Note:</p>
                    <p>This test is evaluated by Gemini AI. It reads your handwriting and gives stepwise marks like a CBSE examiner. For very messy handwriting, results may vary. Your teacher can always re-check.</p>
                </div>

                {/* Questions */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-800 text-lg">Questions to Solve</h2>
                        <p className="text-sm text-gray-500 mt-1">Solve all questions on paper before uploading.</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {(test.subjective_questions as any[]).map((q: any) => (
                            <div key={q.id} className="p-5">
                                <div className="flex items-start gap-3">
                                    <span className="w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                                        Q{q.question_number}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-gray-800 leading-relaxed">{q.question_text}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs text-gray-500">{TYPE_LABEL[q.question_type] || q.question_type}</span>
                                            <span className="w-1 h-1 bg-gray-400 rounded-full" />
                                            <span className="text-xs font-semibold text-violet-600">{q.max_marks} marks</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* If already submitted — show previous result, block re-submit */}
                {existing && existing.status === 'evaluated' && existing.evaluation_result ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
                        <p className="font-semibold text-green-800 mb-1">✅ You already submitted this test.</p>
                        <p className="text-sm text-green-700">
                            Score: <strong>{existing.total_marks_awarded} / {test.total_marks}</strong>
                            {existing.submitted_at
                                ? ` · Submitted on ${new Date(existing.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                                : ''}
                        </p>
                        <p className="text-xs text-green-600 mt-2">
                            Re-submission is not allowed. Contact your teacher if you need a re-evaluation.
                        </p>
                    </div>
                ) : null}

                {/* Upload & Evaluate — only shown if NOT already evaluated */}
                {(!existing || existing.status !== 'evaluated') && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h2 className="font-semibold text-gray-800 text-lg mb-1">Upload Your Answers</h2>
                        <p className="text-sm text-gray-500 mb-5">
                            Photograph each page of your answer sheet clearly. Good lighting = better evaluation.
                        </p>
                        <SubjectiveAnswerUploader
                            testId={testId}
                            questions={test.subjective_questions as any[]}
                            subject={test.subject}
                            totalMarks={test.total_marks}
                        />
                    </div>
                )}
            </main>
        </div>
    )
}
