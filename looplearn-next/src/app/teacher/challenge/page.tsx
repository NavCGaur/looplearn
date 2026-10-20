'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTeacherChallengeOverviewAction } from '@/app/actions/challenge';

export default function TeacherChallengePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [missedFrequency, setMissedFrequency] = useState<any[]>([]);
    const [filterDay, setFilterDay] = useState<number | 'all'>('all');
    const [searchName, setSearchName] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await getTeacherChallengeOverviewAction();
            if (res.success) {
                setAttempts(res.attempts || []);
                setMissedFrequency(res.missedFrequency || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAttempts = attempts.filter(att => {
        const matchesDay = filterDay === 'all' || att.challenge_day === filterDay;
        const matchesName = !searchName.trim() || att.student_name.toLowerCase().includes(searchName.toLowerCase());
        return matchesDay && matchesName;
    });

    const totalAttempts = attempts.length;
    const avgScore = totalAttempts > 0
        ? Math.round((attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts) * 10) / 10
        : 0;
    const uniqueStudents = new Set(attempts.map(a => `${a.student_name}_${a.class_standard}`)).size;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                            <Link href="/challenge" className="hover:text-indigo-400 transition-colors">
                                ← Challenge Hub
                            </Link>
                            <span>/</span>
                            <span className="text-indigo-300 font-semibold">Teacher Overview</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-white">
                            Teacher Dashboard: 6-Day English Challenge
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Monitor student participation, evaluate retention targets, and identify tricky vocabulary
                        </p>
                    </div>

                    <button
                        onClick={loadData}
                        disabled={isLoading}
                        className="py-2.5 px-5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
                    >
                        <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Data
                    </button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Submissions</p>
                        <h3 className="text-3xl font-extrabold text-white mt-2">{totalAttempts}</h3>
                        <p className="text-xs text-slate-500 mt-1">{uniqueStudents} unique students participated</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Test Score</p>
                        <h3 className="text-3xl font-extrabold text-indigo-400 mt-2">{avgScore} <span className="text-lg text-slate-400 font-normal">/ 40</span></h3>
                        <p className="text-xs text-slate-500 mt-1">
                            {totalAttempts > 0 ? `${Math.round((avgScore / 40) * 100)}% overall mastery` : 'No data yet'}
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Challenge Days</p>
                        <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">6 Days</h3>
                        <p className="text-xs text-slate-500 mt-1">200 Common Verbs + Grammar Rules</p>
                    </div>
                </div>

                {/* Per-Verb Miss Frequency (Review Point 1: Exposure, Not Mastery) */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="text-amber-400">⚠️</span> Most Missed Verbs Across Cohort
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Verbs that students struggled with most often. Use these for targeted classroom revision!
                            </p>
                        </div>
                        <span className="text-xs text-slate-400">
                            {missedFrequency.length} unique verbs missed
                        </span>
                    </div>

                    {missedFrequency.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center text-xs text-slate-400">
                            No missed verb records yet. Once students take daily tests, frequency analytics will appear here.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {missedFrequency.slice(0, 9).map((item, idx) => (
                                <div
                                    key={item.verbId}
                                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                                            <span className="text-base font-bold text-white">
                                                {item.verb?.v1_base_form || `Verb #${item.verbId}`}
                                            </span>
                                            {item.verb?.v2_past_form && (
                                                <span className="text-xs text-indigo-400">({item.verb.v2_past_form})</span>
                                            )}
                                        </div>
                                        {item.verb?.hindi_meaning && (
                                            <p className="text-xs text-amber-200/90 mt-1">अर्थ: {item.verb.hindi_meaning}</p>
                                        )}
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                        {item.count} {item.count === 1 ? 'miss' : 'misses'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Student Submissions Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-bold text-white">Student Test Attempts</h2>

                        <div className="flex flex-wrap items-center gap-3">
                            <input
                                type="text"
                                placeholder="Search by student name..."
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />

                            <select
                                value={filterDay}
                                onChange={(e) => setFilterDay(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
                                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Days</option>
                                {[1, 2, 3, 4, 5, 6].map(d => (
                                    <option key={d} value={d}>Day {d}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {filteredAttempts.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">
                            No student test submissions match the selected filters.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                                        <th className="py-3 px-4 font-semibold">Student</th>
                                        <th className="py-3 px-4 font-semibold">Class</th>
                                        <th className="py-3 px-4 font-semibold">Day</th>
                                        <th className="py-3 px-4 font-semibold">Total Score</th>
                                        <th className="py-3 px-4 font-semibold">Word Cards</th>
                                        <th className="py-3 px-4 font-semibold">Blanks</th>
                                        <th className="py-3 px-4 font-semibold">Hangman</th>
                                        <th className="py-3 px-4 font-semibold">Grammar</th>
                                        <th className="py-3 px-4 font-semibold">Sentences</th>
                                        <th className="py-3 px-4 font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {filteredAttempts.map(att => (
                                        <tr key={att.id} className="hover:bg-slate-800/40 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                                                {att.student_name}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-300">
                                                Class {att.class_standard}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300">
                                                    Day {att.challenge_day}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-extrabold text-white">
                                                {att.score} / {att.max_score}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-300 font-mono">
                                                {att.word_card_score ?? 0}/10
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-300 font-mono">
                                                {att.fillblank_score ?? 0}/10
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-300 font-mono">
                                                {att.hangman_score ?? 0}/5
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-300 font-mono">
                                                {att.grammar_score ?? 0}/10
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-300 font-mono">
                                                {att.sentence_score ?? 0}/5
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                                                {new Date(att.submitted_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
