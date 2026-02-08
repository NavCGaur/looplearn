import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    if (code) {
        const supabase = await createClient()

        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('OAuth callback error:', error)
            return NextResponse.redirect(`${origin}/auth/login?error=${error.message}`)
        }

        // Get user to check if profile exists
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            // Check if profile exists
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            // If no profile, redirect to complete signup (choose role & class)
            if (!profile) {
                return NextResponse.redirect(`${origin}/auth/complete-profile`)
            }

            // Redirect based on role
            if (profile.role === 'teacher' || profile.role === 'admin') {
                return NextResponse.redirect(`${origin}/teacher/generator`)
            }

            return NextResponse.redirect(`${origin}/dashboard`)
        }

        // Success - default redirect
        return NextResponse.redirect(`${origin}/dashboard`)
    }

    // No code present, redirect to login
    return NextResponse.redirect(`${origin}/auth/login`)
}
