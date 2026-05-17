'use client'

import { useState } from 'react'
import { downloadOfflineBundle } from '@/app/actions/quiz'
import { saveQuestions, saveProgress, setMeta } from '@/lib/offline/db'
import type { CachedQuestion, CachedProgress } from '@/lib/offline/db'

interface OfflineDownloadButtonProps {
    lastDownloadedAt?: string | null
}

type DownloadState = 'idle' | 'downloading' | 'done' | 'error'

export function OfflineDownloadButton({ lastDownloadedAt }: OfflineDownloadButtonProps) {
    const [state, setState] = useState<DownloadState>('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [questionCount, setQuestionCount] = useState(0)
    const [downloadedAt, setDownloadedAt] = useState<string | null>(lastDownloadedAt || null)

    const handleDownload = async () => {
        setState('downloading')
        setErrorMsg('')

        try {
            const result = await downloadOfflineBundle()

            if ('error' in result && result.error) {
                setState('error')
                setErrorMsg(result.error)
                return
            }

            const bundle = result as {
                questions: CachedQuestion[]
                progress: CachedProgress[]
                downloadedAt: string
                classStandard: number
            }

            // Tag each question with cache timestamp
            const taggedQuestions = bundle.questions.map((q) => ({
                ...q,
                _cachedAt: bundle.downloadedAt,
            }))

            // Save to IndexedDB
            await saveQuestions(taggedQuestions)
            await saveProgress(bundle.progress)
            await setMeta('bundleDownloadedAt', bundle.downloadedAt)
            await setMeta('bundleClassStandard', String(bundle.classStandard))

            setQuestionCount(bundle.questions.length)
            setDownloadedAt(bundle.downloadedAt)
            setState('done')
        } catch (err) {
            setState('error')
            setErrorMsg('Download failed. Please try again on a good connection.')
        }
    }

    const formatDate = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // ── Done state ─────────────────────────────────────────────────────────────
    if (state === 'done') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div className="flex-1">
                    <p className="font-semibold text-green-800">Offline Ready!</p>
                    <p className="text-sm text-green-700">
                        {questionCount} questions downloaded. You can now attempt quizzes without internet.
                    </p>
                    <button
                        onClick={handleDownload}
                        className="mt-2 text-xs text-green-600 underline hover:text-green-800"
                    >
                        🔄 Update offline data
                    </button>
                </div>
            </div>
        )
    }

    // ── Downloading state ──────────────────────────────────────────────────────
    if (state === 'downloading') {
        return (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <div>
                    <p className="font-semibold text-indigo-800">Downloading quiz data...</p>
                    <p className="text-sm text-indigo-600">Please stay connected. This may take a minute.</p>
                </div>
            </div>
        )
    }

    // ── Error state ────────────────────────────────────────────────────────────
    if (state === 'error') {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div className="flex-1">
                    <p className="font-semibold text-red-800">Download failed</p>
                    <p className="text-sm text-red-700">{errorMsg}</p>
                    <button
                        onClick={handleDownload}
                        className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    // ── Idle state (with optional "last downloaded" info) ─────────────────────
    return (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">📥</span>
            <div className="flex-1">
                <p className="font-semibold text-indigo-800">Download for Offline Use</p>
                <p className="text-sm text-indigo-600">
                    Download all your quiz questions so you can study without internet.
                    {downloadedAt && (
                        <span className="block text-indigo-500 mt-0.5">
                            Last downloaded: {formatDate(downloadedAt)}
                        </span>
                    )}
                </p>
                <button
                    onClick={handleDownload}
                    className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                    {downloadedAt ? '🔄 Update Offline Data' : '📥 Download Now'}
                </button>
            </div>
        </div>
    )
}
