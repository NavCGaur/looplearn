'use client'

import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { LoopLearnXIcon } from '@/components/ui/brand-icons'
import { Home, LogOut, BarChart3 } from 'lucide-react'

interface DashboardNavbarProps {
    user: {
        name: string
        role: string
        class: number | null
        points: number
    }
}

export function DashboardNavbar({ user }: DashboardNavbarProps) {
    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-blue-100/50 shadow-sm">
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
                        <div className="hidden md:block">
                            <h1 className="text-xl font-fredoka font-bold text-gray-800">
                                Student Dashboard
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-fredoka font-bold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                            <Home className="w-4 h-4" />
                            Home
                        </Link>

                        <Link href="/dashboard/analytics" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-fredoka font-bold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                            <BarChart3 className="w-4 h-4" />
                            Analytics
                        </Link>

                        {(user.role === 'teacher' || user.role === 'admin') && (
                            <Link
                                href="/dashboard"
                                className="hidden sm:block text-sm font-fredoka font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-4 py-2 rounded-full transition-colors"
                            >
                                Teacher View
                            </Link>
                        )}

                        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-fredoka font-bold text-gray-900 leading-none">{user.name}</p>
                                <p className="text-xs font-fredoka text-gray-500">Class {user.class || 'N/A'}</p>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
