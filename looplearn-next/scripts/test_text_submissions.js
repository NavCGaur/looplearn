/**
 * Test script for the new text-based WhatsApp submission handler.
 * Run from the looplearn-next directory:
 *   node scripts/test_text_submissions.js
 *
 * This simulates what the WhatsApp bot sends to the Next.js API.
 */

const fs = require('fs')
const path = require('path')

// ── Parse .env.local ──────────────────────────────────────────
const envPath = path.join(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...rest] = trimmed.split('=')
    if (key) env[key.trim()] = rest.join('=').trim()
}

const API_URL = 'http://localhost:3000'   // Run `npm run dev` first
const BOT_SECRET = env['WHATSAPP_BOT_SECRET']
const STUDENT_PHONE = '919920899845'      // NAVEEN's registered number

async function callApi(body) {
    const res = await fetch(`${API_URL}/api/whatsapp/receive`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-bot-secret': BOT_SECRET,
        },
        body: JSON.stringify(body),
    })
    return res.json()
}

async function runTests() {
    const tests = [
        { name: '1. Help command',          textBody: 'help' },
        { name: '2. Hello greeting',         textBody: 'hello' },
        { name: '3. Status command',         textBody: 'status' },
        { name: '4. Homework command',       textBody: 'homework' },
        { name: '5. Maths doubt',            textBody: 'HCF aur LCM mein kya difference hota hai?' },
        { name: '6. Science doubt',          textBody: 'Photosynthesis simple steps mein samjhao' },
        { name: '7. English doubt',          textBody: 'Active aur passive voice mein kya difference hai?' },
        { name: '8. Typed maths answers',    textBody: 'Q1: HCF of 45 and 105 is 15, Q2: LCM is 315' },
        { name: '9. Typed science answers',  textBody: 'Q1: Mitochondria is the powerhouse of the cell. It produces ATP energy.' },
        { name: '10. Unregistered phone',    textBody: 'hello', phone: '919999999999' },
    ]

    console.log('=== LoopLearn Text Submission Tests ===\n')

    for (const test of tests) {
        const phone = test.phone ?? STUDENT_PHONE
        console.log(`--- ${test.name} ---`)
        console.log(`Phone: ${phone}`)
        console.log(`Message: "${test.textBody}"`)

        try {
            const result = await callApi({
                phone,
                messageType: 'text',
                textBody: test.textBody,
            })
            console.log(`Reply: ${result.replyText}`)
        } catch (e) {
            console.log(`ERROR: ${e.message}`)
        }
        console.log()

        // Small delay between calls
        await new Promise(r => setTimeout(r, 1500))
    }

    console.log('=== Tests complete ===')
}

runTests().catch(console.error)
