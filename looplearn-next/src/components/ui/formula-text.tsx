'use client'

import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface FormulaTextProps {
    children: string
}

/**
 * Renders text with embedded LaTeX formulas
 * Formulas should be wrapped in $ delimiters
 * Example: "The formula $H_2O$ represents water"
 */
export function FormulaText({ children }: FormulaTextProps) {
    // Split by $ delimiters while preserving them
    const parts = children.split(/(\$[^$]+\$)/g)

    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('$') && part.endsWith('$')) {
                    // Extract formula (remove $ delimiters)
                    const formula = part.slice(1, -1)
                    return <InlineMath key={i} math={formula} />
                }
                return <span key={i}>{part}</span>
            })}
        </>
    )
}
