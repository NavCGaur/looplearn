require('dotenv').config()
const cron = require('node-cron')
const { callApi, sendBulkMessages } = require('./bridge')

// Get next Monday's date string (for Sunday weekly plan)
function getNextMonday() {
    const d = new Date()
    const daysUntilMonday = (8 - d.getDay()) % 7 || 7
    d.setDate(d.getDate() + daysUntilMonday)
    return d.toISOString().split('T')[0]
}

function startScheduler(sock) {
    console.log('⏰ Cron scheduler started (IST timezone)')

    // ── 7:00 AM Mon-Sat — Morning homework task dispatch ─────
    cron.schedule('0 7 * * 1-6', async () => {
        console.log('[Cron] 7 AM — sending morning tasks')
        try {
            const data = await callApi('/api/scheduler/trigger', { job: '7am_task' })
            await sendBulkMessages(sock, data.messages ?? [])
            console.log(`[Cron] 7 AM — sent ${data.messages?.length ?? 0} messages`)
        } catch (e) {
            console.error('[Cron] 7 AM error:', e.message)
        }
    }, { timezone: 'Asia/Kolkata' })

    // ── 5:00 PM Mon-Sat — Reminder to pending students ───────
    cron.schedule('0 17 * * 1-6', async () => {
        console.log('[Cron] 5 PM — sending reminders')
        try {
            const data = await callApi('/api/scheduler/trigger', { job: '5pm_reminder' })
            await sendBulkMessages(sock, data.messages ?? [])
            console.log(`[Cron] 5 PM — sent ${data.messages?.length ?? 0} reminders`)
        } catch (e) {
            console.error('[Cron] 5 PM error:', e.message)
        }
    }, { timezone: 'Asia/Kolkata' })

    // ── 8:00 PM Mon-Sat — Mark non-submitters as missing ─────
    cron.schedule('0 20 * * 1-6', async () => {
        console.log('[Cron] 8 PM — flagging missing submissions')
        try {
            const data = await callApi('/api/scheduler/trigger', { job: '8pm_flag' })
            console.log(`[Cron] 8 PM — flagged ${data.flagged ?? 0} missing`)
        } catch (e) {
            console.error('[Cron] 8 PM error:', e.message)
        }
    }, { timezone: 'Asia/Kolkata' })

    // ── 8:15 PM Mon-Sat — EOD teacher report ─────────────────
    cron.schedule('15 20 * * 1-6', async () => {
        console.log('[Cron] 8:15 PM — sending EOD teacher report')
        try {
            const data = await callApi('/api/scheduler/trigger', { job: '8_15pm_eod_report' })
            await sendBulkMessages(sock, data.messages ?? [])
            console.log('[Cron] 8:15 PM — teacher report sent')
        } catch (e) {
            console.error('[Cron] 8:15 PM error:', e.message)
        }
    }, { timezone: 'Asia/Kolkata' })

    // ── 6:00 PM Sunday — Weekly plan summary to all students ─
    cron.schedule('0 18 * * 0', async () => {
        console.log('[Cron] Sunday 6 PM — sending weekly summary')
        try {
            const weekStart = getNextMonday()
            const data = await callApi('/api/scheduler/trigger', {
                job: 'sunday_weekly',
                week_start: weekStart,
            })
            await sendBulkMessages(sock, data.messages ?? [])
            console.log(`[Cron] Sunday — sent ${data.messages?.length ?? 0} weekly summaries`)
        } catch (e) {
            console.error('[Cron] Sunday error:', e.message)
        }
    }, { timezone: 'Asia/Kolkata' })
}

module.exports = { startScheduler }
