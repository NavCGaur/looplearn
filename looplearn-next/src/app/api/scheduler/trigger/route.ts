import { NextRequest, NextResponse } from 'next/server'
import {
    getTodayTaskMessages,
    getPendingReminderMessages,
    markMissingSubmissions,
    getEodReportData,
    getWeeklySummaryMessages,
} from '@/app/actions/homework'

const BOT_SECRET = process.env.WHATSAPP_BOT_SECRET
const TEACHER_PHONE = process.env.TEACHER_WHATSAPP_PHONE

type Job =
    | '7am_task'
    | '5pm_reminder'
    | '8pm_flag'
    | '8_15pm_eod_report'
    | 'sunday_weekly'

export async function POST(req: NextRequest) {
    // Validate secret
    const secret = req.headers.get('x-bot-secret')
    if (!BOT_SECRET || secret !== BOT_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { job?: Job; week_start?: string }
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { job, week_start } = body

    switch (job) {
        // ── 7 AM: send today's homework tasks to all students ──
        case '7am_task': {
            const messages = await getTodayTaskMessages()
            return NextResponse.json({ success: true, job, messages })
        }

        // ── 5 PM: remind students who haven't submitted yet ───
        case '5pm_reminder': {
            const messages = await getPendingReminderMessages()
            // Strip internal fields before returning
            const outMessages = messages.map(({ phone, message }) => ({ phone, message }))
            return NextResponse.json({ success: true, job, messages: outMessages })
        }

        // ── 8 PM: mark non-submitters as "missing" in DB ─────
        case '8pm_flag': {
            const count = await markMissingSubmissions()
            return NextResponse.json({ success: true, job, flagged: count, messages: [] })
        }

        // ── 8:15 PM: send EOD report to teacher ───────────────
        case '8_15pm_eod_report': {
            if (!TEACHER_PHONE) {
                return NextResponse.json({ success: false, error: 'TEACHER_WHATSAPP_PHONE not set' })
            }
            const data = await getEodReportData()
            if (!data.length) {
                return NextResponse.json({
                    success: true,
                    job,
                    messages: [{
                        phone: TEACHER_PHONE,
                        message: '📊 Aaj koi homework plan nahi tha.',
                    }],
                })
            }
            const todayStr = new Date().toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata',
            })
            const lines = data.map(d => {
                const missingStr = d.missing_names.length
                    ? `🔴 Missing: ${d.missing_names.join(', ')}`
                    : '✅ Sab ne submit kiya!'
                return `Class ${d.class_standard} ${d.subject} (HW #${d.hw_number}):\n✅ Submitted: ${d.submitted}/${d.total}\n${missingStr}`
            })
            const message = `📊 LoopLearn Report — ${todayStr}\n\n${lines.join('\n\n')}\n\n🕐 8:15 PM IST`
            return NextResponse.json({
                success: true,
                job,
                messages: [{ phone: TEACHER_PHONE, message }],
            })
        }

        // ── Sunday 6 PM: weekly plan summary to all students ──
        case 'sunday_weekly': {
            if (!week_start) {
                return NextResponse.json({ error: 'week_start required for sunday_weekly' }, { status: 400 })
            }
            const messages = await getWeeklySummaryMessages(week_start)
            return NextResponse.json({ success: true, job, messages })
        }

        default:
            return NextResponse.json({ error: `Unknown job: ${job}` }, { status: 400 })
    }
}
