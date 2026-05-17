import { describe, it, expect } from 'vitest'
import {
    calculateNextReview,
    createNewCard,
    getNextReviewDate,
    type SRSCard,
    type Quality,
} from '@/lib/srs/algorithm'

// ─── createNewCard ──────────────────────────────────────────────────────────

describe('createNewCard', () => {
    it('returns default values for a brand-new card', () => {
        const card = createNewCard()
        expect(card.easeFactor).toBe(2.5)
        expect(card.intervalDays).toBe(0)
        expect(card.repetitions).toBe(0)
    })
})

// ─── calculateNextReview ────────────────────────────────────────────────────

describe('calculateNextReview – wrong / hard answers reset repetitions', () => {
    const freshCard = createNewCard()

    it('quality=0 (Wrong): resets repetitions and sets interval to 1', () => {
        const result = calculateNextReview(freshCard, 0)
        expect(result.repetitions).toBe(0)
        expect(result.intervalDays).toBe(1)
    })

    it('quality=1 (Hard): resets repetitions and sets interval to 1', () => {
        const result = calculateNextReview(freshCard, 1)
        expect(result.repetitions).toBe(0)
        expect(result.intervalDays).toBe(1)
    })

    it('ease factor never drops below 1.3 no matter how many wrong answers', () => {
        let card = createNewCard()
        // Apply 20 wrong answers
        for (let i = 0; i < 20; i++) {
            card = calculateNextReview(card, 0)
        }
        expect(card.easeFactor).toBeGreaterThanOrEqual(1.3)
    })
})

describe('calculateNextReview – correct answers follow SM-2 intervals', () => {
    it('quality=2 (Good), 1st repetition → interval = 1 day', () => {
        const card = createNewCard()
        const result = calculateNextReview(card, 2)
        expect(result.repetitions).toBe(1)
        expect(result.intervalDays).toBe(1)
    })

    it('quality=2 (Good), 2nd repetition → interval = 6 days', () => {
        let card = createNewCard()
        card = calculateNextReview(card, 2)   // rep 1 → 1 day
        card = calculateNextReview(card, 2)   // rep 2 → 6 days
        expect(card.repetitions).toBe(2)
        expect(card.intervalDays).toBe(6)
    })

    it('quality=2 (Good), 3rd repetition → interval multiplied by easeFactor', () => {
        let card = createNewCard()
        card = calculateNextReview(card, 2)   // rep 1 → 1 day
        card = calculateNextReview(card, 2)   // rep 2 → 6 days
        const prevInterval = card.intervalDays
        const prevEaseFactor = card.easeFactor
        card = calculateNextReview(card, 2)   // rep 3 → round(6 * easeFactor)
        expect(card.repetitions).toBe(3)
        expect(card.intervalDays).toBe(Math.round(prevInterval * prevEaseFactor))
    })

    it('quality=3 (Easy): increases ease factor and increments repetitions', () => {
        const card = createNewCard()
        const result = calculateNextReview(card, 3)
        expect(result.repetitions).toBe(1)
        expect(result.easeFactor).toBeGreaterThan(card.easeFactor)
    })
})

describe('calculateNextReview – wrong answer after streak resets correctly', () => {
    it('after 3 good answers, a wrong answer resets repetitions to 0 and interval to 1', () => {
        let card = createNewCard()
        card = calculateNextReview(card, 2)
        card = calculateNextReview(card, 2)
        card = calculateNextReview(card, 2)
        // Now reset with a wrong answer
        card = calculateNextReview(card, 0)
        expect(card.repetitions).toBe(0)
        expect(card.intervalDays).toBe(1)
    })
})

// ─── getNextReviewDate ───────────────────────────────────────────────────────

describe('getNextReviewDate', () => {
    it('returns a Date object in the future for interval > 0', () => {
        const now = new Date()
        const result = getNextReviewDate(5)
        expect(result).toBeInstanceOf(Date)
        expect(result.getTime()).toBeGreaterThan(now.getTime())
    })

    it('interval=1 returns a date at least 1 second in the future and at most 2 days out', () => {
        // getNextReviewDate normalizes to IST midnight, so it might not be exactly
        // 24h from now — e.g. if called at 11 PM IST, the result is only ~1h away.
        // We just verify it's in the future and within a 2-day window.
        const before = Date.now()
        const result = getNextReviewDate(1)
        const diffMs = result.getTime() - before
        const twoDaysMs = 2 * 24 * 60 * 60 * 1000
        expect(diffMs).toBeGreaterThan(0)           // must be in the future
        expect(diffMs).toBeLessThanOrEqual(twoDaysMs) // at most 2 days out
    })

    it('a longer interval returns a further future date', () => {
        const date5 = getNextReviewDate(5)
        const date10 = getNextReviewDate(10)
        expect(date10.getTime()).toBeGreaterThan(date5.getTime())
    })
})
