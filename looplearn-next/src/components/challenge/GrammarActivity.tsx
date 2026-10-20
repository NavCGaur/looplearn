'use client';

import React, { useState } from 'react';
import { GrammarQuestion } from '@/lib/challenge/types';

interface GrammarActivityProps {
    questions: GrammarQuestion[];
    mode: 'practice' | 'test';
    onComplete?: (score: number, answers: Record<string, string>) => void;
}

export const GrammarActivity: React.FC<GrammarActivityProps> = ({
    questions,
    mode,
    onComplete
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [showResults, setShowResults] = useState(false);

    const currentQ = questions[currentIndex];
    const total = questions.length;
    const selectedAnswer = currentQ ? answers[currentQ.id] : undefined;

    const handleSelectOption = (option: string) => {
        if (!currentQ) return;
        if (mode === 'practice' && selectedAnswer !== undefined) return;

        const newAnswers = { ...answers, [currentQ.id]: option };
        setAnswers(newAnswers);

        if (mode === 'test') {
            if (currentIndex < total - 1) {
                setTimeout(() => {
                    setCurrentIndex(prev => prev + 1);
                }, 350);
            }
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
        questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                score += 1;
            }
        });

        setShowResults(true);
        if (onComplete) {
            onComplete(score, answers);
        }
    };

    if (showResults && mode === 'practice') {
        const score = questions.filter(q => answers[q.id] === q.correctAnswer).length;
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-2xl">
                <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Grammar Revision Complete!</h3>
                <p className="text-slate-300 mb-6">
                    You scored <span className="text-blue-400 font-bold text-lg">{score}</span> out of {total} in Grammar.
                </p>
                <button
                    onClick={() => {
                        setAnswers({});
                        setCurrentIndex(0);
                        setShowResults(false);
                    }}
                    className="py-3 px-6 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/30"
                >
                    Practice Again
                </button>
            </div>
        );
    }

    if (!currentQ) return null;

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Header with progress */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                        {mode === 'test' ? 'Activity D: Grammar (10 Marks)' : 'Practice Mode • Grammar'}
                    </span>
                    <span className="text-xs text-slate-400">
                        Q {currentIndex + 1} of {total}
                    </span>
                </div>
                <div className="text-xs text-slate-400">
                    {Object.keys(answers).length}/{total} Answered
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                        Topic: {currentQ.topic}
                    </span>
                    <span className="text-xs text-slate-400">1 Mark</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-relaxed">
                    {currentQ.question}
                </h3>

                {/* 4 Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {currentQ.options.map((option, idx) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = option === currentQ.correctAnswer;
                        const showFeedback = mode === 'practice' && selectedAnswer !== undefined;

                        let btnStyle = "bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700";

                        if (showFeedback) {
                            if (isCorrect) {
                                btnStyle = "bg-emerald-900/60 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500";
                            } else if (isSelected && !isCorrect) {
                                btnStyle = "bg-rose-900/60 border-rose-500 text-rose-100 ring-2 ring-rose-500";
                            } else {
                                btnStyle = "bg-slate-900/40 border-slate-800/60 text-slate-500";
                            }
                        } else if (isSelected) {
                            btnStyle = "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelectOption(option)}
                                className={`p-4 rounded-2xl border text-base font-semibold transition-all duration-200 text-left flex items-center justify-between ${btnStyle}`}
                            >
                                <span>{option}</span>
                                <span className="text-xs opacity-60 font-mono">
                                    {String.fromCharCode(65 + idx)}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Explanation in Practice Mode */}
                {mode === 'practice' && selectedAnswer !== undefined && currentQ.explanation && (
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm mb-6">
                        <p className="text-xs text-cyan-300 font-semibold mb-1">Teacher's Explanation / स्पष्टीकरण:</p>
                        <p className="text-slate-300">{currentQ.explanation}</p>
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
                        {questions.map((_, i) => (
                            <span
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    i === currentIndex
                                        ? 'bg-blue-500 scale-125'
                                        : answers[questions[i].id] !== undefined
                                        ? 'bg-emerald-500/60'
                                        : 'bg-slate-800'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={selectedAnswer === undefined && mode === 'test'}
                        className="py-2.5 px-5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-all shadow-md shadow-blue-600/20"
                    >
                        {currentIndex === total - 1 ? (mode === 'test' ? 'Save & Next Section →' : 'Finish') : 'Next →'}
                    </button>
                </div>
            </div>
        </div>
    );
};
