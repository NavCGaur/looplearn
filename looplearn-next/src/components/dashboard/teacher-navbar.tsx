'use client'

import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { LoopLearnXIcon } from '@/components/ui/brand-icons'
import { Home } from 'lucide-react'

interface TeacherNavbarProps {
    user: {
        name: string
        email?: string
    }
}

export function TeacherNavbar({ user }: TeacherNavbarProps) {
    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-200">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity">
                            <span className="text-2xl font-bold font-fredoka flex items-center">
                                <span className="bg-gradient-to-r from-blue-500 via-green-500 to-blue-600 bg-clip-text text-transparent">LoopLearn</span>
                                <LoopLearnXIcon className="w-8 h-8" />
                            </span>
                        </Link>

                        <div className="hidden md:block h-6 w-px bg-gray-200" />

                        <div className="hidden md:flex items-center gap-2">
                            <Link href="/dashboard" className="text-xl font-bold text-gray-800 hover:text-indigo-600 transition-colors">
                                Teacher Dashboard
                            </Link>
                            <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                                BETA
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/" className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <Home className="w-4 h-4" />
                            Home
                        </Link>

                        <Link
                            href="/dashboard?view=student"
                            className="hidden sm:block text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                        >
                            Student View
                        </Link>

                        <div className="w-px h-6 bg-gray-200 hidden sm:block" />

                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                {user.name}
                            </span>
                            <button
                                onClick={handleSignOut}
                                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
