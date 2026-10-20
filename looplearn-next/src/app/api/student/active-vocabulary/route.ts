import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getVerbsForDay } from '@/lib/challenge/verbs'

export const dynamic = 'force-dynamic'

function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const challengeDayParam = searchParams.get('challenge_day') || searchParams.get('day')

        if (challengeDayParam) {
            const day = parseInt(challengeDayParam, 10)
            if (!isNaN(day) && day >= 1 && day <= 6) {
                const dayVerbs = getVerbsForDay(day)
                // Return verbs base form for hangman game
                const vocabulary = dayVerbs.map(v => v.v1_base_form)
                return NextResponse.json({
                    success: true,
                    week_number: day,
                    theme: `Day ${day} Verb Challenge`,
                    vocabulary
                })
            }
        }

        const supabase = createAdminClient()

        // 1. Get the active progress for the main pilot cohort
        const { data: progress, error: progError } = await supabase
            .from('cohort_active_progress')
            .select('*, active_week_id(*)')
            .limit(1)
            .maybeSingle()

        if (progError) {
            return NextResponse.json({ success: false, error: progError.message }, { status: 500 })
        }

        if (!progress || !progress.active_week_id) {
            // Fallback default list
            return NextResponse.json({
                success: true,
                week_number: 1,
                theme: "General English",
                vocabulary: ["happy", "sad", "hungry", "tired", "student", "brother", "sister", "friend"]
            })
        }

        const week = progress.active_week_id
        const vocabulary = week.weekly_assets?.target_vocabulary || []

        return NextResponse.json({
            success: true,
            week_number: week.week_number,
            theme: week.theme,
            vocabulary
        })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message || 'Server error' }, { status: 500 })
    }
}

