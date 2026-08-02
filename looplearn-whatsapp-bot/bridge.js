const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const axios = require('axios')

const API_URL = process.env.LOOPLEARN_API_URL   // e.g. https://looplearn.vercel.app
const BOT_SECRET = process.env.WHATSAPP_BOT_SECRET

const { sendErrorAlert } = require('./email')

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
            // Race the send operation with a 10s timeout to prevent socket send deadlock
            await Promise.race([
                sock.sendMessage(jid, { text }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('WhatsApp send timed out')), 10000))
            ])
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

// Debounce buffer for grouping multiple images sent at once
const imageBatchBuffer = new Map()

async function handleIncomingMessage(sock, msg) {
    const jid = msg.key.remoteJid
    if (!jid || jid.endsWith('@g.us') || jid.endsWith('@broadcast') || jid === 'status@broadcast') return // Skip group messages & broadcast/status updates

    // Synchronously resolve remoteJidAlt if present (converts @lid to real phone JID)
    const resolvedJid = msg.key.remoteJidAlt || jid
    const cleanDigits = resolvedJid.replace(/@.*$/, '').replace(/\D/g, '')
    if (!cleanDigits) return // Skip non-numeric JIDs (e.g. status updates)

    const phone = cleanDigits
    const content = msg.message

    // LOG: See exactly what number format WhatsApp sends (critical for student identification)
    console.log(`[IncomingMsg] Raw JID: ${jid} | Extracted phone: ${phone} | Type: ${Object.keys(content || {}).join(',')}`)

    // Determine message type
    const imageMsg = content?.imageMessage
    const isText = !!(content?.conversation || content?.extendedTextMessage?.text)

    // Silently ignore reactions and stickers — no reply sent, no error message
    const isReaction = !!(content?.reactionMessage)
    const isSticker = !!(content?.stickerMessage)
    if (isReaction || isSticker) {
        console.log(`[Bridge] Silently ignoring ${isReaction ? 'reaction' : 'sticker'} from ${phone}`)
        return
    }

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
        }).catch(async (e) => {
            queueMessage(sock, jid, '⚠️ System error: Please inform your Teacher about this issue.')
            await sendErrorAlert('Text Processing Failed', `Failed to send text message to API for ${phone}. Error: ${e.message}`)
        })
        return
    }

    if (imageMsg) {
        // Retrieve or initialize batch buffer for this user
        let userBatch = imageBatchBuffer.get(jid)
        if (!userBatch) {
            userBatch = {
                images: [],
                timeoutId: null
            }
            imageBatchBuffer.set(jid, userBatch)
            // Send acknowledgement only once at the beginning of the batch
            queueMessage(sock, jid, 'Photo(s) receive ho rahi hain, please wait for validation & response...')
        }

        // Download image buffer with a strict 30s timeout to prevent silent hangs (Zombie Baileys streams)
        let imageBuffer
        try {
            const { downloadMediaMessage } = require('@whiskeysockets/baileys')
            imageBuffer = await Promise.race([
                downloadMediaMessage(msg, 'buffer', {}),
                new Promise((_, reject) => setTimeout(() => reject(new Error('DOWNLOAD_TIMEOUT')), 30000))
            ])
        } catch (e) {
            console.error('Image download error:', e.message)
            if (e.message === 'DOWNLOAD_TIMEOUT') {
                queueMessage(sock, jid, '⚠️ Photo download nahi ho paayi (Network timeout). Please apni photo wapas bhejiye.')
            } else {
                queueMessage(sock, jid, '⚠️ Photo download fail ho gaya. Please review connection.')
            }
            // Clear the buffer state if the download fails so it doesn't leave a ghost batch
            imageBatchBuffer.delete(jid)
            return
        }

        // Add to batch list
        userBatch.images.push({
            base64: imageBuffer.toString('base64'),
            mimeType: imageMsg.mimetype || 'image/jpeg'
        })

        // Debounce: reset timer so we wait for the last image in the batch to arrive (2.5s delay)
        if (userBatch.timeoutId) {
            clearTimeout(userBatch.timeoutId)
        }

        userBatch.timeoutId = setTimeout(async () => {
            const batchToSend = [...userBatch.images]
            imageBatchBuffer.delete(jid) // clear buffer for next upload

            console.log(`[Bridge] Debounce trigger: Sending batch of ${batchToSend.length} images for ${phone}...`)

            await callApi('/api/whatsapp/receive', {
                phone,
                messageType: 'image',
                images: batchToSend,
            }).then(data => {
                const reply = data?.replyText ?? '⚠️ System error: Evaluation failed. Please inform your Teacher about this issue.'
                queueMessage(sock, jid, reply)
            }).catch(async (e) => {
                console.error('API error:', e.message)
                queueMessage(sock, jid, '⚠️ System error: Server se connect nahi hua. Please inform your Teacher about this issue.')
                await sendErrorAlert('API Connection Failed', `Failed to send batch of ${batchToSend.length} images to Next.js API for ${phone}. Error: ${e.message}`)
            })
        }, 2500)

        return
    }

    // Unsupported message type (video, audio, document)
    queueMessage(sock, jid, 'Sirf photo bhejo. Video, audio ya documents accept nahi hote.')
}

// ── Call LoopLearnX API (with retry) ───────────────────────────────────────
// Retries up to 2 times on transient errors (network failures, 5xx responses).
// Does NOT retry on permanent errors (401 Unauthorized, 400 Bad Request, 403 Forbidden).
async function callApi(endpoint, body, retries = 2) {
    let lastError
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await axios.post(`${API_URL}${endpoint}`, body, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-bot-secret': BOT_SECRET,
                },
                timeout: 90000, // 90s — Gemini can take 30-40s
            })
            return res.data
        } catch (e) {
            lastError = e
            const status = e.response?.status
            // Never retry auth, bad-request, or payload-too-large errors— they won't succeed on retry
            if (status === 400 || status === 401 || status === 403 || status === 413) {
                console.error(`[API] Permanent error (${status}) for ${endpoint} — not retrying.`)
                throw e
            }
            if (attempt < retries) {
                console.warn(`[API] Attempt ${attempt + 1}/${retries + 1} failed (${e.message}). Retrying in 5s...`)
                await new Promise(r => setTimeout(r, 5000))
            }
        }
    }
    throw lastError
}

// ── Send messages from scheduler ───────────────────────────

async function sendBulkMessages(sock, messages) {
    for (const { phone, message } of messages) {
        queueMessage(sock, toJid(phone), message)
    }
}

module.exports = { handleIncomingMessage, sendBulkMessages, callApi }
