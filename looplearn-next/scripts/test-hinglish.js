/**
 * Test: Hinglish + supportive tone evaluation of SCIENCE TEST IMAGE.jpg
 * Run: node scripts/test-hinglish.js
 */

const fs = require('fs')
const path = require('path')
const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const apiKey = process.env.GOOGLE_GEMINI_API_KEY
if (!apiKey) { process.stdout.write('ERROR: No API key\n'); process.exit(1) }
const genAI = new GoogleGenerativeAI(apiKey)

const FEEDBACK_LANGUAGE = 'hinglish' // change to 'english' to compare

const questions = [
    {
        question_number: 1,
        question_text: 'Describe Transport system in plants.',
        question_type: 'long_answer',
        max_marks: 5,
        marking_rubric: 'Award 1 mark each for: xylem transports water, phloem transports food, transpiration pull, root pressure, translocation concept',
    },
    {
        question_number: 2,
        question_text: 'Describe Phloem.',
        question_type: 'short_answer',
        max_marks: 3,
        marking_rubric: 'Award 1 mark each for: sieve tubes, companion cells, phloem fibres/parenchyma, and function of transporting organic solutes',
    },
]

const classStandard = 9
const subject = 'science'

function getTypeInstructions(type) {
    const map = {
        numerical: 'Award marks stepwise: 1 for Given section, 1 for formula, marks for substitution steps, 1 for correct answer, 1 for correct unit.',
        theorem: 'Award marks stepwise: 1 for theorem statement, marks for each derivation step, 1 for conclusion. Do NOT require Given/To Find.',
        diagram: 'Check: diagram present and recognizable, parts labeled correctly, arrows/orientation correct.',
        short_answer: 'Check for key scientific terms, accurate facts, all required points. Award marks per valid point. Do NOT require Given/To Find.',
        long_answer: 'Check for all major points, scientific accuracy, examples if needed, logical flow. Award marks per sub-point. Do NOT require Given/To Find.',
    }
    return map[type] || 'Award marks for completeness, scientific accuracy, and clarity.'
}

const questionList = questions.map(q => {
    const typeLabel = { short_answer: 'Short Answer (Theory)', long_answer: 'Long Answer (Theory)', numerical: 'Numerical', theorem: 'Theorem/Proof', diagram: 'Diagram' }[q.question_type] || 'Question'
    const typeInstructions = getTypeInstructions(q.question_type)
    const rubric = q.marking_rubric ? `Teacher rubric: ${q.marking_rubric}` : `Default: ${typeInstructions}`
    return `Q${q.question_number} [${q.max_marks} marks] -- ${typeLabel}:\n"${q.question_text}"\n${rubric}\nGrading: ${typeInstructions}`
}).join('\n\n')

const languageInstructions = FEEDBACK_LANGUAGE === 'hinglish'
    ? `**Feedback Language — Hinglish (IMPORTANT):**
- Write ALL feedback fields (what_was_correct, what_was_wrong, suggestion, overall_comment) in Hinglish
- Hinglish means: natural mix of conversational Hindi (in Roman script) + English
- Keep ALL scientific terms, chapter names, formulas, and CBSE keywords in English (e.g. "xylem", "phloem", "transpiration", "formula", "marks")
- Do NOT use Devanagari script — only Roman letters for Hindi words
- Write like a supportive teacher talking to a student, not like a translation
- Example tone: "Aapne xylem ka role sahi likha, aur phloem mention bhi kiya — good effort! Lekin transpiration pull ka mechanism nahi likha tha, woh important point tha."`
    : `**Feedback Language — English:**
- Write all feedback in clear, simple English that a Class ${classStandard} student can understand`

const toneInstructions = `**Tone — Supportive and Encouraging:**
- Acknowledge what the student got right before pointing out mistakes
- Be honest about missing marks but phrase it constructively
- Avoid harsh language — treat missing marks as a learning opportunity
- Do NOT over-praise with empty phrases like "Excellent!", "Brilliant!" for average work
- A 60% score = warm encouragement; a 30% score = gentle, constructive correction
- The overall_comment should feel like a teacher saying "Here's what I noticed about your paper overall"`

const prompt = `You are an experienced CBSE Class ${classStandard} ${subject} examiner evaluating a student's handwritten answers.

The uploaded image contains the student's handwritten answers. Read carefully even if handwriting is not neat.

${languageInstructions}

${toneInstructions}

Core Evaluation Rules:
- Award PARTIAL marks for partially correct answers
- NEVER require Given/To Find/To Prove format for theory questions
- For theory: award marks for each correct point, term, or fact
- For numerical: check Given, formula, substitution, answer, units
- Lenient on spelling, strict on scientific accuracy
- Award 0 if answer is completely absent or unreadable
- NEVER exceed the question's max marks

Questions to Evaluate:
${questionList}

Return ONLY a valid JSON array, no markdown, no text outside JSON:
[
  {
    "question_number": 1,
    "marks_awarded": <integer 0 to max_marks>,
    "max_marks": <max marks>,
    "what_was_correct": "<specific points right>",
    "what_was_wrong": "<specific points missing or wrong>",
    "suggestion": "<one concrete encouraging tip>",
    "overall_comment": "<ONLY on first item: warm 1-2 sentence summary of overall performance>"
  }
]`

async function main() {
    const imagePath = path.join(__dirname, '../public/SCIENCE TEST IMAGE.jpg')
    const imageBuffer = fs.readFileSync(imagePath)
    const imageBase64 = imageBuffer.toString('base64')
    process.stdout.write(`Mode: ${FEEDBACK_LANGUAGE.toUpperCase()}\nImage: ${(imageBuffer.length / 1024).toFixed(1)} KB\nCalling Gemini...\n`)

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent([
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        prompt,
    ])

    let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()
    fs.writeFileSync(path.join(__dirname, 'hinglish-result.json'), text, 'utf8')

    try {
        const j = JSON.parse(text)
        const total = j.reduce((s, r) => s + r.marks_awarded, 0)
        const max = questions.reduce((s, q) => s + q.max_marks, 0)

        const out = [
            `=== ${FEEDBACK_LANGUAGE.toUpperCase()} EVALUATION ===`,
            `SCORE: ${total}/${max}`,
            '',
            j[0].overall_comment ? `OVERALL: ${j[0].overall_comment}` : '',
            '',
        ]
        j.forEach(r => {
            const q = questions.find(q => q.question_number === r.question_number)
            out.push(`--- Q${r.question_number}: ${q?.question_text}`)
            out.push(`Marks: ${r.marks_awarded}/${r.max_marks}`)
            out.push(`Correct: ${r.what_was_correct}`)
            out.push(`Missing: ${r.what_was_wrong}`)
            out.push(`Tip: ${r.suggestion}`)
            out.push('')
        })

        fs.writeFileSync(path.join(__dirname, 'hinglish-summary.txt'), out.join('\n'), 'utf8')
        process.stdout.write(`SCORE: ${total}/${max}\nSaved: scripts/hinglish-result.json + scripts/hinglish-summary.txt\n`)
    } catch (e) {
        process.stdout.write(`Parse error: ${e.message}\nRaw: ${text.slice(0, 300)}\n`)
    }
}

main().catch(e => { process.stdout.write(`Error: ${e.message}\n`); process.exit(1) })
