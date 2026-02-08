import { loadQuizQuestions } from '@/app/actions/quiz'
import { getUser } from '@/app/actions/auth'
import { QuizClient } from '@/components/quiz/quiz-client'
import { redirect } from 'next/navigation'

interface QuizPageProps {
    searchParams: Promise<{ subject?: string; class?: string; excludeIds?: string; chapter?: string }>
}

export default async function QuizPage({ searchParams }: QuizPageProps) {
    const params = await searchParams
    const subject = params.subject || 'science'
    const classStandard = params.class ? parseInt(params.class) : undefined
    const excludeIds = params.excludeIds ? params.excludeIds.split(',').filter(Boolean) : []
    const chapter = params.chapter

    const user = await getUser()
    const isGuest = !user

    // Load questions with exclusions for guests
    const questions = await loadQuizQuestions({
        subject,
        classStandard: classStandard || user?.profile?.class_standard || 8,
        excludeQuestionIds: isGuest ? excludeIds : undefined,
        chapter,
    })

    return <QuizClient
        questions={questions}
        isGuest={isGuest}
        subject={subject}
        classStandard={classStandard || user?.profile?.class_standard || 8}
        chapter={chapter}
    />
}
