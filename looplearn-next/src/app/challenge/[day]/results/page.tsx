'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ResultsView } from '@/components/challenge/ResultsView';
import { ScoreSummary, calculateChallengeScore } from '@/lib/challenge/scoring';

interface ResultsPageProps {
    params: Promise<{ day: string }>;
}

export default function ResultsPage({ params }: ResultsPageProps) {
    const resolvedParams = use(params);
    const day = parseInt(resolvedParams.day, 10);

    if (isNaN(day) || day < 1 || day > 6) {
        notFound();
    }

    const [resultData, setResultData] = useState<{
        studentName: string;
        classStandard: number;
        summary: ScoreSummary;
        persisted?: boolean;
    } | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(`challenge_day_${day}_result`);
            if (raw) {
                const parsed = JSON.parse(raw);
                setResultData(parsed);
            }
        } catch (e) {
            console.error('Failed to parse result from sessionStorage:', e);
        } finally {
            setIsLoading(false);
        }
    }, [day]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!resultData) {
        // Fallback if accessed directly without taking test
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
                    <span className="text-4xl block">📋</span>
                    <h2 className="text-2xl font-bold text-white">No Test Attempt Found</h2>
                    <p className="text-xs text-slate-300">
                        We couldn't find a recent test submission for Day {day} in this session.
                    </p>
                    <div className="flex flex-col gap-3 pt-2">
                        <Link
                            href={`/challenge/${day}/test`}
                            className="py-3 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
                        >
                            Take Day {day} Test Now
                        </Link>
                        <Link
                            href="/challenge"
                            className="py-2.5 px-6 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-xs"
                        >
                            Return to Challenge Hub
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <ResultsView
                studentName={resultData.studentName}
                classStandard={resultData.classStandard}
                challengeDay={day}
                summary={resultData.summary}
                persisted={resultData.persisted}
            />
        </div>
    );
}
