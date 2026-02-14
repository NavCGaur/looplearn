'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export interface AnalyticsFilters {
    timeRange?: '7' | '30' | '90' | 'all'
    subject?: string
    difficulty?: string
}

export interface QuestionPerformance {
    id: string
    question_text: string
    subject: string
    difficulty: string
    chapter: string | null
    total_attempts: number
    avg_quality: number
    struggle_rate: number
    avg_repetitions: number
}

export interface AnalyticsDashboard {
    overview: {
        activeStudents: number
        avgPerformance: number
        strugglingQuestions: number
        atRiskStudents: number
    }
    subjectBreakdown: {
        subject: string
        avgQuality: number
        totalQuestions: number
        mastered: number
        learning: number
    }[]
    topStrugglingQuestions: QuestionPerformance[]
}

/**
 * Get analytics dashboard overview
 */
export async function getAnalyticsDashboard(filters: AnalyticsFilters = {}): Promise<AnalyticsDashboard | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Verify teacher role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
        return null
    }

    // Calculate time range filter
    const timeFilter = getTimeFilter(filters.timeRange)

    // Get all user progress for teacher's questions
    // Use admin client to bypass link-table RLS policies involved in the join
    const adminSupabase = createAdminClient()
    let query = adminSupabase
        .from('user_progress')
        .select(`
            user_id,
            question_id,
            last_quality,
            repetitions,
            last_reviewed,
            questions!inner (
                id,
                question_text,
                subject,
                difficulty,
                chapter,
                created_by
            )
        `)
        .eq('questions.created_by', user.id)

    if (timeFilter) {
        query = query.gte('last_reviewed', timeFilter)
    }

    if (filters.subject) {
        query = query.eq('questions.subject', filters.subject)
    }

    if (filters.difficulty) {
        query = query.eq('questions.difficulty', filters.difficulty)
    }

    const { data: progressData } = await query

    if (!progressData || progressData.length === 0) {
        return {
            overview: {
                activeStudents: 0,
                avgPerformance: 0,
                strugglingQuestions: 0,
                atRiskStudents: 0
            },
            subjectBreakdown: [],
            topStrugglingQuestions: []
        }
    }

    // Calculate overview metrics
    const uniqueStudents = new Set(progressData.map(p => p.user_id))
    const activeStudents = uniqueStudents.size

    const totalQuality = progressData.reduce((sum, p) => sum + (p.last_quality || 0), 0)
    const avgPerformance = progressData.length > 0 ? totalQuality / progressData.length : 0

    // Group by question for question-level analysis
    const questionMap = new Map<string, any[]>()
    progressData.forEach(p => {
        const questions = p.questions as any
        const qId = questions.id
        if (!questionMap.has(qId)) {
            questionMap.set(qId, [])
        }
        questionMap.get(qId)!.push(p)
    })

    // Calculate question performance
    const questionPerformances: QuestionPerformance[] = []
    questionMap.forEach((attempts, questionId) => {
        const question = attempts[0].questions
        const totalAttempts = attempts.length
        const avgQuality = attempts.reduce((sum, a) => sum + (a.last_quality || 0), 0) / totalAttempts
        const struggleCount = attempts.filter(a => (a.last_quality || 0) <= 1).length
        const struggleRate = (struggleCount / totalAttempts) * 100
        const avgRepetitions = attempts.reduce((sum, a) => sum + (a.repetitions || 0), 0) / totalAttempts

        questionPerformances.push({
            id: questionId,
            question_text: question.question_text,
            subject: question.subject,
            difficulty: question.difficulty,
            chapter: question.chapter,
            total_attempts: totalAttempts,
            avg_quality: avgQuality,
            struggle_rate: struggleRate,
            avg_repetitions: avgRepetitions
        })
    })

    const strugglingQuestions = questionPerformances.filter(q => q.struggle_rate > 50).length

    // Calculate at-risk students (avg quality < 1.5)
    const studentQualityMap = new Map<string, number[]>()
    progressData.forEach(p => {
        if (!studentQualityMap.has(p.user_id)) {
            studentQualityMap.set(p.user_id, [])
        }
        studentQualityMap.get(p.user_id)!.push(p.last_quality || 0)
    })

    let atRiskStudents = 0
    studentQualityMap.forEach(qualities => {
        const avg = qualities.reduce((sum, q) => sum + q, 0) / qualities.length
        if (avg < 1.5) atRiskStudents++
    })

    // Subject breakdown
    const subjectMap = new Map<string, { qualities: number[], mastered: number, learning: number }>()
    progressData.forEach(p => {
        const questions = p.questions as any
        const subject = questions.subject
        if (!subjectMap.has(subject)) {
            subjectMap.set(subject, { qualities: [], mastered: 0, learning: 0 })
        }
        const subjectData = subjectMap.get(subject)!
        subjectData.qualities.push(p.last_quality || 0)
        if ((p.repetitions || 0) >= 3) {
            subjectData.mastered++
        } else {
            subjectData.learning++
        }
    })

    const subjectBreakdown = Array.from(subjectMap.entries()).map(([subject, data]) => ({
        subject,
        avgQuality: data.qualities.reduce((sum, q) => sum + q, 0) / data.qualities.length,
        totalQuestions: new Set(progressData.filter(p => (p.questions as any).subject === subject).map(p => p.question_id)).size,
        mastered: data.mastered,
        learning: data.learning
    }))

    // Top 10 struggling questions
    const topStrugglingQuestions = questionPerformances
        .sort((a, b) => a.avg_quality - b.avg_quality)
        .slice(0, 10)

    return {
        overview: {
            activeStudents,
            avgPerformance: Math.round(avgPerformance * 100) / 100,
            strugglingQuestions,
            atRiskStudents
        },
        subjectBreakdown,
        topStrugglingQuestions
    }
}

/**
 * Get detailed question performance data
 */
export async function getQuestionPerformance(filters: AnalyticsFilters = {}): Promise<QuestionPerformance[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Verify teacher role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
        return []
    }

    const timeFilter = getTimeFilter(filters.timeRange)

    const adminSupabase = createAdminClient()
    let query = adminSupabase
        .from('user_progress')
        .select(`
            question_id,
            last_quality,
            repetitions,
            last_reviewed,
            questions!inner (
                id,
                question_text,
                subject,
                difficulty,
                chapter,
                created_by
            )
        `)
        .eq('questions.created_by', user.id)

    if (timeFilter) {
        query = query.gte('last_reviewed', timeFilter)
    }

    if (filters.subject) {
        query = query.eq('questions.subject', filters.subject)
    }

    if (filters.difficulty) {
        query = query.eq('questions.difficulty', filters.difficulty)
    }

    const { data: progressData } = await query

    if (!progressData || progressData.length === 0) {
        return []
    }

    // Group by question
    const questionMap = new Map<string, any[]>()
    progressData.forEach(p => {
        const questions = p.questions as any
        const qId = questions.id
        if (!questionMap.has(qId)) {
            questionMap.set(qId, [])
        }
        questionMap.get(qId)!.push(p)
    })

    // Calculate performance metrics
    const performances: QuestionPerformance[] = []
    questionMap.forEach((attempts, questionId) => {
        const question = attempts[0].questions
        const totalAttempts = attempts.length
        const avgQuality = attempts.reduce((sum, a) => sum + (a.last_quality || 0), 0) / totalAttempts
        const struggleCount = attempts.filter(a => (a.last_quality || 0) <= 1).length
        const struggleRate = (struggleCount / totalAttempts) * 100
        const avgRepetitions = attempts.reduce((sum, a) => sum + (a.repetitions || 0), 0) / totalAttempts

        performances.push({
            id: questionId,
            question_text: question.question_text,
            subject: question.subject,
            difficulty: question.difficulty,
            chapter: question.chapter,
            total_attempts: totalAttempts,
            avg_quality: Math.round(avgQuality * 100) / 100,
            struggle_rate: Math.round(struggleRate * 10) / 10,
            avg_repetitions: Math.round(avgRepetitions * 10) / 10
        })
    })

    return performances.sort((a, b) => a.avg_quality - b.avg_quality)
}


/**
 * Helper to calculate time filter
 */
function getTimeFilter(timeRange?: string): string | null {
    if (!timeRange || timeRange === 'all') return null

    const now = new Date()
    const days = parseInt(timeRange)
    const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return date.toISOString()
}

/**
 * Get activity logs for a specific student
 */
export async function getStudentActivityLogs(studentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Verify teacher/admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
        return []
    }

    // Fetch logs with question details
    const { data: logs, error } = await supabase
        .from('quiz_logs')
        .select(`
            id,
            given_answer,
            is_correct,
            question_type,
            time_taken_seconds,
            error_type,
            created_at,
            questions:questions!quiz_logs_question_id_fkey (
                question_text,
                subject,
                difficulty,
                question_options (
                    option_text,
                    is_correct
                ),
                fillblank_answers (
                    accepted_answer,
                    is_primary
                )
            )
        `)
        .eq('user_id', studentId)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error fetching logs:', error)
        return []
    }

    return logs.map(log => {
        // Determine correct answer text
        let correctAnswer = 'N/A'
        const q = log.questions as any

        if (q) {
            if (log.question_type === 'mcq' && q.question_options) {
                const correctOpt = q.question_options.find((o: any) => o.is_correct)
                correctAnswer = correctOpt ? correctOpt.option_text : 'N/A'
            } else if (log.question_type === 'fillblank' && q.fillblank_answers) {
                const correctAns = q.fillblank_answers.find((a: any) => a.is_primary)
                correctAnswer = correctAns ? correctAns.accepted_answer : (q.fillblank_answers[0]?.accepted_answer || 'N/A')
            }
        }

        return {
            id: log.id,
            questionText: q?.question_text || 'Unknown Question',
            subject: q?.subject || 'N/A',
            difficulty: q?.difficulty || 'N/A',
            givenAnswer: log.given_answer,
            correctAnswer,
            isCorrect: log.is_correct,
            timeTaken: log.time_taken_seconds,
            timestamp: log.created_at,
            errorType: log.error_type
        }
    })
}
