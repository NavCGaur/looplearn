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
        console.error(`${context}:`, {
            message: pgError.message,
            code: pgError.code,
            details: pgError.details,
            hint: pgError.hint,
        })
    }
    // Check if it's a standard Error
    else if (error instanceof Error) {
        console.error(`${context}:`, {
            message: error.message,
            name: error.name,
            stack: error.stack,
        })
    }
    // Fallback for unknown error types
    else {
        console.error(`${context}:`, error)
    }
}
