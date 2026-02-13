import { Suspense } from 'react'
import { getDashboardData } from '@/app/actions/dashboard'
import { ProfileClient } from '@/components/dashboard/profile-client'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
    // We can reuse getDashboardData to get the base user info,
    // but we might need more specific profile fields (school, bio, etc.)
    // So let's fetch profile directly here to be safe and complete.

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        redirect('/auth/complete-profile')
    }

    const userData = {
        name: profile.display_name,
        email: user.email,
        class: profile.class_standard,
        school: profile.school, // Might be null if column missing, handle gracefully
        bio: profile.bio,     // Might be null
        avatar_url: profile.avatar_url, // Might be null
        role: profile.role,
    }

    return (
        <Suspense fallback={<LoadingSpinner size="lg" message="Loading profile..." />}>
            <ProfileClient user={userData} />
        </Suspense>
    )
}
