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
  const processText = (text: string): React.ReactNode[] => {
    // First, let's clean up the text
    let cleanText = text
      // Remove any stray backslashes that might interfere
      .replace(/\\\\/g, '\\')
      // Fix corrupted patterns like $\t$\\text{...
      .replace(/\$\\t\$\\\\text\{/g, '$\\text{')
      .replace(/\$\\t\$/g, '$')
      // Clean up spacing around dollar signs
      .replace(/\$\s+/g, '$')
      .replace(/\s+\$/g, '$')
      // Fix times symbol corruption
      .replace(/imes/g, '\\times')
      // Fix text command issues
      .replace(/ext\{/g, '\\text{')
      // Fix asterisk issues
      .replace(/\*\s*imes\s*\*/g, '\\times')
      .replace(/\*([A-Za-z])/g, '$1'); // Remove stray asterisks before letters

    console.log('Cleaned text:', cleanText);

    // More robust pattern for LaTeX expressions
    // This pattern handles nested braces and various LaTeX constructs
    const mathPattern = /(\$\$[^$]*\$\$|\$[^$]*\$)/g;
    const parts = cleanText.split(mathPattern);

    console.log('Split parts:', parts);

    return parts.map((part, index) => {
      if (part.match(mathPattern)) {
        // Determine if it's display mode
        const isDisplayMode = part.startsWith('$$') && part.endsWith('$$');
        const mathContent = isDisplayMode 
          ? part.slice(2, -2) 
          : part.slice(1, -1);

        console.log('Math content to render:', mathContent);

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
      
      // Regular text
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <span className={className}>
      {processText(children)}
    </span>
  );
};
