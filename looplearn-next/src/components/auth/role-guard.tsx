'use client'

import { ReactNode } from 'react'

interface RoleGuardProps {
    children: ReactNode
    userRole?: string
    allowedRoles: string[]
    fallback?: ReactNode
}

export function RoleGuard({
    children,
    userRole,
    allowedRoles,
    fallback = null
}: RoleGuardProps) {
    if (!userRole || !allowedRoles.includes(userRole)) {
        return <>{fallback}</>
    }

    return <>{children}</>
}
