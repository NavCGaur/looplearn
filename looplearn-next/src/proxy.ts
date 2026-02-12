// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    // Skip auth check for public routes
    const publicPaths = ['/', '/auth/login', '/auth/signup', '/about']
    const isPublicPath = publicPaths.some(path =>
        request.nextUrl.pathname === path ||
        request.nextUrl.pathname.startsWith('/auth/')
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
                    // CRITICAL: Update request cookies
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value)
                    })

                    // CRITICAL: Recreate response with updated request
                    supabaseResponse = NextResponse.next({
                        request,
                    })

                    // CRITICAL: Set all cookies on the new response
                    cookiesToSet.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // IMPORTANT: Don't add ANY logic here - session refresh happens in getUser()
    const { data: { user } } = await supabase.auth.getUser()

    // Redirect to login if not authenticated (except for auth callback)
    if (!user && !request.nextUrl.pathname.startsWith('/auth/callback')) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
    }

    // CRITICAL: Return the supabaseResponse with all cookies
    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}