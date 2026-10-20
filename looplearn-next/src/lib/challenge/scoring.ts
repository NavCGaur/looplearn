import { VerbWord } from './types';
import { getVerbById } from './verbs';

export interface ScoreSummary {
    wordCardScore: number;
    fillblankScore: number;
    hangmanScore: number;
    grammarScore: number;
    sentenceScore: number;
    totalScore: number;
    maxScore: number;
    percentage: number;
    performanceTier: 'Master' | 'Proficient' | 'Developing' | 'Needs Review';
    badgeTitle: string;
    missedVerbs: VerbWord[];
}

export function calculateChallengeScore(params: {
    wordCardScore: number;
    fillblankScore: number;
    hangmanScore: number;
    grammarScore: number;
    sentenceScore: number;
    missedVerbIds: number[];
}): ScoreSummary {
    const wordCardScore = Math.min(10, Math.max(0, params.wordCardScore || 0));
    const fillblankScore = Math.min(10, Math.max(0, params.fillblankScore || 0));
    const hangmanScore = Math.min(5, Math.max(0, params.hangmanScore || 0));
    const grammarScore = Math.min(10, Math.max(0, params.grammarScore || 0));
    const sentenceScore = Math.min(5, Math.max(0, params.sentenceScore || 0));

    const maxScore = 40;
    const totalScore = wordCardScore + fillblankScore + hangmanScore + grammarScore + sentenceScore;
    const percentage = Math.round((totalScore / maxScore) * 100);

    let performanceTier: 'Master' | 'Proficient' | 'Developing' | 'Needs Review' = 'Needs Review';
    let badgeTitle = 'Keep Practicing!';

    if (percentage >= 85) {
        performanceTier = 'Master';
        badgeTitle = 'Verb Champion 🏆';
    } else if (percentage >= 70) {
        performanceTier = 'Proficient';
        badgeTitle = 'Rising English Star ⭐';
    } else if (percentage >= 50) {
        performanceTier = 'Developing';
        badgeTitle = 'Consistent Learner 🚀';
    }

    const uniqueMissedIds = Array.from(new Set(params.missedVerbIds || []));
    const missedVerbs = uniqueMissedIds
        .map(id => getVerbById(id))
        .filter((v): v is VerbWord => !!v);

    return {
        wordCardScore,
        fillblankScore,
        hangmanScore,
        grammarScore,
        sentenceScore,
        totalScore,
        maxScore,
        percentage,
        performanceTier,
        badgeTitle,
        missedVerbs
    };
}
