'use client';

import React, { useState, useEffect } from 'react';
import { DaySelector } from '@/components/challenge/DaySelector';
import { getStudentChallengeProgressAction } from '@/app/actions/challenge';
import Link from 'next/link';

export default function ChallengeLandingPage() {
    const [studentName, setStudentName] = useState('');
    const [classStandard, setClassStandard] = useState(7);
    const [completedDays, setCompletedDays] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        // Load stored student info if available
        const savedName = localStorage.getItem('looplearn_student_name');
        const savedClass = localStorage.getItem('looplearn_student_class');
        if (savedName) {
            setStudentName(savedName);
            const cls = parseInt(savedClass || '7', 10);
            setClassStandard(cls);
            checkProgress(savedName, cls);
        }
    }, []);

    const checkProgress = async (name: string, cls: number) => {
        if (!name.trim()) return;
        setIsLoading(true);
        try {
            const res = await getStudentChallengeProgressAction(name, cls);
            if (res.success && res.completedDays) {
                setCompletedDays(res.completedDays);
            }
            setHasSearched(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentName.trim()) return;
        localStorage.setItem('looplearn_student_name', studentName.trim());
        localStorage.setItem('looplearn_student_class', classStandard.toString());
        checkProgress(studentName, classStandard);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-10">
                {/* Hero Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        English Foundation Accelerator
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                        Six-Day English Verb & Grammar Challenge
                    </h1>
                    <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Master 200 essential English verbs (V1 base & V2 past forms), core grammar rules, and sentence building through daily active recall and Space Hangman.
                    </p>
                </div>

                {/* Student Profile Quick-Bar */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-xl">
                    <form onSubmit={handleSaveStudent} className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="w-full sm:flex-1">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Your Name / आपका नाम
                            </label>
                            <input
                                type="text"
                                required
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            />
                        </div>

                        <div className="w-full sm:w-36">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Class / कक्षा
                            </label>
                            <select
                                value={classStandard}
                                onChange={(e) => setClassStandard(parseInt(e.target.value, 10))}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            >
                                {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                                    <option key={c} value={c}>
                                        Class {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-full sm:w-auto pt-1 sm:pt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2.5 px-6 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap"
                            >
                                {isLoading ? 'Checking...' : hasSearched ? 'Update Profile' : 'Set Profile'}
                            </button>
                        </div>
                    </form>

                    {hasSearched && (
                        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                            <span>
                                Logged as: <strong className="text-white">{studentName}</strong> (Class {classStandard})
                            </span>
                            <span className="text-indigo-400 font-semibold">
                                {completedDays.length} of 6 Days Completed
                            </span>
                        </div>
                    )}
                </div>

                {/* Day Selector Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Daily Learning Path</h2>
                        <span className="text-xs text-slate-400">Choose a day to practice or test</span>
                    </div>
                    <DaySelector completedDays={completedDays} />
                </div>

                {/* Quick Info & Methodology */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-3">
                            1
                        </div>
                        <h3 className="text-base font-bold text-white mb-2">Exposure, Not Mastery</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            No student is blocked from moving forward. Daily lists build vocabulary exposure; words you miss are automatically saved for spaced review.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-3">
                            2
                        </div>
                        <h3 className="text-base font-bold text-white mb-2">Space Hangman Integration</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Reinforce word spelling and meanings with our rocket hangman game loaded specifically with today's action verbs.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-3">
                            3
                        </div>
                        <h3 className="text-base font-bold text-white mb-2">AI Teacher Sentence Check</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Practice constructing your own sentences with V1 and V2 verbs, evaluated in real time by our AI English Teacher.
                        </p>
                    </div>
                </div>

                {/* Teacher link footer */}
                <div className="text-center pt-8 border-t border-slate-900">
                    <Link
                        href="/teacher/challenge"
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Teacher Dashboard & Class Progress Overview →
                    </Link>
                </div>
            </div>
        </div>
    );
}
