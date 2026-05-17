import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeacherNavbar } from '@/components/dashboard/teacher-navbar'

export default async function TeacherHubLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, display_name')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
        redirect('/dashboard')
    }

    const navbarUser = {
        id: user.id,
        name: profile?.display_name || user.email || 'Teacher',
        email: user.email,
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <TeacherNavbar user={navbarUser} />
            {children}
        </div>
    )
}
