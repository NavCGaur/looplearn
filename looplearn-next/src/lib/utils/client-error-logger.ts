/**
 * Client-side error logger for better error diagnostics
 * Similar to the server-side version but for browser console
 */
export function logError(context: string, error: unknown) {
    if (!error) {
        console.error(`${context}: Unknown error (null/undefined)`)
        return
    }

    // Check if it's an object with properties
    if (typeof error === 'object' && error !== null) {
        // Try to extract common error properties
        const errorObj = error as any
        const details: Record<string, any> = {}

        // Common error properties
        if ('message' in errorObj) details.message = errorObj.message
        if ('code' in errorObj) details.code = errorObj.code
        if ('details' in errorObj) details.details = errorObj.details
        if ('hint' in errorObj) details.hint = errorObj.hint
        if ('name' in errorObj) details.name = errorObj.name
        if ('stack' in errorObj) details.stack = errorObj.stack

        // If we found any properties, log them
        if (Object.keys(details).length > 0) {
            console.error(`${context}:`, details)
        } else {
            // Fallback to stringifying the whole object
            console.error(`${context}:`, error)
        }
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
