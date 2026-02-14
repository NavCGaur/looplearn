'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getQuizMetadata } from '@/app/actions/quiz'
import { logError } from '@/lib/utils/client-error-logger'
import {
    BookOpen,
    Calculator,
    FlaskConical,
    Globe,
    GraduationCap,
    ChevronRight,
    CheckCircle2,
    Play,
    School
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface QuizMetadata {
    classes: number[]
    subjects: Record<number, string[]>
    chapters: Record<string, string[]>
}

export function GuestQuizSetup() {
    const router = useRouter()
    const [metadata, setMetadata] = useState<QuizMetadata | null>(null)
    const [loading, setLoading] = useState(true)

    // Selection State
    const [selectedClass, setSelectedClass] = useState<number | null>(null)
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
    const [selectedChapter, setSelectedChapter] = useState<string>('') // Empty string = all chapters

    useEffect(() => {
        async function loadMetadata() {
            try {
                const data = await getQuizMetadata()
                setMetadata(data)
                // Auto-select class if only one available or default to 10 if available
                if (data.classes.includes(10)) setSelectedClass(10)
                else if (data.classes.length > 0) setSelectedClass(data.classes[0])
            } catch (error) {
                logError('Failed to load quiz metadata', error)
            } finally {
                setLoading(false)
            }
        }
        loadMetadata()
    }, [])

    const handleStartQuiz = () => {
        if (!selectedClass || !selectedSubject) return

        const params = new URLSearchParams()
        params.set('subject', selectedSubject)
        params.set('class', selectedClass.toString())
        if (selectedChapter) {
            params.set('chapter', selectedChapter)
        }

        router.push(`/quiz?${params.toString()}`)
    }

    const availableSubjects = selectedClass && metadata ? metadata.subjects[selectedClass] || [] : []
    const availableChapters = selectedClass && selectedSubject && metadata
        ? metadata.chapters[`${selectedClass}-${selectedSubject}`] || []
        : []

    // Subject Icons Mapping
    const getSubjectIcon = (subject: string) => {
        const s = subject.toLowerCase()
        const iconClass = "!w-6 !h-6" // Force standard size
        if (s.includes('math')) return <Calculator className={iconClass} />
        if (s.includes('science') || s.includes('physics') || s.includes('chemistry') || s.includes('biology')) return <FlaskConical className={iconClass} />
        if (s.includes('english')) return <BookOpen className={iconClass} />
        if (s.includes('social') || s.includes('history') || s.includes('geography')) return <Globe className={iconClass} />
        return <BookOpen className={iconClass} />
    }

    const getSubjectColor = (subject: string) => {
        const s = subject.toLowerCase()
        if (s.includes('math')) return 'bg-orange-500 text-white border-orange-600 hover:bg-orange-600 shadow-orange-200'
        if (s.includes('science') || s.includes('physics') || s.includes('chemistry') || s.includes('biology')) return 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 shadow-emerald-200'
        if (s.includes('english')) return 'bg-purple-500 text-white border-purple-600 hover:bg-purple-600 shadow-purple-200'
        if (s.includes('social') || s.includes('history') || s.includes('geography')) return 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600 shadow-blue-200'
        return 'bg-gray-800 text-white border-gray-900 hover:bg-gray-900'
    }

    if (loading) {
        return (
            <div className="w-full max-w-[95%] xl:max-w-[1400px] mx-auto p-8 flex items-center justify-center min-h-[500px]">
                <LoadingSpinner size="lg" message="Loading quiz options..." />
            </div>
        )
    }

    return (
        <section className="w-full max-w-[95%] xl:max-w-[1400px] mx-auto my-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid md:grid-cols-2 gap-0">
                {/* Left Side: Guide & Mascot */}
                <div className="bg-blue-50 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden min-h-[500px]">
                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-8">
                            <span className="bg-blue-600 text-white p-2 rounded-lg">
                                <School className="w-6 h-6" />
                            </span>
                            <span className="text-xl font-bold text-gray-800">LoopLearn Guest Access</span>
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Start Practicing in Seconds
                        </h2>

                        <div className="space-y-6">
                            {[
                                { title: "No Sign-up Required", desc: "Jump straight into learning without creating an account.", icon: <CheckCircle2 className="w-5 h-5 text-blue-600" /> },
                                { title: "Unlimited Practice", desc: "Access thousands of questions across all subjects.", icon: <CheckCircle2 className="w-5 h-5 text-blue-600" /> },
                                { title: "Instant Feedback", desc: "Get detailed explanations for every answer.", icon: <CheckCircle2 className="w-5 h-5 text-blue-600" /> }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="mt-1 bg-white p-2 rounded-full shadow-sm">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                        <p className="text-gray-600 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative mt-8 md:mt-0 flex justify-center">
                        <div className="relative w-64 h-64 md:w-80 md:h-80 transition-transform hover:scale-105 duration-500">
                            <Image
                                src="/loopie-main.png"
                                alt="Loopie Mascot"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side: Setup Form */}
                <div className="p-8 md:p-12 bg-white flex flex-col justify-center">
                    <div className="max-w-xl mx-auto w-full">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                            <span className="text-blue-600">🚀</span> Practice Now
                        </h3>

                        {/* Step 1: Choose Class */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                Step 1: Choose Class
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {metadata?.classes.map((cls) => (
                                    <button
                                        key={cls}
                                        onClick={() => {
                                            setSelectedClass(cls)
                                            setSelectedSubject(null) // Reset subject when class changes
                                            setSelectedChapter('')
                                        }}
                                        className={`px-6 py-2 rounded-full font-medium transition-all ${selectedClass === cls
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 transform scale-105'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        Grade {cls}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 2: Select Subject */}
                        <div className={`mb-8 transition-opacity duration-300 ${selectedClass ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                Step 2: Select Subject
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableSubjects.length > 0 ? availableSubjects.map((subject) => (
                                    <button
                                        key={subject}
                                        onClick={() => {
                                            setSelectedSubject(subject)
                                            setSelectedChapter('')
                                        }}
                                        className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all shadow-md hover:shadow-lg ${selectedSubject === subject
                                            ? 'transform scale-105 ring-4 ring-offset-2 ring-blue-300'
                                            : 'hover:-translate-y-1'
                                            } ${getSubjectColor(subject)}`}
                                    >
                                        <div className="bg-white/20 rounded-full backdrop-blur-sm">
                                            {/* Explicitly sized container and icon */}
                                            <div className="w-8 h-8 flex items-center justify-center">
                                                {getSubjectIcon(subject)}
                                            </div>
                                        </div>
                                        <span className="font-bold text-lg capitalize">{subject}</span>
                                    </button>
                                )) : (
                                    <p className="text-gray-400 text-sm col-span-2">Select a class to see subjects</p>
                                )}
                            </div>
                        </div>

                        {/* Step 3: Choose Chapter */}
                        <div className={`mb-8 transition-opacity duration-300 ${selectedSubject ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                Step 3: Choose Chapter (Optional)
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedChapter}
                                    onChange={(e) => setSelectedChapter(e.target.value)}
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 transition-colors cursor-pointer"
                                >
                                    <option value="">All Chapters</option>
                                    {availableChapters.map((chapter) => (
                                        <option key={chapter} value={chapter}>
                                            {chapter}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronRight className="w-5 h-5 rotate-90" />
                                </div>
                            </div>
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={handleStartQuiz}
                            disabled={!selectedClass || !selectedSubject}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${selectedClass && selectedSubject
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30 hover:scale-[1.02] cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Start Quiz
                        </button>

                        {/* Sign Up Benefits Hook - Moved here */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <span className="text-xl">🚀</span> Why Sign Up?
                            </h4>
                            <ul className="space-y-2">
                                {[
                                    "Track your progress & earn points",
                                    "Climb the global leaderboard",
                                    "Save your difficult questions"
                                ].map((benefit, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => router.push('/auth/signup')}
                                    className="text-blue-600 font-semibold text-sm hover:underline hover:text-blue-700 transition-colors"
                                >
                                    Create a Free Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
