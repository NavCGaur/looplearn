'use client'

import { useState } from 'react'
import { HomeworkSubmissionStatus } from '@/app/actions/homework'
import { updateStudentPhone } from '@/app/actions/homework-actions'
import { X, Phone, Loader2 } from 'lucide-react'

interface Props {
    student: HomeworkSubmissionStatus
    onClose: () => void
}

export function StudentPhoneModal({ student, onClose }: Props) {
    const [phone, setPhone] = useState(student.whatsapp_phone ?? '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [saved, setSaved] = useState(false)

    const handleSave = async () => {
        setLoading(true)
        setError(null)
        const clean = phone.replace(/\D/g, '')
        const res = await updateStudentPhone(student.student_id, clean || null)
        setLoading(false)
        if (res.success) {
            setSaved(true)
            setTimeout(onClose, 800)
        } else {
            setError(res.error ?? 'Failed to save')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 font-fredoka text-lg">
                        WhatsApp Number
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Set WhatsApp number for <strong>{student.display_name}</strong>
                    <span className="text-gray-400"> · Class {student.class_standard}</span>
                </p>

                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl flex-1">
                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                        <input
                            type="tel"
                            value={phone}
                            onChange={e => { setPhone(e.target.value); setSaved(false) }}
                            placeholder="91XXXXXXXXXX"
                            className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800"
                            autoFocus
                        />
                    </div>
                </div>

                <p className="text-xs text-gray-400 mb-4">
                    Enter without + sign. Example: 919876543210 (country code + number)
                </p>

                {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || saved}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                            saved
                                ? 'bg-green-500 text-white'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        } disabled:opacity-60`}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saved ? '✓ Saved!' : 'Save Number'}
                    </button>
                </div>
            </div>
        </div>
    )
}
