import { Resend } from 'resend'

export async function sendErrorAlert(subject: string, errorMessage: string) {
    if (!process.env.RESEND_API_KEY || !process.env.TEACHER_EMAIL) {
        console.warn('⚠️ [Email Alert] Skipping email alert because RESEND_API_KEY or TEACHER_EMAIL is missing in .env')
        return
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const { error } = await resend.emails.send({
            from: 'LoopLearn NextJS Alert <onboarding@resend.dev>',
            to: process.env.TEACHER_EMAIL,
            subject: `🚨 LoopLearn API Error: ${subject}`,
            html: `
                <h2>LoopLearn Next.js API Alert</h2>
                <p>An issue was detected in the WhatsApp webhook API.</p>
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
    } catch (e: any) {
        console.error('Exception while sending email alert:', e.message)
    }
}
