require('dotenv').config()
const axios = require('axios')

const API_URL = process.env.LOOPLEARN_API_URL   // e.g. https://looplearn.vercel.app
const BOT_SECRET = process.env.WHATSAPP_BOT_SECRET

// Rate-limited send queue — prevents WhatsApp from banning the number
// for bulk messaging. Sends one message every 1.5-3s.
const sendQueue = []
let sending = false

async function processSendQueue(sock) {
    if (sending || !sendQueue.length) return
    sending = true
    while (sendQueue.length) {
        const { jid, text } = sendQueue.shift()
        try {
            await sock.sendMessage(jid, { text })
        } catch (e) {
            console.error('Send error:', e.message)
        }
        // Random delay 1.5-3 seconds
        await sleep(1500 + Math.random() * 1500)
    }
    sending = false
}

function queueMessage(sock, jid, text) {
    sendQueue.push({ jid, text })
    processSendQueue(sock)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Phone number → WhatsApp JID
function toJid(phone) {
    const clean = phone.replace(/\D/g, '')
    return `${clean}@s.whatsapp.net`
}

// ── Incoming message handler ────────────────────────────────

async function handleIncomingMessage(sock, msg) {
    const jid = msg.key.remoteJid
    if (!jid || jid.endsWith('@g.us')) return // Skip group messages

    const phone = jid.replace('@s.whatsapp.net', '')
    const content = msg.message

    // Determine message type
    const imageMsg = content?.imageMessage
    const isText = !!(content?.conversation || content?.extendedTextMessage?.text)

    if (isText) {
        // Extract the actual text body the student typed
        const textBody = content?.conversation
            || content?.extendedTextMessage?.text
            || ''

        if (!textBody.trim()) return // Ignore empty/blank messages

        await callApi('/api/whatsapp/receive', {
            phone,
            messageType: 'text',
            textBody: textBody.trim(), // Pass the actual message content
        }).then(data => {
            if (data?.replyText) queueMessage(sock, jid, data.replyText)
        }).catch(() => {
            queueMessage(sock, jid, 'Kuch problem aayi. Thodi der baad dobara try karo.')
        })
        return
    }

    if (imageMsg) {
        // Send acknowledgement immediately (before Gemini eval which takes 20-40s)
        queueMessage(sock, jid, 'Photo submit ho rahi hai, please 2 minute wait kariye response ke liye.')

        // Download image
        let imageBuffer
        try {
            const { downloadMediaMessage } = require('@whiskeysockets/baileys')
            imageBuffer = await downloadMediaMessage(msg, 'buffer', {})
        } catch (e) {
            console.error('Image download error:', e.message)
            queueMessage(sock, jid, 'Photo download nahi hua. Dobara bhejo.')
            return
        }

        const imageBase64 = imageBuffer.toString('base64')
        const mimeType = imageMsg.mimetype || 'image/jpeg'

        await callApi('/api/whatsapp/receive', {
            phone,
            imageBase64,
            mimeType,
            messageType: 'image',
        }).then(data => {
            const reply = data?.replyText ?? 'Evaluation failed. Dobara try karo.'
            queueMessage(sock, jid, reply)
        }).catch(e => {
            console.error('API error:', e.message)
            queueMessage(sock, jid, 'Server se connect nahi hua. Thodi der baad try karo.')
        })
        return
    }

    // Unsupported message type (video, audio, document)
    queueMessage(sock, jid, 'Sirf photo bhejo. Video, audio ya documents accept nahi hote.')
}

// ── Call LoopLearnX API ────────────────────────────────────

async function callApi(path, body) {
    const res = await axios.post(`${API_URL}${path}`, body, {
        headers: {
            'Content-Type': 'application/json',
            'x-bot-secret': BOT_SECRET,
        },
        timeout: 90000, // 90s — Gemini can take 30-40s
    })
    return res.data
}

// ── Send messages from scheduler ───────────────────────────

async function sendBulkMessages(sock, messages) {
    for (const { phone, message } of messages) {
        queueMessage(sock, toJid(phone), message)
    }
}

module.exports = { handleIncomingMessage, sendBulkMessages, callApi }
