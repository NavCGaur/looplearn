import type { Metadata } from 'next'
import { HomeworkSubmitPage } from './HomeworkSubmitPage'

export const metadata: Metadata = {
    title: 'Submit Homework — LoopLearnX',
    description: 'Upload a photo of your homework or dictation sheet and get instant AI evaluation with scores and feedback.',
}

export default function SubmitPage() {
    return <HomeworkSubmitPage />
}
