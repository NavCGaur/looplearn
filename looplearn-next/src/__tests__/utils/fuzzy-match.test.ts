import { describe, it, expect } from 'vitest'
import { normalizeLatex, fuzzyMatchAnswer, exactMatch } from '@/lib/utils/fuzzy-match'

// ─── normalizeLatex ─────────────────────────────────────────────────────────

describe('normalizeLatex', () => {
    it('removes $ delimiters', () => {
        expect(normalizeLatex('$hello$')).toBe('hello')
    })

    it('strips \\text{} keeping inner content', () => {
        expect(normalizeLatex('$\\text{Water}$')).toBe('water')
    })

    it('strips \\ce{} keeping inner content (chemical formula)', () => {
        expect(normalizeLatex('$\\ce{CO_2}$')).toBe('co2')
    })

    it('converts H2O with subscript notation to h2o', () => {
        // "$\\text{H}_2\\text{O}$" → "H2O" → lowercase → "h2o"
        const result = normalizeLatex('$\\text{H}_2\\text{O}$')
        expect(result).toBe('h2o')
    })

    it('removes subscript number notation _2', () => {
        expect(normalizeLatex('H_2O')).toBe('h2o')
    })

    it('removes bracketed subscript _{2}', () => {
        expect(normalizeLatex('H_{2}O')).toBe('h2o')
    })

    it('removes superscript ^', () => {
        expect(normalizeLatex('x^2')).toBe('x2')
    })

    it('collapses multiple spaces and trims', () => {
        expect(normalizeLatex('  hello   world  ')).toBe('hello world')
    })

    it('lowercases the result', () => {
        expect(normalizeLatex('Oxygen')).toBe('oxygen')
    })

    it('plain text with no LaTeX is returned lowercased and trimmed', () => {
        expect(normalizeLatex('  Photosynthesis  ')).toBe('photosynthesis')
    })
})

// ─── fuzzyMatchAnswer ───────────────────────────────────────────────────────

describe('fuzzyMatchAnswer', () => {
    it('exact match returns true', () => {
        expect(fuzzyMatchAnswer('photosynthesis', ['photosynthesis'])).toBe(true)
    })

    it('case-insensitive match via normalization returns true', () => {
        expect(fuzzyMatchAnswer('Photosynthesis', ['photosynthesis'])).toBe(true)
    })

    it('typo within fuzzy threshold returns true', () => {
        // "photosynths" vs "photosynthesis" — close enough with default threshold
        expect(fuzzyMatchAnswer('photosynths', ['photosynthesis'])).toBe(true)
    })

    it('completely wrong answer returns false', () => {
        expect(fuzzyMatchAnswer('elephant', ['photosynthesis'])).toBe(false)
    })

    it('matches against any of multiple correct answers', () => {
        expect(fuzzyMatchAnswer('h2o', ['dihydrogen monoxide', 'water', 'h2o'])).toBe(true)
    })

    it('LaTeX answer strips correctly before matching', () => {
        // User types plain text, correct answer has LaTeX
        expect(fuzzyMatchAnswer('co2', ['$\\ce{CO_2}$'])).toBe(true)
    })

    it('empty correct answers array returns false', () => {
        expect(fuzzyMatchAnswer('anything', [])).toBe(false)
    })
})

// ─── exactMatch ─────────────────────────────────────────────────────────────

describe('exactMatch', () => {
    it('returns true for exact match (case-insensitive by default)', () => {
        expect(exactMatch('Water', ['water'])).toBe(true)
    })

    it('returns true when one of multiple answers matches', () => {
        expect(exactMatch('h2o', ['dihydrogen monoxide', 'water', 'h2o'])).toBe(true)
    })

    it('returns false when no answer matches', () => {
        expect(exactMatch('acid', ['base', 'water'])).toBe(false)
    })

    it('returns true for exact match when caseSensitive=true', () => {
        expect(exactMatch('Water', ['Water'], true)).toBe(true)
    })

    it('returns false when case does not match and caseSensitive=true', () => {
        expect(exactMatch('water', ['Water'], true)).toBe(false)
    })
})
