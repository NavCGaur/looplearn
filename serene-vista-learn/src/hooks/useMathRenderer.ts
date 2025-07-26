import { useState, useEffect } from 'react';
import { loadKaTeX } from '../components/utils/katexLoader';

export const useMathRenderer = () => {
  const [isKatexReady, setIsKatexReady] = useState(false);
  const [katexError, setKatexError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initKaTeX = async () => {
      try {
        setIsLoading(true);
        await loadKaTeX();
        setIsKatexReady(true);
        setKatexError(null);
      } catch (error) {
        console.error('KaTeX initialization failed:', error);
        setKatexError(error as Error);
        setIsKatexReady(false);
      } finally {
        setIsLoading(false);
      }
    };

    initKaTeX();
  }, []);

  return { isKatexReady, katexError, isLoading };
};