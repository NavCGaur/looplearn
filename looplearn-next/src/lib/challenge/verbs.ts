import verbsRaw from './data/verbs.json';
import { VerbWord, WordCardQuestion, FillBlankQuestion, SentencePrompt } from './types';

export const ALL_VERBS: VerbWord[] = verbsRaw as VerbWord[];

export function getAllVerbs(): VerbWord[] {
    return ALL_VERBS;
}

export function getVerbsForDay(day: number): VerbWord[] {
    return ALL_VERBS.filter(v => v.day === day);
}

export function getVerbById(id: number): VerbWord | undefined {
    return ALL_VERBS.find(v => v.id === id);
}

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Spaced Review Selector:
 * Selects count verbs for a given day, prioritizing words previously missed.
 */
export function getVerbsForPracticeOrTest(day: number, missedVerbIds: number[] = [], totalCount = 10): VerbWord[] {
    const dayVerbs = getVerbsForDay(day);
    const priorVerbs = ALL_VERBS.filter(v => v.day < day);
    
    // Pick missed verbs that belong to prior days or current day
    const missedVerbs = missedVerbIds
        .map(id => getVerbById(id))
        .filter((v): v is VerbWord => !!v);

    if (day === 1 || (priorVerbs.length === 0 && missedVerbs.length === 0)) {
        return shuffleArray(dayVerbs).slice(0, totalCount);
    }

    if (day === 6) {
        // Day 6 is cumulative review: prioritize all missed verbs, fill remaining from all 200 verbs
        const uniqueMissed = Array.from(new Set(missedVerbs.map(v => v.id)))
            .map(id => getVerbById(id)!);
        const remainingPool = ALL_VERBS.filter(v => !uniqueMissed.some(m => m.id === v.id));
        const combined = [...shuffleArray(uniqueMissed), ...shuffleArray(remainingPool)];
        return combined.slice(0, totalCount);
    }

    // Days 2 to 5: 8 from current day + 2 from missed/prior days
    const currentDayNeeded = Math.min(8, totalCount);
    const reviewNeeded = totalCount - currentDayNeeded;

    const pickedCurrent = shuffleArray(dayVerbs).slice(0, currentDayNeeded);
    
    const reviewPool = missedVerbs.length > 0 ? missedVerbs : priorVerbs;
    const pickedReview = shuffleArray(reviewPool.filter(v => v.day < day)).slice(0, reviewNeeded);

    // If review pool didn't have enough, fill with current day
    const combined = [...pickedCurrent, ...pickedReview];
    if (combined.length < totalCount) {
        const extraNeeded = totalCount - combined.length;
        const extraFromDay = dayVerbs.filter(v => !combined.some(c => c.id === v.id));
        combined.push(...shuffleArray(extraFromDay).slice(0, extraNeeded));
    }

    return shuffleArray(combined);
}

/**
 * Generates 10 Word Card MCQ questions (5 EN->HI, 5 HI->EN)
 */
export function generateWordCardQuestions(day: number, missedVerbIds: number[] = []): WordCardQuestion[] {
    const selectedVerbs = getVerbsForPracticeOrTest(day, missedVerbIds, 10);
    const allHindiMeanings = Array.from(new Set(ALL_VERBS.map(v => v.hindi_meaning)));
    const allEnglishBases = Array.from(new Set(ALL_VERBS.map(v => v.v1_base_form)));

    return selectedVerbs.map((verb, idx) => {
        // Half English -> Hindi, Half Hindi -> English
        const direction: 'en_to_hi' | 'hi_to_en' = idx % 2 === 0 ? 'en_to_hi' : 'hi_to_en';

        if (direction === 'en_to_hi') {
            const correctAnswer = verb.hindi_meaning;
            const distractors = shuffleArray(allHindiMeanings.filter(m => m !== correctAnswer)).slice(0, 3);
            const options = shuffleArray([correctAnswer, ...distractors]);

            return {
                id: `wc_${day}_${verb.id}_${idx}`,
                verbId: verb.id,
                prompt: verb.v1_base_form,
                promptSubtitle: `Past Form (V2): ${verb.v2_past_form}`,
                direction,
                correctAnswer,
                options,
                verb
            };
        } else {
            const correctAnswer = verb.v1_base_form;
            const distractors = shuffleArray(allEnglishBases.filter(b => b !== correctAnswer)).slice(0, 3);
            const options = shuffleArray([correctAnswer, ...distractors]);

            return {
                id: `wc_${day}_${verb.id}_${idx}`,
                verbId: verb.id,
                prompt: verb.hindi_meaning,
                promptSubtitle: `Choose the correct English verb (V1):`,
                direction,
                correctAnswer,
                options,
                verb
            };
        }
    });
}

interface SentenceTemplate {
    before: string;
    after: string;
    timeClue: string;
    form: 'V1' | 'V2';
}

const TEMPLATES_PAST: SentenceTemplate[] = [
    { before: "Yesterday, Rahul", after: "very early in the morning.", timeClue: "Yesterday (Past)", form: "V2" },
    { before: "Last night, the teacher", after: "the lesson carefully.", timeClue: "Last night (Past)", form: "V2" },
    { before: "Two hours ago, they", after: "all the instructions.", timeClue: "Two hours ago (Past)", form: "V2" },
    { before: "Last week, my friend", after: "to my house after school.", timeClue: "Last week (Past)", form: "V2" },
    { before: "In the morning, she", after: "her homework on time.", timeClue: "In the morning (Past)", form: "V2" },
];

const TEMPLATES_PRESENT: SentenceTemplate[] = [
    { before: "Every day, I", after: "with complete dedication.", timeClue: "Every day (Routine)", form: "V1" },
    { before: "They usually", after: "together during lunchtime.", timeClue: "Usually (Routine)", form: "V1" },
    { before: "We always", after: "our books before class begins.", timeClue: "Always (Habit)", form: "V1" },
    { before: "Students often", after: "questions to the teacher.", timeClue: "Often (Habit)", form: "V1" },
    { before: "You should always", after: "politely with everyone.", timeClue: "Should (Base V1)", form: "V1" },
];

/**
 * Generates 10 Fill-In-The-Blanks questions with time clues (V1 vs V2)
 */
export function generateFillInBlankQuestions(day: number, missedVerbIds: number[] = []): FillBlankQuestion[] {
    const selectedVerbs = getVerbsForPracticeOrTest(day, missedVerbIds, 10);

    return selectedVerbs.map((verb, idx) => {
        // Alternating past (V2) and present/routine (V1)
        const isPast = idx % 2 === 0;
        const template = isPast
            ? TEMPLATES_PAST[idx % TEMPLATES_PAST.length]
            : TEMPLATES_PRESENT[idx % TEMPLATES_PRESENT.length];

        const requiredForm: 'V1' | 'V2' = template.form;
        const correctAnswer = requiredForm === 'V1' ? verb.v1_base_form : verb.v2_past_form;
        const distractor = requiredForm === 'V1' ? verb.v2_past_form : verb.v1_base_form;

        // Shuffle options
        const options = shuffleArray([correctAnswer, distractor]);

        return {
            id: `fib_${day}_${verb.id}_${idx}`,
            verbId: verb.id,
            sentenceBefore: template.before,
            sentenceAfter: template.after,
            fullSentenceHint: `${template.before} [ _____ ] ${template.after}`,
            timeClue: template.timeClue,
            requiredForm,
            correctAnswer,
            options,
            hindiMeaning: verb.hindi_meaning,
            verb
        };
    });
}

/**
 * Generates 5 Sentence Construction prompts for AI evaluation
 */
export function generateSentencePrompts(day: number, missedVerbIds: number[] = []): SentencePrompt[] {
    const selectedVerbs = getVerbsForPracticeOrTest(day, missedVerbIds, 5);

    return selectedVerbs.map((verb, idx) => {
        const requiredTense: 'present' | 'past' = idx % 2 === 0 ? 'past' : 'present';
        const targetVerbWord = requiredTense === 'past' ? verb.v2_past_form : verb.v1_base_form;

        return {
            id: `sent_${day}_${verb.id}_${idx}`,
            verbId: verb.id,
            verb,
            requiredTense,
            promptText: requiredTense === 'past'
                ? `Write a simple PAST tense sentence using "${targetVerbWord}" (${verb.hindi_meaning}):`
                : `Write a simple PRESENT tense sentence using "${targetVerbWord}" (${verb.hindi_meaning}):`,
            exampleHint: requiredTense === 'past'
                ? `Example clue: Start with "Yesterday..." or "I ${targetVerbWord}..."`
                : `Example clue: Start with "I ${targetVerbWord} every day..." or "We ${targetVerbWord}..."`
        };
    });
}
