'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    getVerbsForDay,
    generateWordCardQuestions,
    generateFillInBlankQuestions,
    generateSentencePrompts
} from '@/lib/challenge/verbs';
import { getGrammarQuestionsForDay } from '@/lib/challenge/grammar-questions';
import { WordCardActivity } from '@/components/challenge/WordCardActivity';
import { FillInBlankActivity } from '@/components/challenge/FillInBlankActivity';
import { GrammarActivity } from '@/components/challenge/GrammarActivity';
import { SentenceActivity } from '@/components/challenge/SentenceActivity';

interface PracticePageProps {
    params: Promise<{ day: string }>;
}

export default function PracticePage({ params }: PracticePageProps) {
    const resolvedParams = use(params);
    const day = parseInt(resolvedParams.day, 10);

    if (isNaN(day) || day < 1 || day > 6) {
        notFound();
    }

    const [activeTab, setActiveTab] = useState<'cards' | 'blanks' | 'hangman' | 'grammar' | 'sentences' | 'verb_list'>('cards');
    const [wordCardQuestions, setWordCardQuestions] = useState<any[]>([]);
    const [fillBlankQuestions, setFillBlankQuestions] = useState<any[]>([]);
    const [sentencePrompts, setSentencePrompts] = useState<any[]>([]);
    const [showVerbListModal, setShowVerbListModal] = useState(false);

    const dayVerbs = getVerbsForDay(day);
    const grammarQuestions = getGrammarQuestionsForDay(day);

    useEffect(() => {
        // Read any previously missed verb IDs from localStorage for spaced review
        let savedMissed: number[] = [];
        try {
            const raw = localStorage.getItem('looplearn_missed_verb_ids');
            if (raw) savedMissed = JSON.parse(raw);
        } catch (e) {}

        setWordCardQuestions(generateWordCardQuestions(day, savedMissed));
        setFillBlankQuestions(generateFillInBlankQuestions(day, savedMissed));
        setSentencePrompts(generateSentencePrompts(day, savedMissed));
    }, [day]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Navigation Breadcrumb & Day Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                            <Link href="/challenge" className="hover:text-indigo-400 transition-colors">
                                Challenge Hub
                            </Link>
                            <span>/</span>
                            <span className="text-indigo-300 font-semibold">Day {day} Practice</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-white">
                            Day {day} Practice Arena
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Self-paced practice with instant feedback • No marks deducted • Unlimited retries
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowVerbListModal(true)}
                            className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
                        >
                            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            View Day {day} Verbs ({dayVerbs.length})
                        </button>

                        <Link
                            href={`/challenge/${day}/test`}
                            className="py-2.5 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 transition-all"
                        >
                            Take Scored Test (40M) →
                        </Link>
                    </div>
                </div>

                {/* Activity Tabs */}
                <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <button
                        onClick={() => setActiveTab('cards')}
                        className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'cards'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        1. Word Cards
                    </button>
                    <button
                        onClick={() => setActiveTab('blanks')}
                        className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'blanks'
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        2. Fill in Blanks
                    </button>
                    <button
                        onClick={() => setActiveTab('hangman')}
                        className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'hangman'
                                ? 'bg-pink-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        3. Space Hangman
                    </button>
                    <button
                        onClick={() => setActiveTab('grammar')}
                        className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'grammar'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        4. Grammar MCQs
                    </button>
                    <button
                        onClick={() => setActiveTab('sentences')}
                        className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'sentences'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        5. Sentence AI
                    </button>
                </div>

                {/* Tab Contents */}
                <div>
                    {activeTab === 'cards' && wordCardQuestions.length > 0 && (
                        <WordCardActivity questions={wordCardQuestions} mode="practice" />
                    )}

                    {activeTab === 'blanks' && fillBlankQuestions.length > 0 && (
                        <FillInBlankActivity questions={fillBlankQuestions} mode="practice" />
                    )}

                    {activeTab === 'hangman' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-xl space-y-6">
                            <div className="w-20 h-20 bg-pink-500/20 text-pink-400 rounded-3xl flex items-center justify-center mx-auto border border-pink-500/30 text-3xl">
                                🚀
                            </div>
                            <h2 className="text-2xl font-black text-white">Space Hangman — Day {day} Edition</h2>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Space Hangman has been configured with Day {day}'s action verbs! Fuel your rocket, guess the correct letters before running out of attempts, and launch into the cosmos!
                            </p>
                            <div className="pt-2">
                                <Link
                                    href={`/spacehangman?challenge_day=${day}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-2 py-3.5 px-8 rounded-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg shadow-pink-600/30 transition-all hover:scale-105 active:scale-95"
                                >
                                    <span>Launch Space Hangman</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </Link>
                            </div>
                            <p className="text-[11px] text-slate-500">Opens in a new tab so your practice progress is preserved.</p>
                        </div>
                    )}

                    {activeTab === 'grammar' && (
                        <GrammarActivity questions={grammarQuestions} mode="practice" />
                    )}

                    {activeTab === 'sentences' && sentencePrompts.length > 0 && (
                        <SentenceActivity prompts={sentencePrompts} mode="practice" />
                    )}
                </div>

                {/* Modal for Day's Verbs List */}
                {showVerbListModal && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Day {day} Verbs List</h3>
                                    <p className="text-xs text-slate-400">Total {dayVerbs.length} verbs with V1 & V2 forms</p>
                                </div>
                                <button
                                    onClick={() => setShowVerbListModal(false)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="overflow-y-auto py-4 space-y-2 flex-1">
                                {dayVerbs.map(v => (
                                    <div
                                        key={v.id}
                                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-slate-500">#{v.id}</span>
                                            <div>
                                                <span className="font-bold text-white">{v.v1_base_form}</span>
                                                <span className="text-indigo-400 ml-2 font-medium">({v.v2_past_form})</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-amber-200">{v.hindi_meaning}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                v.verb_type === 'irregular'
                                                    ? 'bg-amber-500/20 text-amber-300'
                                                    : 'bg-emerald-500/20 text-emerald-300'
                                            }`}>
                                                {v.verb_type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-slate-800 text-right">
                                <button
                                    onClick={() => setShowVerbListModal(false)}
                                    className="py-2 px-5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                                >
                                    Close Reference
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
