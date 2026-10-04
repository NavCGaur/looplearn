'use server'

import { createClient } from '@/lib/supabase/server'
import { logSupabaseError } from '@/lib/utils/error-logger'
import { headers } from 'next/headers'

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
    const supabase = await createClient()
    const headerStore = await headers()
    const host = headerStore.get('host') || 'looplearnx.com'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const origin = `${protocol}://${host}`

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
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

    return { url: data.url }
}
