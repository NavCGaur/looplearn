import React from 'react';

// Brand colors for gradient reference:
// blue-600: #2563eb
// green-500: #22c55e
// blue-500: #3b82f6

export const LoopLearnXIcon = ({ className }: { className?: string }) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
        <defs>
            <linearGradient id="loopLearnXGradient" x1="0" y1="0" x2="100%" y2="0">
                <stop offset="0%" stopColor="#2563eb" /> {/* blue-600 */}
                <stop offset="50%" stopColor="#22c55e" /> {/* green-500 */}
                <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
            </linearGradient>
        </defs>
        <path
            d="M5 19C5 19 8 12 12 12C16 12 19 5 19 5"
            stroke="url(#loopLearnXGradient)"
            strokeWidth="3"
            strokeLinecap="round"
        />
        <path
            d="M5 5C5 5 8 12 12 12C16 12 19 19 19 19"
            stroke="url(#loopLearnXGradient)"
            strokeWidth="3"
            strokeLinecap="round"
        />
    </svg>
);
