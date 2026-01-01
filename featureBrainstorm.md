# Feature Brainstorm & Execution Plan — LoopLearn

Concise reference of the weekly-batch, pool-rotation and mastery workflow we discussed. Use this when you are ready to execute.

---

## 1. High-level approach (teacher-first)
- Weekly batching: teacher prepares content once (Sunday) for the coming week.
- Pools: create a pool of ~20 items per class/chapter (vocab or questions).
- Daily rotation: each student receives K items/day from the pool (e.g., 5).
- Activities use same daily set: meaning cards, short quizzes, games (hangman), practice problems.
- Mastery: mark item mastered after a short, repeat-success rule (see section 4).

---

## 2. Data model (recommended)
- VocabPool
  - _id, classStandard, chapter, teacherId
  - words: [{ id, text, meaning, examples, media? }]
  - poolSize, wordsPerDay, startDate, durationDays, createdAt, updatedAt
- QuestionPool
  - _id, classStandard, chapter, teacherId
  - questions: [{ id, stem, choices, answer, learningObjective, difficulty, type, estimatedTime }]
  - poolSize, questionsPerDay, metadata...
- PerStudentItemState
  - { itemId, poolId, userId, attemptsTotal, correctCount, consecutiveCorrect, lastAttemptAt, lastCorrectAt, mastered (bool), nextReviewAt }

---

## 3. Rotation / selection (deterministic, stateless)
- Seeded shuffle (recommended): seed = hash(poolId + date). Fisher–Yates using seeded PRNG, then take first K.
- Sliding-window variant: startIndex = hash(date) % N; slice K with wrap-around.
- Benefits: same set across devices, no precompute writes required.

Pseudo-code (concept):
```javascript
// seededShuffle(array, seedStr) => shuffled array
// daily = seededShuffle(poolItems, poolId + '|' + date).slice(0, K)
```

---

## 4. Mastery rules (robust, anti-gaming)
- Track per-student per-item counters (see PerStudentItemState).
- Weighted-streak rule (recommended):
  - Weights: quiz=2, hangman=1, meaning-check=1
  - Mark mastered when: recent weighted sum ≥ 3 AND consecutiveCorrect >= 2 (within window, e.g., 7 days)
  - Alternative: require 2 consecutive correct attempts with at least one being a quiz.
- On mastery: remove from that student's rotation OR lower its frequency (reintroduce every N cycles).
- For multi-step/math items: allow partial credit and require stronger evidence (e.g., 3 weighted points).

Operational guards:
- Minimum interaction time threshold to avoid instant-guess gaming.
- Treat game wins (hangman) as lower-evidence than quiz correctness.

---

## 5. Teacher workflow (Sunday checklist)
1. Prepare pool(s) for each class (CSV paste or quick editor): ~20 items.
2. Tag items (chapter, LO, difficulty).
3. Set wordsPerDay/questionsPerDay (e.g., 5).
4. Preview day 1–5 (optional) and swap if needed.
5. Publish pool for the week (students auto-see daily sets).
6. Weekly review: inspect mastery stats and mark weak items for next week.

Quick manual workaround:
- Keep a spreadsheet per class: columns [item, LO, difficulty, weekAssigned, status].
- Use bulk import endpoints or scripts later to upload.

---

## 6. Math & Science specifics
- Create QuestionPools per LO/chapter. Tag by type/difficulty/estimatedTime.
- Distribution templates (example): for a 6-question quiz = 4 procedural + 1 conceptual + 1 challenge.
- Generation workflow: generate candidate items → teacher preview → publish subset for the week.
- Grading:
  - Auto-grade objective items.
  - Manual grade for open responses; store rubric scores and treat manual-correct as mastery evidence.
  - Partial-credit supported for multi-step math.

---

## 7. Non-enrolled / exploratory users policy
Options:
- Recommended: Open self-study mode
  - Provide seeded starter kits (10–20 items per chapter) accessible to all users.
  - Keep self-study progress private (separate from class progress/leaderboards).
  - Allow users to request to join a class (teacher approves).
- Alternative: Restrict access (less discoverability).

---

## 8. Edge cases & operational notes
- Timezones: define day by class timezone or let client pass date param to server.
- Pool size vs daily size: use sliding window or shuffle to balance repeats.
- New syllabus: create starter kits (30–40 seeded items) split across weeks.
- Slow/unstable network: cache daily set client-side for offline practice and sync results later.
- Cheating: randomize choices, add minimal dwell time checks, monitor anomaly patterns.

---

## 9. Metrics to track (for planner & teacher)
- Per-item: attempts, correctRate, attemptsToMaster, avgTime
- Per-student: items mastered, engagement (daily active), streaks
- Class-level: pool coverage, hardest items
- Use metrics to drive next-week priorities (focus weak LOs)

---

## 10. API & implementation notes (reference)
- Suggested endpoints (conceptual):
  - POST /api/vocab/pools  { classStandard, chapter, teacherId, words[], wordsPerDay, startDate }
  - GET /api/vocab/pools/:poolId/daily?date=YYYY-MM-DD  -> returns dailyWords
  - GET /api/vocab/class/:classStandard/daily?date=...  -> auto-find active pool
  - POST /api/pools/:poolId/lock  -> lock a day's set (optional)
  - POST /api/item-attempt  { userId, itemId, poolId, activityType, correct, timeTaken }
- Deterministic selection done on-read; optional precompute job for previews/locked days.

---

## 11. Prioritized next steps (pick one to start)
- Immediate (no dev): adopt Sunday batching + maintain spreadsheet pools; start labeling items and run manual previews.
- Quick dev-free win: prepare CSVs of pools for import via existing bulk endpoints.
- Developer help (fast): create import script or deterministic selection endpoint; or draft teacher Sunday checklist printable.

---

## 12. Short-term teacher template (one-line)
- "Sunday: create 20-item pool -> tag LO/difficulty -> set 5/day -> preview & publish -> Monday: students see Day-1 set."

---

