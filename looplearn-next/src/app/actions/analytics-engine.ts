'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export interface Chapter {
    name: string
    attempted: number
    mastered: number
    avgQuality: number // Keep for backward compat or internal difficulty tracking
    accuracy: number // New: Percentage of correct answers (0-1)
    struggleCount: number
    strugglingQuestions: {
        id: string
        text: string
        score: number
    }[]
    difficulty: Record<string, number>
}

export interface Subject {
    name: string
    attempted: number
    mastered: number
    avgQuality: number
    accuracy: number
    chapters: Record<string, Chapter>
}

export interface StudentAnalytics {
    studentName: string
    className: string
    subjects: Record<string, Subject>
}

export async function getStudentAnalytics(targetUserId?: string): Promise<StudentAnalytics | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Default to current user if no target provided
    const userIdToCheck = targetUserId || user.id

    // Check permissions
    const isViewingSelf = user.id === userIdToCheck
    let requesterIsTeacher = false

    if (!isViewingSelf) {
        const { data: requesterProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (requesterProfile?.role === 'teacher' || requesterProfile?.role === 'admin') {
            requesterIsTeacher = true
        } else {
            return null // Unauthorized
        }
    }

    // Use admin client to bypass RLS for fetching other users' data
    const adminDb = createAdminClient()

    // 1. Fetch Student Profile
    const { data: studentProfile } = await adminDb
        .from('profiles')
        .select('display_name, class_standard')
        .eq('id', userIdToCheck)
        .single()

    if (!studentProfile) return null

    // 2. Fetch User Progress with Question Metadata
    const { data: progressData, error } = await adminDb
        .from('user_progress')
        .select(`
            last_quality,
            repetitions,
            questions!inner (
                id,
                question_text,
                subject,
                chapter,
                difficulty
            )
        `)
        .eq('user_id', userIdToCheck)

    if (error || !progressData) {
        console.error("Error fetching analytics:", error)
        return {
            studentName: studentProfile.display_name || 'Student',
            className: studentProfile.class_standard?.toString() || 'N/A',
            subjects: {}
        }
    }

    // 3. Aggregate Data in Memory
    const subjects: Record<string, Subject> = {}

    progressData.forEach((entry: any) => {
        const q = entry.questions
        const subjectName = q.subject || 'Uncategorized'
        const chapterName = q.chapter || 'General'
        const difficulty = q.difficulty || 'medium'

        // Initialize Subject
        if (!subjects[subjectName]) {
            subjects[subjectName] = {
                name: subjectName,
                attempted: 0,
                mastered: 0,
                avgQuality: 0,
                accuracy: 0,
                chapters: {}
            }
        }

        const subject = subjects[subjectName]

        // Initialize Chapter
        if (!subject.chapters[chapterName]) {
            subject.chapters[chapterName] = {
                name: chapterName,
                attempted: 0,
                mastered: 0,
                avgQuality: 0,
                accuracy: 0,
                struggleCount: 0,
                strugglingQuestions: [],
                difficulty: { easy: 0, medium: 0, hard: 0 }
            }
        }

        const chapter = subject.chapters[chapterName]

        // Update counts
        subject.attempted++
        chapter.attempted++

        // Accuracy Check (Quality > 0 means they got it right, even if hard)
        if ((entry.last_quality || 0) > 0) {
            // We can track correct count temporarily in 'accuracy' field before averaging
            // Or just add a new field. Let's reuse accuracy as a counter for now since it's local
            // Actually, cleaner to just use the field as a sum of 1s and 0s
            subject.accuracy += 1
            chapter.accuracy += 1
        }

        // Quality Sum (for average calculation later)
        chapter.avgQuality += (entry.last_quality || 0)

        // Difficulty Count
        if (chapter.difficulty[difficulty] !== undefined) {
            chapter.difficulty[difficulty]++
        }

        // Mastery Check (Repetitions >= 3)
        if ((entry.repetitions || 0) >= 3) {
            subject.mastered++
            chapter.mastered++
        }

        // Struggle Check (Quality <= 1)
        if ((entry.last_quality || 0) <= 1) {
            chapter.struggleCount++
            // Increased limit to 20 as requested to see more struggling questions
            if (chapter.strugglingQuestions.length < 20) {
                chapter.strugglingQuestions.push({
                    id: q.id,
                    text: q.question_text,
                    score: entry.last_quality
                })
            }
        }
    })

    // 4. Final Calculations (Averages)
    Object.values(subjects).forEach(sub => {
        let totalSubQuality = 0

        Object.values(sub.chapters).forEach(chap => {
            if (chap.attempted > 0) {
                totalSubQuality += chap.avgQuality // Accumulate total raw quality for subject avg
                chap.avgQuality = Math.round((chap.avgQuality / chap.attempted) * 10) / 10

                // Calculate Accuracy (Correct / Attempted)
                // chapter.accuracy currently holds the 'count' of correct answers
                chap.accuracy = Math.round((chap.accuracy / chap.attempted) * 100) / 100
            }
        })

        if (sub.attempted > 0) {
            sub.avgQuality = Math.round((totalSubQuality / sub.attempted) * 10) / 10
            // subject.accuracy currently holds the 'count' of correct answers
            sub.accuracy = Math.round((sub.accuracy / sub.attempted) * 100) / 100
        }
    })

    return {
        studentName: studentProfile.display_name || 'Student',
        className: studentProfile.class_standard?.toString() || 'N/A',
        subjects
    }
}
