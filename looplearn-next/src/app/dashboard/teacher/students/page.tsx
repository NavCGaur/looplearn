import Link from 'next/link'
import { getStudentsList } from '@/app/actions/teacher-dashboard'
import { User, Trophy, Calendar, Clock, Wifi } from 'lucide-react'
import { TeacherNavbar } from '@/components/dashboard/teacher-navbar'
import { createClient } from '@/lib/supabase/server'
import { StudentActivityLog } from '@/components/dashboard/teacher/student-activity-log'
import { LastActiveTime } from '@/components/dashboard/teacher/last-active-time'
import { OfflineToggle } from '@/components/dashboard/teacher/offline-toggle'

interface Student {
    id: string
    display_name: string | null
    class_standard: number | null
    points: number | null
    created_at: string
    last_active_at: string | null
    offline_access_enabled: boolean | null
}

export default async function StudentsListPage() {
    const students = await getStudentsList()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get teacher profile for name
    const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user?.id)
        .single()

    const navbarUser = {
        id: user?.id || '',
        name: profile?.display_name || user?.email || 'Teacher',
        email: user?.email
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <TeacherNavbar user={navbarUser} />
            <div className="px-4 py-8 sm:p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
                            <p className="text-gray-500">Track performance and progress of your students.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {students.length === 0 ? (
                            <div className="p-12 text-center">
                                <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No students found</h3>
                                <p className="text-gray-500">Students will appear here once they sign up.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Wifi className="w-3.5 h-3.5" />
                                                    Offline
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {students.map((student: Student) => (
                                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                                            {student.display_name?.charAt(0) || 'S'}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{student.display_name || 'Unknown User'}</div>
                                                            <div className="text-sm text-gray-500">ID: {student.id.slice(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        Class {student.class_standard || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <Trophy className="w-4 h-4 text-yellow-500 mr-1.5" />
                                                        {student.points || 0}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                                                        <LastActiveTime dateString={student.last_active_at} />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                                                        {new Date(student.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <OfflineToggle
                                                        studentId={student.id}
                                                        initialEnabled={student.offline_access_enabled ?? false}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white shadow-[-10px_0_15px_-5px_rgb(0_0_0_/_0.05)]">
                                                    <div className="flex items-center justify-end space-x-4">
                                                        <StudentActivityLog
                                                            studentId={student.id}
                                                            studentName={student.display_name || 'Student'}
                                                        />
                                                        <Link
                                                            href={`/dashboard/teacher/students/${student.id}`}
                                                            className="text-indigo-600 hover:text-indigo-900 font-bold"
                                                        >
                                                            Analytics
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
