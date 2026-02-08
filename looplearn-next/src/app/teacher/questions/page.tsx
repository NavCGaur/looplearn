import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { QuestionBankTable } from '@/components/teacher/question-bank-table'

export default async function QuestionBankPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Role Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
                            ← Dashboard
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">My Question Bank</h1>
                            <p className="text-sm text-gray-500">Manage and Organize your Content</p>
                        </div>
                    </div>
                    <Link
                        href="/teacher/generator"
                        className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <span>⚡</span> Create New
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <QuestionBankTable />
            </main>
        </div>
    )
}
