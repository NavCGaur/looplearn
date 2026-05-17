'use client'

import { useEffect, useState } from 'react'

interface LastActiveTimeProps {
    dateString: string | null
}

export function LastActiveTime({ dateString }: LastActiveTimeProps) {
    const [formattedTime, setFormattedTime] = useState<string>('Loading...')

    useEffect(() => {
        if (!dateString) {
            setFormattedTime('Never')
            return
        }

        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        // If less than 24 hours, show relative time
        if (diffInSeconds < 86400) {
            const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

            if (diffInSeconds < 60) {
                setFormattedTime('Just now')
            } else if (diffInSeconds < 3600) {
                setFormattedTime(rtf.format(-Math.floor(diffInSeconds / 60), 'minute'))
            } else {
                setFormattedTime(rtf.format(-Math.floor(diffInSeconds / 3600), 'hour'))
            }
        } else {
            // Otherwise show standard date in local timezone
            setFormattedTime(date.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            }))
        }
    }, [dateString])

    return <span>{formattedTime}</span>
}
