/**
 * Test script: Send SCIENCE TEST IMAGE.jpg to Gemini, output result to JSON
 * Run: node scripts/test-subjective-eval-json.js
 */

const fs = require('fs')
const path = require('path')
const { GoogleGenerativeAI } = require('@google/generative-ai')

require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const apiKey = process.env.GOOGLE_GEMINI_API_KEY
if (!apiKey) {
    process.stdout.write('ERROR: GOOGLE_GEMINI_API_KEY not found\n')
    process.exit(1)
}

const genAI = new GoogleGenerativeAI(apiKey)

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

function getTypeInstructions(type) {
    switch (type) {
        case 'numerical': return 'Award marks stepwise: 1 for Given section, 1 for formula, marks for substitution steps, 1 for correct answer, 1 for correct unit.'
        case 'theorem': return 'Award marks stepwise: 1 for theorem statement, marks for each derivation step, 1 for conclusion. Do NOT require Given/To Find.'
        case 'diagram': return 'Check: diagram present and recognizable, parts labeled correctly, arrows/orientation correct.'
        case 'short_answer': return 'Check for key scientific terms, accurate facts, all required points. Award marks per valid point. Do NOT require Given/To Find.'
        case 'long_answer': return 'Check for all major points, scientific accuracy, examples if needed, logical flow. Award marks per sub-point. Do NOT require Given/To Find.'
        default: return 'Award marks for completeness, scientific accuracy, and clarity.'
    }
}

const questionList = questions.map(q => {
    const typeLabel = { short_answer: 'Short Answer (Theory)', long_answer: 'Long Answer (Theory)', numerical: 'Numerical', theorem: 'Theorem/Proof', diagram: 'Diagram' }[q.question_type] || 'Question'
    const typeInstructions = getTypeInstructions(q.question_type)
    const rubric = q.marking_rubric ? `Teacher rubric: ${q.marking_rubric}` : `Default: ${typeInstructions}`
    return `Q${q.question_number} [${q.max_marks} marks] -- ${typeLabel}:\n"${q.question_text}"\n${rubric}\nGrading: ${typeInstructions}`
}).join('\n\n')

const prompt = `You are an experienced CBSE Class 9 science examiner evaluating handwritten answers.

The uploaded image contains the student's handwritten answers. Read carefully even if handwriting is not neat.

Core Evaluation Rules:
- Award PARTIAL marks for partially correct answers
- NEVER require Given/To Find/To Prove format for theory questions (short_answer or long_answer)
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
    "what_was_correct": "<specific points the student got right>",
    "what_was_wrong": "<specific points missing or wrong, or 'Nothing - full marks!' if perfect>",
    "suggestion": "<one concrete improvement tip>"
  }
]`

async function main() {
    const imagePath = path.join(__dirname, '../public/SCIENCE TEST IMAGE.jpg')
    const imageBuffer = fs.readFileSync(imagePath)
    const imageBase64 = imageBuffer.toString('base64')

    process.stdout.write(`Image loaded: ${(imageBuffer.length / 1024).toFixed(1)} KB\n`)
    process.stdout.write('Calling Gemini...\n')

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent([
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        prompt,
    ])

    let text = result.response.text()
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()

    // Write raw response to file
    const outputPath = path.join(__dirname, 'gemini-eval-result.json')
    fs.writeFileSync(outputPath, text, 'utf8')
    process.stdout.write(`RAW RESPONSE SAVED TO: scripts/gemini-eval-result.json\n`)

    // Parse and also write a readable summary
    try {
        const evalResults = JSON.parse(text)
        const totalAwarded = evalResults.reduce((s, r) => s + r.marks_awarded, 0)
        const totalMax = questions.reduce((s, q) => s + q.max_marks, 0)

        let summary = `TOTAL: ${totalAwarded} / ${totalMax}\n\n`
        for (const r of evalResults) {
            const q = questions.find(q => q.question_number === r.question_number)
            summary += `Q${r.question_number}: ${q?.question_text}\n`
            summary += `  Marks: ${r.marks_awarded} / ${r.max_marks}\n`
            summary += `  Correct: ${r.what_was_correct}\n`
            summary += `  Missing: ${r.what_was_wrong}\n`
            summary += `  Tip: ${r.suggestion}\n\n`
        }
        const summaryPath = path.join(__dirname, 'gemini-eval-summary.txt')
        fs.writeFileSync(summaryPath, summary, 'utf8')
        process.stdout.write(`SUMMARY SAVED TO: scripts/gemini-eval-summary.txt\n`)
        process.stdout.write(`SCORE: ${totalAwarded}/${totalMax}\n`)
    } catch (e) {
        process.stdout.write(`Parse error: ${e.message}\n`)
    }
}

main().catch(e => { process.stdout.write(`Error: ${e.message}\n`); process.exit(1) })
