require('dotenv').config()
const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendErrorAlert(subject, errorMessage) {
    if (!process.env.RESEND_API_KEY || !process.env.TEACHER_EMAIL) {
        console.warn('⚠️ [Email Alert] Skipping email alert because RESEND_API_KEY or TEACHER_EMAIL is missing in .env')
        return
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'LoopLearn Bot Alert <onboarding@resend.dev>', // Use a verified domain if you have one, else this sandbox domain works for the verified email
            to: process.env.TEACHER_EMAIL,
            subject: `🚨 LoopLearn Bot Error: ${subject}`,
            html: `
                <h2>LoopLearn WhatsApp Bot Alert</h2>
                <p>An issue was detected in the bot infrastructure.</p>
                <div style="background-color: #ffebee; padding: 15px; border-left: 4px solid #f44336; margin-top: 15px;">
                    <p style="font-family: monospace; color: #b71c1c;">${errorMessage}</p>
                </div>
                <p style="color: #757575; font-size: 12px; margin-top: 30px;">Time: ${new Date().toISOString()}</p>
            `,
        })

        if (error) {
            console.error('Failed to send email alert via Resend:', error)
        } else {
            console.log(`📧 Email alert sent to ${process.env.TEACHER_EMAIL}`)
        }
    } catch (e) {
        console.error('Exception while sending email alert:', e.message)
    }
}

module.exports = { sendErrorAlert }
