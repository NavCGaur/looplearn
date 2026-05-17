'use server'

import * as aiService from './ai'
import { GeneratedQuestion, QuestionType, Difficulty, SubjectiveQuestionInput } from './ai'

export async function generateQuestions(
    subject: string,
    chapter: string,
    classStandard: number,
    difficulty: Difficulty,
    count: number = 5,
    type: QuestionType = 'mcq'
) {
    return aiService.generateQuestions(subject, chapter, classStandard, difficulty, count, type)
}

export async function saveQuestionsToDatabase(
    questions: GeneratedQuestion[],
    metadata: {
        subject: string
        chapter: string
        classStandard: number
        difficulty: string
    }
) {
    return aiService.saveQuestionsToDatabase(questions, metadata)
}

export async function generateQuestionsFromPDF(
    pdfBase64: string,
    subject: string,
    chapter: string,
    classStandard: number,
    difficulty: Difficulty,
    count: number = 5,
    type: QuestionType = 'mcq'
) {
    return aiService.generateQuestionsFromPDF(pdfBase64, subject, chapter, classStandard, difficulty, count, type)
}

export async function evaluateSubjectiveAnswers(
    imageBase64: string,
    imageMimeType: 'image/jpeg' | 'image/png' | 'image/webp',
    questions: SubjectiveQuestionInput[],
    subject: string,
    classStandard: number,
    feedbackLanguage: 'english' | 'hinglish' = 'english'
) {
    return aiService.evaluateSubjectiveAnswers(imageBase64, imageMimeType, questions, subject, classStandard, feedbackLanguage)
}

export async function evaluateQuickPracticeSheet(
    imageBase64: string,
    imageMimeType: 'image/jpeg' | 'image/png' | 'image/webp',
    feedbackLanguage: 'english' | 'hinglish' = 'english'
) {
    return aiService.evaluateQuickPracticeSheet(imageBase64, imageMimeType, feedbackLanguage)
}
