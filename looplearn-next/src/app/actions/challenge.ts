'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import {
    ChallengeSubmissionData,
    SentenceEvaluation
} from '@/lib/challenge/types';
import { calculateChallengeScore } from '@/lib/challenge/scoring';
import { getVerbById } from '@/lib/challenge/verbs';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );
}

function normalizeStudentName(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

/**
 * Evaluates a student's sentence using Gemini AI with safe fallback
 */
export async function evaluateSentenceAction(params: {
    verbId: number;
    targetVerb: string;
    requiredTense: 'present' | 'past';
    studentSentence: string;
}): Promise<SentenceEvaluation> {
    const { targetVerb, requiredTense, studentSentence } = params;
    const cleanSentence = studentSentence.trim();

    if (!cleanSentence) {
        return {
            score: 0,
            feedback: "Please write a sentence before submitting.",
            isCorrectTense: false,
            isCorrectVerbForm: false
        };
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
        // Fallback heuristic if API key is not configured
        const hasVerb = cleanSentence.toLowerCase().includes(targetVerb.toLowerCase());
        const hasWords = cleanSentence.split(/\s+/).length >= 3;
        return {
            score: hasVerb && hasWords ? 1 : 0,
            feedback: hasVerb && hasWords
                ? `Good job using "${targetVerb}" in your sentence!`
                : `Make sure to use "${targetVerb}" in a complete sentence.`,
            isCorrectTense: hasVerb,
            isCorrectVerbForm: hasVerb
        };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are a warm, encouraging English teacher for middle-school Indian students (Class 6-9).
Task: The student was asked to write a simple ${requiredTense.toUpperCase()} TENSE sentence using the verb "${targetVerb}".
Student's input: "${cleanSentence}"

Evaluate according to these strict rules:
1. Did the student use the target verb "${targetVerb}" or an appropriate form for ${requiredTense} tense?
2. Is the sentence meaningful in English?
3. Award 1 mark if the tense and verb form are correct (even with small spelling or punctuation slips). Award 0 marks if the verb form is wrong, tense is wrong, or sentence makes no sense.
4. Give a warm, helpful 1-2 sentence feedback (encouraging and clear).
5. If there is a mistake, suggest a natural corrected sentence.

Respond ONLY with valid JSON in this format, with no markdown backticks:
{
  "score": 1,
  "isCorrectTense": true,
  "isCorrectVerbForm": true,
  "feedback": "Great sentence! You correctly used the past form.",
  "correctedSentence": "I went to school yesterday."
}`;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        // Remove code fences if any
        if (text.startsWith('```json')) text = text.slice(7);
        if (text.startsWith('```')) text = text.slice(3);
        if (text.endsWith('```')) text = text.slice(0, -3);
        text = text.trim();

        const parsed = JSON.parse(text);
        return {
            score: parsed.score === 1 ? 1 : 0,
            feedback: parsed.feedback || `Evaluated sentence using "${targetVerb}".`,
            correctedSentence: parsed.correctedSentence,
            isCorrectTense: !!parsed.isCorrectTense,
            isCorrectVerbForm: !!parsed.isCorrectVerbForm
        };
    } catch (err: any) {
        console.error('Error in evaluateSentenceAction:', err.message);
        // Resilient fallback: Check if target verb is present
        const hasVerb = cleanSentence.toLowerCase().includes(targetVerb.toLowerCase());
        const hasWords = cleanSentence.split(/\s+/).length >= 3;
        return {
            score: hasVerb && hasWords ? 1 : 0,
            feedback: hasVerb && hasWords
                ? `Good attempt with "${targetVerb}"!`
                : `Please make sure to include "${targetVerb}" in your sentence.`,
            isCorrectTense: hasVerb,
            isCorrectVerbForm: hasVerb
        };
    }
}

/**
 * Submits the scored test attempt to Supabase
 */
export async function submitChallengeAttemptAction(data: ChallengeSubmissionData) {
    const supabase = getSupabaseAdmin();
    const normalizedName = normalizeStudentName(data.studentName);

    const summary = calculateChallengeScore({
        wordCardScore: data.wordCardScore,
        fillblankScore: data.fillblankScore,
        hangmanScore: data.hangmanScore,
        grammarScore: data.grammarScore,
        sentenceScore: data.sentenceScore,
        missedVerbIds: data.missedVerbIds
    });

    const payload = {
        student_name: normalizedName,
        class_standard: data.classStandard,
        challenge_day: data.challengeDay,
        score: summary.totalScore,
        max_score: summary.maxScore,
        word_card_score: summary.wordCardScore,
        fillblank_score: summary.fillblankScore,
        hangman_score: summary.hangmanScore,
        grammar_score: summary.grammarScore,
        sentence_score: summary.sentenceScore,
        missed_verb_ids: data.missedVerbIds,
        answers_json: data.answersJson,
        submitted_at: new Date().toISOString()
    };

    try {
        const { data: inserted, error } = await supabase
            .from('verb_challenge_attempts')
            .upsert(payload, { onConflict: 'student_name,class_standard,challenge_day' })
            .select('id')
            .single();

        if (error) {
            console.error('Failed to save verb_challenge_attempt in Supabase:', error.message);
            // Return score summary anyway so student UI is never broken
            return {
                success: true,
                persisted: false,
                normalizedName,
                summary,
                error: error.message
            };
        }

        return {
            success: true,
            persisted: true,
            attemptId: inserted?.id,
            normalizedName,
            summary
        };
    } catch (e: any) {
        console.error('Exception in submitChallengeAttemptAction:', e.message);
        return {
            success: true,
            persisted: false,
            normalizedName,
            summary,
            error: e.message
        };
    }
}

/**
 * Retrieves past attempts and accumulated missed verb IDs for a student
 */
export async function getStudentChallengeProgressAction(studentName: string, classStandard: number) {
    const supabase = getSupabaseAdmin();
    const normalizedName = normalizeStudentName(studentName);

    try {
        const { data, error } = await supabase
            .from('verb_challenge_attempts')
            .select('*')
            .ilike('student_name', normalizedName)
            .eq('class_standard', classStandard)
            .order('challenge_day', { ascending: true });

        if (error || !data) {
            return {
                success: false,
                completedDays: [],
                allMissedVerbIds: []
            };
        }

        const completedDays = data.map(d => d.challenge_day);
        const allMissedVerbIds: number[] = [];
        data.forEach(d => {
            if (Array.isArray(d.missed_verb_ids)) {
                allMissedVerbIds.push(...d.missed_verb_ids);
            }
        });

        return {
            success: true,
            attempts: data,
            completedDays,
            allMissedVerbIds: Array.from(new Set(allMissedVerbIds))
        };
    } catch (e) {
        return {
            success: false,
            completedDays: [],
            allMissedVerbIds: []
        };
    }
}

/**
 * Retrieves teacher dashboard data: all student attempts and most missed verbs
 */
export async function getTeacherChallengeOverviewAction() {
    const supabase = getSupabaseAdmin();

    try {
        const { data, error } = await supabase
            .from('verb_challenge_attempts')
            .select('*')
            .order('submitted_at', { ascending: false });

        if (error || !data) {
            return { success: false, attempts: [], missedFrequency: [] };
        }

        // Count per-verb miss frequency across all students
        const freqMap: Record<number, number> = {};
        data.forEach(row => {
            if (Array.isArray(row.missed_verb_ids)) {
                row.missed_verb_ids.forEach((id: number) => {
                    freqMap[id] = (freqMap[id] || 0) + 1;
                });
            }
        });

        const missedFrequency = Object.entries(freqMap)
            .map(([idStr, count]) => {
                const id = parseInt(idStr, 10);
                const verb = getVerbById(id);
                return {
                    verbId: id,
                    count,
                    verb
                };
            })
            .sort((a, b) => b.count - a.count);

        return {
            success: true,
            attempts: data,
            missedFrequency
        };
    } catch (e: any) {
        return { success: false, attempts: [], missedFrequency: [], error: e.message };
    }
}
