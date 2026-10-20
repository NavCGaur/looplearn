'use client';

import React from 'react';
import Link from 'next/link';
import { ScoreSummary } from '@/lib/challenge/scoring';

interface ResultsViewProps {
    studentName: string;
    classStandard: number;
    challengeDay: number;
    summary: ScoreSummary;
    persisted?: boolean;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
    studentName,
    classStandard,
    challengeDay,
    summary,
    persisted = true
}) => {
    const nextDay = challengeDay < 6 ? challengeDay + 1 : 1;

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8 animate-fadeIn">
            {/* Header Celebration Card */}
            <div className="bg-gradient-to-b from-indigo-950/80 to-slate-900 border border-indigo-800/50 rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-indigo-500/10 blur-3xl pointer-events-none" />

                <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-4">
                    Day {challengeDay} Test Complete
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                    Congratulations, {studentName}!
                </h1>
                <p className="text-sm text-slate-300 mb-6">
                    Class {classStandard} • Six-Day English Verb & Grammar Challenge
                </p>

                {/* Big Score Dial */}
                <div className="flex flex-col items-center justify-center my-6">
                    <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-slate-950/80 border-4 border-indigo-500 shadow-xl shadow-indigo-500/20">
                        <div className="text-center">
                            <span className="text-4xl font-black text-white">{summary.totalScore}</span>
                            <span className="text-sm font-semibold text-slate-400">/{summary.maxScore}</span>
                        </div>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 font-bold text-sm">
                        <span>{summary.badgeTitle}</span>
                        <span>•</span>
                        <span>{summary.percentage}%</span>
                    </div>
                </div>

                {!persisted && (
                    <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 py-1.5 px-3 rounded-xl inline-block mt-2">
                        Note: Test evaluated locally. Score recorded for this browser session.
                    </p>
                )}
            </div>

            {/* Score Breakdown Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Activity Score Breakdown (Total 40 Marks)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Word Cards */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Activity A: Word Cards</p>
                            <p className="text-base font-bold text-white mt-1">Vocabulary & Meanings</p>
                        </div>
                        <span className="text-lg font-extrabold text-indigo-400">{summary.wordCardScore}/10</span>
                    </div>

                    {/* Fill in Blanks */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Activity B: Fill in Blanks</p>
                            <p className="text-base font-bold text-white mt-1">V1 vs V2 Time Clues</p>
                        </div>
                        <span className="text-lg font-extrabold text-purple-400">{summary.fillblankScore}/10</span>
                    </div>

                    {/* Hangman */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Activity C: Space Hangman</p>
                            <p className="text-base font-bold text-white mt-1">Spelling & Rocket Launch</p>
                        </div>
                        <span className="text-lg font-extrabold text-pink-400">{summary.hangmanScore}/5</span>
                    </div>

                    {/* Grammar */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Activity D: Grammar MCQs</p>
                            <p className="text-base font-bold text-white mt-1">Rules & Applications</p>
                        </div>
                        <span className="text-lg font-extrabold text-blue-400">{summary.grammarScore}/10</span>
                    </div>

                    {/* Sentence Construction */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between sm:col-span-2 lg:col-span-2">
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Activity E: Sentence Writing</p>
                            <p className="text-base font-bold text-white mt-1">AI Teacher Evaluated Sentences</p>
                        </div>
                        <span className="text-lg font-extrabold text-emerald-400">{summary.sentenceScore}/5</span>
                    </div>
                </div>
            </div>

            {/* Words to Revise Section (Exposure, Not Mastery) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Your Words to Revise (अभ्यास सूची)
                    </h3>
                    <span className="text-xs text-slate-400">
                        {summary.missedVerbs.length} {summary.missedVerbs.length === 1 ? 'word' : 'words'} flagged
                    </span>
                </div>

                <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                    Remember: You don't need 100% mastery immediately! These are the specific verbs you found challenging today.
                    Our system has saved them and will gently reinforce them in your future practice sessions and Day 6 grand revision.
                </p>

                {summary.missedVerbs.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-600/30 text-center">
                        <span className="text-3xl mb-2 block">🌟</span>
                        <h4 className="text-base font-bold text-emerald-300 mb-1">Flawless Vocabulary Recall!</h4>
                        <p className="text-xs text-slate-300">You didn't miss any vocabulary words in this test. Keep up the brilliant work!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {summary.missedVerbs.map(verb => (
                            <div
                                key={verb.id}
                                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-bold text-white">{verb.v1_base_form}</span>
                                        <span className="text-xs text-indigo-400 font-semibold">→ {verb.v2_past_form}</span>
                                    </div>
                                    <p className="text-xs text-amber-200/90 mt-1">अर्थ: {verb.hindi_meaning}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    verb.verb_type === 'irregular'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                    {verb.verb_type}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Next Steps Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-2">
                <Link
                    href={`/challenge/${challengeDay}/practice`}
                    className="w-full sm:w-auto text-center py-3.5 px-6 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    ↺ Practice Day {challengeDay} Again
                </Link>

                <div className="flex gap-3 w-full sm:w-auto">
                    <Link
                        href="/challenge"
                        className="flex-1 sm:flex-none text-center py-3.5 px-6 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                    >
                        Challenge Hub
                    </Link>
                    {challengeDay < 6 && (
                        <Link
                            href={`/challenge/${nextDay}/practice`}
                            className="flex-1 sm:flex-none text-center py-3.5 px-6 rounded-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Proceed to Day {nextDay} →
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};
