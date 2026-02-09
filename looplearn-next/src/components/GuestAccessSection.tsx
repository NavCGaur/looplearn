'use client'

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Infinity as InfinityIcon, MessageCircle, ChevronDown, Trophy, Bookmark, TrendingUp, LucideIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { getQuizMetadata } from "@/app/actions/quiz";
import { cn } from "@/lib/utils";

// --- Components ---

const FeatureCard = ({
    icon: Icon,
    title,
    description,
    delay,
    color,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    delay: number;
    color: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        viewport={{ once: true }}
        className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/50 transition-colors"
    >
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shrink-0 shadow-lg text-white`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

const SelectButton = ({
    label,
    options,
    value,
    onChange,
    disabled
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean
}) => {
    const [isOpen, setIsOpen] = useState(false);

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
                                        onChange(option);
                                        setIsOpen(false);
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
    );
};

const SignUpBenefit = ({
    icon: Icon,
    text,
    delay,
}: {
    icon: LucideIcon;
    text: string;
    delay: number;
}) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.4 }}
        viewport={{ once: true }}
        className="flex items-center gap-4 p-3"
    >
        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-yellow-600" />
        </div>
        <span className="text-gray-700 font-semibold text-lg">{text}</span>
    </motion.div>
);

const GuestAccessSection = () => {
    const router = useRouter()

    // State
    const [selectedClass, setSelectedClass] = useState<number | null>(null)
    const [selectedSubject, setSelectedSubject] = useState<string>('')
    const [selectedChapter, setSelectedChapter] = useState<string>('')

    const [metadata, setMetadata] = useState<{
        classes: number[]
        subjects: Record<number, string[]>
        chapters: Record<string, string[]>
    }>({ classes: [], subjects: {}, chapters: {} })

    // Effects
    useEffect(() => {
        async function loadMetadata() {
            const data = await getQuizMetadata()
            setMetadata(data)
        }
        loadMetadata()
    }, [])

    const handleStartQuiz = () => {
        if (!selectedClass || !selectedSubject) return

        const params = new URLSearchParams()
        params.set('class', selectedClass.toString())
        params.set('subject', selectedSubject)
        if (selectedChapter && selectedChapter !== 'All Chapters') {
            params.set('chapter', selectedChapter)
        }

        router.push(`/quiz?${params.toString()}`)
    }

    // Derived Display Data
    const displayClasses = metadata.classes.map(c => `Grade ${c}`)

    let displaySubjects: string[] = []
    if (selectedClass && metadata.subjects[selectedClass]) {
        displaySubjects = metadata.subjects[selectedClass].map(s => s.charAt(0).toUpperCase() + s.slice(1))
    }

    // Filter chapters based on selection
    let displayChapters: string[] = []
    if (selectedClass && selectedSubject) {
        const key = `${selectedClass}-${selectedSubject}`
        if (metadata.chapters[key]) {
            displayChapters = ['All Chapters', ...metadata.chapters[key]]
        } else {
            displayChapters = ['All Chapters'] // Default if no chapters found
        }
    }

    return (
        <section id="guest-access" className="py-20 lg:py-28 relative bg-gradient-to-b from-white via-blue-50/30 to-white">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-purple-100/40 blur-3xl opacity-60" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-blue-100/40 blur-3xl opacity-60" />
                <div className="absolute top-1/2 right-10 w-64 h-64 rounded-full bg-yellow-100/40 blur-3xl opacity-60" />
            </div>

            <div className="container max-w-[1400px] mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <span className="badge-pill mb-4 font-fredoka text-blue-700">
                        <span>🎮</span>
                        <span className="text-xl">LoopLearn Guest Access</span>
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-2 font-fredoka">
                        Start Practicing in{" "}
                        <span className="text-blue-600 relative inline-block">
                            Seconds
                            <span className="absolute bottom-1 left-0 w-full h-3 bg-blue-100/50 -z-10 rounded-full"></span>
                        </span>
                    </h2>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                    {/* Left Column - Features & Quiz Selector */}
                    <div className="space-y-10">


                        {/* Quiz Selector Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            viewport={{ once: true }}
                            className="h-full"
                        >
                            <Card className="border-2 border-white shadow-xl bg-white/80 backdrop-blur-sm ring-1 ring-black/5 h-full flex flex-col">
                                <CardContent className="p-6 lg:p-8 space-y-6 flex-1 flex flex-col">
                                    {/* Loopie Avatar */}
                                    <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                                        <motion.div
                                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center border-2 border-dashed border-blue-200"
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            {/* Small Loopie Image */}
                                            <div className="relative w-10 h-10">
                                                <img src="/loopie-main.png" alt="Loopie" className="object-contain" />
                                            </div>
                                        </motion.div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-xl">Loopie says:</p>
                                            <p className="text-gray-500 text-base">"Let's start learning! 🚀"</p>
                                        </div>
                                    </div>

                                    {/* Step 1: Grade */}
                                    <div className="space-y-3">
                                        <label className="text-lg font-bold text-gray-700 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold">1</span>
                                            Choose Class
                                        </label>
                                        <SelectButton
                                            label="Select Grade"
                                            options={displayClasses}
                                            value={selectedClass ? `Grade ${selectedClass}` : ''}
                                            onChange={(val) => {
                                                // Extract number from string like "Grade 9"
                                                const match = val.match(/\d+/)
                                                const num = match ? parseInt(match[0]) : null

                                                if (num) {
                                                    setSelectedClass(num)
                                                    setSelectedSubject('') // reset subject
                                                    setSelectedChapter('')
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Step 2: Subject */}
                                    <div className="space-y-3">
                                        <label className="text-lg font-bold text-gray-700 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-green-500 text-white text-sm flex items-center justify-center font-bold">2</span>
                                            Select Subject
                                        </label>
                                        <SelectButton
                                            label="Select Subject"
                                            options={displaySubjects}
                                            value={selectedSubject ? selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1) : ''}
                                            onChange={(val) => {
                                                setSelectedSubject(val.toLowerCase())
                                                setSelectedChapter('')
                                            }}
                                            disabled={!selectedClass}
                                        />
                                    </div>

                                    {/* Step 3: Chapter */}
                                    <div className="space-y-3">
                                        <label className="text-lg font-bold text-gray-700 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center font-bold">3</span>
                                            Choose Chapter (Optional)
                                        </label>
                                        <SelectButton
                                            label="Select Chapter"
                                            options={displayChapters}
                                            value={selectedChapter}
                                            onChange={setSelectedChapter}
                                            disabled={!selectedSubject}
                                        />
                                    </div>

                                    {/* Start Quiz Button */}
                                    <Button
                                        size="xl"
                                        className="w-full group mt-2 rounded-xl text-lg font-bold shadow-lg shadow-green-200 bg-[#4ADE80] hover:bg-[#22c55e] text-white cursor-pointer"
                                        onClick={handleStartQuiz}
                                        disabled={!selectedClass || !selectedSubject}
                                    >
                                        <Rocket className="w-6 h-6 mr-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                        Start Quiz
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Right Column - Why Sign Up */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        viewport={{ once: true }}
                        className="lg:sticky lg:top-8 h-full"
                    >
                        <Card className="overflow-hidden border-2 border-yellow-200 shadow-xl bg-gradient-to-br from-yellow-50 via-white to-green-50 h-full flex flex-col">
                            <CardContent className="p-6 lg:p-8 space-y-8 flex-1 flex flex-col justify-center">
                                {/* Header */}
                                <div className="text-center pb-4 border-b border-yellow-100">
                                    <motion.div
                                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg border-4 border-white"
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <span className="text-3xl">🚀</span>
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-gray-900 font-fredoka">Why Sign Up?</h3>
                                    <p className="text-gray-500 text-sm mt-1">Unlock the full LoopLearn experience!</p>
                                </div>

                                {/* Benefits */}
                                <div className="space-y-4 py-4">
                                    <SignUpBenefit
                                        icon={TrendingUp}
                                        text="Track your progress & earn points"
                                        delay={0.1}
                                    />
                                    <SignUpBenefit
                                        icon={Trophy}
                                        text="Climb the global leaderboard"
                                        delay={0.2}
                                    />
                                    <SignUpBenefit
                                        icon={Bookmark}
                                        text="Save your difficult questions"
                                        delay={0.3}
                                    />
                                </div>

                                {/* CTA */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        size="xl"
                                        className="w-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#4f46e5] hover:to-[#9333ea] shadow-lg rounded-xl text-lg h-14 text-white font-bold cursor-pointer"
                                        onClick={() => router.push('/auth/signup')}
                                    >
                                        Create a Free Account
                                    </Button>
                                </motion.div>


                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default GuestAccessSection;
