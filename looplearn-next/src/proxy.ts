// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    // Skip auth check for public routes and policy pages
    const publicPaths = [
        '/',
        '/auth/login',
        '/auth/signup',
        '/about',
        '/contact',
        '/privacy',
        '/terms',
        '/leaderboard',
        '/quiz',
        '/submit',
        '/ads.txt',
        '/api/web-submit',
        '/web-submissions',
        '/teacher/web-submissions',
    ]

    const isPublicPath = publicPaths.some(path =>
        request.nextUrl.pathname === path ||
        request.nextUrl.pathname.startsWith('/auth/') ||
        request.nextUrl.pathname.startsWith('/submit') ||
        request.nextUrl.pathname.startsWith('/leaderboard') ||
        request.nextUrl.pathname.startsWith('/api/web-submit') ||
        request.nextUrl.pathname.startsWith('/web-submissions') ||
        request.nextUrl.pathname.startsWith('/teacher/web-submissions')
    )

    if (isPublicPath) {
        return NextResponse.next()
    }

    // CRITICAL: Create response INSIDE the setAll callback
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value)
                    })

                    supabaseResponse = NextResponse.next({
                        request,
                    })

                    cookiesToSet.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Redirect to login if not authenticated (except for auth callback)
    if (!user && !request.nextUrl.pathname.startsWith('/auth/callback')) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|ads.txt|manifest.webmanifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|txt)$).*)',
    ],
}