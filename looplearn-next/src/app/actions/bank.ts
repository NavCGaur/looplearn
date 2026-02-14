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
        query = query.ilike('chapter', `%${chapter}%`)
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
 * Note: Database has CASCADE DELETE configured for:
 * - question_options
 * - fillblank_answers  
 * - user_progress
 * These will be automatically deleted when the question is deleted.
 */
export async function deleteQuestions(questionIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Verify user is a teacher/admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
        throw new Error('Only teachers and admins can delete questions')
    }

    // Delete questions (CASCADE will handle related data)
    // Admins can delete any questions, teachers can only delete their own
    let deleteQuery = supabase
        .from('questions')
        .delete({ count: 'exact' })
        .in('id', questionIds)

    // Only filter by created_by if not an admin
    if (profile.role !== 'admin') {
        deleteQuery = deleteQuery.eq('created_by', user.id)
    }

    const { error, count } = await deleteQuery

    if (error) {
        logSupabaseError('Error deleting questions', error)
        console.error('Delete failed:', {
            questionIds,
            userRole: profile.role,
            userId: user.id,
            error: error.message,
            hint: error.hint,
            details: error.details
        })
        throw new Error(`Failed to delete questions: ${error.message}`)
    }

    console.log(`Successfully deleted ${count} questions and their related data`)
    return { success: true, deletedCount: count }
}
