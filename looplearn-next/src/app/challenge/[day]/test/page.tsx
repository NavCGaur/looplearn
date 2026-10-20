'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, notFound } from 'next/navigation';
import {
    generateWordCardQuestions,
    generateFillInBlankQuestions,
    generateSentencePrompts
} from '@/lib/challenge/verbs';
import { getGrammarQuestionsForDay } from '@/lib/challenge/grammar-questions';
import { WordCardActivity } from '@/components/challenge/WordCardActivity';
import { FillInBlankActivity } from '@/components/challenge/FillInBlankActivity';
import { GrammarActivity } from '@/components/challenge/GrammarActivity';
import { SentenceActivity } from '@/components/challenge/SentenceActivity';
import { submitChallengeAttemptAction } from '@/app/actions/challenge';
import { SentenceEvaluation } from '@/lib/challenge/types';

interface TestPageProps {
    params: Promise<{ day: string }>;
}

export default function TestPage({ params }: TestPageProps) {
    const resolvedParams = use(params);
    const day = parseInt(resolvedParams.day, 10);
    const router = useRouter();

    if (isNaN(day) || day < 1 || day > 6) {
        notFound();
    }

    // Student identity
    const [studentName, setStudentName] = useState('');
    const [classStandard, setClassStandard] = useState(7);
    const [isStarted, setIsStarted] = useState(false);

    // Current stage of test: 1=WordCards, 2=FillBlanks, 3=Hangman, 4=Grammar, 5=Sentences, 6=Submitting
    const [currentStage, setCurrentStage] = useState(1);

    // Question sets
    const [wordCardQuestions, setWordCardQuestions] = useState<any[]>([]);
    const [fillBlankQuestions, setFillBlankQuestions] = useState<any[]>([]);
    const [sentencePrompts, setSentencePrompts] = useState<any[]>([]);
    const grammarQuestions = getGrammarQuestionsForDay(day);

    // Scores & answers
    const [wordCardScore, setWordCardScore] = useState(0);
    const [wordCardMissedIds, setWordCardMissedIds] = useState<number[]>([]);
    const [wordCardAnswers, setWordCardAnswers] = useState<Record<string, string>>({});

    const [fillblankScore, setFillblankScore] = useState(0);
    const [fillblankMissedIds, setFillblankMissedIds] = useState<number[]>([]);
    const [fillblankAnswers, setFillblankAnswers] = useState<Record<string, string>>({});

    const [hangmanScore, setHangmanScore] = useState(0);

    const [grammarScore, setGrammarScore] = useState(0);
    const [grammarAnswers, setGrammarAnswers] = useState<Record<string, string>>({});

    const [sentenceScore, setSentenceScore] = useState(0);
    const [sentenceMissedIds, setSentenceMissedIds] = useState<number[]>([]);
    const [sentenceAnswers, setSentenceAnswers] = useState<Record<string, { sentence: string; evaluation?: SentenceEvaluation }>>({});

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const savedName = localStorage.getItem('looplearn_student_name');
        const savedClass = localStorage.getItem('looplearn_student_class');
        if (savedName) {
            setStudentName(savedName);
            setClassStandard(parseInt(savedClass || '7', 10));
        }

        let savedMissed: number[] = [];
        try {
            const raw = localStorage.getItem('looplearn_missed_verb_ids');
            if (raw) savedMissed = JSON.parse(raw);
        } catch (e) {}

        setWordCardQuestions(generateWordCardQuestions(day, savedMissed));
        setFillBlankQuestions(generateFillInBlankQuestions(day, savedMissed));
        setSentencePrompts(generateSentencePrompts(day, savedMissed));
    }, [day]);

    const handleStartTest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentName.trim()) return;
        localStorage.setItem('looplearn_student_name', studentName.trim());
        localStorage.setItem('looplearn_student_class', classStandard.toString());
        setIsStarted(true);
    };

    // Stage 1 complete
    const handleWordCardComplete = (score: number, missedIds: number[], answers: Record<string, string>) => {
        setWordCardScore(score);
        setWordCardMissedIds(missedIds);
        setWordCardAnswers(answers);
        setCurrentStage(2);
    };

    // Stage 2 complete
    const handleFillBlankComplete = (score: number, missedIds: number[], answers: Record<string, string>) => {
        setFillblankScore(score);
        setFillblankMissedIds(missedIds);
        setFillblankAnswers(answers);
        setCurrentStage(3);
    };

    // Stage 3 complete (Hangman)
    const handleHangmanComplete = () => {
        setCurrentStage(4);
    };

    // Stage 4 complete (Grammar)
    const handleGrammarComplete = (score: number, answers: Record<string, string>) => {
        setGrammarScore(score);
        setGrammarAnswers(answers);
        setCurrentStage(5);
    };

    // Stage 5 complete (Sentences) & Final Submission
    const handleSentenceComplete = async (
        score: number,
        missedIds: number[],
        answers: Record<string, { sentence: string; evaluation?: SentenceEvaluation }>
    ) => {
        setSentenceScore(score);
        setSentenceMissedIds(missedIds);
        setSentenceAnswers(answers);
        setIsSubmitting(true);

        const allMissed = Array.from(new Set([
            ...wordCardMissedIds,
            ...fillblankMissedIds,
            ...missedIds
        ]));

        // Update local missed verbs for spaced review
        try {
            const raw = localStorage.getItem('looplearn_missed_verb_ids');
            const prior = raw ? JSON.parse(raw) : [];
            const merged = Array.from(new Set([...prior, ...allMissed]));
            localStorage.setItem('looplearn_missed_verb_ids', JSON.stringify(merged));
        } catch (e) {}

        const submissionData = {
            studentName: studentName.trim(),
            classStandard,
            challengeDay: day,
            wordCardScore,
            fillblankScore,
            hangmanScore,
            grammarScore,
            sentenceScore: score,
            totalScore: wordCardScore + fillblankScore + hangmanScore + grammarScore + score,
            maxScore: 40,
            missedVerbIds: allMissed,
            answersJson: {
                wordCardAnswers,
                fillblankAnswers,
                hangmanCompletedWords: hangmanScore,
                grammarAnswers,
                sentenceAnswers: answers
            }
        };

        try {
            const res = await submitChallengeAttemptAction(submissionData);
            // Store result in sessionStorage for instant ResultsView display
            sessionStorage.setItem(`challenge_day_${day}_result`, JSON.stringify({
                studentName: res.normalizedName || studentName.trim(),
                classStandard,
                challengeDay: day,
                summary: res.summary,
                persisted: res.persisted
            }));
            router.push(`/challenge/${day}/results`);
        } catch (e) {
            console.error('Error submitting test:', e);
            // Redirect anyway using calculated scores
            router.push(`/challenge/${day}/results`);
        }
    };

    if (!isStarted) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
                    <div className="text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Day {day} Official Test
                        </span>
                        <h1 className="text-3xl font-extrabold text-white mt-3">Ready for the Test?</h1>
                        <p className="text-xs text-slate-400 mt-2">
                            40 Marks total • Word Cards (10M), Fill in Blanks (10M), Space Hangman (5M), Grammar (10M), Sentence Writing (5M)
                        </p>
                    </div>

                    <form onSubmit={handleStartTest} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Student Name / विद्यार्थी का नाम
                            </label>
                            <input
                                type="text"
                                required
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Class / कक्षा
                            </label>
                            <select
                                value={classStandard}
                                onChange={(e) => setClassStandard(parseInt(e.target.value, 10))}
                                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            >
                                {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                                    <option key={c} value={c}>
                                        Class {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                        >
                            Start Test (Day {day}) →
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <Link href={`/challenge/${day}/practice`} className="text-xs text-slate-500 hover:text-indigo-400 transition-colors">
                            Need more practice first? Go to Practice Mode →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-white bg-slate-800 px-3 py-1 rounded-lg">
                            {studentName} (Class {classStandard})
                        </span>
                        <span className="text-xs text-slate-400">Day {day} Test</span>
                    </div>

                    {/* Stage Pills */}
                    <div className="flex items-center gap-1.5 text-xs">
                        {['A. Word Cards', 'B. Blanks', 'C. Hangman', 'D. Grammar', 'E. Sentences'].map((name, idx) => (
                            <span
                                key={idx}
                                className={`hidden sm:inline-block px-2.5 py-1 rounded-full font-medium ${
                                    currentStage === idx + 1
                                        ? 'bg-indigo-600 text-white'
                                        : currentStage > idx + 1
                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                        : 'bg-slate-900 text-slate-500'
                                }`}
                            >
                                {name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Stage 1: Word Cards */}
                {currentStage === 1 && wordCardQuestions.length > 0 && (
                    <WordCardActivity
                        questions={wordCardQuestions}
                        mode="test"
                        onComplete={handleWordCardComplete}
                    />
                )}

                {/* Stage 2: Fill in Blanks */}
                {currentStage === 2 && fillBlankQuestions.length > 0 && (
                    <FillInBlankActivity
                        questions={fillBlankQuestions}
                        mode="test"
                        onComplete={handleFillBlankComplete}
                    />
                )}

                {/* Stage 3: Hangman */}
                {currentStage === 3 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-xl mx-auto shadow-2xl text-center space-y-6">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                            Activity C: Space Hangman (5 Marks)
                        </span>
                        <h2 className="text-2xl font-black text-white">Play Space Hangman</h2>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Open Space Hangman in a new tab, play with today's action verbs, and enter how many words you successfully guessed and launched into space!
                        </p>

                        <div>
                            <Link
                                href={`/spacehangman?challenge_day=${day}`}
                                target="_blank"
                                className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl font-bold bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/30 transition-all hover:scale-105 active:scale-95"
                            >
                                <span>Open Space Hangman 🚀</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </Link>
                        </div>

                        {/* Words Guessed Picker */}
                        <div className="pt-4 border-t border-slate-800">
                            <label className="block text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">
                                How many words did you successfully solve? (0 to 5)
                            </label>
                            <div className="flex justify-center gap-2">
                                {[0, 1, 2, 3, 4, 5].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setHangmanScore(num)}
                                        className={`w-12 h-12 rounded-2xl font-bold text-lg border transition-all ${
                                            hangmanScore === num
                                                ? 'bg-pink-600 border-pink-400 text-white ring-2 ring-pink-500 shadow-lg shadow-pink-600/30 scale-105'
                                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-2">1 mark awarded for each solved word.</p>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleHangmanComplete}
                                className="w-full py-3 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
                            >
                                Save Hangman Score & Next Section (Grammar) →
                            </button>
                        </div>
                    </div>
                )}

                {/* Stage 4: Grammar MCQs */}
                {currentStage === 4 && (
                    <GrammarActivity
                        questions={grammarQuestions}
                        mode="test"
                        onComplete={handleGrammarComplete}
                    />
                )}

                {/* Stage 5: Sentence Construction & Final Submit */}
                {currentStage === 5 && sentencePrompts.length > 0 && (
                    <SentenceActivity
                        prompts={sentencePrompts}
                        mode="test"
                        onComplete={handleSentenceComplete}
                    />
                )}

                {/* Loading screen while submitting */}
                {isSubmitting && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <h3 className="text-xl font-bold text-white mb-1">Evaluating & Saving Your Test...</h3>
                        <p className="text-xs text-slate-400">Compiling your activity marks and generating revision targets.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
