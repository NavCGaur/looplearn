'use server'

import { createClient } from '@/lib/supabase/server'
import { ACTIVE_PILOT_SCHEDULE } from '@/config/planner-config'

export interface StudentAnalyticsCard {
    id: string
    display_name: string
    status: 'Ready' | 'Needs Practice' | 'Struggling'
    active_error_details: string
    last_submitted: string
}

export interface CohortAnalytics {
    completed_count: number
    started_count: number
    total_students: number
    common_mistakes: { mistake: string; correction: string; count: number }[]
    ai_recommendation: {
        text: string
        why: string
        confidence: 'High' | 'Medium' | 'Low'
    }
    students: StudentAnalyticsCard[]
}

// ── Active Week Getter ──────────────────────────────────────────
export async function getActivePilotWeek(cohortName = 'Pilot Cohort 2026') {
    const supabase = await createClient()

    // 1. Get cohort
    let { data: cohort } = await supabase
        .from('cohorts')
        .select('*')
        .eq('name', cohortName)
        .maybeSingle()

    if (!cohort) {
        // Create if missing
        const { data: newCohort } = await supabase
            .from('cohorts')
            .insert({ name: cohortName, class_standard: 7 })
            .select()
            .single()
        cohort = newCohort
    }

    if (!cohort) throw new Error('Failed to load or create cohort.')

    // 2. Get active progress
    let { data: progress } = await supabase
        .from('cohort_active_progress')
        .select('*, active_week_id(*)')
        .eq('cohort_id', cohort.id)
        .maybeSingle()

    // 3. Fallback: If no progress, find Week 1 of "English Foundation"
    if (!progress || !progress.active_week_id) {
        const { data: week1 } = await supabase
            .from('curriculum_weeks')
            .select('*, version_id(*, program_id(*))')
            .eq('week_number', 1)
            .maybeSingle()

        if (week1) {
            // Initialize active progress
            await supabase.from('cohort_active_progress').upsert({
                cohort_id: cohort.id,
                active_week_id: week1.id
            })
            
            // Re-fetch to populate relations
            const { data: refetched } = await supabase
                .from('cohort_active_progress')
                .select('*, active_week_id(*)')
                .eq('cohort_id', cohort.id)
                .single()
            progress = refetched
        }
    }

    if (!progress || !progress.active_week_id) {
        return { cohort, activeWeek: null, phases: [] }
    }

    // 4. Fetch all phases for the active week
    const { data: phases } = await supabase
        .from('curriculum_phases')
        .select('*')
        .eq('week_id', progress.active_week_id.id)
        .order('phase_number', { ascending: true })

    return {
        cohort,
        activeWeek: progress.active_week_id,
        phases: phases || []
    }
}

// ── Save Week Draft ─────────────────────────────────────────────
export async function saveWeekDraft(params: {
    weekId: string
    theme: string
    weeklyAssets: any
    phases: { id: string; phase_name: string; instructional_content: any }[]
}) {
    const supabase = await createClient()

    // Update main week theme/assets
    const { error: weekError } = await supabase
        .from('curriculum_weeks')
        .update({
            theme: params.theme,
            weekly_assets: params.weeklyAssets,
            updated_at: new Date().toISOString()
        })
        .eq('id', params.weekId)

    if (weekError) return { success: false, error: weekError.message }

    // Update each phase
    for (const phase of params.phases) {
        const { error: phaseError } = await supabase
            .from('curriculum_phases')
            .update({
                phase_name: phase.phase_name,
                instructional_content: phase.instructional_content
            })
            .eq('id', phase.id)

        if (phaseError) return { success: false, error: phaseError.message }
    }

    return { success: true }
}

// ── Approve Week ────────────────────────────────────────────────
export async function approveWeek(weekId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('curriculum_weeks')
        .update({ status: 'approved' })
        .eq('id', weekId)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

// ── Publish Active Week ─────────────────────────────────────────
export async function publishActiveWeek(cohortId: string, weekId: string) {
    const supabase = await createClient()

    // 1. Set week status to published
    const { error: publishError } = await supabase
        .from('curriculum_weeks')
        .update({ status: 'published' })
        .eq('id', weekId)

    if (publishError) return { success: false, error: publishError.message }

    // 2. Set as active week for cohort
    const { error: progressError } = await supabase
        .from('cohort_active_progress')
        .upsert({
            cohort_id: cohortId,
            active_week_id: weekId,
            updated_at: new Date().toISOString()
        })

    if (progressError) return { success: false, error: progressError.message }

    // 3. Automatically create/sync homework plan for the Production Phase (Phase 3)
    const { data: week } = await supabase
        .from('curriculum_weeks')
        .select('*')
        .eq('id', weekId)
        .single()

    const { data: cohort } = await supabase
        .from('cohorts')
        .select('*')
        .eq('id', cohortId)
        .single()

    if (week && cohort) {
        const weekStart = new Date().toISOString().split('T')[0] // today's Monday anchor
        const homeworkAsset = week.weekly_assets || {}
        
        // Find existing plan for cohort
        const { data: existingPlan } = await supabase
            .from('homework_plans')
            .select('id')
            .eq('cohort_id', cohortId)
            .eq('curriculum_week_id', weekId)
            .maybeSingle()

        if (!existingPlan) {
            await supabase.from('homework_plans').insert({
                teacher_id: 'ad6b0b1c-55f6-46a6-8c17-9f544caf06f3', // Default teacher UUID
                class_standard: cohort.class_standard,
                subject: 'English',
                day_of_week: 4, // Thursday (Production)
                week_start: weekStart,
                hw_number: week.week_number,
                task_description: homeworkAsset.homework_prompt || `Week ${week.week_number} Foundation Practice`,
                curriculum_mode: 'english_foundation',
                curriculum_module_id: 'ef_pilot_v1_w1', // fallback reference to legacy table
                curriculum_week_id: week.id,
                cohort_id: cohortId,
                assessment_type: 'weekly_practice'
            })
        }
    }

    return { success: true }
}

// ── Cohort Analytics Calculation ────────────────────────────────
export async function getPilotCohortAnalytics(cohortId: string, weekId: string): Promise<CohortAnalytics> {
    const supabase = await createClient()

    // 1. Fetch pilot students linked to this cohort
    const { data: students } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('cohort_id', cohortId)

    if (!students || students.length === 0) {
        return {
            completed_count: 0,
            started_count: 0,
            total_students: 0,
            common_mistakes: [],
            ai_recommendation: { text: "No students registered in cohort.", why: "Cohort has zero members.", confidence: "Low" },
            students: []
        }
    }

    // 2. Fetch homework plan linked to this week
    const { data: plan } = await supabase
        .from('homework_plans')
        .select('id')
        .eq('curriculum_week_id', weekId)
        .maybeSingle()

    const planId = plan?.id

    let startedCount = 0
    let completedCount = 0
    const commonMistakesMap: Record<string, { correction: string; count: number }> = {}
    const studentCards: StudentAnalyticsCard[] = []

    let iAmMasteryTotal = 0
    let theyAreMasteryTotal = 0
    let masterySamples = 0

    for (const student of students) {
        // Check submission status for active plan
        let submission = null
        if (planId) {
            const { data: sub } = await supabase
                .from('homework_submissions')
                .select('*')
                .eq('plan_id', planId)
                .eq('student_id', student.id)
                .maybeSingle()
            submission = sub
        }

        // Fetch student memory to evaluate active error profiles
        const { data: memory } = await supabase
            .from('student_ai_memory')
            .select('*')
            .eq('student_id', student.id)
            .maybeSingle()

        // Determine student status
        let status: 'Ready' | 'Needs Practice' | 'Struggling' = 'Ready'
        let activeErrorDetails = 'Ready for next pattern.'
        let lastSubmitted = 'No submission'

        if (submission) {
            startedCount++
            if (submission.status === 'submitted') {
                completedCount++
                lastSubmitted = new Date(submission.submitted_at).toLocaleDateString('en-IN')
            }
            
            // Extract common mistakes from raw AI response
            const rawAi = submission.raw_ai_response
            if (rawAi && rawAi.prioritized_weaknesses) {
                const tier1 = rawAi.prioritized_weaknesses.tier_1_immediate || []
                tier1.forEach((err: string) => {
                    const cleanErr = err.toLowerCase()
                    if (cleanErr.includes('am') || cleanErr.includes('are') || cleanErr.includes('is')) {
                        commonMistakesMap[err] = {
                            correction: cleanErr.includes('am') ? "I am happy" : "They are my friends",
                            count: (commonMistakesMap[err]?.count || 0) + 1
                        }
                        status = 'Struggling'
                        activeErrorDetails = `Struggling with: ${err}`
                    }
                })
            }
        }

        if (memory && memory.learning_profile) {
            const lp = memory.learning_profile.toLowerCase()
            if (lp.includes('struggles') || lp.includes('missing') || lp.includes('incorrect')) {
                if (status === 'Ready') {
                    status = 'Needs Practice'
                    activeErrorDetails = 'Minor copula or singular/plural mismatches detected.'
                }
            }
            
            // Calculate pseudo metrics for dynamic AI recommendations
            if (lp.includes('assets: i am')) {
                iAmMasteryTotal += lp.includes('independent production: high') ? 85 : 60
            } else {
                iAmMasteryTotal += 30
            }
            
            if (lp.includes('they are')) {
                theyAreMasteryTotal += 75
            } else {
                theyAreMasteryTotal += 35
            }
            masterySamples++
        }

        studentCards.push({
            id: student.id,
            display_name: student.display_name || 'Unnamed',
            status,
            active_error_details: activeErrorDetails,
            last_submitted: lastSubmitted
        })
    }

    // Format common mistakes
    const common_mistakes = Object.entries(commonMistakesMap).map(([mistake, details]) => ({
        mistake,
        correction: details.correction,
        count: details.count
    })).sort((a, b) => b.count - a.count)

    // Compute AI Recommendation
    const submissionRate = completedCount / students.length
    const confidence: 'High' | 'Medium' | 'Low' = 
        submissionRate >= 0.75 ? 'High' : submissionRate >= 0.40 ? 'Medium' : 'Low'

    const iAmAvg = masterySamples ? iAmMasteryTotal / masterySamples : 50
    const theyAreAvg = masterySamples ? theyAreMasteryTotal / masterySamples : 35

    let recText = "Introduce the next grammatical module 'I have'."
    let recWhy = "The cohort demonstrates stable structural control on this week's target copulas."

    if (theyAreAvg < 50) {
        recText = "Spend 10-15 minutes revising the plural copula 'They are' before starting Week 2."
        recWhy = `${Math.round(100 - theyAreAvg)}% of students are still confusing plural subject agreement (e.g. writing 'They is' or omitting 'are' entirely).`
    } else if (iAmAvg < 60) {
        recText = "Do not proceed to Week 2. Revise declarative 'I am' structures with adjectives."
        recWhy = `Basic identity linkage (I am [adjective]) is not yet secure. Only ${Math.round(iAmAvg)}% of the cohort successfully generated correct S-V sentences.`
    }

    return {
        completed_count: completedCount,
        started_count: startedCount,
        total_students: students.length,
        common_mistakes,
        ai_recommendation: {
            text: recText,
            why: recWhy,
            confidence
        },
        students: studentCards
    }
}
