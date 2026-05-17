import { getAssignmentsForTeacher, toggleAssignmentActive } from '@/app/actions/assignments'
import { TeacherNavbar } from '@/components/dashboard/teacher-navbar'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, Users, Clock, Loader2, ChevronRight, Upload } from 'lucide-react'
import { AssignmentsListClient } from '@/components/teacher/assignments-list-client'

export const dynamic = 'force-dynamic'

export default async function TeacherAssignmentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>Please sign in</div>
    }

    // Get teacher profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const navbarUser = {
        id: user.id,
        name: profile?.display_name || user.email || 'Teacher',
        email: user.email
    }

    const { data: assignments } = await getAssignmentsForTeacher()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <TeacherNavbar user={navbarUser} />

            <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-gray-900">
                            Assignments
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Manage uploaded question papers and review student answers
                        </p>
                    </div>
                </div>

                <AssignmentsListClient initialAssignments={assignments || []} />
            </main>
        </div>
    )
}
