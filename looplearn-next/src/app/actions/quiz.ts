'use server'

import { createClient } from '@/lib/supabase/server'
import type { QuizQuestion } from '@/types/db'
import { logSupabaseError } from '@/lib/utils/error-logger'

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
        return loadQuestionsForUser(user.id, subject, limit)
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
    limit: number
): Promise<QuizQuestion[]> {
    const supabase = await createClient()

    // Get user's class standard
    const { data: profile } = await supabase
        .from('profiles')
        .select('class_standard')
        .eq('id', userId)
        .single()

    if (!profile) return []

    // Get questions due for review
    const { data: dueProgress } = await supabase
        .from('user_progress')
        .select(`
      question_id,
      questions (
        id,
        question_text,
        question_type,
        class_standard,
        subject,
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
        .limit(limit)

    const dueQuestions = dueProgress?.map(p => p.questions).filter(Boolean) || []

    // If we need more questions, add new ones
    if (dueQuestions.length < limit) {
        const needed = limit - dueQuestions.length
        const { data: newQuestions } = await supabase
            .from('questions')
            .select(`
        *,
        question_options (*),
        fillblank_answers (*)
      `)
            .eq('subject', subject)
            .lte('class_standard', profile.class_standard)
            .eq('is_active', true)
            .not('id', 'in', `(${dueQuestions.map((q: any) => q.id).join(',')})`)
            .limit(needed)

        return [...dueQuestions, ...(newQuestions || [])] as unknown as QuizQuestion[]
    }

    return dueQuestions as unknown as QuizQuestion[]
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
