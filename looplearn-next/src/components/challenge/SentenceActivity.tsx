'use client';

import React, { useState } from 'react';
import { SentencePrompt, SentenceEvaluation } from '@/lib/challenge/types';
import { evaluateSentenceAction } from '@/app/actions/challenge';

interface SentenceActivityProps {
    prompts: SentencePrompt[];
    mode: 'practice' | 'test';
    onComplete?: (
        score: number,
        missedVerbIds: number[],
        answers: Record<string, { sentence: string; evaluation?: SentenceEvaluation }>
    ) => void;
}

export const SentenceActivity: React.FC<SentenceActivityProps> = ({
    prompts,
    mode,
    onComplete
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sentences, setSentences] = useState<Record<string, string>>({});
    const [evaluations, setEvaluations] = useState<Record<string, SentenceEvaluation>>({});
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const currentPrompt = prompts[currentIndex];
    const total = prompts.length;
    const currentSentence = currentPrompt ? (sentences[currentPrompt.id] || '') : '';
    const currentEval = currentPrompt ? evaluations[currentPrompt.id] : undefined;

    const handleSentenceChange = (val: string) => {
        if (!currentPrompt) return;
        setSentences(prev => ({ ...prev, [currentPrompt.id]: val }));
    };

    const handleEvaluate = async () => {
        if (!currentPrompt || !currentSentence.trim() || isEvaluating) return;

        setIsEvaluating(true);
        try {
            const targetVerb = currentPrompt.requiredTense === 'past'
                ? currentPrompt.verb.v2_past_form
                : currentPrompt.verb.v1_base_form;

            const res = await evaluateSentenceAction({
                verbId: currentPrompt.verb.id,
                targetVerb,
                requiredTense: currentPrompt.requiredTense,
                studentSentence: currentSentence
            });

            setEvaluations(prev => ({ ...prev, [currentPrompt.id]: res }));
        } catch (e) {
            console.error('Failed to evaluate sentence:', e);
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < total - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            finishActivity();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const finishActivity = () => {
        let score = 0;
        const missedVerbIds: number[] = [];
        const answers: Record<string, { sentence: string; evaluation?: SentenceEvaluation }> = {};

        prompts.forEach(p => {
            const evalResult = evaluations[p.id];
            const sentenceText = sentences[p.id] || '';
            answers[p.id] = { sentence: sentenceText, evaluation: evalResult };

            if (evalResult && evalResult.score === 1) {
                score += 1;
            } else {
                missedVerbIds.push(p.verbId);
            }
        });

        setShowResults(true);
        if (onComplete) {
            onComplete(score, missedVerbIds, answers);
        }
    };

    if (showResults && mode === 'practice') {
        const score = prompts.filter(p => evaluations[p.id]?.score === 1).length;
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-2xl">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Sentence Writing Complete!</h3>
                <p className="text-slate-300 mb-6">
                    You received <span className="text-emerald-400 font-bold text-lg">{score}</span> out of {total} marks from the AI Teacher!
                </p>
                <button
                    onClick={() => {
                        setEvaluations({});
                        setCurrentIndex(0);
                        setShowResults(false);
                    }}
                    className="py-3 px-6 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/30"
                >
                    Practice Again
                </button>
            </div>
        );
    }

    if (!currentPrompt) return null;

    const targetVerb = currentPrompt.requiredTense === 'past'
        ? currentPrompt.verb.v2_past_form
        : currentPrompt.verb.v1_base_form;

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Header with progress */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        {mode === 'test' ? 'Activity E: Sentence Writing (5 Marks)' : 'Practice Mode • Sentence Writing'}
                    </span>
                    <span className="text-xs text-slate-400">
                        Prompt {currentIndex + 1} of {total}
                    </span>
                </div>
                <div className="text-xs text-slate-400">
                    {Object.keys(evaluations).length}/{total} Evaluated
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                />
            </div>

            {/* Main Prompt Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-lg ${
                        currentPrompt.requiredTense === 'past'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    }`}>
                        Required: {currentPrompt.requiredTense} tense
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                        Verb: <strong className="text-white underline">{targetVerb}</strong> ({currentPrompt.verb.hindi_meaning})
                    </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 leading-relaxed">
                    {currentPrompt.promptText}
                </h3>
                <p className="text-xs text-slate-400 mb-6 italic">
                    {currentPrompt.exampleHint}
                </p>

                {/* Textarea */}
                <div className="mb-4">
                    <textarea
                        value={currentSentence}
                        onChange={(e) => handleSentenceChange(e.target.value)}
                        placeholder={`Type your ${currentPrompt.requiredTense} tense sentence with "${targetVerb}" here...`}
                        rows={3}
                        className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base transition-all resize-none"
                    />
                </div>

                {/* AI Evaluate Button */}
                <div className="flex items-center justify-between mb-6">
                    <span className="text-xs text-slate-500">
                        {currentSentence.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <button
                        onClick={handleEvaluate}
                        disabled={!currentSentence.trim() || isEvaluating}
                        className="py-2.5 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white disabled:opacity-40 disabled:hover:from-emerald-600 transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20"
                    >
                        {isEvaluating ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                AI Teacher Checking...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {currentEval ? 'Re-Evaluate Sentence' : 'Check with AI Teacher'}
                            </>
                        )}
                    </button>
                </div>

                {/* AI Teacher Feedback Display */}
                {currentEval && (
                    <div className={`p-5 rounded-2xl border text-sm mb-6 transition-all ${
                        currentEval.score === 1
                            ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-100'
                            : 'bg-amber-950/40 border-amber-600/50 text-amber-100'
                    }`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-bold flex items-center gap-1.5">
                                {currentEval.score === 1 ? '🌟 1 / 1 Mark Awarded!' : '⚠️ 0 / 1 Mark'}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/60 font-mono">
                                AI Assessment
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm mb-2">{currentEval.feedback}</p>
                        {currentEval.correctedSentence && (
                            <div className="mt-2 pt-2 border-t border-slate-800/80 text-xs">
                                <span className="text-slate-400">Better expression / सुझाव: </span>
                                <span className="font-medium text-white italic">"{currentEval.correctedSentence}"</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Navigation */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-5 mt-2">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all"
                    >
                        ← Previous
                    </button>

                    <div className="flex gap-1">
                        {prompts.map((_, i) => (
                            <span
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    i === currentIndex
                                        ? 'bg-emerald-500 scale-125'
                                        : evaluations[prompts[i].id] !== undefined
                                        ? 'bg-emerald-500/60'
                                        : 'bg-slate-800'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={!currentEval && mode === 'test'}
                        className="py-2.5 px-5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all shadow-md shadow-emerald-600/20"
                    >
                        {currentIndex === total - 1 ? (mode === 'test' ? 'Review & Submit Test →' : 'Finish') : 'Next →'}
                    </button>
                </div>
            </div>
        </div>
    );
};
