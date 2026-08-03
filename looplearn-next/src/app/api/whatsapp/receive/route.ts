import { NextRequest, NextResponse } from 'next/server'
import { processWhatsAppSubmission, processWhatsAppTextSubmission } from '@/app/actions/homework'
import { sendErrorAlert } from '@/lib/email'

// Shared secret between VPS and Next.js
const BOT_SECRET = process.env.WHATSAPP_BOT_SECRET

// Allow up to 120 seconds — needed for Gemini image evaluation on complex homework sheets
// Without this, Vercel uses the plan default (can be as low as 10s)
export const maxDuration = 120

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
        images?: { base64: string; mimeType: string }[]
        isLid?: boolean
    }

    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { phone, imageBase64, mimeType, messageType, images, isLid } = body
    if (!phone) {
        return NextResponse.json({ error: 'Missing phone' }, { status: 400 })
    }
    const cleanPhone = phone.replace(/@.*$/, '').replace(/\D/g, '')
    console.log(`[API Webhook] Incoming - Phone: ${cleanPhone}, Type: ${messageType}, HasImagesArray: ${!!images}, HasSingleImage: ${!!imageBase64}`)

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
            const timeoutMs = 55000 // 55s — just under Vercel's 60s limit
            const result = await Promise.race([
                processWhatsAppTextSubmission({ phone: cleanPhone, textBody, isLid }),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('EVALUATION_TIMEOUT')), timeoutMs)
                )
            ])
            return NextResponse.json({ success: result.success, replyText: result.replyText })
        } catch (error: any) {
            if (error.message === 'EVALUATION_TIMEOUT') {
                console.error(`[API Webhook] Text processing timed out for ${cleanPhone}`)
                return NextResponse.json({
                    success: false,
                    replyText: '⏳ Evaluation mein thoda zyada time lag raha hai. Thodi der mein dobara *DONE* type karke submit karo.',
                })
            }
            console.error('[API Webhook] Text processing error:', error)
            await sendErrorAlert('Text Processing Exception', `Exception while processing text message from ${cleanPhone}. Error: ${error.message}\nStack: ${error.stack}`)
            return NextResponse.json({
                success: false,
                replyText: '⚠️ System error: Message process karne mein problem aayi. Please inform your Teacher about this issue.',
            })
        }
    }

    // 3. Extract and check images
    const imageList = images && Array.isArray(images)
        ? images
        : (imageBase64 ? [{ base64: imageBase64, mimeType: mimeType ?? 'image/jpeg' }] : [])

    if (imageList.length === 0) {
        console.log(`[API Webhook] Unsupported type from ${cleanPhone}: ${messageType}`)
        return NextResponse.json({
            success: false,
            replyText: '📸 Photo bhejo ya kuch type karo. Video/audio accept nahi hote.',
        })
    }

    // 4. Process the image submission (batch) with a 55s client timeout
    // (maxDuration=120 gives Vercel 120s, but we race at 55s to send a friendly
    //  fallback before Vercel hard-kills the function at the platform limit)
    console.log(`[API Webhook] Processing ${imageList.length} photo(s) for ${cleanPhone}...`)
    try {
        const timeoutMs = 55000
        const result = await Promise.race([
            processWhatsAppSubmission({ phone: cleanPhone, images: imageList, isLid }),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('EVALUATION_TIMEOUT')), timeoutMs)
            )
        ])
        console.log(`[API Webhook] Result for ${cleanPhone}:`, JSON.stringify(result))

        if (!result.success) {
            if (result.error === 'unregistered') {
                return NextResponse.json({
                    success: true,
                    replyText: result.feedbackText || '✅ Photo(s) receive ho gaye. Evaluation process ho raha hai...',
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
        if (error.message === 'EVALUATION_TIMEOUT') {
            console.error(`[API Webhook] Image processing timed out for ${cleanPhone}`)
            return NextResponse.json({
                success: false,
                replyText: '⏳ Evaluation mein thoda zyada time lag raha hai. Thodi der mein dobara *DONE* type karke submit karo.',
            })
        }
        console.error('[API Webhook] Image processing error:', error)
        await sendErrorAlert('Image Processing Exception', `Exception while processing image from ${cleanPhone}. Error: ${error.message}\nStack: ${error.stack}`)
        return NextResponse.json({
            success: false,
            replyText: '⚠️ System error: Photo process karne mein problem aayi. Please inform your Teacher about this issue.',
        })
    }
}

