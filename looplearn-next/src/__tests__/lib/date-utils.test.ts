import { describe, it, expect } from 'vitest'
import { getStartOfISTDay, getISTDate } from '@/lib/date-utils'

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

// ─── getStartOfISTDay ───────────────────────────────────────────────────────

describe('getStartOfISTDay', () => {
    it('returns a Date object', () => {
        expect(getStartOfISTDay()).toBeInstanceOf(Date)
    })

    it('the returned IST time is midnight (00:00:00)', () => {
        const result = getStartOfISTDay()
        // Shift back to IST perspective
        const inIST = new Date(result.getTime() + IST_OFFSET_MS)
        expect(inIST.getUTCHours()).toBe(0)
        expect(inIST.getUTCMinutes()).toBe(0)
        expect(inIST.getUTCSeconds()).toBe(0)
        expect(inIST.getUTCMilliseconds()).toBe(0)
    })

    it('Feb 14 15:00 UTC (8:30 PM IST) → start of Feb 14 IST = Feb 13 18:30 UTC', () => {
        // 2026-02-14T15:00:00Z is 8:30 PM IST.
        // The start of that IST day is Feb 14 00:00 IST = Feb 13 18:30 UTC.
        const input = new Date('2026-02-14T15:00:00Z')
        const result = getStartOfISTDay(input)
        expect(result.toISOString()).toBe('2026-02-13T18:30:00.000Z')
    })

    it('Feb 14 20:00 UTC (Feb 15 01:30 AM IST) → start of Feb 15 IST = Feb 14 18:30 UTC', () => {
        // 2026-02-14T20:00:00Z crosses midnight into Feb 15 IST.
        const input = new Date('2026-02-14T20:00:00Z')
        const result = getStartOfISTDay(input)
        expect(result.toISOString()).toBe('2026-02-14T18:30:00.000Z')
    })

    it('exactly at IST midnight (00:00 IST = 18:30 UTC previous day) → same day', () => {
        // 2026-02-14T18:30:00Z = Feb 15 00:00:00 IST exactly.
        // Start of Feb 15 IST = Feb 14 18:30 UTC (same as input).
        const input = new Date('2026-02-14T18:30:00Z')
        const result = getStartOfISTDay(input)
        expect(result.toISOString()).toBe('2026-02-14T18:30:00.000Z')
    })
})

// ─── getISTDate ──────────────────────────────────────────────────────────────

describe('getISTDate', () => {
    it('returns a Date object shifted by +5:30 from UTC', () => {
        const utcNoon = new Date('2026-02-14T12:00:00Z') // 12:00 UTC = 17:30 IST
        const result = getISTDate(utcNoon)
        // In UTC terms, result should be +5:30 ahead
        expect(result.getTime()).toBe(utcNoon.getTime() + IST_OFFSET_MS)
        // Should be 5:30 PM IST, i.e. UTC 17:30
        expect(result.getUTCHours()).toBe(17)
        expect(result.getUTCMinutes()).toBe(30)
    })

    it('defaults to current time when no argument is passed', () => {
        const before = Date.now()
        const result = getISTDate()
        const after = Date.now()
        // IST date should be roughly now + 5.5h
        expect(result.getTime()).toBeGreaterThanOrEqual(before + IST_OFFSET_MS)
        expect(result.getTime()).toBeLessThanOrEqual(after + IST_OFFSET_MS)
    })
})
