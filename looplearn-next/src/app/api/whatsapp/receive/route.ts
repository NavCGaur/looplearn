import { NextRequest, NextResponse } from 'next/server'
import { processWhatsAppSubmission, processWhatsAppTextSubmission } from '@/app/actions/homework'
import { sendErrorAlert } from '@/lib/email'

// Shared secret between VPS and Next.js
const BOT_SECRET = process.env.WHATSAPP_BOT_SECRET

export async function POST(req: NextRequest) {
    // 1. Validate shared secret
    const secret = req.headers.get('x-bot-secret')
    if (!BOT_SECRET || secret !== BOT_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: {
        phone?: string
        imageBase64?: string
        mimeType?: string
        messageType?: string
        textBody?: string   // Text content from student's typed message
    }

    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { phone, imageBase64, mimeType, messageType } = body
    if (!phone) {
        return NextResponse.json({ error: 'Missing phone' }, { status: 400 })
    }
    const cleanPhone = phone.replace(/@.*$/, '').replace(/\D/g, '')
    console.log(`[API Webhook] Incoming - Phone: ${cleanPhone}, Type: ${messageType}, HasImage: ${!!imageBase64}`)

    if (!cleanPhone) {
        return NextResponse.json({ error: 'Missing phone' }, { status: 400 })
    }

    // 2. Route text messages to the text handler
    if (messageType === 'text') {
        const textBody = body.textBody?.trim() ?? ''
        if (!textBody) {
            return NextResponse.json({
                success: false,
                replyText: '❓ Kuch likho! Aapka message empty tha.',
            })
        }
        console.log(`[API Webhook] Text message from ${cleanPhone}: "${textBody.slice(0, 80)}"`)
        try {
            const result = await processWhatsAppTextSubmission({
                phone: cleanPhone,
                textBody,
            })
            return NextResponse.json({ success: result.success, replyText: result.replyText })
        } catch (error: any) {
            console.error('[API Webhook] Text processing error:', error)
            await sendErrorAlert('Text Processing Exception', `Exception while processing text message from ${cleanPhone}. Error: ${error.message}\nStack: ${error.stack}`)
            return NextResponse.json({
                success: false,
                replyText: '⚠️ System error: Message process karne mein problem aayi. Please inform your Teacher about this issue.',
            })
        }
    }

    // 3. Reject non-image, non-text messages (video, audio, documents)
    if (!imageBase64) {
        console.log(`[API Webhook] Unsupported type from ${cleanPhone}: ${messageType}`)
        return NextResponse.json({
            success: false,
            replyText: '📸 Photo bhejo ya kuch type karo. Video/audio accept nahi hote.',
        })
    }

    // 4. Process the image submission (existing flow — unchanged)
    console.log(`[API Webhook] Processing photo submission for ${cleanPhone}...`)
    try {
        const result = await processWhatsAppSubmission({
            phone: cleanPhone,
            imageBase64,
            mimeType: mimeType ?? 'image/jpeg',
        })
        console.log(`[API Webhook] Result for ${cleanPhone}:`, JSON.stringify(result))

        if (!result.success) {
            if (result.error === 'unregistered') {
                return NextResponse.json({
                    success: false,
                    replyText: '❌ Aapka number registered nahi hai. Apne teacher se contact karo.',
                })
            }
            return NextResponse.json({
                success: false,
                replyText: '⚠️ System error: Kuch problem aayi hai. Please inform your Teacher about this issue.',
            })
        }

        return NextResponse.json({
            success: true,
            replyText: result.feedbackText,
            studentName: result.studentName,
        })
    } catch (error: any) {
        console.error('[API Webhook] Image processing error:', error)
        await sendErrorAlert('Image Processing Exception', `Exception while processing image from ${cleanPhone}. Error: ${error.message}\nStack: ${error.stack}`)
        return NextResponse.json({
            success: false,
            replyText: '⚠️ System error: Photo process karne mein problem aayi. Please inform your Teacher about this issue.',
        })
    }
}

