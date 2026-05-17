// Plain server module (no 'use server' directive to allow direct imports in api routes)

// ============================================
// AI Server Actions — LoopLearn
// ============================================

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

export type QuestionType = 'mcq' | 'fillblank' | 'truefalse'

// ============================================
// Subjective Evaluation Types
// ============================================
export interface SubjectiveQuestionInput {
    question_number: number
    question_text: string
    question_type: 'short_answer' | 'long_answer' | 'numerical' | 'theorem' | 'diagram'
    max_marks: number
    marking_rubric?: string
}

export interface QuestionEvalResult {
    question_number: number
    marks_awarded: number
    max_marks: number
    what_was_correct: string
    what_was_wrong: string
    suggestion: string
    diagram_present?: boolean
    diagram_labeled?: boolean
    // Only present on the first item — holistic summary of the whole paper
    overall_comment?: string
    // One-line direct coaching note for teacher's WhatsApp class summary
    // e.g. "Q1: Wrote only 3 examples of vegetative propagation, missed Bamboo"
    teacher_summary?: string
}

// For Quick Practice mode — Gemini reads questions from the image itself
export interface QuickPracticeEvalResult {
    detected_class: string      // e.g. "Class 9"
    detected_subject: string    // e.g. "Science"
    detected_chapter: string    // e.g. "Gravitation"
    questions: QuestionEvalResult[]
    totalMarks: number
    maxMarks: number
    // Handwriting/presentation coaching notes (future feature — optional)
    presentation_notes?: string[]
}

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

/**
 * Generate questions from a chapter PDF using Gemini multimodal input
 */
export async function generateQuestionsFromPDF(
    pdfBase64: string,
    subject: string,
    chapter: string,
    classStandard: number,
    difficulty: Difficulty,
    count: number = 5,
    type: QuestionType = 'mcq'
): Promise<{ success: boolean; data?: GeneratedQuestion[]; error?: string }> {
    try {
        // 1. Auth & Role check
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

        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            throw new Error('Gemini API Key not configured')
        }

        // 2. Build the same prompt schema as generateQuestions
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        let specificInstructions = ''
        let jsonSchema = ''

        if (type === 'mcq') {
            specificInstructions = `
    -   "options" must contain exactly 4 choices.
    -   One and only one option must be "is_correct": true.`
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
    ]`
        } else if (type === 'fillblank') {
            specificInstructions = `
    -   The question must be a sentence with a missing word indicated by 3 underscores: "___".
    -   "answer" field must contain the correct word(s) that fill the blank.
    -   Ensure the answer is unambiguous.`
            jsonSchema = `
    [
      {
        "question_text": "The powerhouse of the cell is the ___.",
        "question_type": "fillblank",
        "answer": "mitochondria",
        "explanation": "Mitochondria produce ATP..."
      }
    ]`
        } else if (type === 'truefalse') {
            specificInstructions = `
    -   The question must be a statement that is either definitively True or False.
    -   "options" must contain exactly 2 choices: "True" and "False".`
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
    ]`
        }

        const systemPrompt = `You are an expert CBSE curriculum teacher for Class 6 to 10 students in India. You specialize in creating clear, accurate, and age-appropriate quiz questions strictly following the NCERT syllabus.`

        const textPrompt = `
The attached PDF is a chapter from a Class ${classStandard} ${subject} textbook (CBSE Board).
Chapter / Topic: "${chapter}"

Based ONLY on the content of this PDF, generate ${count} ${difficulty} level ${type === 'mcq' ? 'multiple-choice' : type === 'fillblank' ? 'fill-in-the-blank' : 'true/false'} questions.

**Strict Requirements:**
1.  **Format**: Return ONLY a valid JSON array. No markdown code blocks, no intro text.
2.  **Formulas**: Use LaTeX wrapped in single dollar signs for ANY math or chemical formulas.
    -   Example: "What is the formula for water? $H_2O$"
3.  **Content**:
    -   Questions must be derived strictly from the PDF content.
    -   Questions must be conceptually accurate and grade-appropriate.
    -   Provide a short "explanation" for each answer.
${specificInstructions}
4.  **Schema**:
${jsonSchema}
`

        // 3. Call Gemini with PDF as inline multimodal data
        const result = await model.generateContent([
            systemPrompt,
            {
                inlineData: {
                    mimeType: 'application/pdf',
                    data: pdfBase64,
                },
            },
            textPrompt,
        ])

        const response = await result.response
        let text = response.text()

        // 4. Clean and parse JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const questions: GeneratedQuestion[] = JSON.parse(text)

        if (!Array.isArray(questions)) {
            throw new Error('Invalid response format from AI')
        }

        // Force type to match request
        questions.forEach(q => q.question_type = type)

        return { success: true, data: questions }

    } catch (error: any) {
        console.error('PDF AI Generation Error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Evaluate handwritten student answers using Gemini Vision.
 * Accepts a single stitched image (base64) containing all pages of the student's answers.
 * Returns structured per-question marks and feedback.
 */
export async function evaluateSubjectiveAnswers(
    imageBase64: string,
    imageMimeType: 'image/jpeg' | 'image/png' | 'image/webp',
    questions: SubjectiveQuestionInput[],
    subject: string,
    classStandard: number,
    feedbackLanguage: 'english' | 'hinglish' = 'english'
): Promise<{ success: boolean; data?: QuestionEvalResult[]; totalMarks?: number; maxMarks?: number; error?: string }> {
    try {
        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            throw new Error('Gemini API Key not configured')
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        // Build question list for the prompt
        // Build per-question instructions based on type — theory questions are NOT checked for Given/To Find
        const getTypeInstructions = (type: string): string => {
            switch (type) {
                case 'numerical':
                    return 'Award marks stepwise: 1 for "Given" section, 1 for correct formula, marks for substitution steps, 1 for correct final answer, 1 for correct unit. Strictly check units.'
                case 'theorem':
                    return 'Award marks stepwise: 1 for stating the theorem/to prove, marks for each logical derivation step, 1 for the conclusion/proved statement. Do NOT require Given/To Find.'
                case 'diagram':
                    return 'Check: (a) is the diagram drawn and recognizable, (b) are all important parts labeled correctly, (c) are arrows/direction/orientation correct. Award proportionally.'
                case 'short_answer':
                    return 'Check for: key scientific terms, accurate facts, all required points mentioned. Award marks per valid point. Do NOT require Given/To Find format — this is a theory answer.'
                case 'long_answer':
                    return 'Check for: all major points/sections, scientific accuracy, examples if needed, logical flow. Award marks per sub-point. Do NOT require Given/To Find — this is a theory/descriptive answer.'
                default:
                    return 'Award marks for completeness, scientific accuracy, and clarity.'
            }
        }

        const questionList = questions.map(q => {
            const typeLabel: Record<string, string> = {
                short_answer: 'Short Answer (Theory)',
                long_answer: 'Long Answer (Theory)',
                numerical: 'Numerical/Calculation',
                theorem: 'Proof/Theorem',
                diagram: 'Diagram-Based',
            }
            const typeInstructions = getTypeInstructions(q.question_type)
            const rubric = q.marking_rubric
                ? `Teacher's rubric: ${q.marking_rubric}`
                : `Default rubric: ${typeInstructions}`

            return `Q${q.question_number} [${q.max_marks} marks] — ${typeLabel[q.question_type] || 'Question'}:
"${q.question_text}"
${rubric}
Grading approach: ${typeInstructions}`
        }).join('\n\n')

        // ── Language instructions ────────────────────────────────────────────
        const languageInstructions = feedbackLanguage === 'hinglish'
            ? `**Feedback Language — Hinglish (IMPORTANT):**
- Write ALL feedback fields (what_was_correct, what_was_wrong, suggestion, overall_comment) in Hinglish
- Hinglish means: natural mix of conversational Hindi (in Roman script) + English
- Keep ALL scientific terms, chapter names, formulas, and CBSE keywords in English (e.g. "xylem", "phloem", "transpiration", "formula", "marks")
- Do NOT use Devanagari script — only Roman letters for Hindi words
- Write like a supportive teacher talking to a student, not like a translation
- Example tone: "Aapne xylem ka role sahi likha, aur phloem mention bhi kiya — good effort! Lekin transpiration pull ka mechanism nahi likha tha, woh important point tha."`
            : `**Feedback Language — English:**
- Write all feedback in clear, simple English that a Class ${classStandard} student can understand
- Avoid overly technical language in the feedback text itself; keep it accessible`

        // ── Tone instructions (applies to both languages) ────────────────────
        const toneInstructions = `**Tone — Supportive and Encouraging:**
- Acknowledge what the student got right before pointing out mistakes
- Be honest about missing marks but phrase it constructively ("You missed X" not "You failed to write X")
- Avoid harsh language — treat missing marks as a learning opportunity
- Do NOT over-praise with empty phrases like "Excellent!", "Brilliant!", "Amazing!" for average work
- A 60% score = warm encouragement; a 30% score = gentle, constructive correction, not discouragement
- The overall_comment should feel like a teacher saying "Here's what I noticed about your paper overall"`

        const prompt = `You are an experienced CBSE Class ${classStandard} ${subject} examiner evaluating a student's handwritten exam answers.

The uploaded image contains the student's handwritten answers. The answers may span the entire image. Read all the handwriting carefully, even if it is not perfectly neat.

${languageInstructions}

${toneInstructions}

**Core Evaluation Rules:**
- Award PARTIAL marks — a student who writes most of the correct points should not get zero
- NEVER require "Given / To Find / To Prove" format for theory (short_answer or long_answer) questions — that format is only for numericals
- For theory questions: award marks for each correct point, term, or fact mentioned
- For numerical questions: check Given section, formula, substitution steps, answer, and units
- For diagrams: check presence, recognizability, and correctness of labels
- Be lenient on handwriting quality and minor spelling, but strict on scientific factual accuracy
- If a question's answer is completely absent or unreadable, award 0 marks
- NEVER award more marks than the question's maximum

**Questions to Evaluate:**
${questionList}

**CRITICAL: Return ONLY a valid JSON array. No markdown, no prose, no explanation outside the JSON. Use this exact schema:**
[
  {
    "question_number": 1,
    "marks_awarded": <integer, 0 to max_marks inclusive>,
    "max_marks": <the question's max marks>,
    "what_was_correct": "<specific: which points/facts/steps the student got right>",
    "what_was_wrong": "<specific: which points/facts/steps were missing or incomplete. Write 'Nothing \u2014 full marks!' if perfect.>",
    "suggestion": "<one concrete, encouraging improvement tip>",
    "diagram_present": <true or false \u2014 ONLY include this field for diagram-type questions>,
    "diagram_labeled": <true or false \u2014 ONLY include this field for diagram-type questions>,
    "overall_comment": "<ONLY on the first question object: 1-2 sentence warm summary of the student's overall performance \u2014 highlight their strength and one key area to improve>"
  }
]`

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: imageMimeType,
                    data: imageBase64,
                },
            },
            prompt,
        ])

        let text = result.response.text()

        // Clean any markdown wrappers Gemini may add despite instructions
        text = text.replace(/```json/g, '').replace(/```/g, '').trim()

        // Parse Gemini response — wrapped separately so a truncated or malformed
        // response gives a specific error the client can display helpfully.
        let evalResults: QuestionEvalResult[]
        try {
            evalResults = JSON.parse(text)
        } catch {
            console.error('Subjective Evaluation: JSON parse failed. Raw text snippet:', text.slice(0, 300))
            throw new Error(
                'JSON parse failed: Gemini returned an incomplete response. ' +
                'This usually happens when the answer image is very large. ' +
                'Please upload a clearer, well-lit photo and try again.'
            )
        }

        if (!Array.isArray(evalResults)) {
            throw new Error('Gemini returned invalid evaluation format')
        }

        // Clamp marks to [0, max] and round to nearest 0.5 (valid CBSE half-mark steps)
        // e.g. 2.33 → 2.5, 3.67 → 3.5, 4.9 → 5.0 — prevents non-standard decimals
        evalResults.forEach(r => {
            const clamped = Math.max(0, Math.min(r.marks_awarded, r.max_marks))
            r.marks_awarded = Math.round(clamped * 2) / 2
        })

        const totalMarks = evalResults.reduce((sum, r) => sum + r.marks_awarded, 0)
        const maxMarks = questions.reduce((sum, q) => sum + q.max_marks, 0)

        return { success: true, data: evalResults, totalMarks, maxMarks }

    } catch (error: any) {
        console.error('Subjective Evaluation Error:', error)
        return { success: false, error: error.message }
    }
}
/**
 * Quick Practice mode — reads questions AND answers from the image.
 * No teacher test needed. Gemini detects class, subject, chapter, and
 * each Q&A pair from the student's self-written answer sheet.
 *
 * Expected sheet format (teacher instructs students verbally):
 *   CLASS 9     SCIENCE     Gravitation
 *   Q1. Define gravitational force.       (3 marks)
 *   Ans: ...
 *   Q2. Calculate F if ...                (5 marks)
 *   Ans: ...
 */
export async function evaluateQuickPracticeSheet(
    imageBase64: string,
    imageMimeType: 'image/jpeg' | 'image/png' | 'image/webp',
    feedbackLanguage: 'english' | 'hinglish' = 'english'
): Promise<{ success: boolean; data?: QuickPracticeEvalResult; error?: string }> {
    try {
        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            throw new Error('Gemini API Key not configured')
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const languageInstructions = feedbackLanguage === 'hinglish'
            ? `Write ALL feedback fields in Hinglish (natural mix of conversational Hindi in Roman script + English). Keep scientific terms, formulas, and CBSE keywords in English. Do NOT use Devanagari script.`
            : `Write all feedback in clear, simple English that a secondary school student can understand.`

        const prompt = `You are an experienced CBSE examiner evaluating a student's handwritten answer sheet.

The image contains a self-written practice sheet where the student has written:
- Their class, subject, and chapter name at the top
- Each question numbered as Q1, Q2, etc. with marks in brackets like (3 marks) or [5 marks]
- Their answer below each question (starting with "Ans:", "Answer:", or just written below the question)

**Your task:**
1. Read the class, subject, and chapter from the top of the sheet
2. Identify each question and the maximum marks allocated to it
3. Read the student's answer for each question
4. Evaluate each answer as a CBSE examiner would for that class and subject

**Evaluation Rules:**
- Award PARTIAL marks — a student who writes most of the correct points should not get zero
- For numerical questions: check Given section, formula, substitution steps, answer, and units
- For theory questions: award marks per valid point or fact mentioned
- For diagram questions: check if diagram is drawn and labeled correctly
- NEVER deduct marks for: capitalization errors, letter form (e.g. cursive S vs small s, capital C vs small c), handwriting style, or spelling of common English words
- DO deduct marks only for: scientifically wrong facts, missing key points, wrong formula, wrong units, incomplete steps
- Be lenient on handwriting quality and minor spelling errors, but strict on scientific accuracy
- If a question's answer is completely absent or unreadable, award 0 marks
- NEVER award more marks than the question's maximum
- If you cannot detect a question number or its marks clearly, make a reasonable best-effort guess


**Feedback Language:** ${languageInstructions}

**Tone:** Supportive and encouraging. Acknowledge what was right before pointing out mistakes. Phrase missing marks as a learning opportunity, not a failure.

**CRITICAL: Return ONLY a valid JSON object. No markdown, no prose outside the JSON. Use this exact schema:**
{
  "detected_class": "<e.g. Class 9 — if not visible, write Unknown>",
  "detected_subject": "<e.g. Science — if not visible, write Unknown>",
  "detected_chapter": "<e.g. Gravitation — if not visible, write Unknown>",
  "presentation_notes": [],
  "questions": [
    {
      "question_number": 1,
      "marks_awarded": <integer or .5 step, 0 to max_marks>,
      "max_marks": <marks written beside the question>,
      "what_was_correct": "<specific points the student got right>",
      "what_was_wrong": "<specific points missing or wrong in terms of SCIENTIFIC content only. Write 'Nothing — full marks!' if perfect.>",
      "suggestion": "<one concrete improvement tip for scientific content>",
      "teacher_summary": "<Q[N]: one line direct to student, saying specifically what was missing or wrong. If full marks, write 'Q[N]: Full marks — well done!'. Examples: 'Q1: Mentioned only wind dispersal, missed birds and water as agents' or 'Q2: Formula correct but forgot to include units in final answer'>",
      "overall_comment": "<ONLY on question 1: 1-2 sentence warm summary of the student's overall performance>"
    }
  ]
}`

        const result = await model.generateContent([
            { inlineData: { mimeType: imageMimeType, data: imageBase64 } },
            prompt,
        ])

        let text = result.response.text()
        text = text.replace(/```json/g, '').replace(/```/g, '').trim()

        let parsed: { detected_class: string; detected_subject: string; detected_chapter: string; questions: QuestionEvalResult[]; presentation_notes?: string[] }
        try {
            parsed = JSON.parse(text)
        } catch {
            console.error('QuickPractice: JSON parse failed. Snippet:', text.slice(0, 300))
            throw new Error(
                'JSON parse failed: Gemini returned an incomplete response. ' +
                'Try uploading a clearer, well-lit photo and submit again.'
            )
        }

        if (!Array.isArray(parsed.questions)) {
            throw new Error('Gemini returned invalid evaluation format')
        }

        // Clamp + round marks to valid CBSE half-mark steps
        parsed.questions.forEach(r => {
            const clamped = Math.max(0, Math.min(r.marks_awarded, r.max_marks))
            r.marks_awarded = Math.round(clamped * 2) / 2
        })

        const totalMarks = parsed.questions.reduce((sum, r) => sum + r.marks_awarded, 0)
        const maxMarks = parsed.questions.reduce((sum, r) => sum + r.max_marks, 0)

        return {
            success: true,
            data: {
                detected_class: parsed.detected_class || 'Unknown',
                detected_subject: parsed.detected_subject || 'Unknown',
                detected_chapter: parsed.detected_chapter || 'Unknown',
                questions: parsed.questions,
                totalMarks,
                maxMarks,
                presentation_notes: Array.isArray(parsed.presentation_notes) ? parsed.presentation_notes : [],
            },
        }
    } catch (error: any) {
        console.error('QuickPractice Evaluation Error:', error)
        return { success: false, error: error.message }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSIGNMENT MODE — STEP 1: Extract questions from teacher's question paper
// Called once when teacher uploads the paper. Result stored in assignments.questions_json
// ─────────────────────────────────────────────────────────────────────────────
export async function extractQuestionsFromPaper(
    paperImages: { base64: string; mimeType: string }[]
): Promise<{ success: boolean; data?: { questions: { q_number: number; question_text: string; marks: number }[]; totalMarks: number }; error?: string }> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.0,  // Pure extraction — zero creativity
                topP: 1,
                topK: 1,
                responseMimeType: 'application/json',
            },
        })

        const prompt = `You are a document parser. Extract ALL questions from this question paper image(s).

RULES:
- Extract EVERY question you can see, including sub-parts (a, b, c) as separate items if they have separate marks.
- For each question, extract: question number, the full question text, and the marks allocated.
- Marks are usually written in brackets like (1), [2], or at the side of the question.
- Do NOT answer the questions. Only extract them.
- Return ONLY valid JSON, no prose.

JSON schema:
{
  "questions": [
    { "q_number": 1, "question_text": "Define matter.", "marks": 1 },
    { "q_number": 2, "question_text": "Give two examples of condensation.", "marks": 2 }
  ]
}`

        const imageParts = paperImages.map(img => ({
            inlineData: { mimeType: img.mimeType, data: img.base64 }
        }))

        const result = await model.generateContent([...imageParts, prompt])
        let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()

        let parsed: { questions: { q_number: number; question_text: string; marks: number }[] }
        try {
            parsed = JSON.parse(text)
        } catch {
            return { success: false, error: 'Could not parse question paper. Try a clearer photo.' }
        }

        if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
            return { success: false, error: 'No questions found in the image. Try a clearer photo.' }
        }

        const totalMarks = parsed.questions.reduce((sum, q) => sum + (q.marks || 0), 0)
        return { success: true, data: { questions: parsed.questions, totalMarks } }

    } catch (error: any) {
        console.error('extractQuestionsFromPaper error:', error)
        return { success: false, error: error.message }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSIGNMENT MODE — STEP 2: Evaluate student answers against extracted questions
// questionsText: formatted from DB's questions_json
// answerImages: student's answer pages, sent individually (no stitching)
// ─────────────────────────────────────────────────────────────────────────────
export async function evaluateAssignmentAnswers(
    questionsText: string,
    answerImages: { base64: string; mimeType: string }[],
    language: 'english' | 'hinglish' = 'hinglish'
): Promise<{ success: boolean; data?: QuickPracticeEvalResult; error?: string }> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.1,
                topP: 0.8,
                topK: 10,
                responseMimeType: 'application/json',
            },
        })

        const prepPrompt = `You are a CBSE examiner grading a student's handwritten answer sheet.
${language === 'hinglish' ? "Provide all feedback in friendly Hinglish (Hindi written in English letters, e.g. 'Aapne yeh sahi kiya...')." : 'Provide all feedback in professional English.'}

== QUESTION PAPER (extracted text — this is the source of truth) ==
${questionsText}
== END OF QUESTION PAPER ==

The following ${answerImages.length} image(s) are the STUDENT'S HANDWRITTEN ANSWER SHEET.

**CRITICAL RULES — READ CAREFULLY:**
1. EVIDENCE-BASED ONLY: Only evaluate a question if you can CLEARLY SEE the student's answer written in the images. Look for question numbers like Q1, 1, Ans 1, (i), etc.
2. NEVER assume an answer exists. If you cannot see it written, SKIP that question entirely.
3. Do NOT fabricate or hallucinate answers the student did not write.
4. Unattempted questions are NOT included in the output at all.
5. Marks: full if correct, partial if partially correct, 0 if clearly wrong.
6. If marks_awarded is 0, set what_was_correct to null (student got nothing right).
7. what_was_wrong: if full marks, write exactly "Nothing — full marks!". Otherwise explain the scientific error.
8. suggestion: one concrete, specific improvement tip.

**Return ONLY valid JSON, no markdown:**
{
  "detected_class": "<e.g. Class 8 — if not visible write Unknown>",
  "detected_subject": "<e.g. Science — if not visible write Unknown>",
  "detected_chapter": "<if visible, otherwise Unknown>",
  "presentation_notes": [],
  "questions": [
    {
      "question_number": 1,
      "marks_awarded": <0 to max_marks in 0.5 steps>,
      "max_marks": <from question paper>,
      "what_was_correct": "<specific points correct, or null if marks_awarded is 0>",
      "what_was_wrong": "<specific errors, or 'Nothing — full marks!' if perfect>",
      "suggestion": "<one specific tip>",
      "teacher_summary": "<Q[N]: one line direct to student about gap, or 'Q[N]: Full marks — well done!' if perfect>",
      "overall_comment": "<ONLY on question_number 1: 1-2 sentence warm summary of overall performance>"
    }
  ]
}`

        const imageParts = answerImages.map(img => ({
            inlineData: { mimeType: img.mimeType, data: img.base64 }
        }))

        const result = await model.generateContent([...imageParts, prepPrompt])
        let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()

        let parsed: { detected_class: string; detected_subject: string; detected_chapter: string; questions: QuestionEvalResult[]; presentation_notes?: string[] }
        try {
            parsed = JSON.parse(text)
        } catch {
            return { success: false, error: 'JSON parse failed: Gemini returned an incomplete response. Try clearer photos.' }
        }

        if (!Array.isArray(parsed.questions)) {
            return { success: false, error: 'Invalid evaluation format' }
        }

        // Sanitise: clamp marks, ensure what_was_correct is null for 0-mark answers
        parsed.questions.forEach(r => {
            const clamped = Math.max(0, Math.min(r.marks_awarded, r.max_marks))
            r.marks_awarded = Math.round(clamped * 2) / 2
            if (r.marks_awarded === 0) r.what_was_correct = null as any
        })

        const totalMarks = parsed.questions.reduce((sum, r) => sum + r.marks_awarded, 0)
        const maxMarks = parsed.questions.reduce((sum, r) => sum + r.max_marks, 0)

        return {
            success: true,
            data: {
                detected_class: parsed.detected_class || 'Unknown',
                detected_subject: parsed.detected_subject || 'Unknown',
                detected_chapter: parsed.detected_chapter || 'Unknown',
                questions: parsed.questions,
                totalMarks,
                maxMarks,
                presentation_notes: Array.isArray(parsed.presentation_notes) ? parsed.presentation_notes : [],
            }
        }
    } catch (error: any) {
        console.error('evaluateAssignmentAnswers error:', error)
        return { success: false, error: error.message }
    }
}
