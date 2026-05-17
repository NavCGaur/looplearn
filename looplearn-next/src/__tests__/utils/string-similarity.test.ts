import { describe, it, expect } from 'vitest'
import { levenshteinDistance, isSpellingError } from '@/lib/utils/string-similarity'

// ─── levenshteinDistance ────────────────────────────────────────────────────

describe('levenshteinDistance', () => {
    it('returns 0 for identical strings', () => {
        expect(levenshteinDistance('hello', 'hello')).toBe(0)
    })

    it('"kitten" → "sitting" = 3 edits', () => {
        expect(levenshteinDistance('kitten', 'sitting')).toBe(3)
    })

    it('"photosyntheis" → "photosynthesis" = 1 insertion', () => {
        expect(levenshteinDistance('photosyntheis', 'photosynthesis')).toBe(1)
    })

    it('"cat" → "dog" = 3 substitutions', () => {
        expect(levenshteinDistance('cat', 'dog')).toBe(3)
    })

    it('returns correct distance for completely different strings', () => {
        expect(levenshteinDistance('', 'hello')).toBe(5)
        expect(levenshteinDistance('hello', '')).toBe(5)
    })

    it('both empty strings = distance 0', () => {
        expect(levenshteinDistance('', '')).toBe(0)
    })

    it('is commutative: distance(a,b) === distance(b,a)', () => {
        expect(levenshteinDistance('abc', 'abcd')).toBe(levenshteinDistance('abcd', 'abc'))
    })
})

// ─── isSpellingError ────────────────────────────────────────────────────────

describe('isSpellingError', () => {
    it('detects a 1-character typo as a spelling error', () => {
        // "photosynthsis" vs "photosynthesis" – 1 char off, high similarity
        expect(isSpellingError('photosynthsis', 'photosynthesis')).toBe(true)
    })

    it('detects a spelling error for a 1-char omission in a long word', () => {
        // "acceleraton" vs "acceleration": 1 missing char, max_len=12, similarity=91.7% > 80%
        expect(isSpellingError('acceleraton', 'acceleration')).toBe(true)
    })

    it('does NOT flag a completely wrong answer as a spelling error', () => {
        expect(isSpellingError('dog', 'photosynthesis')).toBe(false)
    })

    it('does NOT flag an exact correct answer as a spelling error', () => {
        expect(isSpellingError('photosynthesis', 'photosynthesis')).toBe(false)
    })

    it('returns false for empty given answer', () => {
        expect(isSpellingError('', 'photosynthesis')).toBe(false)
    })

    it('returns false for empty correct answer', () => {
        expect(isSpellingError('photosynthesis', '')).toBe(false)
    })

    it('is case-insensitive (normalizes before comparing)', () => {
        // "Gravity" vs "gravity" should NOT be a spelling error (they're the same)
        expect(isSpellingError('Gravity', 'gravity')).toBe(false)
    })

    it('detects a missing letter in a science term', () => {
        // "Newton" missing last letter
        expect(isSpellingError('Newto', 'Newton')).toBe(true)
    })

    it('does NOT flag a 2-word vs 1-word answer as spelling error', () => {
        // "Newton Law" vs "Newton" – too different
        expect(isSpellingError('Newton Law', 'Newton')).toBe(false)
    })
})
