import { NextRequest, NextResponse } from 'next/server'
import { processWhatsAppSubmission } from '@/app/actions/homework'

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

    // 2. Reject text messages — image only
    if (messageType === 'text' || !imageBase64) {
        return NextResponse.json({
            success: false,
            replyText: 'Photo bhejo! Text submissions accept nahi hoti. Apne answers ki clear photo lo aur bhejo. 📸',
        })
    }

    // 3. Process the image submission
    const result = await processWhatsAppSubmission({
        phone,
        imageBase64,
        mimeType: mimeType ?? 'image/jpeg',
    })

    if (!result.success) {
        if (result.error === 'unregistered') {
            return NextResponse.json({
                success: false,
                replyText: '❌ Aapka number registered nahi hai. Apne teacher se contact karo.',
            })
        }
        return NextResponse.json({
            success: false,
            replyText: '⚠️ Kuch problem aayi. Thodi der baad dobara try karo.',
        })
    }

    return NextResponse.json({
        success: true,
        replyText: result.feedbackText,
        studentName: result.studentName,
    })
}
