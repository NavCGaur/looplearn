'use server'

import { createClient } from '@/lib/supabase/server'
import { logSupabaseError } from '@/lib/utils/error-logger'
import { redirect } from 'next/navigation'

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    })

    if (error) {
        logSupabaseError('Google OAuth error', error)
        return { error: error.message }
    }

    // Return the URL for client-side redirect instead of server-side redirect
    return { url: data.url }
}
