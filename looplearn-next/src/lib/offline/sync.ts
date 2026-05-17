'use client'

import { getQueue, clearQueue, setMeta } from './db'

export interface SyncResult {
    synced: number
    pointsEarned: number
    error?: string
}

/**
 * Flushes the offline answer queue to the server.
 * Call this when the app detects it has come back online.
 *
 * Returns the number of answers synced and total points earned.
 */
export async function syncOfflineQueue(): Promise<SyncResult> {
    const queue = await getQueue()

    if (queue.length === 0) {
        return { synced: 0, pointsEarned: 0 }
    }

    try {
        const response = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                answers: queue.map((item) => ({
                    questionId: item.questionId,
                    givenAnswer: item.givenAnswer,
                    isCorrect: item.isCorrect,
                    questionType: item.questionType,
                    timeTaken: item.timeTaken,
                    answeredAt: item.answeredAt,
                    pointsEarned: item.pointsEarned,
                })),
                progressUpdates: queue.map((item) => ({
                    questionId: item.questionId,
                    ...item.srsUpdate,
                })),
                totalPoints: queue.reduce((sum, item) => sum + item.pointsEarned, 0),
            }),
        })

        if (!response.ok) {
            const body = await response.json().catch(() => ({}))
            return {
                synced: 0,
                pointsEarned: 0,
                error: body.error || `Server error ${response.status}`,
            }
        }

        const result = await response.json()

        // Clear the queue only after a confirmed successful sync
        await clearQueue()
        await setMeta('lastSyncedAt', new Date().toISOString())

        return {
            synced: queue.length,
            pointsEarned: result.pointsEarned || 0,
        }
    } catch (err) {
        // Network error — leave queue intact for next attempt
        return {
            synced: 0,
            pointsEarned: 0,
            error: 'Network error — will retry when online',
        }
    }
}
