'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

export type QuestionType = 'mcq' | 'fillblank' | 'truefalse'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface GeneratedQuestion {
    question_text: string
    question_type: QuestionType
    // For MCQ
    options?: {
        text: string
        is_correct: boolean
    }[]
    // For Fill Blank
    answer?: string
    explanation: string
}

/**
 * Generate questions using Gemini AI
 */
export async function generateQuestions(
    subject: string,
    chapter: string,
    classStandard: number,
    difficulty: Difficulty,
    count: number = 5,
    type: QuestionType = 'mcq'
) {
    try {
        // 1. Check permissions (Must be teacher or admin)
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error('Unauthorized')

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
            throw new Error('Only teachers can generate questions')
        }

        // 2. Validate API Key
        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            throw new Error('Gemini API Key not configured')
        }

        // 3. Construct Prompt
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const systemPrompt = `You are an expert CBSE curriculum teacher for Class 6 to 10 students in India. You specialize in creating clear, accurate, and age-appropriate quiz questions strictly following the NCERT syllabus.`

        let specificInstructions = ''
        let jsonSchema = ''

        if (type === 'mcq') {
            specificInstructions = `
    -   "options" must contain exactly 4 choices.
    -   One and only one option must be "is_correct": true.
            `
            jsonSchema = `
    [
      {
        "question_text": "Question string here...",
        "question_type": "mcq",
        "options": [
          { "text": "Option A", "is_correct": false },
          { "text": "Option B", "is_correct": true },
          { "text": "Option C", "is_correct": false },
          { "text": "Option D", "is_correct": false }
        ],
        "explanation": "Explanation here..."
      }
    ]
            `
        } else if (type === 'fillblank') {
            specificInstructions = `
    -   The question must be a sentence with a missing word indicated by 3 underscores: "___".
    -   "answer" field must contain the correct word(s) that fill the blank.
    -   Ensure the answer is unambiguous.
            `
            jsonSchema = `
    [
      {
        "question_text": "The powerhouse of the cell is the ___.",
        "question_type": "fillblank",
        "answer": "mitochondria",
        "explanation": "Mitochondria produce ATP..."
      }
    ]
            `
        } else if (type === 'truefalse') {
            specificInstructions = `
    -   The question must be a statement that is either definitively True or False.
    -   "options" must contain exactly 2 choices: "True" and "False".
            `
            jsonSchema = `
    [
      {
        "question_text": "Water boils at 100 degrees Celsius at sea level.",
        "question_type": "truefalse",
        "options": [
          { "text": "True", "is_correct": true },
          { "text": "False", "is_correct": false }
        ],
        "explanation": "This is a standard physical property..."
      }
    ]
            `
        }

        const userPrompt = `
Generate ${count} ${difficulty} level ${type === 'mcq' ? 'multiple-choice' : type === 'fillblank' ? 'fill-in-the-blank' : 'true/false'} questions for Class ${classStandard} ${subject} students (CBSE Board).
Topic: "${chapter}"

**Strict Requirements:**
1.  **Format**: Return ONLY a valid JSON array. No markdown code blocks, no intro text.
2.  **Formulas**: Use LaTeX wrapped in single dollar signs for ANY math or chemical formulas. 
    -   Example: "What is the formula for water? $H_2O$"
3.  **Content**: 
    -   Questions must be conceptually accurate and grade-appropriate.
    -   Provide a short "explanation".
${specificInstructions}
4.  **Schema**:
${jsonSchema}
`

        // 4. Call Gemini
        const result = await model.generateContent([systemPrompt, userPrompt])
        const response = await result.response
        let text = response.text()

        // 5. Clean and Parse JSON
        // Remove markdown code blocks if Gemini ignores instruction
        text = text.replace(/```json/g, '').replace(/```/g, '').trim()

        const questions: GeneratedQuestion[] = JSON.parse(text)

        // 6. Basic Validation
        if (!Array.isArray(questions)) {
            throw new Error('Invalid response format from AI')
        }

        // Force type to match request (AI sometimes hallucinates type field)
        questions.forEach(q => q.question_type = type)

        return { success: true, data: questions }

    } catch (error: any) {
        console.error('AI Generation Error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Save generated questions to Supabase
 */
export async function saveQuestionsToDatabase(
    questions: GeneratedQuestion[],
    metadata: {
        subject: string
        chapter: string
        classStandard: number
        difficulty: string
    }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    let savedCount = 0
    let errors: string[] = []

    for (const [index, q] of questions.entries()) {
        // 1. Validate Question Integrity BEFORE Database Calls
        if (!q.question_text) {
            errors.push(`Question ${index + 1}: Missing text`)
            continue
        }

        if ((q.question_type === 'mcq' || q.question_type === 'truefalse') && (!q.options || q.options.length === 0)) {
            errors.push(`Question ${index + 1}: Missing options for ${q.question_type}`)
            continue
        }

        if (q.question_type === 'fillblank' && !q.answer) {
            errors.push(`Question ${index + 1}: Missing answer for fill-in-blank`)
            continue
        }

        // 2. Insert Question
        const { data: questionData, error: qError } = await supabase
            .from('questions')
            .insert({
                question_text: q.question_text,
                question_type: q.question_type,
                class_standard: metadata.classStandard,
                subject: metadata.subject,
                chapter: metadata.chapter,
                difficulty: metadata.difficulty,
                created_by: user.id,
                is_active: true
            })
            .select()
            .single()

        if (qError) {
            console.error('Error saving question:', qError)
            errors.push(`Question ${index + 1}: Database error (${qError.message})`)
            continue
        }

        // 3. Insert Details (Options or Answer)
        if (q.question_type === 'mcq' || q.question_type === 'truefalse') {
            const optionsToInsert = q.options!.map((opt, i) => ({
                question_id: questionData.id,
                option_text: opt.text,
                is_correct: opt.is_correct || false, // Ensure boolean
                display_order: i + 1,
                explanation: (opt.is_correct || q.question_type === 'truefalse') ? q.explanation : null
            }))

            const { error: oError } = await supabase
                .from('question_options')
                .insert(optionsToInsert)

            if (oError) {
                console.error('Error saving options:', oError)
                errors.push(`Question ${index + 1}: Failed to save options`)
            } else {
                savedCount++
            }

        } else if (q.question_type === 'fillblank') {
            const { error: fError } = await supabase
                .from('fillblank_answers')
                .insert({
                    question_id: questionData.id,
                    accepted_answer: q.answer!,
                    is_case_sensitive: false,
                    is_primary: true
                })

            if (fError) {
                console.error('Error saving fillblank:', fError)
                errors.push(`Question ${index + 1}: Failed to save answer`)
            } else {
                savedCount++
            }
        }
    }

    return {
        success: savedCount > 0,
        count: savedCount,
        errors: errors.length > 0 ? errors : undefined
    }
}
