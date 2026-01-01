// Dynamic, cached loader for KaTeX. Returns the same promise for subsequent calls.
let katexPromise: Promise<typeof import('katex')> | null = null;

export const loadKaTeX = async (): Promise<typeof import('katex')> => {
  if (!katexPromise) {
    // dynamic import so KaTeX is code-split and not forced into every bundle
    katexPromise = import('katex').then(mod => mod).catch(err => {
      // reset on failure so caller can retry later
      katexPromise = null;
      throw err;
    });
  }
  return katexPromise;
};

export const resetKatexLoader = () => {
  katexPromise = null;
};
