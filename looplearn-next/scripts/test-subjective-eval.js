/**
 * Test script: Send SCIENCE TEST IMAGE.jpg directly to Gemini
 * Run: node scripts/test-subjective-eval.js
 */

const fs = require('fs')
const path = require('path')
const { GoogleGenerativeAI } = require('@google/generative-ai')

require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const apiKey = process.env.GOOGLE_GEMINI_API_KEY
if (!apiKey) {
    console.error('❌ GOOGLE_GEMINI_API_KEY not found in .env.local')
    process.exit(1)
}

const genAI = new GoogleGenerativeAI(apiKey)

// ── Questions to evaluate ────────────────────────────────────
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
        marking_rubric: 'Award 1 mark each for: sieve tubes, companion cells, phloem fibres — and function of transporting organic solutes',
    },
]

const subject = 'science'
const classStandard = 9

// ── Build prompt (mirrors evaluateSubjectiveAnswers in ai.ts) ─
function getTypeInstructions(type) {
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
    const typeLabel = {
        short_answer: 'Short Answer (Theory)',
        long_answer: 'Long Answer (Theory)',
        numerical: 'Numerical/Calculation',
        theorem: 'Proof/Theorem',
        diagram: 'Diagram-Based',
    }[q.question_type] || 'Question'

    const typeInstructions = getTypeInstructions(q.question_type)
    const rubric = q.marking_rubric
        ? `Teacher's rubric: ${q.marking_rubric}`
        : `Default rubric: ${typeInstructions}`

    return `Q${q.question_number} [${q.max_marks} marks] — ${typeLabel}:\n"${q.question_text}"\n${rubric}\nGrading approach: ${typeInstructions}`
}).join('\n\n')

const prompt = `You are an experienced CBSE Class ${classStandard} ${subject} examiner evaluating a student's handwritten exam answers.

The uploaded image contains the student's handwritten answers. The answers may span the entire image. Read all the handwriting carefully, even if it is not perfectly neat.

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
    "what_was_wrong": "<specific: which points/facts/steps were missing, wrong, or incomplete. Write 'Nothing — full marks!' if perfect.>",
    "suggestion": "<one concrete improvement tip for this question type>"
  }
]`

// ── Load image ───────────────────────────────────────────────
const imagePath = path.join(__dirname, '../public/SCIENCE TEST IMAGE.jpg')
console.log('📂 Loading image from:', imagePath)

const imageBuffer = fs.readFileSync(imagePath)
const imageBase64 = imageBuffer.toString('base64')
console.log(`📷 Image size: ${(imageBuffer.length / 1024).toFixed(1)} KB`)

// ── Call Gemini ──────────────────────────────────────────────
async function main() {
    console.log('\n🤖 Sending to Gemini 2.5 Flash for evaluation...\n')

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent([
        {
            inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64,
            },
        },
        prompt,
    ])

    let text = result.response.text()
    console.log('─── RAW GEMINI RESPONSE ───────────────────────────────')
    console.log(text)
    console.log('───────────────────────────────────────────────────────\n')

    // Parse and display cleanly
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()

    try {
        const evalResults = JSON.parse(text)
        const totalAwarded = evalResults.reduce((s, r) => s + r.marks_awarded, 0)
        const totalMax = questions.reduce((s, q) => s + q.max_marks, 0)

        console.log(`\n🎯 TOTAL SCORE: ${totalAwarded} / ${totalMax}\n`)
        console.log('═══════════════════════════════════════════════════════')

        for (const r of evalResults) {
            const q = questions.find(q => q.question_number === r.question_number)
            console.log(`\nQ${r.question_number}: ${q?.question_text}`)
            console.log(`   Marks: ${r.marks_awarded} / ${r.max_marks}`)
            console.log(`   ✅ Correct : ${r.what_was_correct}`)
            console.log(`   ❌ Missing : ${r.what_was_wrong}`)
            console.log(`   💡 Tip     : ${r.suggestion}`)
        }
        console.log('\n═══════════════════════════════════════════════════════')
    } catch (e) {
        console.error('❌ JSON parse failed. Raw response was shown above.')
    }
}

main().catch(err => {
    console.error('❌ Error:', err.message)
    process.exit(1)
})
