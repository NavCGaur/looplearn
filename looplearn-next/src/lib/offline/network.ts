'use client'

import { useState, useEffect } from 'react'

/**
 * Returns true if the browser has actual network connectivity.
 * Uses a real fetch to /api/ping instead of navigator.onLine,
 * which is unreliable across browsers and devices.
 */
export function useIsOnline(): boolean {
    // Default to true to avoid flash of offline banner on load
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        async function checkConnectivity() {
            try {
                // Always hit the network — ignore navigator.onLine which can lie.
                // The SW passes /api/ requests straight to network (no cache).
                await fetch(`/api/ping?t=${Date.now()}`, { cache: 'no-store' })
                setIsOnline(true)
            } catch {
                setIsOnline(false)
            }
        }

        // Check immediately on mount
        checkConnectivity()

        // Re-check when browser reports a change (belt + suspenders)
        window.addEventListener('online', checkConnectivity)
        window.addEventListener('offline', checkConnectivity)

        // Poll every 10 s to auto-recover from stuck state
        const interval = setInterval(checkConnectivity, 10_000)

        return () => {
            window.removeEventListener('online', checkConnectivity)
            window.removeEventListener('offline', checkConnectivity)
            clearInterval(interval)
        }
    }, [])

    return isOnline
}

/**
 * Non-hook version for use outside React components.
 */
export function isOnline(): boolean {
    if (typeof navigator === 'undefined') return true
    return navigator.onLine
}

