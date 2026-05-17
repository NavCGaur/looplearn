# 🧪 LoopLearn Testing Guide

Welcome! This guide explains everything you need to know about running tests in LoopLearn — no prior testing experience needed.

---

## 📋 Quick Reference

| Command | What it does | When to use |
|---------|-------------|-------------|
| `npm test` | Runs ALL tests once and shows results | Before pushing any code change |
| `npm run test:watch` | Runs tests and re-runs automatically on file save | While actively coding |
| `npm run test:coverage` | Runs tests + shows what % of code is tested | Periodically to check test health |
| `npm run test:ui` | Opens a browser dashboard for tests | When you want a visual overview |
| `npm run typecheck` | Checks TypeScript errors without building | When you get TypeScript errors |

---

## 🚀 Running Tests — Step by Step

### 1. Open a terminal in the project folder

```
c:\Users\verti\NewLoopLearn\looplearn-next
```

### 2. Run the tests

```bash
npm test
```

### 3. Read the output

A passing run looks like this:

```
✓ src/__tests__/srs/algorithm.test.ts (12 tests)
✓ src/__tests__/utils/string-similarity.test.ts (9 tests)
✓ src/__tests__/utils/fuzzy-match.test.ts (13 tests)
✓ src/__tests__/lib/date-utils.test.ts (7 tests)

Test Files   4 passed (4)
Tests       41 passed (41)
Duration     1.2s
```

A failing run looks like this (something broke!):

```
× src/__tests__/srs/algorithm.test.ts > createNewCard > ease factor never drops below 1.3
  AssertionError: expected 1.1 to be >= 1.3
```

The failing test name tells you exactly which function broke.

---

## ❓ When Should I Run Tests?

| Situation | Action |
|-----------|--------|
| After editing any file in `src/lib/` | Run `npm test` |
| After editing the SRS algorithm | Run `npm test` |
| After editing quiz answer checking logic | Run `npm test` |
| Before pushing / deploying to production | Run `npm test` |
| While actively adding new logic | Run `npm run test:watch` (auto-runs on save) |
| After a new feature is finished | Run `npm run test:coverage` |

> **Rule of thumb:** If you changed any `.ts` file in `src/lib/`, run `npm test` before moving on.

---

## 📊 Understanding the Coverage Report

Coverage tells you what percentage of your code is tested.

```bash
npm run test:coverage
```

This creates a `coverage/` folder. Open `coverage/index.html` in your browser to see:

- 🟢 **Green lines** = tested code (safe to refactor)
- 🔴 **Red lines** = untested code (could break silently)

**Good targets:**
- `src/lib/srs/algorithm.ts` → aim for 90%+
- `src/lib/utils/*.ts` → aim for 85%+

---

## 📁 Where Are the Tests?

```
src/
└── __tests__/
    ├── srs/
    │   └── algorithm.test.ts       ← SRS / Spaced Repetition algorithm
    ├── utils/
    │   ├── string-similarity.test.ts  ← Spelling error detection
    │   └── fuzzy-match.test.ts        ← Answer matching (LaTeX + fuzzy)
    └── lib/
        └── date-utils.test.ts      ← IST (Indian Standard Time) utilities
```

---

## 🔬 What Each Test Suite Covers

### `algorithm.test.ts` — Spaced Repetition (SM-2)
Tests the core learning algorithm that decides when students see each question again.

- A new card has the right default values
- Wrong answers reset the repetition count
- Correct answers follow the correct interval: 1 day → 6 days → longer intervals
- Easy answers increase the "ease factor" (question becomes easier)
- The ease factor can never go below 1.3 (no matter how many wrong answers)
- Review dates are in the future

### `string-similarity.test.ts` — Spelling Error Detection
Tests whether a student made a typo vs. gave a completely wrong answer.

- "photosynthsis" vs "photosynthesis" → spelling error ✅
- "dog" vs "photosynthesis" → NOT a spelling error ✅
- Empty answers → false (handled safely)

### `fuzzy-match.test.ts` — Answer Matching
Tests whether a student's answer is close enough to the correct answer, including LaTeX formulas.

- `$\text{H}_2\text{O}$` strips to `h2o`
- `$\ce{CO_2}$` strips to `co2`
- "Water" matches ["water"] (case-insensitive)
- Minor typos still match within the fuzzy threshold

### `date-utils.test.ts` — IST Date Utilities
Tests the Indian Standard Time (UTC+5:30) date calculation used to determine "today's" quiz due date.

- `getStartOfISTDay` returns midnight IST (not midnight UTC)
- Correctly handles the UTC→IST crossover (e.g., 8:30 PM IST is still "today" in IST)

---

## ➕ Adding a New Test (When You Add New Logic)

When you add a new utility function, follow this pattern:

1. Create a file at `src/__tests__/<folder>/<filename>.test.ts`
2. Import the function you want to test
3. Use `describe` to group related tests, `it` for individual cases

**Example template:**

```typescript
import { describe, it, expect } from 'vitest'
import { myNewFunction } from '@/lib/utils/my-new-file'

describe('myNewFunction', () => {
    it('returns X when given Y', () => {
        const result = myNewFunction(someInput)
        expect(result).toBe(expectedOutput)
    })

    it('handles edge case Z', () => {
        expect(myNewFunction(edgeCase)).toBe(expectedForEdgeCase)
    })
})
```

> **Note:** Only test pure functions (functions that don't call Supabase or the database). Server actions in `src/app/actions/` require a live database connection and are harder to test automatically.

---

## 🛠 Troubleshooting

### "Cannot find module '@/lib/...'"
Make sure you are running from the project root (`looplearn-next/`). The `@/` alias points to `src/`.

### Tests pass locally but CI/CD fails
Run `npm run typecheck` — you may have TypeScript errors that aren't caught by the tests themselves.

### "vitest: command not found"
Run `npm install` to ensure all devDependencies are installed.

### A test fails after I made a change
That's the test doing its job! Read the error message — it tells you exactly which assertion failed and what values were expected vs. received. Find the function it's testing and fix the logic (or update the test if the new behavior is intentional).

---

## 🏗 Architecture Summary

```
Core Logic (Tested ✅)          Server Actions (Not auto-tested ⚠️)
─────────────────────────       ──────────────────────────────────
src/lib/srs/algorithm.ts        src/app/actions/quiz.ts
src/lib/utils/fuzzy-match.ts    src/app/actions/analytics.ts
src/lib/utils/string-similar..  src/app/actions/guest.ts
src/lib/date-utils.ts           src/app/actions/...
```

Server actions require a live Supabase database. They are tested manually by using the app and checking that features work as expected.
