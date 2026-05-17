require('dotenv').config()
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const pino = require('pino')
const qrcodeTerminal = require('qrcode-terminal')
const qrcode = require('qrcode')
const express = require('express')
const fs = require('fs')
const path = require('path')
const { handleIncomingMessage } = require('./bridge')
const { startScheduler } = require('./scheduler')

const logger = pino({ level: 'silent' }) // Quiet Baileys internal logs
const PORT = process.env.PORT || 3000

// Express setup for status and QR monitoring
const app = express()
let sock = null
let botStatus = 'starting' // starting, qr_needed, connected, disconnected, logged_out
let currentQr = null
let currentQrImage = null // Data URL for the QR code image
let schedulerStarted = false

app.get('/', (req, res) => {
    let statusColor = 'text-yellow-500'
    let statusText = 'Starting...'
    let actionHtml = ''

    if (botStatus === 'qr_needed') {
        statusColor = 'text-amber-500 font-bold'
        statusText = '⚠️ Action Needed: Scan QR Code'
        actionHtml = `
            <div class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-sm mx-auto">
                <p class="text-sm text-amber-800">Scan this QR code from WhatsApp Business on your phone to link the bot.</p>
                <a href="/qr" class="inline-block mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-all">View QR Code 📷</a>
            </div>
        `
    } else if (botStatus === 'connected') {
        statusColor = 'text-green-600 font-bold'
        statusText = '✅ Connected & Running'
        actionHtml = `
            <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl max-w-sm mx-auto">
                <p class="text-sm text-green-800">Bot is actively monitoring homework submissions 24/7.</p>
            </div>
        `
    } else if (botStatus === 'disconnected') {
        statusColor = 'text-red-500'
        statusText = '❌ Temporarily Disconnected'
        actionHtml = `<p class="text-xs text-gray-500 mt-2">Attempting to auto-reconnect...</p>`
    } else if (botStatus === 'logged_out') {
        statusColor = 'text-red-700 font-bold font-fredoka'
        statusText = '🚨 Logged Out / Session Terminated'
        actionHtml = `<p class="text-sm text-gray-600 mt-2">Deleting session files and generating new credentials. Please refresh in a moment.</p>`
    }

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>LoopLearn Bot Status</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Inter', sans-serif; }
                .font-fredoka { font-family: 'Fredoka', sans-serif; }
            </style>
            ${botStatus === 'qr_needed' || botStatus === 'starting' || botStatus === 'logged_out' ? '<meta http-equiv="refresh" content="10">' : ''}
        </head>
        <body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
            <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-gray-100 text-center">
                <h1 class="text-2xl font-bold font-fredoka text-indigo-600">LoopLearn WhatsApp Bot</h1>
                <p class="text-gray-400 text-xs mt-1">VPS Bridge Infrastructure</p>
                
                <div class="my-8 py-6 border-y border-gray-50">
                    <p class="text-xs text-gray-400 uppercase tracking-wider font-semibold">Current Status</p>
                    <p class="text-lg mt-1 ${statusColor}">${statusText}</p>
                    ${actionHtml}
                </div>
                
                <div class="text-[10px] text-gray-300">
                    Host: Mumbai-1 VPS · System Time: ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                </div>
            </div>
        </body>
        </html>
    `)
})

app.get('/qr', (req, res) => {
    if (botStatus !== 'qr_needed' || !currentQrImage) {
        return res.redirect('/')
    }

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Scan WhatsApp QR Code</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="refresh" content="15">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Inter', sans-serif; }
                .font-fredoka { font-family: 'Fredoka', sans-serif; }
            </style>
        </head>
        <body class="bg-indigo-900 min-h-screen flex items-center justify-center p-4 text-white">
            <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-gray-800 text-center">
                <a href="/" class="text-xs text-indigo-500 hover:text-indigo-700 font-semibold mb-4 block text-left">← Back to Status</a>
                <h1 class="text-xl font-bold font-fredoka text-indigo-600">Scan QR Code</h1>
                <p class="text-xs text-gray-400 mt-1 mb-6">Open WhatsApp Business → Linked Devices → Link a Device</p>
                
                <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex justify-center inline-block mx-auto mb-6">
                    <img src="${currentQrImage}" alt="WhatsApp QR Code" class="w-64 h-64" />
                </div>
                
                <p class="text-[11px] text-gray-400 animate-pulse">This page will automatically refresh every 15s when a new QR code is generated.</p>
            </div>
        </body>
        </html>
    `)
})

app.get('/status', (req, res) => {
    res.json({
        status: botStatus,
        hasQr: !!currentQrImage,
        timestamp: new Date().toISOString()
    })
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Status Web Server running on http://0.0.0.0:${PORT}`)
})

// ── WhatsApp Baileys Connection Logic ───────────────────────────────

async function connectToWhatsApp() {
    botStatus = 'starting'
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
    const { version } = await fetchLatestBaileysVersion()

    sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: state,
        browser: ['LoopLearn Bot', 'Chrome', '120.0'],
        getMessage: async () => ({ conversation: '' }),
    })

    // QR code events
    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            botStatus = 'qr_needed'
            currentQr = qr
            try {
                currentQrImage = await qrcode.toDataURL(qr)
                console.log('\n📱 New WhatsApp QR generated. Visit the web status page to scan it.')
                qrcodeTerminal.generate(qr, { small: true })
            } catch (err) {
                console.error('Error generating QR image DataURL:', err)
            }
        }

        if (connection === 'close') {
            currentQr = null
            currentQrImage = null
            
            const error = lastDisconnect?.error instanceof Boom ? lastDisconnect.error : null
            const statusCode = error?.output?.statusCode
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut

            console.log(`Connection closed. Status code: ${statusCode}. Reconnecting: ${shouldReconnect}`)

            if (shouldReconnect) {
                botStatus = 'disconnected'
                setTimeout(connectToWhatsApp, 5000)
            } else {
                botStatus = 'logged_out'
                console.error('🚨 Session completely logged out from WhatsApp. Purging credentials...')
                
                // Purely delete auth_info to reset state completely
                try {
                    fs.rmSync(path.join(__dirname, 'auth_info'), { recursive: true, force: true })
                    console.log('Successfully cleared auth_info session credentials folder.')
                } catch (e) {
                    console.error('Failed to clear credentials folder:', e.message)
                }

                // Wait 3 seconds and restart to present fresh QR code
                setTimeout(connectToWhatsApp, 3000)
            }
        }

        if (connection === 'open') {
            botStatus = 'connected'
            currentQr = null
            currentQrImage = null
            console.log('✅ LoopLearn WhatsApp bot connected successfully!')
            
            // Start cron scheduler once connected (only start once)
            if (!schedulerStarted) {
                startScheduler(sock)
                schedulerStarted = true
            }
        }
    })

    sock.ev.on('creds.update', saveCreds)

    // Handle incoming messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return
        for (const msg of messages) {
            if (msg.key.fromMe) continue // Skip own messages
            await handleIncomingMessage(sock, msg)
        }
    })
}

connectToWhatsApp().catch(err => {
    console.error('Fatal Baileys crash:', err)
    process.exit(1)
})
