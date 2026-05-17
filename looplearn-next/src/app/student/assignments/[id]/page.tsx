import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, FileText, Clock } from 'lucide-react'
import { DashboardNavbar } from '@/components/dashboard/dashboard-navbar'
import { AssignmentSubmitter } from '@/components/student/assignment-submitter'
import { formatDate } from '@/lib/date-utils'

export default async function AssignmentSubmitPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) redirect('/auth/setup')

    const navbarUser = {
        id: user.id,
        name: profile.display_name,
        role: profile.role,
        class: profile.class_standard,
        points: profile.points || 0
    }

    // 2. Fetch assignment details
    const { data: assignment, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

    if (error || !assignment) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <DashboardNavbar user={navbarUser} />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <h2 className="text-xl font-bold text-gray-800">Assignment Not Found</h2>
                    <p className="text-gray-500 mt-2">This assignment may have been closed by the teacher.</p>
                    <Link href="/dashboard" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    // 3. Check if already submitted
    const { data: submission } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('assignment_id', id)
        .eq('student_id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
            <DashboardNavbar user={navbarUser} />

            <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                <div className="mb-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Dashboard
                    </Link>
                </div>

                {/* Assignment Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold font-fredoka text-gray-900">{assignment.title}</h1>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 flex-wrap">
                                <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium">{assignment.subject}</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Posted {formatDate(assignment.created_at)}
                                </span>
                                <span>Class {assignment.class_standard}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submission Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <AssignmentSubmitter
                        assignmentId={assignment.id}
                        existingSubmission={submission || null}
                        assignmentTitle={assignment.title}
                        assignmentSubject={assignment.subject}
                        classStandard={assignment.class_standard}
                    />
                </div>
            </div>
        </div>
    )
}
