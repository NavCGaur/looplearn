'use client'

import { useState, useEffect, useCallback } from 'react'
import { useIsOnline } from '@/lib/offline/network'
import { getQueueCount } from '@/lib/offline/db'
import { syncOfflineQueue } from '@/lib/offline/sync'

type SyncState = 'idle' | 'syncing' | 'synced' | 'error'

export function OfflineBanner() {
    const isOnline = useIsOnline()
    const [queueCount, setQueueCount] = useState(0)
    const [syncState, setSyncState] = useState<SyncState>('idle')
    const [pointsEarned, setPointsEarned] = useState(0)
    const [dismissed, setDismissed] = useState(false)

    // Refresh queue count periodically
    const refreshCount = useCallback(async () => {
        try {
            const count = await getQueueCount()
            setQueueCount(count)
        } catch {
            // IndexedDB not available (e.g. server-side render)
        }
    }, [])

    useEffect(() => {
        refreshCount()
        const interval = setInterval(refreshCount, 5000)
        return () => clearInterval(interval)
    }, [refreshCount])

    // Auto-sync when coming back online
    useEffect(() => {
        if (isOnline && queueCount > 0 && syncState === 'idle') {
            handleSync()
        }
    }, [isOnline, queueCount])

    // Reset dismissed state when going offline
    useEffect(() => {
        if (!isOnline) setDismissed(false)
    }, [isOnline])

    const handleSync = async () => {
        setSyncState('syncing')
        try {
            const result = await syncOfflineQueue()
            if (result.error) {
                setSyncState('error')
            } else {
                setPointsEarned(result.pointsEarned)
                setSyncState('synced')
                await refreshCount()
                // Auto-dismiss success banner after 5 seconds
                setTimeout(() => {
                    setSyncState('idle')
                    setDismissed(true)
                }, 5000)
            }
        } catch {
            setSyncState('error')
        }
    }

    // Nothing to show: online, no queue, no sync in progress
    if (isOnline && queueCount === 0 && syncState === 'idle') return null
    if (dismissed && isOnline) return null

    // ── Synced success banner ──────────────────────────────────────────────────
    if (syncState === 'synced') {
        return (
            <div className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-2 flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span>✅</span>
                    <span>
                        All synced!{pointsEarned > 0 ? ` +${pointsEarned} points earned 🎉` : ''}
                    </span>
                </div>
                <button
                    onClick={() => { setSyncState('idle'); setDismissed(true) }}
                    className="text-white/80 hover:text-white text-lg leading-none"
                    aria-label="Dismiss"
                >
                    ×
                </button>
            </div>
        )
    }

    // ── Syncing banner ─────────────────────────────────────────────────────────
    if (syncState === 'syncing') {
        return (
            <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-500 text-white px-4 py-2 flex items-center gap-2 shadow-md">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Syncing your progress...</span>
            </div>
        )
    }

    // ── Error banner ───────────────────────────────────────────────────────────
    if (syncState === 'error') {
        return (
            <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 flex items-center justify-between shadow-md">
                <span className="text-sm font-medium">⚠️ Sync failed. Will retry when online.</span>
                <button
                    onClick={handleSync}
                    className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
                >
                    Retry
                </button>
            </div>
        )
    }

    // ── Offline banner (with unsynced count) ───────────────────────────────────
    if (!isOnline) {
        return (
            <div className="fixed top-0 left-0 right-0 z-50 bg-gray-800 text-white px-4 py-2 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2 text-sm">
                    <span>📴</span>
                    <span className="font-medium">You&apos;re offline.</span>
                    {queueCount > 0 && (
                        <span className="text-gray-300">
                            {queueCount} answer{queueCount !== 1 ? 's' : ''} will sync when you reconnect.
                        </span>
                    )}
                    {queueCount === 0 && (
                        <span className="text-gray-300">Quiz works from your downloaded data.</span>
                    )}
                </div>
            </div>
        )
    }

    // ── Online but has unsynced queue (just came back online, sync pending) ────
    if (isOnline && queueCount > 0) {
        return (
            <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 flex items-center justify-between shadow-md">
                <span className="text-sm font-medium">
                    🔄 {queueCount} answer{queueCount !== 1 ? 's' : ''} pending sync...
                </span>
                <button
                    onClick={handleSync}
                    className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded font-medium"
                >
                    Sync Now
                </button>
            </div>
        )
    }

    return null
}
