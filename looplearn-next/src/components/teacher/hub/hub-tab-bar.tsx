'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, BarChart2, Users } from 'lucide-react'

const TABS = [
    { href: '/teacher/hub/planner',     label: 'Weekly Planner', icon: Calendar },
    { href: '/teacher/hub/tracker',     label: 'Daily Tracker',  icon: Users },
    { href: '/teacher/hub/performance', label: 'Performance',    icon: BarChart2 },
]

export function HubTabBar() {
    const path = usePathname()
    return (
        <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 shadow-sm w-full max-w-lg">
            {TABS.map(({ href, label, icon: Icon }) => {
                const active = path.startsWith(href)
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                            active
                                ? 'bg-indigo-600 text-white shadow'
                                : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
                        }`}
                    >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">{label}</span>
                    </Link>
                )
            })}
        </div>
    )
}
