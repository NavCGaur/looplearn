import { Suspense } from 'react'
import { loadQuizQuestions } from '@/app/actions/quiz'
import { getUser } from '@/app/actions/auth'
import { QuizClient } from '@/components/quiz/quiz-client'
import { redirect } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface QuizPageProps {
    searchParams: Promise<{ subject?: string; class?: string; excludeIds?: string; chapter?: string }>
}

function QuizLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <LoadingSpinner size="xl" message="Preparing your quiz..." />
        </div>
    )
}

async function QuizContent({ searchParams }: QuizPageProps) {
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

export default async function QuizPage({ searchParams }: QuizPageProps) {
    return (
        <Suspense fallback={<QuizLoading />}>
            <QuizContent searchParams={searchParams} />
        </Suspense>
    )
}
