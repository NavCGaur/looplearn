'use client';

import React, { useState } from 'react';
import { WordCardQuestion } from '@/lib/challenge/types';

interface WordCardActivityProps {
    questions: WordCardQuestion[];
    mode: 'practice' | 'test';
    onComplete?: (score: number, missedVerbIds: number[], answers: Record<string, string>) => void;
}

export const WordCardActivity: React.FC<WordCardActivityProps> = ({
    questions,
    mode,
    onComplete
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isFlipped, setIsFlipped] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const currentQ = questions[currentIndex];
    const total = questions.length;
    const selectedAnswer = currentQ ? answers[currentQ.id] : undefined;

    const handleSelectOption = (option: string) => {
        if (!currentQ) return;
        if (mode === 'practice' && selectedAnswer !== undefined) return; // locked after answer in practice

        const newAnswers = { ...answers, [currentQ.id]: option };
        setAnswers(newAnswers);

        if (mode === 'test') {
            // Auto-advance in test after short delay or manual next
            if (currentIndex < total - 1) {
                setTimeout(() => {
                    setCurrentIndex(prev => prev + 1);
                }, 350);
            }
        }
    };

    const handleNext = () => {
        setIsFlipped(false);
        if (currentIndex < total - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            finishActivity();
        }
    };

    const handlePrev = () => {
        setIsFlipped(false);
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const finishActivity = () => {
        let score = 0;
        const missedVerbIds: number[] = [];

        questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                score += 1;
            } else {
                missedVerbIds.push(q.verbId);
            }
        });

        setShowResults(true);
        if (onComplete) {
            onComplete(score, missedVerbIds, answers);
        }
    };

    if (showResults && mode === 'practice') {
        const score = questions.filter(q => answers[q.id] === q.correctAnswer).length;
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-2xl">
                <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Practice Complete!</h3>
                <p className="text-slate-300 mb-6">
                    You got <span className="text-emerald-400 font-bold text-lg">{score}</span> out of {total} correct in Word Cards.
                </p>
                <button
                    onClick={() => {
                        setAnswers({});
                        setCurrentIndex(0);
                        setShowResults(false);
                    }}
                    className="py-3 px-6 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30"
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
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                        {mode === 'test' ? 'Activity A: Word Cards (10 Marks)' : 'Practice Mode • Word Cards'}
                    </span>
                    <span className="text-xs text-slate-400">
                        Card {currentIndex + 1} of {total}
                    </span>
                </div>
                <div className="text-xs text-slate-400">
                    {Object.keys(answers).length}/{total} Answered
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                <div
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                />
            </div>

            {/* Main Question Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative">
                {/* Flip Card toggle for practice mode */}
                {mode === 'practice' && (
                    <button
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="absolute top-5 right-5 text-xs text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {isFlipped ? 'Show Quiz' : 'Flip Card Details'}
                    </button>
                )}

                {isFlipped && mode === 'practice' ? (
                    <div className="py-6 text-center animate-fadeIn">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                            currentQ.verb.verb_type === 'irregular'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                            {currentQ.verb.verb_type.toUpperCase()} VERB
                        </span>
                        <h2 className="text-4xl font-extrabold text-white mb-2">{currentQ.verb.v1_base_form}</h2>
                        <p className="text-xl text-indigo-300 font-medium mb-4">Past (V2): <span className="font-bold underline">{currentQ.verb.v2_past_form}</span></p>
                        <p className="text-2xl text-amber-200 font-semibold mb-6">अर्थ: {currentQ.verb.hindi_meaning}</p>
                        <p className="text-xs text-slate-400">Day {currentQ.verb.day} Vocabulary • ID #{currentQ.verb.id}</p>
                    </div>
                ) : (
                    <div>
                        <div className="text-center mb-8">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">
                                {currentQ.direction === 'en_to_hi' ? 'What is the Hindi meaning of:' : 'What is the English verb (V1) for:'}
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide mb-2">
                                {currentQ.prompt}
                            </h2>
                            {currentQ.promptSubtitle && (
                                <p className="text-xs text-indigo-300/80 font-medium">
                                    {currentQ.promptSubtitle}
                                </p>
                            )}
                        </div>

                        {/* Options Grid */}
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
                                    btnStyle = "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30";
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
                                        ? 'bg-indigo-500 scale-125'
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
                        className="py-2.5 px-5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-600/20"
                    >
                        {currentIndex === total - 1 ? (mode === 'test' ? 'Save & Next Section →' : 'Finish') : 'Next →'}
                    </button>
                </div>
            </div>
        </div>
    );
};
