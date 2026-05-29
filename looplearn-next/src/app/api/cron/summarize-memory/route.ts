import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { getChatWindow, updateStudentMemory } from '@/app/actions/memory'

// This endpoint is called by Vercel Cron OR by pg_cron via a webhook.
// It runs nightly to extract and update every student's learning profile.
// Schedule: Daily at 10 PM IST (4:30 PM UTC) — after students have submitted homework.

const CRON_SECRET = process.env.CRON_SECRET

function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export async function POST(req: NextRequest) {
    // Validate the cron secret so this endpoint cannot be called publicly
    const secret = req.headers.get('x-cron-secret')
    if (!CRON_SECRET || secret !== CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Fetch all students who have sent at least one message today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: activeStudents, error } = await adminClient
        .from('chat_messages')
        .select('student_id')
        .gte('created_at', todayStart.toISOString())
        .order('student_id')

    if (error) {
        console.error('[Cron] Failed to fetch active students:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Deduplicate student IDs
    const uniqueStudentIds = [...new Set((activeStudents ?? []).map(r => r.student_id))]

    if (!uniqueStudentIds.length) {
        console.log('[Cron] No active students today — nothing to summarize.')
        return NextResponse.json({ success: true, processed: 0 })
    }

    // Fetch student names for the prompt
    const { data: profiles } = await adminClient
        .from('profiles')
        .select('id, display_name')
        .in('id', uniqueStudentIds)

    const nameMap = new Map((profiles ?? []).map(p => [p.id, p.display_name ?? 'Student']))

    // Fetch existing memory profiles
    const { data: existingMemories } = await adminClient
        .from('student_ai_memory')
        .select('student_id, learning_profile')
        .in('student_id', uniqueStudentIds)

    const memoryMap = new Map((existingMemories ?? []).map(m => [m.student_id, m.learning_profile]))

    // Process each student
    let processed = 0
    let failed = 0

    for (const studentId of uniqueStudentIds) {
        try {
            // Fetch today's messages for this student (last 30 messages to keep token costs low)
            const recentMessages = await getChatWindow(studentId, 30)
            if (!recentMessages.length) continue

            const studentName = nameMap.get(studentId) ?? 'Student'
            const existingProfile = memoryMap.get(studentId) ?? null

            const result = await updateStudentMemory(
                studentId,
                studentName,
                existingProfile,
                recentMessages
            )

            if (result.success) {
                processed++
                console.log(`[Cron] ✅ Updated memory for ${studentName}`)
            } else {
                failed++
                console.warn(`[Cron] ⚠️ Failed to update memory for ${studentName}`)
            }

            // Small delay between students to avoid rate-limiting Gemini
            await new Promise(r => setTimeout(r, 1000))

        } catch (e: any) {
            failed++
            console.error(`[Cron] Error for student ${studentId}:`, e.message)
        }
    }

    // ── Prune old messages (replaces pg_cron — no Pro plan needed) ─────────────
    // Deletes chat_messages older than 90 days to keep the table lean.
    const { error: pruneError } = await adminClient.rpc('prune_old_chat_messages')
    if (pruneError) {
        console.warn('[Cron] Prune step failed (non-critical):', pruneError.message)
    } else {
        console.log('[Cron] 🧹 Old messages pruned successfully')
    }

    console.log(`[Cron] Nightly memory summarization complete. Processed: ${processed}, Failed: ${failed}`)
    return NextResponse.json({
        success: true,
        processed,
        failed,
        total: uniqueStudentIds.length,
    })
}
