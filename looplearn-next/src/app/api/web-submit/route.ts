import { NextRequest, NextResponse } from 'next/server'
import { submitHomeworkFromWeb } from '@/app/actions/web-submit'

// Allow up to 120 seconds for Gemini image evaluation
export const maxDuration = 120

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { studentName, classStandard, imageBase64, imageMimeType } = body

        if (!studentName || !classStandard || !imageBase64) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: studentName, classStandard, imageBase64' },
                { status: 400 }
            )
        }

        const result = await submitHomeworkFromWeb({
            studentName,
            classStandard: parseInt(classStandard, 10),
            imageBase64,
            imageMimeType: imageMimeType || 'image/jpeg',
        })

        return NextResponse.json(result)
    } catch (e: any) {
        console.error('[API /web-submit] Error:', e.message)
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
