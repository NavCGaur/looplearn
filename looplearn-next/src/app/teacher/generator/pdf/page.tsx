import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PdfUploadGenerator } from '@/components/teacher/pdf-upload-generator'

export default async function PdfGeneratorPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

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
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Teacher Dashboard</h1>
                        <p className="text-sm text-gray-500">AI Content Generation from PDF</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/teacher/generator"
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            ⚡ Text Generator
                        </Link>
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            ← Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        📄 PDF → Questions Generator
                    </h2>
                    <p className="text-gray-600">
                        Upload any chapter PDF and Gemini will read it and generate quiz questions
                        tailored to the class, subject, difficulty, and type you choose.
                    </p>
                </div>

                <PdfUploadGenerator />
            </main>
        </div>
    )
}
