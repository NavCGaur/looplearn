import { NextResponse } from 'next/server'

/**
 * Lightweight connectivity probe.
 * Used by useIsOnline() to verify actual network reachability
 * instead of relying on the unreliable navigator.onLine flag.
 */
export async function GET() {
    return NextResponse.json({ ok: true }, {
        headers: {
            'Cache-Control': 'no-store, max-age=0',
        },
    })
}
