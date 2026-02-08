'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CompleteProfilePage() {
    const router = useRouter()
    const [role, setRole] = useState<'student' | 'teacher'>('student')
    const [classStandard, setClassStandard] = useState('8')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const supabase = createClient()

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setError('No user found. Please sign in again.')
                return
            }

            // Create profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    role,
                    class_standard: role === 'student' ? parseInt(classStandard) : null,
                    display_name: user.user_metadata.full_name || user.email?.split('@')[0],
                })

            if (profileError) {
                setError(profileError.message)
                return
            }

            // Success - redirect based on role
            if (role === 'teacher') {
                router.push('/teacher/generator')
            } else {
                router.push('/dashboard')
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-2">Complete Your Profile</h1>
                <p className="text-gray-600 text-center mb-8">Just one more step!</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            I am a...
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('student')}
                                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${role === 'student'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-2xl mb-1">🎓</div>
                                <div className="font-semibold">Student</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('teacher')}
                                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${role === 'teacher'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-2xl mb-1">👨‍🏫</div>
                                <div className="font-semibold">Teacher</div>
                            </button>
                        </div>
                    </div>

                    {/* Class Standard (only for students) */}
                    {role === 'student' && (
                        <div>
                            <label htmlFor="classStandard" className="block text-sm font-medium text-gray-700 mb-2">
                                Class/Grade
                            </label>
                            <select
                                id="classStandard"
                                value={classStandard}
                                onChange={(e) => setClassStandard(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                            >
                                <option value="6">Class 6</option>
                                <option value="7">Class 7</option>
                                <option value="8">Class 8</option>
                                <option value="9">Class 9</option>
                                <option value="10">Class 10</option>
                                <option value="11">Class 11</option>
                                <option value="12">Class 12</option>
                            </select>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? 'Saving...' : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
    )
}
