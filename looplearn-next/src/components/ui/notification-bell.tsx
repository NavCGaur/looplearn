'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    type AppNotification,
} from '@/app/actions/notifications'
import { Bell } from 'lucide-react'
import Link from 'next/link'

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

const typeIcon: Record<AppNotification['type'], string> = {
    teacher_note: '👨‍🏫',
    submission: '📝',
    achievement: '🏆',
    error: '⚠️',
    system: '🔔',
}

export function NotificationBell({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<AppNotification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [open, setOpen] = useState(false)
    const [, startTransition] = useTransition()
    const panelRef = useRef<HTMLDivElement>(null)

    // ── Initial fetch ─────────────────────────────────────────────────────────
    useEffect(() => {
        getNotifications(20).then(res => {
            if (res.success) {
                setNotifications(res.data)
                setUnreadCount(res.unreadCount)
            }
        })
    }, [])

    // ── Realtime subscription ─────────────────────────────────────────────────
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const newNotif = payload.new as AppNotification
                    setNotifications(prev => [newNotif, ...prev])
                    setUnreadCount(c => c + 1)
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [userId])

    // ── Close on outside click ─────────────────────────────────────────────────
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    // ── Mark one as read ──────────────────────────────────────────────────────
    const handleRead = (n: AppNotification) => {
        if (!n.is_read) {
            startTransition(async () => {
                await markNotificationRead(n.id)
                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x))
                setUnreadCount(c => Math.max(0, c - 1))
            })
        }
    }

    // ── Mark all as read ──────────────────────────────────────────────────────
    const handleMarkAllRead = () => {
        startTransition(async () => {
            await markAllNotificationsRead()
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        })
    }

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button — wrapper div owns the positioning context for the badge */}
            <div style={{ position: 'relative', display: 'inline-flex' }}>
                <button
                    onClick={() => setOpen(o => !o)}
                    className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    title="Notifications"
                >
                    <Bell className="w-5 h-5" />
                </button>
                {unreadCount > 0 && (
                    <span
                        style={{ position: 'absolute', top: '-2px', right: '-6px', zIndex: 10 }}
                        className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none pointer-events-none"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-[100] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="font-semibold text-sm text-gray-800">🔔 Notifications</p>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-10 text-center text-gray-400">
                                <p className="text-3xl mb-2">🔕</p>
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => {
                                const content = (
                                    <div
                                        key={n.id}
                                        onClick={() => handleRead(n)}
                                        className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-50 ${!n.is_read ? 'bg-indigo-50/60' : ''}`}
                                    >
                                        <span className="text-xl shrink-0 mt-0.5">{typeIcon[n.type] ?? '🔔'}</span>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                                        </div>
                                        {!n.is_read && (
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                )

                                return n.link ? (
                                    <Link href={n.link} key={n.id} onClick={() => { handleRead(n); setOpen(false) }}>
                                        {content}
                                    </Link>
                                ) : (
                                    <div key={n.id}>{content}</div>
                                )
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
                            <p className="text-xs text-gray-400">{notifications.length} recent notifications</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
