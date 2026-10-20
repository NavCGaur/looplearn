'use client';

import React from 'react';
import Link from 'next/link';

interface DayInfo {
    day: number;
    title: string;
    verbCount: number;
    grammarTopic: string;
    theme: string;
}

const DAYS_DATA: DayInfo[] = [
    {
        day: 1,
        title: "Day 1 — Daily Verbs & Basics",
        verbCount: 34,
        grammarTopic: "IS/AM/ARE, WAS/WERE & Pronouns",
        theme: "Everyday actions (eat, go, see, come, play...)"
    },
    {
        day: 2,
        title: "Day 2 — Possession & Actions",
        verbCount: 34,
        grammarTopic: "HAS/HAVE, WILL HAVE & Plural Nouns",
        theme: "Physical actions (make, take, give, find, tell...)"
    },
    {
        day: 3,
        title: "Day 3 — Motion & Perception",
        verbCount: 33,
        grammarTopic: "Articles (A/AN/THE), Nouns & Adjectives",
        theme: "Sensory & motion (feel, hear, run, bring, write...)"
    },
    {
        day: 4,
        title: "Day 4 — Routine & Habits",
        verbCount: 33,
        grammarTopic: "Present Simple (Positive/Negative, He/She + -s)",
        theme: "Daily routines (stand, lose, pay, meet, sit...)"
    },
    {
        day: 5,
        title: "Day 5 — Expression & Thought",
        verbCount: 33,
        grammarTopic: "Mixed Grammar & Verb Corrections",
        theme: "Mental & social actions (speak, read, grow, win, buy...)"
    },
    {
        day: 6,
        title: "Day 6 — Grand Cumulative Revision",
        verbCount: 200,
        grammarTopic: "Full Grammar & Verb Mastery Review",
        theme: "All 200 common verbs with spaced review focus"
    }
];

interface DaySelectorProps {
    completedDays?: number[];
    currentSelectedDay?: number;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
    completedDays = [],
    currentSelectedDay
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DAYS_DATA.map((info) => {
                const isCompleted = completedDays.includes(info.day);
                const isSelected = currentSelectedDay === info.day;

                return (
                    <div
                        key={info.day}
                        className={`rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between ${
                            isSelected
                                ? 'bg-indigo-900/40 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500'
                                : isCompleted
                                ? 'bg-emerald-950/20 border-emerald-700/50 hover:border-emerald-500'
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:shadow-xl'
                        }`}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                                    info.day === 6
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                }`}>
                                    Day {info.day} {info.day === 6 ? '• Final' : ''}
                                </span>
                                {isCompleted && (
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Completed
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{info.title}</h3>
                            <p className="text-sm text-slate-300 mb-4">{info.theme}</p>

                            <div className="space-y-2 mb-6 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                                <div className="flex justify-between items-center">
                                    <span>Vocabulary Target:</span>
                                    <span className="font-semibold text-slate-200">
                                        {info.day === 6 ? '200 Verbs' : `${info.verbCount} Verbs (V1 & V2)`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-start gap-2">
                                    <span className="shrink-0">Grammar Focus:</span>
                                    <span className="text-right font-medium text-indigo-300">{info.grammarTopic}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Link
                                href={`/challenge/${info.day}/practice`}
                                className="flex-1 text-center py-2.5 px-4 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Practice Mode
                            </Link>
                            <Link
                                href={`/challenge/${info.day}/test`}
                                className="flex-1 text-center py-2.5 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Take Test (40M)
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
