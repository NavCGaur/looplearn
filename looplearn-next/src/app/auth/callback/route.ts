import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { convertGuestSession } from '@/app/actions/guest'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/dashboard'
    // Always use the incoming request origin so domain matches PKCE cookies
    const origin = requestUrl.origin

    if (code) {
        console.log('Auth Callback: Processing code', { code: code.substring(0, 5) + '...', next, origin })

        const cookieStore = await cookies()

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
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        // Check if user is already authenticated even if exchange emitted a warning
        const { data: { user } } = await supabase.auth.getUser()

        if (exchangeError && !user) {
            console.error('Auth Callback Error: Exchange failed', exchangeError)
            return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`)
        }

        if (user) {
            console.log('Auth Callback: User authenticated', { userId: user.id })

            // Convert guest session if one exists
            try {
                await convertGuestSession(user.id)
                console.log('Auth Callback: Guest session conversion attempted')
            } catch (convertError) {
                console.error('Auth Callback: Guest session conversion failed', convertError)
            }

            // Check if profile exists
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            console.log('Auth Callback: Profile check', { found: !!profile })

            if (!profile) {
                console.log('Auth Callback: Redirecting to complete-profile')
                return NextResponse.redirect(`${origin}/auth/complete-profile`)
            }

            console.log('Auth Callback: Redirecting to destination', { next })
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Fallback redirect to login
    return NextResponse.redirect(`${origin}/auth/login`)
}
