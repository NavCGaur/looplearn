import React from 'react';
import {MathRenderer} from './MathRenderer';

interface TextWithMathProps {
  children: string;
  className?: string;
  onMathError?: (error: Error, expression: string) => void;
}

export const TextWithMath: React.FC<TextWithMathProps> = ({
  children,
  className = '',
  onMathError
}) => {
  console.log('TextWithMath input:', children);
  
  // Enhanced LaTeX pattern matching and cleaning
  const processText = (text?: string): React.ReactNode[] => {
    // Normalize common issues from AI-generated JSON: double-escaped backslashes, stray tokens
    // Coerce undefined/null to empty string so .replace/.trim are safe
    const safeText = (text || '');
    console.log('TextWithMath processText - safeText:', safeText);
    let cleanText = safeText
      // Convert double-escaped backslashes returned by some models: \\\\sqrt -> \\sqrt
      .replace(/\\\\/g, '\\')
      // Some responses insert escaped dollar signs or stray tokens; collapse repeated $ signs to standard ones
      .replace(/\$\s+\$/g, '$$')
      // Fix obvious corrupted \text occurrences like \t}\text or similar
      .replace(/\\t\}/g, '\\text}')
      // Fix missing backslash before text: ext{...} -> \text{...}
      .replace(/(\$?)ext\{([^}]+)\}/g, '$1\\text{$2}')
      // Fix corrupted chemical formulas where \text{...}_digit becomes ext...digit
      // Pattern: extCO2 -> \text{CO}_2, extH2 -> \text{H}_2, etc.
      .replace(/ext([A-Z][A-Za-z]*)(\d+)/g, '\\text{$1}_{$2}')
      // Fix corrupted \text where backslash was stripped but no subscript: extO -> \text{O}
      .replace(/ext([A-Z][A-Za-z]*)/g, '\\text{$1}')
      // Fix common 'imes' corruption
      .replace(/([^\\])imes/g, '$1\\times')
      // Clean spacing around dollar signs
      .replace(/\$\s+/g, '$')
      .replace(/\s+\$/g, '$');

    console.log('TextWithMath processText - after cleaning:', cleanText);

    // If we detect corrupted LaTeX patterns that aren't wrapped in $ signs, wrap them
    // Look for patterns like: \text{...} or \mathrm{...} or subscripts/superscripts not in $ 
    if (/\\(text|mathrm)\{[^}]+\}|[A-Za-z]_\d|[A-Za-z]\^\d/.test(cleanText) && !/\$/.test(cleanText)) {
      console.log('Detected unwrapped LaTeX, wrapping in $ signs:', cleanText);
      cleanText = `$${cleanText}$`;
    }

    // Robust splitting: capture $$...$$ or $...$ tokens while preserving everything else
    const mathPattern = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
    const parts: string[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = mathPattern.exec(cleanText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(cleanText.slice(lastIndex, match.index));
      }
      parts.push(match[0]);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < cleanText.length) parts.push(cleanText.slice(lastIndex));

    return parts.map((part, index) => {
      // Avoid using .test() on a global regex (stateful). Instead determine math
      // fragments by checking for starting/ending dollar delimiters.
      const isDisplayMode = part.startsWith('$$') && part.endsWith('$$');
      const isInlineMode = part.startsWith('$') && part.endsWith('$');

      if (isDisplayMode || isInlineMode) {
        const mathContent = isDisplayMode ? part.slice(2, -2) : part.slice(1, -1);
        return (
          <MathRenderer
            key={index}
            displayMode={isDisplayMode}
            onError={(error) => onMathError?.(error, mathContent)}
          >
            {mathContent}
          </MathRenderer>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <span className={className}>
      {processText(children)}
    </span>
  );
};
