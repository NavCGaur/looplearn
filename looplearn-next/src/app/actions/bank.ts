'use server'

import { createClient } from '@/lib/supabase/server'
import { logSupabaseError } from '@/lib/utils/error-logger'

export interface QuestionFilter {
    classStandard?: number
    subject?: string
    search?: string
    chapter?: string
    questionType?: string
    page?: number
    pageSize?: number
}

/**
 * Fetch paginated questions for the teacher bank
 */
export async function getQuestions(filters: QuestionFilter = {}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const {
        classStandard,
        subject,
        search,
        chapter,
        questionType,
        page = 1,
        pageSize = 20
    } = filters

    // Calculate pagination range
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // Build Query
    let query = supabase
        .from('questions')
        .select(`
            *,
            question_options (*),
            fillblank_answers (*)
        `, { count: 'exact' })
        .eq('created_by', user.id) // Only show own questions
        .order('created_at', { ascending: false })

    if (classStandard) {
        query = query.eq('class_standard', classStandard)
    }

    if (subject && subject !== 'All') {
        query = query.eq('subject', subject.toLowerCase())
    }

    if (chapter) {
        query = query.eq('chapter', chapter)
    }

    if (questionType) {
        query = query.eq('question_type', questionType)
    }

    if (search) {
        query = query.ilike('question_text', `%${search}%`)
    }

    const { data, count, error } = await query.range(from, to)

    if (error) {
        logSupabaseError('Error fetching questions', error)
        throw new Error(error.message)
    }

    return {
        questions: data || [],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
    }
}

/**
 * Bulk delete questions
 */
export async function deleteQuestions(questionIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('questions')
        .delete()
        .in('id', questionIds)
        .eq('created_by', user.id) // Security check

    if (error) {
        logSupabaseError('Error deleting questions', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
