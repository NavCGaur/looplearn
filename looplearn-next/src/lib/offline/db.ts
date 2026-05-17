/**
 * IndexedDB wrapper for LoopLearn offline storage.
 *
 * Stores:
 *  - questions      : cached QuizQuestion objects (with options + answers)
 *  - user_progress  : student's own SRS progress rows
 *  - offline_queue  : answers pending sync to Supabase
 */

const DB_NAME = 'looplearn-offline'
const DB_VERSION = 1

export interface OfflineAnswer {
    id: string            // client-generated UUID for dedup
    questionId: string
    givenAnswer: string
    isCorrect: boolean
    questionType: string
    timeTaken: number
    answeredAt: string    // ISO timestamp
    pointsEarned: number
    // SRS update to apply on sync
    srsUpdate: {
        easeFactor: number
        intervalDays: number
        repetitions: number
        nextReviewDate: string
        lastQuality: number
    }
}

export interface CachedQuestion {
    id: string
    question_text: string
    question_type: string
    class_standard: number
    subject: string
    chapter: string | null
    difficulty: string | null
    points: number
    answer_explanation: string | null
    question_options: Array<{
        id: string
        option_text: string
        display_order: number
        is_correct: boolean
        explanation: string | null
    }>
    fillblank_answers: Array<{
        id: string
        accepted_answer: string
        is_case_sensitive: boolean
        is_primary: boolean
    }>
    // metadata for cache management
    _cachedAt: string
}

export interface CachedProgress {
    question_id: string
    ease_factor: number
    interval_days: number
    repetitions: number
    next_review_date: string
    last_reviewed: string | null
    last_quality: number | null
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result

            // Questions store — keyed by question id
            if (!db.objectStoreNames.contains('questions')) {
                const qs = db.createObjectStore('questions', { keyPath: 'id' })
                qs.createIndex('by_subject_class', ['subject', 'class_standard'], { unique: false })
            }

            // User progress store — keyed by question_id
            if (!db.objectStoreNames.contains('user_progress')) {
                db.createObjectStore('user_progress', { keyPath: 'question_id' })
            }

            // Offline answer queue — keyed by client-generated id
            if (!db.objectStoreNames.contains('offline_queue')) {
                db.createObjectStore('offline_queue', { keyPath: 'id' })
            }

            // Metadata store — key/value pairs (e.g. lastSyncedAt, bundleDownloadedAt)
            if (!db.objectStoreNames.contains('meta')) {
                db.createObjectStore('meta')
            }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

// ─── Questions ────────────────────────────────────────────────────────────────

export async function saveQuestions(questions: CachedQuestion[]): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('questions', 'readwrite')
        const store = tx.objectStore('questions')
        questions.forEach((q) => store.put(q))
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}

export async function getQuestions(subject: string, classStandard: number): Promise<CachedQuestion[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('questions', 'readonly')
        const store = tx.objectStore('questions')
        const index = store.index('by_subject_class')
        const request = index.getAll([subject, classStandard])
        request.onsuccess = () => resolve(request.result || [])
        request.onerror = () => reject(request.error)
    })
}

export async function getAllCachedQuestions(): Promise<CachedQuestion[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('questions', 'readonly')
        const store = tx.objectStore('questions')
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result || [])
        request.onerror = () => reject(request.error)
    })
}

export async function clearQuestions(): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('questions', 'readwrite')
        tx.objectStore('questions').clear()
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}

// ─── User Progress ────────────────────────────────────────────────────────────

export async function saveProgress(progressRows: CachedProgress[]): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('user_progress', 'readwrite')
        const store = tx.objectStore('user_progress')
        progressRows.forEach((p) => store.put(p))
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}

export async function getProgress(questionId: string): Promise<CachedProgress | null> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('user_progress', 'readonly')
        const request = tx.objectStore('user_progress').get(questionId)
        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
    })
}

export async function updateProgressLocally(update: CachedProgress): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('user_progress', 'readwrite')
        tx.objectStore('user_progress').put(update)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}

// ─── Offline Queue ────────────────────────────────────────────────────────────

export async function pushToQueue(answer: OfflineAnswer): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('offline_queue', 'readwrite')
        tx.objectStore('offline_queue').put(answer)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}

export async function getQueue(): Promise<OfflineAnswer[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('offline_queue', 'readonly')
        const request = tx.objectStore('offline_queue').getAll()
        request.onsuccess = () => resolve(request.result || [])
        request.onerror = () => reject(request.error)
    })
}

export async function getQueueCount(): Promise<number> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('offline_queue', 'readonly')
        const request = tx.objectStore('offline_queue').count()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

export async function clearQueue(): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('offline_queue', 'readwrite')
        tx.objectStore('offline_queue').clear()
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function setMeta(key: string, value: string): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('meta', 'readwrite')
        tx.objectStore('meta').put(value, key)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}

export async function getMeta(key: string): Promise<string | null> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('meta', 'readonly')
        const request = tx.objectStore('meta').get(key)
        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
    })
}
