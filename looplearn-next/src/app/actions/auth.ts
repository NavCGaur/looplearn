'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Get current authenticated user with profile
 */
export async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return {
        ...user,
        profile
    }
}

/**
 * Sign out current user
 */
export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
}
