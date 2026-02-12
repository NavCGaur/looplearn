import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/dashboard'
    const origin = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin

    if (code) {
        console.log('Auth Callback: Processing code', { code: code.substring(0, 5) + '...', next, origin })

        const cookieStore = await cookies()

        // Create a Supabase client specifically for this Route Handler
        // This ensures cookies are set correctly without the try/catch suppression of the shared utility
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch (error) {
                            console.error('Auth Callback: Cookie set failed', error)
                        }
                    },
                },
            }
        )

        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Auth Callback Error: Exchange failed', error)
            return NextResponse.redirect(`${origin}/auth/login?error=${error.message}`)
        }

        console.log('Auth Callback: Exchange successful')

        // Get user to check if profile exists
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            console.error('Auth Callback Error: User fetch failed after exchange', userError)
            return NextResponse.redirect(`${origin}/auth/login?error=user_fetch_failed`)
        }

        console.log('Auth Callback: User found', { userId: user.id })

        if (user) {
            // Check if profile exists
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            console.log('Auth Callback: Profile check', { found: !!profile })

            // If no profile, redirect to complete signup (choose role & class)
            if (!profile) {
                console.log('Auth Callback: Redirecting to complete-profile')
                return NextResponse.redirect(`${origin}/auth/complete-profile`)
            }

            // Redirect to the next parameter or dashboard
            console.log('Auth Callback: Redirecting to destination', { next })
            return NextResponse.redirect(`${origin}${next}`)
        }

        // Success - redirect to next or default dashboard
        console.log('Auth Callback: Fallback redirect')
        return NextResponse.redirect(`${origin}${next}`)
    }

    // No code present, redirect to login
    return NextResponse.redirect(`${origin}/auth/login`)
}
