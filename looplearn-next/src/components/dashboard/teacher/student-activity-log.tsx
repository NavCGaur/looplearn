'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, CheckCircle2, XCircle, Activity } from 'lucide-react'
import { getStudentActivityLogs } from '@/app/actions/analytics'

interface StudentActivityLogProps {
    studentId: string
    studentName: string
}

interface ActivityLog {
    id: string
    questionText: string
    subject: string
    difficulty: string
    givenAnswer: string
    correctAnswer: string
    isCorrect: boolean
    timeTaken: number
    timestamp: string
    errorType?: string | null
}

export function StudentActivityLog({ studentId, studentName }: StudentActivityLogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [loading, setLoading] = useState(false)

    const loadLogs = async () => {
        setLoading(true)
        try {
            const data = await getStudentActivityLogs(studentId)
            setLogs(data)
        } catch (error) {
            console.error('Failed to load logs', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (open) {
            loadLogs()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button className="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center">
                    <Activity className="w-4 h-4 mr-1" />
                    Activity
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        Activity Log: {studentName}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">
                            No recent activity found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="bg-white border rounded-lg p-4 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2 ${log.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                                log.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {log.difficulty}
                                            </span>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                {log.subject}
                                            </span>
                                            {log.errorType === 'spelling' && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                                    Spelling Error
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {formatDuration(log.timeTaken)}
                                            <span className="mx-2">•</span>
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </div>

                                    <p className="text-sm font-medium text-gray-900 mb-3">{log.questionText}</p>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className={`p-2 rounded ${log.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                            }`}>
                                            <div className="flex items-center mb-1">
                                                {log.isCorrect ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600 mr-1" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-red-600 mr-1" />
                                                )}
                                                <span className="font-semibold text-gray-700">Given Answer:</span>
                                            </div>
                                            <p className="text-gray-900">{log.givenAnswer}</p>
                                        </div>

                                        {!log.isCorrect && (
                                            <div className="p-2 rounded bg-gray-50 border border-gray-200">
                                                <div className="flex items-center mb-1">
                                                    <CheckCircle2 className="w-4 h-4 text-gray-400 mr-1" />
                                                    <span className="font-semibold text-gray-700">Correct Answer:</span>
                                                </div>
                                                <p className="text-gray-900">{log.correctAnswer}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
}
