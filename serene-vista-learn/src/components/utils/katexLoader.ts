import katex from 'katex';

let isKatexLoaded = false;

export const loadKaTeX = async (): Promise<typeof katex> => {
  if (!isKatexLoaded) {
    isKatexLoaded = true; // Mark as loaded
  }
  return katex;
};

export const resetKatexLoader = () => {
  isKatexLoaded = false;
};
