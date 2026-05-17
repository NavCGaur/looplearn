'use client'

import { useState } from 'react'
import { toggleOfflineAccess } from '@/app/actions/teacher-dashboard'

interface OfflineToggleProps {
    studentId: string
    initialEnabled: boolean
}

export function OfflineToggle({ studentId, initialEnabled }: OfflineToggleProps) {
    const [enabled, setEnabled] = useState(initialEnabled)
    const [loading, setLoading] = useState(false)

    const handleToggle = async () => {
        setLoading(true)
        const newValue = !enabled
        const result = await toggleOfflineAccess(studentId, newValue)
        if (result.error) {
            alert(`Failed to update: ${result.error}`)
            // Revert on error
            setEnabled(enabled)
        } else {
            setEnabled(newValue)
        }
        setLoading(false)
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            title={enabled ? 'Disable offline access' : 'Enable offline access'}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${enabled ? 'bg-indigo-600' : 'bg-gray-300'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-1'
                    }`}
            />
        </button>
    )
}
