const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const { Resend } = require('resend')

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

async function sendErrorAlert(subject, errorMessage) {
    if (!resend || !process.env.TEACHER_EMAIL) {
        console.warn('⚠️ [Email Alert] Skipping email alert because RESEND_API_KEY or TEACHER_EMAIL is missing in .env')
        return
    }

    try {
        const recipient = process.env.TEACHER_EMAIL || 'naveencg070@gmail.com'
        const { data, error } = await resend.emails.send({
            from: 'LoopLearn Bot Alert <onboarding@resend.dev>', // Use a verified domain if you have one, else this sandbox domain works for the verified email
            to: recipient,
            subject: `🚨 LoopLearn Bot Error: ${subject}`,
            html: `
                <h2>LoopLearn WhatsApp Bot Alert</h2>
                <p>An issue was detected in the bot infrastructure.</p>
                <div style="background-color: #ffebee; padding: 15px; border-left: 4px solid #f44336; margin-top: 15px; border-radius: 8px;">
                    <p style="font-family: monospace; color: #b71c1c; margin: 0;">${errorMessage}</p>
                </div>
                <div style="margin-top: 20px;">
                    <a href="http://92.4.80.16:3000" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Open Bot Command Center 🚀</a>
                </div>
                <p style="color: #757575; font-size: 12px; margin-top: 25px;">Time: ${new Date().toISOString()}</p>
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
