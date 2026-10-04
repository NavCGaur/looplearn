import { GoogleGenerativeAI } from '@google/generative-ai'

const rawGenAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')
const genAI = {
    getGenerativeModel(options: any) {
        const rawModel = rawGenAI.getGenerativeModel(options)
        return new Proxy(rawModel, {
            get(target, prop, receiver) {
                if (prop === 'generateContent') {
                    return async function(contents: any[]) {
                        let delay = 2000
                        const maxRetries = 4
                        for (let attempt = 1; attempt <= maxRetries; attempt++) {
                            try {
                                return await target.generateContent(contents)
                            } catch (error: any) {
                                const isTransient = 
                                    error.status === 503 || 
                                    error.status === 429 || 
                                    (error.message && (error.message.includes('503') || error.message.includes('429') || error.message.includes('Service Unavailable') || error.message.includes('quota') || error.message.includes('high demand') || error.message.includes('fetch failed')))

                                if (isTransient && attempt < maxRetries) {
                                    console.warn(`[Gemini Retry] Attempt ${attempt} failed with transient error: ${error.message || error}. Retrying in ${delay}ms...`)
                                    await new Promise(resolve => setTimeout(resolve, delay))
                                    delay *= 2
                                } else {
                                    throw error
                                }
                            }
                        }
                    }
                }
                return Reflect.get(target, prop, receiver)
            }
        })
    }
}

export interface EnglishFoundationEvalResult {
    success: boolean
    marks_obtained: number
    max_marks: number
    ai_feedback: string // Formatted message for the student
    grammar_weaknesses: string[]
    vocabulary_weaknesses: string[]
    raw_ai_response?: any
}

export async function evaluateEnglishFoundation(
    imageBase64: string | string[],
    imageMimeType: 'image/jpeg' | 'image/png' | 'image/webp',
    grammarPattern: string,
    targetVocabulary: string[],
    classStandard: number,
    feedbackLanguage: 'english' | 'hinglish' = 'hinglish'
): Promise<EnglishFoundationEvalResult> {
    try {
        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            throw new Error('Gemini API Key not configured')
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

        // Formulate prompt
        const prompt = `You are a supportive, caring English teacher in India helper. You are evaluating a student's handwritten English homework.
The student is in Class ${classStandard} and has a weak foundation in English.

This week's focus:
- **Grammar Pattern to check**: "${grammarPattern}"
- **Target Vocabulary to check**: ${JSON.stringify(targetVocabulary)}

Evaluate the homework image. Read all handwriting carefully.

**Evaluation Guidelines:**
1. **Focus feedback ONLY on the week's grammar pattern and target vocabulary.**
2. Ignore minor capitalization, punctuation, or spelling mistakes of non-target words unless it makes the sentence completely incomprehensible.
3. Be a supportive coach. Address the student directly (e.g. use "Aap", "Aapne", "Aapka" in Hinglish or "You", "Your" in English).
4. Provide structured feedback containing:
   - Positive observation (what they did right, e.g. how many target words they used correctly).
   - One key correction (clearly show what they wrote and how to write it correctly).
   - One practice example.
5. NEVER use technical terms like "invalid", "unreadable", "OCR", "validation", "AI". Use simple, student-friendly terms.
6. Language: ${feedbackLanguage === 'hinglish' ? 'Hinglish (mix of conversational Hindi in Roman script + English words)' : 'Simple English'}.

**CRITICAL: Return ONLY a valid JSON object. Do not include markdown wraps or prose. Use this exact schema:**
{
  "marks_obtained": <integer between 0 and 10, indicating performance relative to correct grammar pattern and vocabulary use>,
  "max_marks": 10,
  "ai_feedback": "<supportive, direct feedback message formatted with lines and bullet points as shown below>",
  "grammar_weaknesses": ["<short lowercase error descriptions, e.g., 'omits am', 'confuses has/have'>"],
  "vocabulary_weaknesses": ["<short lowercase spelling/misuse descriptions, e.g., 'misspelled happy', 'misused tired'>"]
}

Example of desired ai_feedback tone and format (Hinglish):
"✅ Bahut badhiya! Aapne 4 sentences bilkul sahi likhe hain aur words ka achha use kiya hai.

⚠️ Ek choti si mistake:
Aapne likha: 'I happy'
Iska sahi form hai: 'I am happy'
Hamesha apne baare mein batate waqt 'I am' ka use karein.

✍️ Ab practice karein:
- I am happy.
- I am tired."

Example of desired ai_feedback tone and format (English):
"✅ Great job! You wrote 4 sentences correctly and used the vocabulary words well.

⚠️ A small correction:
You wrote: 'I happy'
It should be: 'I am happy'
Always use 'I am' when talking about yourself.

✍️ Let's practice:
- I am happy.
- I am tired."`

        const imageParts = Array.isArray(imageBase64)
            ? imageBase64.map(b => ({ inlineData: { mimeType: imageMimeType, data: b } }))
            : [{ inlineData: { mimeType: imageMimeType, data: imageBase64 } }]

        const result = await model.generateContent([
            ...imageParts,
            prompt
        ])

        let text = result.response.text()
        text = text.replace(/```json/g, '').replace(/```/g, '').trim()

        let parsed: any
        try {
            parsed = JSON.parse(text)
        } catch {
            console.error('AI English Foundation Eval: JSON parse failed. Raw text:', text)
            throw new Error('Failed to parse AI evaluation response.')
        }

        return {
            success: true,
            marks_obtained: typeof parsed.marks_obtained === 'number' ? parsed.marks_obtained : 7,
            max_marks: 10,
            ai_feedback: parsed.ai_feedback || '',
            grammar_weaknesses: Array.isArray(parsed.grammar_weaknesses) ? parsed.grammar_weaknesses : [],
            vocabulary_weaknesses: Array.isArray(parsed.vocabulary_weaknesses) ? parsed.vocabulary_weaknesses : [],
            raw_ai_response: parsed
        }
    } catch (error: any) {
        console.error('English Foundation Evaluation Error:', error)
        return {
            success: false,
            marks_obtained: 0,
            max_marks: 10,
            ai_feedback: 'Sorry, verification process could not be completed successfully. Please try submitting again.',
            grammar_weaknesses: [],
            vocabulary_weaknesses: []
        }
    }
}
