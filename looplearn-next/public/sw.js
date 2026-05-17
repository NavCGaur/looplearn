/**
 * LoopLearnX Service Worker
 * Caches the app shell for offline use.
 * Quiz question data is stored in IndexedDB separately (see lib/offline/db.ts).
 */

const CACHE_NAME = 'looplearn-shell-v2'

// App shell — pages and assets that should always be available offline
const SHELL_URLS = [
    '/',
    '/dashboard',
    '/quiz',
    '/offline',
    '/favicon.ico',
]

// Install: cache the app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Cache what we can, but don't fail install if some URLs are missing
            return cache.addAll(SHELL_URLS).catch(() => {
                console.log('[SW] Some shell URLs could not be cached during install')
            })
        })
    )
    // Activate immediately without waiting for old SW to be released
    self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    )
    // Take control of all open clients immediately
    self.clients.claim()
})

// Fetch: Network-first for API/auth, Cache-first for static assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url)

    // Always go to network for:
    // - Supabase API calls
    // - Next.js server actions (_next/static is fine to cache)
    // - Our own /api routes (sync endpoint)
    const isApiCall =
        url.hostname.includes('supabase.co') ||
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/_next/data/') ||
        event.request.method !== 'GET'

    if (isApiCall) {
        // Network only — don't cache API responses
        // Wrap in try/catch so offline failures propagate cleanly to client-side error handlers
        event.respondWith(
            fetch(event.request).catch((err) => {
                // Re-throw so client-side try/catch (e.g. in loadMetadata) can catch it
                return Promise.reject(err)
            })
        )
        return
    }

    // For Next.js static assets (_next/static), use cache-first
    if (url.pathname.startsWith('/_next/static/')) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached
                return fetch(event.request).then((response) => {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
                    return response
                })
            })
        )
        return
    }

    // For page navigations: Network-first, fall back to cache, then /offline
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful page responses
                if (response.ok) {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
                }
                return response
            })
            .catch(() => {
                // Offline: try cache first
                return caches.match(event.request).then((cached) => {
                    if (cached) return cached
                    // For navigation requests, return the offline page
                    if (event.request.mode === 'navigate') {
                        return caches.match('/offline') || new Response(
                            '<h1>You are offline</h1><p>Please open the app while connected to download quiz data.</p>',
                            { headers: { 'Content-Type': 'text/html' } }
                        )
                    }
                    return new Response('Offline', { status: 503 })
                })
            })
    )
})
