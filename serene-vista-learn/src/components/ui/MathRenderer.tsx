import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadKaTeX } from '../utils/katexLoader';

interface MathRendererProps {
  children: string;
  displayMode?: boolean;
  className?: string;
  onError?: (error: Error) => void;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  children,
  displayMode = false,
  className = '',
  onError
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [katexLoaded, setKatexLoaded] = useState(false);

  // Check if content contains LaTeX
  const hasLatex = children.includes('$') || children.includes('\\') || children.includes('^') || children.includes('_');

  const renderMath = useCallback(async () => {
    if (!containerRef.current || !children.trim()) {
      setIsLoading(false);
      return;
    }

    // If no LaTeX content, just show plain text
    if (!hasLatex) {
      containerRef.current.textContent = children;
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);
      console.debug('MathRenderer: attempting to load KaTeX');
      const katex = await loadKaTeX();
      console.debug('MathRenderer: loadKaTeX resolved, katex:', !!katex);
      
      if (!katex || !katex.render) {
        throw new Error('KaTeX not properly loaded');
      }

      setKatexLoaded(true);
      
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      // Clean the math expression
      let cleanExpression = children
        .trim()
        // Fix common issues
        // Accept either "\\text{...}" or corrupted "text{...}" (missing backslash)
        .replace(/\\?text\{([^}]*)\}/g, '\\mathrm{$1}') // Use mathrm instead of text for better compatibility
        .replace(/\s*\*\s*/g, '\\cdot ') // Replace * with proper multiplication symbol
        .replace(/imes/g, '\\times') // Fix times symbol
        .replace(/\^(\d+)/g, '^{$1}') // Wrap single digit exponents in braces
        .replace(/_(\d+)/g, '_{$1}'); // Wrap single digit subscripts in braces
      
  console.debug('MathRenderer: rendering LaTeX:', cleanExpression);
      
      // Enhanced rendering options
      const options = {
        displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
        trust: true,
        strict: "ignore" as const, // Ignore unknown commands instead of erroring
        macros: {
          '\\ce': '\\mathrm{#1}', // Chemistry notation
          '\\degree': '^{\\circ}', // Degree symbol
        }
      };

      katex.render(cleanExpression, containerRef.current, options);
  console.debug('MathRenderer: KaTeX rendered successfully');
      setIsLoading(false);
    } catch (error) {
  console.error('MathRenderer: KaTeX rendering error:', error);
      setHasError(true);
      setIsLoading(false);
      
      // Fallback to plain text
      if (containerRef.current) {
        containerRef.current.textContent = children;
      }
      
  onError?.(error as Error);
    }
  }, [children, displayMode, onError, hasLatex]);

  useEffect(() => {
    renderMath();
  }, [renderMath]);

  // Force re-render when component mounts and KaTeX becomes available
  useEffect(() => {
    if (katexLoaded && hasLatex) {
      const timer = setTimeout(() => {
        renderMath();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [katexLoaded, hasLatex, renderMath]);

  if (hasError) {
    return (
      <span className={`math-error ${className}`} title="Math rendering failed">
        {children}
      </span>
    );
  }

  return (
    <span 
      ref={containerRef}
      className={`math-renderer ${className} ${isLoading ? 'loading' : ''}`}
      style={{ 
        minHeight: isLoading ? '1em' : 'auto',
        display: 'inline-block'
      }}
    >
      {isLoading && children}
    </span>
  );
};