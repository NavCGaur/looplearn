/**
 * SM-2 Spaced Repetition Algorithm
 * Adapted for educational quiz application
 */

export interface SRSCard {
    easeFactor: number    // 1.3 - 2.5 (difficulty multiplier)
    intervalDays: number  // Days until next review
    repetitions: number   // Consecutive correct answers
}

export type Quality = 0 | 1 | 2 | 3 // 0=Wrong, 1=Hard, 2=Good, 3=Easy

/**
 * Calculate next review based on SM-2 algorithm
 * @param card Current SRS state
 * @param quality User's performance (0-3)
 * @returns Updated SRS state
 */
export function calculateNextReview(
    card: SRSCard,
    quality: Quality
): SRSCard {
    let { easeFactor, intervalDays, repetitions } = card

    // Adjust ease factor based on performance
    easeFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02))
    )

    if (quality < 2) {
        // Wrong/Hard: Reset but keep some progress
        repetitions = 0
        intervalDays = 1
    } else {
        // Correct answer
        repetitions += 1

        if (repetitions === 1) {
            intervalDays = 1
        } else if (repetitions === 2) {
            intervalDays = 6
        } else {
            intervalDays = Math.round(intervalDays * easeFactor)
        }
    }

    return { easeFactor, intervalDays, repetitions }
}

import { getStartOfISTDay } from '../date-utils'

/**
 * Calculate next review date
 * Uses IST (Indian Standard Time) day boundary (12:00 AM IST)
 */
export function getNextReviewDate(intervalDays: number): Date {
    const next = new Date()
    // Add interval days to current time
    next.setDate(next.getDate() + intervalDays)

    // Normalize to start of IST day
    return getStartOfISTDay(next)
}

/**
 * Initialize new SRS card with defaults
 */
export function createNewCard(): SRSCard {
    return {
        easeFactor: 2.5,
        intervalDays: 0,
        repetitions: 0
    }
}
