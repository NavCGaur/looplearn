export type VerbType = 'regular' | 'irregular';

export interface VerbWord {
    id: number;
    day: number;
    v1_base_form: string;
    v2_past_form: string;
    hindi_meaning: string;
    verb_type: VerbType;
}

export type WordCardDirection = 'en_to_hi' | 'hi_to_en';

export interface WordCardQuestion {
    id: string;
    verbId: number;
    prompt: string;
    promptSubtitle?: string;
    direction: WordCardDirection;
    correctAnswer: string;
    options: string[]; // 4 options
    verb: VerbWord;
}

export interface FillBlankQuestion {
    id: string;
    verbId: number;
    sentenceBefore: string;
    sentenceAfter: string;
    fullSentenceHint: string;
    timeClue: string;
    requiredForm: 'V1' | 'V2';
    correctAnswer: string;
    options: string[]; // [V1, V2]
    hindiMeaning: string;
    verb: VerbWord;
}

export interface GrammarQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    topic: string;
}

export interface SentencePrompt {
    id: string;
    verbId: number;
    verb: VerbWord;
    requiredTense: 'present' | 'past';
    promptText: string;
    exampleHint: string;
}

export interface SentenceEvaluation {
    score: number; // 0 or 1
    feedback: string;
    correctedSentence?: string;
    isCorrectTense: boolean;
    isCorrectVerbForm: boolean;
}

export interface ChallengeSubmissionData {
    studentName: string;
    classStandard: number;
    challengeDay: number;
    wordCardScore: number;
    fillblankScore: number;
    hangmanScore: number;
    grammarScore: number;
    sentenceScore: number;
    totalScore: number;
    maxScore: number;
    missedVerbIds: number[];
    answersJson: {
        wordCardAnswers?: Record<string, string>;
        fillblankAnswers?: Record<string, string>;
        hangmanCompletedWords?: number;
        grammarAnswers?: Record<string, string>;
        sentenceAnswers?: Record<string, { sentence: string; evaluation?: SentenceEvaluation }>;
    };
}
