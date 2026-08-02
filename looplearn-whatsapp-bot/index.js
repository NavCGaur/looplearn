const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const pino = require('pino')
const qrcodeTerminal = require('qrcode-terminal')
const qrcode = require('qrcode')
const express = require('express')
const fs = require('fs')
const axios = require('axios')

const { handleIncomingMessage } = require('./bridge')
const { startScheduler } = require('./scheduler')
const { sendErrorAlert } = require('./email')

const logger = pino({ level: 'silent' }) // Quiet Baileys internal logs
const PORT = process.env.PORT || 3000
const API_URL = process.env.LOOPLEARN_API_URL || 'https://looplearnx.com'

// ── Dashboard Basic Auth ────────────────────────────────────────────────────
const DASHBOARD_USER = process.env.DASHBOARD_USERNAME || 'admin'
const DASHBOARD_PASS = process.env.DASHBOARD_PASSWORD // If unset, auth is DISABLED (dev mode)

function basicAuth(req, res, next) {
    if (!DASHBOARD_PASS) return next() // Skip if not configured (local dev)
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="LoopLearn Command Center"')
        return res.status(401).send('Authentication required.')
    }
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString()
    const colonIdx = decoded.indexOf(':')
    const user = decoded.slice(0, colonIdx)
    const pass = decoded.slice(colonIdx + 1)
    if (user !== DASHBOARD_USER || pass !== DASHBOARD_PASS) {
        res.setHeader('WWW-Authenticate', 'Basic realm="LoopLearn Command Center"')
        return res.status(401).send('Invalid credentials.')
    }
    next()
}

// Global Unhandled Exception Guards (Prevents process freezes)
process.on('unhandledRejection', (reason) => {
    console.error('⚠️ [Global Guard] Unhandled Rejection:', reason)
})
process.on('uncaughtException', (err) => {
    console.error('🚨 [Global Guard] Uncaught Exception:', err.message)
})

const app = express()
app.use(express.json())

let sock = null
let botStatus = 'starting' // starting, qr_needed, connected, disconnected, logged_out
let currentQr = null
let currentQrImage = null
let schedulerStarted = false

// Metrics & Activity Tracking
const startTime = Date.now()
let totalMessagesProcessed = 0
let lastMessageProcessedAt = Date.now()

// Reconnection state — exponential backoff + circuit breaker + reentrancy lock
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10
let isConnecting = false
let reconnectTimer = null

// Baileys version cache — fetch once, reuse for 24h
let cachedBaileysVersion = null
let versionCachedAt = 0

async function getBaileysVersion() {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000
    if (cachedBaileysVersion && (Date.now() - versionCachedAt) < ONE_DAY_MS) {
        return cachedBaileysVersion
    }
    const { version } = await fetchLatestBaileysVersion()
    cachedBaileysVersion = version
    versionCachedAt = Date.now()
    console.log(`[Baileys] Fetched protocol version: ${version.join('.')}`)
    return version
}

// Returns exponential backoff delay in ms (5s → 10s → 20s → ... → 120s cap) with jitter
function getReconnectDelay() {
    const base = 5000
    const delay = Math.min(base * Math.pow(2, reconnectAttempts), 120000)
    return delay + Math.random() * 1000 // add jitter to avoid thundering herd
}

function updateLastMessageTime() {
    lastMessageProcessedAt = Date.now()
    totalMessagesProcessed++
}

// ── Session Heartbeat Monitor ───────────────────────────────────────────────
const DEAF_SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000 // 2 hours
setInterval(() => {
    if (botStatus !== 'connected') return

    // Check 1: Socket-level health (catches dead connections faster than message counting)
    const wsReadyState = sock?.ws?.readyState
    if (wsReadyState !== undefined && wsReadyState !== 1) {
        console.warn(`⚠️ [Heartbeat] WebSocket not OPEN (readyState: ${wsReadyState}) — forcing reconnect.`)
        botStatus = 'disconnected'
        if (sock) { try { sock.end(undefined) } catch (_) {} }
        scheduleReconnect()
        return
    }

    // Check 2: Zombie session — connected but no messages for 2 hours
    const silentFor = Date.now() - lastMessageProcessedAt
    if (silentFor > DEAF_SESSION_TIMEOUT_MS) {
        console.warn(`⚠️ [Heartbeat] Zombie session detected (silent for ${Math.round(silentFor / 3600000 * 10) / 10}h) — forcing reconnect.`)
        botStatus = 'disconnected'
        if (sock) { try { sock.end(undefined) } catch (_) {} }
        scheduleReconnect()
    }
}, 60 * 1000)

// ── Reconnect Scheduler (Exponential Backoff + Circuit Breaker) ─────────────
function scheduleReconnect() {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
    }
    reconnectAttempts++
    if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        botStatus = 'failed'
        isConnecting = false
        console.error(`🚨 [Reconnect] Circuit breaker triggered after ${MAX_RECONNECT_ATTEMPTS} failed attempts. Manual restart required.`)
        sendErrorAlert(
            'Bot Cannot Reconnect — Manual Action Required',
            `The WhatsApp bot failed to reconnect after ${MAX_RECONNECT_ATTEMPTS} consecutive attempts. Please open the Command Center and click Restart Bot.`
        ).catch(() => {})
        return
    }
    const delay = getReconnectDelay()
    console.log(`🔄 [Reconnect] Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${Math.round(delay / 1000)}s...`)
    reconnectTimer = setTimeout(() => {
        isConnecting = false
        connectToWhatsApp()
    }, delay)
}

// ── REST API Endpoints ──────────────────────────────────────────────────────

// Apply Basic Auth to ALL routes
app.use(basicAuth)

// API: Detailed Health Status
app.get('/api/status', async (req, res) => {
    const uptimeSec = Math.floor((Date.now() - startTime) / 1000)
    const memUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)

    res.json({
        status: botStatus,
        hasQr: !!currentQrImage,
        uptimeSeconds: uptimeSec,
        memoryUsageMb: memUsage,
        totalMessagesProcessed,
        lastMessageProcessedAt: new Date(lastMessageProcessedAt).toISOString(),
        serverTime: new Date().toISOString(),
        serverTimeIST: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
    })
})

// API: Fetch Recent Server Logs
app.get('/api/logs', (req, res) => {
    try {
        const errLogPath = path.join(__dirname, 'logs', 'err-0.log')
        const outLogPath = path.join(__dirname, 'logs', 'out-0.log')

        let logs = []

        if (fs.existsSync(outLogPath)) {
            const outContent = fs.readFileSync(outLogPath, 'utf8')
            const lines = outContent.trim().split('\n').slice(-40)
            logs.push(...lines.map(line => ({ type: 'out', text: line })))
        }

        if (fs.existsSync(errLogPath)) {
            const errContent = fs.readFileSync(errLogPath, 'utf8')
            const lines = errContent.trim().split('\n').slice(-20)
            logs.push(...lines.map(line => ({ type: 'err', text: line })))
        }

        res.json({ success: true, logs })
    } catch (e) {
        res.json({ success: false, error: e.message, logs: [] })
    }
})

// API: Ping Backend Vercel API
app.get('/api/ping-backend', async (req, res) => {
    const start = Date.now()
    try {
        const response = await axios.get(`${API_URL}/api/ping`, { timeout: 10000 })
        const latency = Date.now() - start
        res.json({ success: true, status: response.status, latencyMs: latency })
    } catch (e) {
        const latency = Date.now() - start
        res.json({ success: false, error: e.message, latencyMs: latency })
    }
})

let currentPairingCode = null

// API: Request 8-Digit Pairing Code
app.post('/api/pairing-code', async (req, res) => {
    const { phone } = req.body
    const targetPhone = phone || process.env.BOT_PHONE_NUMBER
    if (!targetPhone) {
        return res.status(400).json({ success: false, error: 'Phone number required (e.g. 919876543210)' })
    }
    if (!sock) {
        return res.status(500).json({ success: false, error: 'WhatsApp socket not initialized' })
    }
    try {
        const cleanPhone = targetPhone.replace(/\D/g, '')
        const code = await sock.requestPairingCode(cleanPhone)
        currentPairingCode = code
        console.log(`\n🔑 [Pairing Code] Generated code for ${cleanPhone}: ${code}\n`)
        res.json({ success: true, pairingCode: code })
    } catch (e) {
        console.error('Failed to request pairing code:', e.message)
        res.status(500).json({ success: false, error: e.message })
    }
})

// API: Trigger Restart
app.post('/api/restart', (req, res) => {
    console.log('🔄 Manual restart triggered from Command Center UI...')
    res.json({ success: true, message: 'Restarting bot in 2 seconds...' })
    setTimeout(() => process.exit(0), 2000)
})

// API: Purge Credentials & Reset Session
app.post('/api/reset-session', (req, res) => {
    console.log('🧹 Purging credentials and generating fresh QR code...')
    botStatus = 'logged_out'
    currentQr = null
    currentQrImage = null
    currentPairingCode = null

    try {
        if (sock) { try { sock.end(undefined) } catch (_) {} }
        fs.rmSync(path.join(__dirname, 'auth_info'), { recursive: true, force: true })
        console.log('Successfully cleared auth_info session folder.')
    } catch (e) {
        console.error('Failed to clear credentials folder:', e.message)
    }

    res.json({ success: true, message: 'Credentials purged. Generating new QR / pairing code...' })
    setTimeout(connectToWhatsApp, 2000)
})

// ── Command Center Dashboard HTML ──────────────────────────────────────────

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>LoopLearn Bot Command Center</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Inter', sans-serif; }
                .font-fredoka { font-family: 'Fredoka', sans-serif; }
            </style>
        </head>
        <body class="bg-slate-900 text-slate-100 min-h-screen p-4 sm:p-6">
            <div class="max-w-5xl mx-auto space-y-6">
                
                <!-- Top Header -->
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl gap-4">
                    <div>
                        <div class="flex items-center gap-3">
                            <h1 class="text-2xl font-bold font-fredoka text-indigo-400">LoopLearn Bot Command Center</h1>
                            <span class="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">v1.2 Live</span>
                        </div>
                        <p class="text-slate-400 text-xs mt-1">Oracle VPS Mumbai-1 · Infrastructure Control Dashboard</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="refreshData()" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl border border-slate-600 transition-all">🔄 Refresh</button>
                        <button onclick="triggerRestart()" class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all">⚡ Restart Bot</button>
                    </div>
                </div>

                <!-- Live Status Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md">
                        <p class="text-slate-400 text-xs uppercase tracking-wider font-semibold">Bot Status</p>
                        <p id="botStatusBadge" class="text-lg font-bold mt-2 text-yellow-400">Loading...</p>
                    </div>
                    <div class="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md">
                        <p class="text-slate-400 text-xs uppercase tracking-wider font-semibold">System Uptime</p>
                        <p id="uptimeBadge" class="text-lg font-bold mt-2 text-slate-100">--</p>
                    </div>
                    <div class="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md">
                        <p class="text-slate-400 text-xs uppercase tracking-wider font-semibold">Processed Messages</p>
                        <p id="msgCountBadge" class="text-lg font-bold mt-2 text-indigo-400">--</p>
                    </div>
                    <div class="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md">
                        <p class="text-slate-400 text-xs uppercase tracking-wider font-semibold">Vercel API Health</p>
                        <p id="apiHealthBadge" class="text-lg font-bold mt-2 text-slate-400">Testing...</p>
                    </div>
                </div>

                <!-- QR Panel & Controls Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <!-- QR Code Card (Left) -->
                    <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl text-center flex flex-col justify-center items-center">
                        <h2 class="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">WhatsApp Link Status</h2>
                        
                        <div id="qrContainer" class="bg-white p-4 rounded-2xl border border-slate-700 my-2 inline-block">
                            <p class="text-slate-500 text-xs">Checking session status...</p>
                        </div>
                        
                        <p id="qrNotice" class="text-xs text-slate-400 mt-4">Scan using WhatsApp Business → Linked Devices</p>

                        <!-- Pairing Code Alternative Option -->
                        <div class="mt-4 p-3 bg-slate-900/80 rounded-xl border border-slate-700 w-full text-left">
                            <p class="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider mb-2">🔑 Or Link with Pairing Code</p>
                            <div class="flex gap-2">
                                <input id="pairingPhoneInput" type="text" placeholder="e.g. 919876543210" class="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1 text-xs text-white w-full focus:outline-none focus:border-indigo-500" />
                                <button onclick="requestPairingCodeUI()" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg whitespace-nowrap">Get Code</button>
                            </div>
                            <div id="pairingCodeResult" class="mt-2 text-center text-sm font-mono font-bold text-emerald-400 hidden"></div>
                        </div>
                        
                        <button onclick="triggerResetSession()" class="mt-4 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 text-xs font-semibold rounded-xl transition-all w-full">
                            🧹 Reset Session & Force New QR
                        </button>
                    </div>

                    <!-- 1-Click Operations Panel (Right) -->
                    <div class="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col justify-between">
                        <div>
                            <h2 class="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">1-Click Control Operations</h2>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                                    <h3 class="font-semibold text-sm text-slate-200">🔄 Soft Restart</h3>
                                    <p class="text-xs text-slate-400 mt-1">Restarts the PM2 process cleanly without dropping linked credentials.</p>
                                    <button onclick="triggerRestart()" class="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all">Restart Bot</button>
                                </div>

                                <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                                    <h3 class="font-semibold text-sm text-slate-200">🧪 Ping Vercel API</h3>
                                    <p class="text-xs text-slate-400 mt-1">Tests HTTP latency from VPS to looplearnx.com endpoint.</p>
                                    <button onclick="testApi()" class="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all">Ping API Now</button>
                                </div>
                            </div>
                        </div>

                        <div class="mt-6 p-4 bg-slate-900/40 rounded-xl border border-slate-700 text-xs text-slate-400">
                            <strong>System Info:</strong> Server IST Time: <span id="istTime" class="text-slate-200">--</span> | Memory: <span id="memUsage" class="text-slate-200">--</span> MB
                        </div>
                    </div>
                </div>

                <!-- Live Log Viewer -->
                <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-sm font-semibold text-slate-300 uppercase tracking-wider">Live Server Logs</h2>
                        <span class="text-[11px] text-slate-400">Auto-refreshes every 10s</span>
                    </div>
                    
                    <div id="logBox" class="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 h-64 overflow-y-auto space-y-1">
                        <p class="text-slate-500">Loading logs...</p>
                    </div>
                </div>

            </div>

            <script>
                async function refreshData() {
                    try {
                        const res = await fetch('/api/status');
                        const data = await res.json();

                        const statusElem = document.getElementById('botStatusBadge');
                        if (data.status === 'connected') {
                            statusElem.className = 'text-lg font-bold mt-2 text-emerald-400';
                            statusElem.innerText = '✅ Connected & Running';
                        } else if (data.status === 'qr_needed') {
                            statusElem.className = 'text-lg font-bold mt-2 text-amber-400';
                            statusElem.innerText = '⚠️ Action Needed: Scan QR';
                        } else if (data.status === 'disconnected') {
                            statusElem.className = 'text-lg font-bold mt-2 text-red-400';
                            statusElem.innerText = '❌ Temporarily Disconnected';
                        } else {
                            statusElem.className = 'text-lg font-bold mt-2 text-slate-300';
                            statusElem.innerText = data.status;
                        }

                        document.getElementById('uptimeBadge').innerText = Math.floor(data.uptimeSeconds / 60) + ' min';
                        document.getElementById('msgCountBadge').innerText = data.totalMessagesProcessed;
                        document.getElementById('istTime').innerText = data.serverTimeIST;
                        document.getElementById('memUsage').innerText = data.memoryUsageMb;

                        // QR update
                        const qrBox = document.getElementById('qrContainer');
                        if (data.hasQr) {
                            qrBox.innerHTML = '<img src="/qr" class="w-56 h-56 rounded-lg" />';
                            document.getElementById('qrNotice').innerText = 'Scan QR code with WhatsApp Business to link.';
                        } else if (data.status === 'connected') {
                            qrBox.innerHTML = '<div class="w-56 h-56 flex items-center justify-center text-emerald-600 font-bold text-lg">✅ Session Linked</div>';
                            document.getElementById('qrNotice').innerText = 'WhatsApp session active 24/7.';
                        } else {
                            qrBox.innerHTML = '<div class="w-56 h-56 flex items-center justify-center text-slate-400 text-sm">Generating QR...</div>';
                        }
                    } catch (e) {
                        console.error('Failed to fetch status:', e);
                    }

                    fetchLogs();
                }

                async function fetchLogs() {
                    try {
                        const res = await fetch('/api/logs');
                        const data = await res.json();
                        const box = document.getElementById('logBox');
                        if (data.logs && data.logs.length) {
                            box.innerHTML = data.logs.map(l => {
                                const color = l.type === 'err' ? 'text-red-400' : 'text-slate-300';
                                return '<div class="' + color + '">' + escapeHtml(l.text) + '</div>';
                            }).join('');
                            box.scrollTop = box.scrollHeight;
                        }
                    } catch (e) {}
                }

                async function requestPairingCodeUI() {
                    const input = document.getElementById('pairingPhoneInput');
                    const resultBox = document.getElementById('pairingCodeResult');
                    const phone = input.value.trim();
                    if (!phone) {
                        alert('Please enter your phone number with country code (e.g. 919876543210)');
                        return;
                    }
                    resultBox.className = 'mt-2 text-center text-xs font-mono font-semibold text-amber-400 block';
                    resultBox.innerText = 'Requesting Pairing Code...';
                    try {
                        const res = await fetch('/api/pairing-code', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phone })
                        });
                        const data = await res.json();
                        if (data.success) {
                            resultBox.className = 'mt-2 p-2 bg-emerald-950 border border-emerald-500/40 rounded-lg text-center text-sm font-mono font-bold text-emerald-300 block tracking-widest';
                            resultBox.innerText = 'CODE: ' + data.pairingCode;
                            alert('Pairing Code Generated: ' + data.pairingCode + '\n\nOpen WhatsApp on your phone -> Linked Devices -> Link with phone number instead, and enter this code!');
                        } else {
                            resultBox.className = 'mt-2 text-center text-xs font-mono font-semibold text-red-400 block';
                            resultBox.innerText = 'Error: ' + data.error;
                        }
                    } catch (e) {
                        resultBox.className = 'mt-2 text-center text-xs font-mono font-semibold text-red-400 block';
                        resultBox.innerText = 'Request failed: ' + e.message;
                    }
                }

                async function testApi() {
                    const badge = document.getElementById('apiHealthBadge');
                    badge.innerText = 'Testing...';
                    badge.className = 'text-lg font-bold mt-2 text-amber-400';
                    try {
                        const res = await fetch('/api/ping-backend');
                        const data = await res.json();
                        if (data.success) {
                            badge.innerText = '✅ Online (' + data.latencyMs + 'ms)';
                            badge.className = 'text-lg font-bold mt-2 text-emerald-400';
                        } else {
                            badge.innerText = '❌ Failed (' + data.error + ')';
                            badge.className = 'text-lg font-bold mt-2 text-red-400';
                        }
                    } catch (e) {
                        badge.innerText = '❌ Request Failed';
                        badge.className = 'text-lg font-bold mt-2 text-red-400';
                    }
                }

                async function triggerRestart() {
                    if (!confirm('Are you sure you want to restart the bot?')) return;
                    await fetch('/api/restart', { method: 'POST' });
                    alert('Bot is restarting... Page will refresh in 5 seconds.');
                    setTimeout(() => location.reload(), 5000);
                }

                async function triggerResetSession() {
                    if (!confirm('This will purge saved WhatsApp login credentials and generate a NEW QR code. Continue?')) return;
                    await fetch('/api/reset-session', { method: 'POST' });
                    alert('Session reset! Generating new QR code...');
                    setTimeout(refreshData, 3000);
                }

                function escapeHtml(text) {
                    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                }

                // Initial Load & Intervals
                refreshData();
                testApi();
                setInterval(refreshData, 10000);
            </script>
        </body>
        </html>
    `)
})

app.get('/qr', (req, res) => {
    if (currentQrImage) {
        const imgBuffer = Buffer.from(currentQrImage.replace(/^data:image\/png;base64,/, ''), 'base64')
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': imgBuffer.length
        })
        res.end(imgBuffer)
    } else {
        res.status(404).send('No QR available')
    }
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Command Center Web Server running on http://0.0.0.0:${PORT}`)
})

// ── WhatsApp Baileys Connection Logic ───────────────────────────────

async function connectToWhatsApp() {
    if (isConnecting) {
        console.log('⚠️ [Connect] Connection attempt already in progress, skipping duplicate call.')
        return
    }
    isConnecting = true
    botStatus = 'starting'
    const AUTH_INFO_PATH = path.join(__dirname, 'auth_info')
    // Ensure auth_info directory always exists before Baileys tries to write to it
    if (!fs.existsSync(AUTH_INFO_PATH)) {
        fs.mkdirSync(AUTH_INFO_PATH, { recursive: true })
    }
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_INFO_PATH)
    const version = await getBaileysVersion() // Uses 24h cache — no network call on every reconnect

    if (sock) {
        try { sock.end(undefined) } catch (_) {}
    }

    sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: state,
        browser: ['LoopLearn Bot', 'Chrome', '120.0'],
        getMessage: async () => ({ conversation: '' }),
    })

    // Connection events
    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            botStatus = 'qr_needed'
            currentQr = qr
            try {
                currentQrImage = await qrcode.toDataURL(qr)
                console.log('\n📱 New WhatsApp QR generated. Visit the web Command Center to scan it.')
                qrcodeTerminal.generate(qr, { small: true })
            } catch (err) {
                console.error('Error generating QR image:', err)
            }
        }

        if (connection === 'close') {
            currentQr = null
            currentQrImage = null

            const error = lastDisconnect?.error instanceof Boom ? lastDisconnect.error : null
            const statusCode = error?.output?.statusCode
            const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403

            console.log(`[Connection] Closed with status code: ${statusCode}. Logged out: ${isLoggedOut}`)

            // Ensure old socket resources are explicitly released
            if (sock) { try { sock.end(undefined) } catch (_) {} }

            if (isLoggedOut) {
                botStatus = 'logged_out'
                isConnecting = false
                console.error('🚨 WhatsApp session logged out by server. Purging credentials...')

                try {
                    fs.rmSync(path.join(__dirname, 'auth_info'), { recursive: true, force: true })
                    // Recreate empty dir so Baileys can write to it immediately on reconnect
                    fs.mkdirSync(path.join(__dirname, 'auth_info'), { recursive: true })
                } catch (e) {
                    console.error('Failed to reset credentials folder:', e.message)
                }

                // Wait 10 seconds before reconnecting to avoid WhatsApp rate-limiting QR scans
                setTimeout(() => {
                    isConnecting = false
                    connectToWhatsApp()
                }, 10000)
                await sendErrorAlert('WhatsApp Logged Out', 'The WhatsApp session was logged out. A new QR code is required on the Command Center.')
            } else {
                // Temporary network/socket drop (e.g. 408, 515, 428) — PRESERVE credentials!
                botStatus = 'disconnected'
                scheduleReconnect() // Uses exponential backoff (5s → 10s → 20s ... → 120s cap)
            }
        }

        if (connection === 'open') {
            botStatus = 'connected'
            isConnecting = false
            currentQr = null
            currentQrImage = null
            reconnectAttempts = 0 // Reset circuit breaker on successful connection
            console.log('✅ LoopLearn WhatsApp bot connected successfully!')
            lastMessageProcessedAt = Date.now()

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
            if (msg.key.fromMe) continue
            updateLastMessageTime()
            await handleIncomingMessage(sock, msg)
        }
    })
}

connectToWhatsApp().catch(async (err) => {
    console.error('Fatal Baileys crash:', err)
    await sendErrorAlert('Fatal Bot Crash', `The Baileys WhatsApp bot crashed. Error: ${err.message}`)
    process.exit(1)
})
