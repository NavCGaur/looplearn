// ─────────────────────────────────────────────────────────────────────────────
// THREE-TIER MEMORY SYSTEM — LoopLearn AI Tutor
//
// Tier 1: Short-term sliding window (chat_messages table)
//         → Last 6 messages injected into every Gemini call for conversational flow
//
// Tier 2: Mid-term personalized learning profile (student_ai_memory table)
//         → Bullet-point facts extracted asynchronously from chat history
//         → Injected into system prompt so Gemini acts like a personal tutor
//
// Tier 3: Curriculum RAG (pgvector — Phase 2, skipped for now)
// ─────────────────────────────────────────────────────────────────────────────

import { createClient as createSupabaseClientDirect } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

const rawGenAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')
const genAI = {
    getGenerativeModel(options: any) {
        const rawModel = rawGenAI.getGenerativeModel(options)
        return new Proxy(rawModel, {
            get(target, prop, receiver) {
                if (prop === 'generateContent') {
                    return async function(contents: any[]) {
                        let delay = 2000
                        const maxRetries = 4
                        for (let attempt = 1; attempt <= maxRetries; attempt++) {
                            try {
                                return await target.generateContent(contents)
                            } catch (error: any) {
                                const isTransient = 
                                    error.status === 503 || 
                                    error.status === 429 || 
                                    (error.message && (error.message.includes('503') || error.message.includes('429') || error.message.includes('Service Unavailable') || error.message.includes('quota') || error.message.includes('high demand') || error.message.includes('fetch failed')))

                                if (isTransient && attempt < maxRetries) {
                                    console.warn(`[Gemini Retry] Attempt ${attempt} failed with transient error: ${error.message || error}. Retrying in ${delay}ms...`)
                                    await new Promise(resolve => setTimeout(resolve, delay))
                                    delay *= 2
                                } else {
                                    throw error
                                }
                            }
                        }
                    }
                }
                return Reflect.get(target, prop, receiver)
            }
        })
    }
}

function createAdminClient() {
    return createSupabaseClientDirect(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
    created_at?: string
}

// ── Tier 1: Save a user + assistant message pair ──────────────────────────────
// Uses atomic batch insert — both messages written in one DB call.
// Call this AFTER Gemini returns a successful response.
export async function saveChatMessages(
    studentId: string,
    userMessage: string,
    assistantMessage: string
): Promise<void> {
    const adminClient = createAdminClient()
    const { error } = await adminClient
        .from('chat_messages')
        .insert([
            { student_id: studentId, role: 'user',      content: userMessage },
            { student_id: studentId, role: 'assistant', content: assistantMessage },
        ])
    if (error) {
        console.error('[Memory] Failed to save chat messages:', error.message)
    }
}

// ── Tier 1: Fetch sliding window (chronological order, oldest first) ──────────
// Calls the Supabase SQL function get_chat_window defined in the migration.
export async function getChatWindow(
    studentId: string,
    limit: number = 6
): Promise<ChatMessage[]> {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient.rpc('get_chat_window', {
        p_student_id: studentId,
        p_limit: limit,
    })
    if (error) {
        console.error('[Memory] Failed to fetch chat window:', error.message)
        return []
    }
    return (data ?? []) as ChatMessage[]
}

// ── Tier 2: Fetch student learning profile ────────────────────────────────────
// Fetched by primary key — zero latency penalty on the hot path.
export async function getStudentMemory(studentId: string): Promise<string | null> {
    const adminClient = createAdminClient()
    const { data } = await adminClient
        .from('student_ai_memory')
        .select('learning_profile, last_summarized_at')
        .eq('student_id', studentId)
        .single()
    return data?.learning_profile ?? null
}

// ── Tier 2: Check if memory is stale (>48h without update) ───────────────────
export async function isMemoryStale(studentId: string): Promise<boolean> {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient.rpc('is_memory_stale', {
        p_student_id: studentId,
    })
    if (error) return true // Treat error as stale — triggers a refresh
    return data as boolean
}

// ── Tier 2: Update student learning profile (REPLACE, not append) ─────────────
// CRITICAL DESIGN DECISION: Gemini is explicitly instructed to REPLACE outdated
// facts, not append to them. This prevents "memory stuckness" where the AI keeps
// telling a student to "focus on fractions" even after they have mastered them.
//
// Called by:
//   1. Nightly pg_cron job via /api/cron/summarize-memory
//   2. Inline on the hot path when profile is >48h stale (safety net)
export async function updateStudentMemory(
    studentId: string,
    studentName: string,
    existingProfile: string | null,
    recentMessages: ChatMessage[]
): Promise<{ success: boolean; newProfile?: string }> {
    try {
        if (!process.env.GOOGLE_GEMINI_API_KEY) throw new Error('Missing Gemini API key')
        if (!recentMessages.length) return { success: false }

        const model = genAI.getGenerativeModel({
            model: 'gemini-flash-latest',
            generationConfig: { temperature: 0.2 },
        })

        const messageLog = recentMessages
            .map(m => `${m.role === 'user' ? 'Student' : 'AI Tutor'}: ${m.content}`)
            .join('\n')

        const existingSection = existingProfile
            ? `**Existing Learning Profile (UPDATE this — replace outdated facts, add new ones, remove stale ones):**\n${existingProfile}`
            : `**No existing profile. Create a new one from the interactions below.**`

        const prompt = `You are a teaching assistant maintaining an accurate learning profile for a CBSE student (Class 6-10).

Student Name: ${studentName}

${existingSection}

**Recent Tutoring Interactions:**
${messageLog}

**Your Task:**
1. Analyze these interactions carefully.
2. REPLACE outdated facts. If the student now understands something they previously struggled with, UPDATE the fact to show mastery (e.g., change "Struggles with HCF" to "Mastered HCF as of this week").
3. ADD new facts from today's session.
4. REMOVE facts that are clearly stale or no longer applicable.
5. Keep the profile concise — max 8 bullet points.

**Output ONLY the updated bullet-point profile. No intro text, no explanation. Start directly with bullets:**`

        const result = await model.generateContent(prompt)
        const newProfile = result.response.text().trim()

        const adminClient = createAdminClient()
        const { error } = await adminClient
            .from('student_ai_memory')
            .upsert(
                {
                    student_id: studentId,
                    learning_profile: newProfile,
                    last_summarized_at: new Date().toISOString(),
                },
                { onConflict: 'student_id' }
            )

        if (error) {
            console.error('[Memory] Failed to upsert student memory:', error.message)
            return { success: false }
        }

        console.log(`[Memory] ✅ Updated profile for student ${studentId}`)
        return { success: true, newProfile }

    } catch (error: any) {
        console.error('[Memory] updateStudentMemory error:', error.message)
        return { success: false }
    }
}
