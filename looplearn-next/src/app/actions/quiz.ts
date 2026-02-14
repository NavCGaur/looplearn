'use server'

import { createClient } from '@/lib/supabase/server'
import type { QuizQuestion } from '@/types/db'
import { logSupabaseError } from '@/lib/utils/error-logger'
import { getStartOfISTDay } from '@/lib/date-utils'

/**
 * Load quiz questions for a user based on their class and subject
 * For guests: Returns random questions
 * For users: Returns questions due for review (SRS) + new questions
 */
export async function loadQuizQuestions(params: {
    subject: string
    classStandard?: number
    limit?: number
    excludeQuestionIds?: string[]
    chapter?: string
}): Promise<QuizQuestion[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { subject, classStandard, limit = 10, excludeQuestionIds = [], chapter } = params

    if (user) {
        // Registered user: Load questions based on SRS
        return loadQuestionsForUser(user.id, subject, limit, chapter)
    } else {
        // Guest: Load random questions, excluding previously seen ones
        return loadQuestionsForGuest(subject, classStandard || 8, limit, excludeQuestionIds, chapter)
    }
}

/**
 * Fetch available metadata for guest setup (Classes, Subjects, Chapters)
 */
export async function getQuizMetadata() {
    const supabase = await createClient()

    // Get all active questions to derive metadata
    // Note: In a larger app, we would have separate tables for this or use a more optimized query
    const { data: questions } = await supabase
        .from('questions')
        .select('class_standard, subject, chapter')
        .eq('is_active', true)

    if (!questions) return { classes: [], subjects: {}, chapters: {} }

    // Extract unique classes
    const classes = [...new Set(questions.map(q => q.class_standard))].sort((a, b) => a - b)

    // Extract subjects per class
    const subjects: Record<number, string[]> = {}
    classes.forEach(c => {
        const classQuestions = questions.filter(q => q.class_standard === c)
        subjects[c] = [...new Set(classQuestions.map(q => q.subject))].sort()
    })

    // Extract chapters per class + subject
    const chapters: Record<string, string[]> = {}
    classes.forEach(c => {
        const classSubjects = subjects[c] || []
        classSubjects.forEach(s => {
            const key = `${c}-${s}`
            const subjectQuestions = questions.filter(q => q.class_standard === c && q.subject === s)

            // Filter out null/undefined chapters if any
            const rawChapters = subjectQuestions.map(q => q.chapter).filter(Boolean) as string[]

            // Use Fuse to group similar chapters
            // Goal: "Matter in our sorroundings" and "Matter in our surroundings" -> "Matter In Our Surroundings"

            let remaining = [...new Set(rawChapters)]
            const groups: string[][] = []

            // Dynamic import Fuse since it's a server action
            const Fuse = require('fuse.js')

            while (remaining.length > 0) {
                const current = remaining[0]
                const fuse = new Fuse(remaining, { includeScore: true, threshold: 0.3 }) // 0.3 threshold for similarity
                const results = fuse.search(current)

                // All matches (including itself) form a group
                const group = results.map((r: any) => r.item)
                groups.push(group)

                // Remove grouped items from remaining
                remaining = remaining.filter(r => !group.includes(r))
            }

            const uniqueChapters = new Set<string>()

            groups.forEach(group => {
                // Heuristic: Pick the first one and Title Case it.
                // ideally we would pick the most frequent one, but for now simple normalization of the cluster leader.
                const bestMatch = group[0]
                const normalized = bestMatch
                    .toLowerCase()
                    .replace(/&/g, 'and')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
                    .trim()

                uniqueChapters.add(normalized)
            })

            chapters[key] = [...uniqueChapters].sort()
        })
    })

    return { classes, subjects, chapters }
}

async function loadQuestionsForUser(
    userId: string,
    subject: string,
    limit: number,
    chapter?: string
): Promise<QuizQuestion[]> {
    const supabase = await createClient()

    // Get user's class standard
    const { data: profile } = await supabase
        .from('profiles')
        .select('class_standard')
        .eq('id', userId)
        .single()

    if (!profile) return []

    const today = getStartOfISTDay(new Date())
    const todayISO = today.toISOString()

    // PRIORITY 1: Get never-attempted questions (NOT in user_progress)
    let neverAttemptedQuery = supabase
        .from('questions')
        .select(`
            *,
            question_options (*),
            fillblank_answers (*)
        `)
        .eq('subject', subject)
        .eq('class_standard', profile.class_standard)
        .eq('is_active', true)

    // Filter by chapter if provided
    if (chapter) {
        neverAttemptedQuery = neverAttemptedQuery.ilike('chapter', `%${chapter}%`)
    }

    // Exclude questions that exist in user_progress
    const { data: attemptedQuestionIds } = await supabase
        .from('user_progress')
        .select('question_id')
        .eq('user_id', userId)

    if (attemptedQuestionIds && attemptedQuestionIds.length > 0) {
        const attemptedIds = attemptedQuestionIds.map(p => p.question_id).join(',')
        neverAttemptedQuery = neverAttemptedQuery.not('id', 'in', `(${attemptedIds})`)
    }

    const { data: neverAttempted } = await neverAttemptedQuery.limit(limit)
    const neverAttemptedQuestions = (neverAttempted || []) as unknown as QuizQuestion[]

    // If we have enough never-attempted questions, return them
    if (neverAttemptedQuestions.length >= limit) {
        return neverAttemptedQuestions.slice(0, limit)
    }

    const collected: QuizQuestion[] = [...neverAttemptedQuestions]
    const collectedIds = new Set(collected.map(q => q.id))
    let needed = limit - collected.length

    // PRIORITY 2: Get due review questions (SRS scheduled)
    if (needed > 0) {
        let dueQuery = supabase
            .from('user_progress')
            .select(`
                question_id,
                questions (
                    id,
                    question_text,
                    question_type,
                    class_standard,
                    subject,
                    chapter,
                    difficulty,
                    points,
                    question_options (
                        id,
                        option_text,
                        display_order,
                        is_correct
                    ),
                    fillblank_answers (
                        id,
                        accepted_answer,
                        is_case_sensitive,
                        is_primary
                    )
                )
            `)
            .eq('user_id', userId)
            .lte('next_review_date', new Date().toISOString())
            .limit(needed)

        const { data: dueProgress } = await dueQuery
        const dueQuestions = (dueProgress?.map(p => p.questions).filter(Boolean) || []) as unknown as QuizQuestion[]

        // Filter by chapter if provided
        const filteredDue = chapter
            ? dueQuestions.filter(q => q.chapter?.toLowerCase().includes(chapter.toLowerCase()))
            : dueQuestions

        for (const q of filteredDue) {
            if (!collectedIds.has(q.id) && collected.length < limit) {
                collected.push(q)
                collectedIds.add(q.id)
            }
        }

        needed = limit - collected.length
    }

    // PRIORITY 3: Get not-attempted-today questions
    if (needed > 0) {
        let notTodayQuery = supabase
            .from('user_progress')
            .select(`
                question_id,
                last_reviewed,
                questions (
                    id,
                    question_text,
                    question_type,
                    class_standard,
                    subject,
                    chapter,
                    difficulty,
                    points,
                    question_options (
                        id,
                        option_text,
                        display_order,
                        is_correct
                    ),
                    fillblank_answers (
                        id,
                        accepted_answer,
                        is_case_sensitive,
                        is_primary
                    )
                )
            `)
            .eq('user_id', userId)
            .lt('last_reviewed', todayISO)
            .order('last_reviewed', { ascending: true })
            .limit(needed * 2) // Get more to filter by chapter

        const { data: notTodayProgress } = await notTodayQuery
        const notTodayQuestions = (notTodayProgress?.map(p => p.questions).filter(Boolean) || []) as unknown as QuizQuestion[]

        // Filter by chapter if provided
        const filteredNotToday = chapter
            ? notTodayQuestions.filter(q => q.chapter?.toLowerCase().includes(chapter.toLowerCase()))
            : notTodayQuestions

        for (const q of filteredNotToday) {
            if (!collectedIds.has(q.id) && collected.length < limit) {
                collected.push(q)
                collectedIds.add(q.id)
            }
        }

        needed = limit - collected.length
    }

    // PRIORITY 4: Get oldest attempts (fallback)
    if (needed > 0) {
        let oldestQuery = supabase
            .from('user_progress')
            .select(`
                question_id,
                last_reviewed,
                questions (
                    id,
                    question_text,
                    question_type,
                    class_standard,
                    subject,
                    chapter,
                    difficulty,
                    points,
                    question_options (
                        id,
                        option_text,
                        display_order,
                        is_correct
                    ),
                    fillblank_answers (
                        id,
                        accepted_answer,
                        is_case_sensitive,
                        is_primary
                    )
                )
            `)
            .eq('user_id', userId)
            .order('last_reviewed', { ascending: true })
            .limit(needed * 2) // Get more to filter by chapter

        const { data: oldestProgress } = await oldestQuery
        const oldestQuestions = (oldestProgress?.map(p => p.questions).filter(Boolean) || []) as unknown as QuizQuestion[]

        // Filter by chapter if provided
        const filteredOldest = chapter
            ? oldestQuestions.filter(q => q.chapter?.toLowerCase().includes(chapter.toLowerCase()))
            : oldestQuestions

        for (const q of filteredOldest) {
            if (!collectedIds.has(q.id) && collected.length < limit) {
                collected.push(q)
                collectedIds.add(q.id)
            }
        }
    }

    return collected.slice(0, limit)
}

async function loadQuestionsForGuest(
    subject: string,
    classStandard: number,
    limit: number,
    excludeQuestionIds: string[] = [],
    chapter?: string
): Promise<QuizQuestion[]> {
    const supabase = await createClient()

    console.log('Loading questions for guest:', { subject, classStandard, limit, excludeCount: excludeQuestionIds.length, chapter })

    // 1. We need to find all DB chapter variants that match the requested "Canonical" chapter
    let targetChapters: string[] = []

    if (chapter) {
        // Fetch ALL chapters for this subject/class to do fuzzy matching again
        // (This is a bit redundant but safe without a persistent mapping table)
        const { data: allChapters } = await supabase
            .from('questions')
            .select('chapter')
            .eq('subject', subject)
            .lte('class_standard', classStandard) // Use lte to match setup logic? No, specific class usually. Setup uses `filter` strict eq.
            // Wait, setup uses `questions.filter(q => q.class_standard === c)`. Strict equality.
            // loadQuestionsForGuest uses `lte`... allowing harder questions?
            // "Guest: Load random questions... loadQuestionsForGuest(..., classStandard || 8)"
            // If user picks Class 10, we should probably fetch Class 10 questions.
            // The original code used `lte`. I will keep `lte` for volume but strict for chapter matching.
            .eq('is_active', true)

        const rawChapters = [...new Set(allChapters?.map(q => q.chapter) || [])]

        if (rawChapters.length > 0) {
            const Fuse = require('fuse.js')
            const fuse = new Fuse(rawChapters, { includeScore: true, threshold: 0.3 })
            // Search for the "Canonical" chapter name provided by client
            const results = fuse.search(chapter)
            targetChapters = results.map((r: any) => r.item)
            // Also include exact match just in case
            targetChapters.push(chapter)
        } else {
            targetChapters = [chapter]
        }

        console.log('Fuzzy matched chapters:', targetChapters)
    }

    let query = supabase
        .from('questions')
        .select(`
      *,
      question_options (*),
      fillblank_answers (*)
    `)
        .eq('subject', subject)
        .lte('class_standard', classStandard)
        .eq('is_active', true)

    // Filter by chapter if provided
    if (chapter && targetChapters.length > 0) {
        // Use IN filter for all variations
        query = query.in('chapter', targetChapters)
    } else if (chapter) {
        // Fallback
        query = query.ilike('chapter', chapter)
    }

    // Exclude previously seen questions
    if (excludeQuestionIds.length > 0) {
        query = query.not('id', 'in', `(${excludeQuestionIds.join(',')})`)
    }

    const { data, error } = await query.limit(limit * 2) // Get more to shuffle

    console.log('Query result:', { dataCount: data?.length, hasError: !!error })

    // Log first question structure to debug
    if (data && data.length > 0) {
        console.log('First question structure:', JSON.stringify(data[0], null, 2))
    }

    if (error) {
        logSupabaseError('Error loading questions', error)
        return []
    }

    if (!data || data.length === 0) {
        console.warn('No questions found for:', { subject, classStandard })
        return []
    }

    // Shuffle and return limit
    const shuffled = data.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, limit) as unknown as QuizQuestion[]
}

/**
 * Update user progress after answering a question
 * Uses SM-2 algorithm to calculate next review date
 */
export async function updateProgress(params: {
    questionId: string
    quality: 0 | 1 | 2 | 3
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Must be logged in to save progress' }
    }

    const { questionId, quality } = params

    // Get existing progress or create new
    const { data: existing } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .single()

    const { calculateNextReview, getNextReviewDate, createNewCard } = await import('@/lib/srs/algorithm')

    const card = existing
        ? {
            easeFactor: existing.ease_factor,
            intervalDays: existing.interval_days,
            repetitions: existing.repetitions,
        }
        : createNewCard()

    const updated = calculateNextReview(card, quality)
    const nextReviewDate = getNextReviewDate(updated.intervalDays)

    if (existing) {
        // Update existing
        await supabase
            .from('user_progress')
            .update({
                ease_factor: updated.easeFactor,
                interval_days: updated.intervalDays,
                repetitions: updated.repetitions,
                last_quality: quality,
                next_review_date: nextReviewDate.toISOString(),
                last_reviewed: new Date().toISOString(),
            })
            .eq('id', existing.id)
    } else {
        // Insert new
        await supabase.from('user_progress').insert({
            user_id: user.id,
            question_id: questionId,
            ease_factor: updated.easeFactor,
            interval_days: updated.intervalDays,
            repetitions: updated.repetitions,
            last_quality: quality,
            next_review_date: nextReviewDate.toISOString(),
            last_reviewed: new Date().toISOString(),
        })
    }

    return { success: true, nextReview: nextReviewDate }
}

/**
 * Award points to user for correct answers
 */
export async function awardPoints(points: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Must be logged in to earn points' }
    }

    // Increment points
    const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single()

    if (!profile) return { error: 'Profile not found' }

    await supabase
        .from('profiles')
        .update({ points: profile.points + points })
        .eq('id', user.id)

    return { success: true, totalPoints: profile.points + points }
}

/**
 * Log details of a user's answer
 */
export async function logAnswer(params: {
    questionId: string
    givenAnswer: string
    isCorrect: boolean
    questionType: string
    timeTaken: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    let errorType: string | null = null

    // If answer is incorrect, check for spelling error
    if (!params.isCorrect && params.givenAnswer) {
        // Fetch the correct answer for comparison
        // We need to fetch based on question type
        const { data: question } = await supabase
            .from('questions')
            .select(`
                question_type,
                question_options (option_text, is_correct),
                fillblank_answers (accepted_answer, is_primary)
            `)
            .eq('id', params.questionId)
            .single()

        if (question) {
            let correctAnswer = ''

            if (['mcq', 'truefalse'].includes(question.question_type) && question.question_options) {
                const correctOpt = question.question_options.find((o: any) => o.is_correct)
                if (correctOpt) correctAnswer = correctOpt.option_text
            } else if (question.question_type === 'fillblank' && question.fillblank_answers) {
                const correctAns = question.fillblank_answers.find((a: any) => a.is_primary)
                // Fallback to any answer if primary not found
                if (correctAns) correctAnswer = correctAns.accepted_answer
                else if (question.fillblank_answers.length > 0) correctAnswer = question.fillblank_answers[0].accepted_answer
            }

            if (correctAnswer) {
                const { isSpellingError } = await import('@/lib/utils/string-similarity')
                if (isSpellingError(params.givenAnswer, correctAnswer)) {
                    errorType = 'spelling'
                }
            }
        }
    }

    const { error } = await supabase.from('quiz_logs').insert({
        user_id: user.id,
        question_id: params.questionId,
        given_answer: params.givenAnswer,
        is_correct: params.isCorrect,
        question_type: params.questionType,
        time_taken_seconds: params.timeTaken,
        error_type: errorType
    })

    if (error) {
        logSupabaseError('Error logging answer', error)
        return { error: error.message }
    }

    return { success: true }
}
