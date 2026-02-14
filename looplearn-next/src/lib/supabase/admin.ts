import { createClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client with the service role key to bypass Row Level Security.
 * USE WITH CAUTION: Only use this in server-side contexts where you have already
 * verified the user's permissions.
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
