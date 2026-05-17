import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Properly log Supabase errors with all available details
 * Supabase errors don't serialize well with console.log/error, so we need to extract the properties
 */
export function logSupabaseError(context: string, error: PostgrestError | Error | unknown) {
    if (!error) {
        console.error(`${context}: Unknown error (null/undefined)`)
        return
    }

    // Check if it's a Supabase PostgrestError
    if (typeof error === 'object' && error !== null && 'code' in error) {
        const pgError = error as PostgrestError
        console.error(`${context}: ${JSON.stringify({ // Next.js intercepts console.error; stringify prevents `{}`
            message: pgError.message,
            code: pgError.code,
            details: pgError.details,
            hint: pgError.hint,
        })}`)
    }
    // Check if it's a standard Error
    else if (error instanceof Error) {
        // If error message contains HTML, it's likely a Cloudflare/Proxy error
        if (error.message && error.message.includes('<!DOCTYPE html>')) {
            console.warn(`${context}: Network/Proxy Error (Cloudflare). Connection to Supabase failed.`)
        } else {
            console.error(`${context}:`, {
                message: error.message,
                name: error.name,
                stack: error.stack,
            })
        }
    }
    // Fallback for unknown error types
    else {
        // Check if it's an object with a message containing HTML (like a raw fetch response error)
        const anyError = error as any;
        if (anyError && typeof anyError.message === 'string' && anyError.message.includes('<!DOCTYPE html>')) {
            const match = anyError.message.match(/<title>([^<]+)<\/title>/);
            const title = match ? match[1] : 'Unknown Proxy Error';
            console.warn(`${context}: Network/Proxy Error - ${title}`);
            return;
        }

        try {
            console.error(`${context}:`, JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
        } catch (e) {
            console.error(`${context}:`, String(error))
        }
    }
}
