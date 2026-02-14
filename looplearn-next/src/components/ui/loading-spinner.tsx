'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    message?: string
    className?: string
}

export function LoadingSpinner({ size = 'md', message, className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-16 h-16 text-base',
        lg: 'w-24 h-24 text-xl',
        xl: 'w-32 h-32 text-2xl'
    }

    const borderWidths = {
        sm: 'border-2',
        md: 'border-4',
        lg: 'border-4',
        xl: 'border-[6px]'
    }

    return (
        <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
            {/* Spinning Circle with LLX */}
            <motion.div
                className={cn(
                    'relative rounded-full border-gray-200 border-t-primary-blue flex items-center justify-center',
                    sizeClasses[size],
                    borderWidths[size]
                )}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            >
                <span className="font-fredoka font-bold text-primary-blue">
                    LLX
                </span>
            </motion.div>

            {/* Optional Message */}
            {message && (
                <motion.p
                    className="text-gray-600 font-fredoka font-medium text-center max-w-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {message}
                </motion.p>
            )}
        </div>
    )
}
