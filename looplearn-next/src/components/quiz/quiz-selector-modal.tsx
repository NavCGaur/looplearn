'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Rocket, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getQuizMetadata } from '@/app/actions/quiz'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface QuizSelectorModalProps {
    isOpen: boolean
    onClose: () => void
    userClass: number
}

const SelectButton = ({
    label,
    options,
    value,
    onChange,
    disabled
}: {
    label: string
    options: string[]
    value: string
    onChange: (val: string) => void
    disabled?: boolean
}) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative">
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between px-4 py-3 bg-white border-2 rounded-xl text-left font-medium text-gray-900 transition-all ${disabled ? 'opacity-50 cursor-not-allowed border-gray-100' : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
            >
                <span className={cn("text-lg", !value && "text-gray-500")}>{value || label}</span>
                <ChevronDown className={cn("w-6 h-6 text-gray-400 transition-transform", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                    >
                        <div className="p-1">
                            {options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        onChange(option)
                                        setIsOpen(false)
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-600 transition-colors font-semibold text-gray-700 rounded-lg text-lg"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function QuizSelectorModal({ isOpen, onClose, userClass }: QuizSelectorModalProps) {
    const router = useRouter()
    const [selectedSubject, setSelectedSubject] = useState<string>('')
    const [selectedChapter, setSelectedChapter] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [starting, setStarting] = useState(false) // Loading state for quiz start
    const [metadata, setMetadata] = useState<{
        classes: number[]
        subjects: Record<number, string[]>
        chapters: Record<string, string[]>
    }>({ classes: [], subjects: {}, chapters: {} })

    // Load metadata when modal opens
    useEffect(() => {
        if (isOpen) {
            async function loadMetadata() {
                setLoading(true)
                const data = await getQuizMetadata()
                setMetadata(data)
                setLoading(false)
            }
            loadMetadata()
        }
    }, [isOpen])

    // Reset selections when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedSubject('')
            setSelectedChapter('')
            setStarting(false)
        }
    }, [isOpen])

    const handleStartQuiz = () => {
        if (!selectedSubject || !selectedChapter) return

        setStarting(true) // Show loading state
        const params = new URLSearchParams()
        params.set('subject', selectedSubject)
        params.set('chapter', selectedChapter)

        // Navigate first, modal will close automatically when component unmounts
        router.push(`/quiz?${params.toString()}`)

        // Close modal after a short delay to allow navigation to start
        setTimeout(() => {
            onClose()
        }, 100)
    }

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose])

    // Derived display data
    let displaySubjects: string[] = []
    if (metadata.subjects[userClass]) {
        displaySubjects = metadata.subjects[userClass].map(s => s.charAt(0).toUpperCase() + s.slice(1))
    }

    let displayChapters: string[] = []
    if (selectedSubject) {
        const key = `${userClass}-${selectedSubject}`
        if (metadata.chapters[key]) {
            displayChapters = metadata.chapters[key]
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Header */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <motion.div
                                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center border-2 border-dashed border-blue-200"
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <div className="relative w-8 h-8">
                                            <img src="/loopie-main.png" alt="Loopie" className="object-contain" />
                                        </div>
                                    </motion.div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 font-fredoka">Start a Quiz</h2>
                                        <p className="text-sm text-gray-500">Choose your subject and chapter</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            {loading ? (
                                <div className="py-12">
                                    <LoadingSpinner size="md" message="Loading quiz options..." />
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* Subject Selection */}
                                    <div className="space-y-3">
                                        <label className="text-lg font-bold text-gray-700 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold">1</span>
                                            Select Subject
                                        </label>
                                        <SelectButton
                                            label="Select Subject"
                                            options={displaySubjects}
                                            value={selectedSubject ? selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1) : ''}
                                            onChange={(val) => {
                                                setSelectedSubject(val.toLowerCase())
                                                setSelectedChapter('') // Reset chapter when subject changes
                                            }}
                                        />
                                    </div>

                                    {/* Chapter Selection */}
                                    <div className="space-y-3">
                                        <label className="text-lg font-bold text-gray-700 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-green-500 text-white text-sm flex items-center justify-center font-bold">2</span>
                                            Choose Chapter
                                        </label>
                                        <SelectButton
                                            label="Select Chapter"
                                            options={displayChapters}
                                            value={selectedChapter}
                                            onChange={setSelectedChapter}
                                            disabled={!selectedSubject}
                                        />
                                    </div>

                                    {/* Start Button */}
                                    <button
                                        onClick={handleStartQuiz}
                                        disabled={!selectedSubject || !selectedChapter || starting}
                                        className="w-full group mt-4 rounded-xl text-lg font-bold shadow-lg shadow-green-200 bg-[#4ADE80] hover:bg-[#22c55e] text-white cursor-pointer py-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                                    >
                                        {starting ? (
                                            <>
                                                <LoadingSpinner size="sm" />
                                                <span>Starting Quiz...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Rocket className="w-6 h-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                                Start Quiz
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
