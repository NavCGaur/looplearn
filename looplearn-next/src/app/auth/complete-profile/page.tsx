'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { createClient } from '@/lib/supabase/client'

export default function CompleteProfilePage() {
    const router = useRouter()
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

            // Create profile — all self-signups are students only.
            // Teacher role must be assigned manually via Supabase admin.
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    role: 'student',
                    class_standard: parseInt(classStandard),
                    display_name: user.user_metadata.full_name || user.email?.split('@')[0],
                })

            if (profileError) {
                setError(profileError.message)
                return
            }

            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-2">Almost There! 🎓</h1>
                <p className="text-gray-600 text-center mb-8">Select your class to complete setup.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Class Standard */}
                    <div>
                        <label htmlFor="classStandard" className="block text-sm font-medium text-gray-700 mb-2">
                            Which class are you in?
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
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner size="sm" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            "Let's Go! 🚀"
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
