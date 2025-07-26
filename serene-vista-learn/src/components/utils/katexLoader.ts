let katexLoadPromise: Promise<any> | null = null;
let isKatexLoaded = false;

// Extend window interface to include KaTeX
declare global {
  interface Window {
    katex?: any;
  }
}

// Multiple CDN sources for reliability
const KATEX_SOURCES = [
  {
    js: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.js',
    css: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.css',
    integrity: {
      js: 'sha512-aoZChv+8imY/U1O7KIHXvOgcbz3SZ4tXYXkeGbUfGDBcXELcZaRVLsJlUGXZVNDhKfKjwBqI5gN8lQel7jV4A==',
      css: 'sha512-7nTa5CnxbdnIqNjEjhf1URgWnN/W8FuWn9HiNs8mCvdNyTePO9CkW1P3kZaJR8I7BYjKUEKmU3O/Jk2wJUJdA=='
    }
  },
  {
    js: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js',
    css: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css',
    integrity: {
      js: 'sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn',
      css: 'sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn'
    }
  },
  {
    js: 'https://unpkg.com/katex@0.16.8/dist/katex.min.js',
    css: 'https://unpkg.com/katex@0.16.8/dist/katex.min.css',
    integrity: null // unpkg doesn't support integrity
  }
];

const loadScript = (src: string, integrity?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    if (integrity) {
      script.integrity = integrity;
      script.crossOrigin = 'anonymous';
    }
    
    const timeout = setTimeout(() => {
      reject(new Error(`Script load timeout: ${src}`));
    }, 10000); // 10 second timeout
    
    script.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to load script: ${src}`));
    };
    
    document.head.appendChild(script);
  });
};

const loadCSS = (href: string, integrity?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if CSS already exists
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    if (integrity) {
      link.integrity = integrity;
      link.crossOrigin = 'anonymous';
    }
    
    const timeout = setTimeout(() => {
      resolve(); // Don't fail on CSS timeout, just continue
    }, 5000);
    
    link.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    
    link.onerror = () => {
      clearTimeout(timeout);
      resolve(); // Don't fail on CSS error, just continue
    };
    
    document.head.appendChild(link);
  });
};

export const loadKaTeX = async (): Promise<any> => {
  // Return cached promise if already loading
  if (katexLoadPromise) {
    return katexLoadPromise;
  }

  // Return immediately if already loaded
  if (isKatexLoaded && window.katex) {
    return window.katex;
  }

  katexLoadPromise = new Promise(async (resolve, reject) => {
    try {
      // Check if KaTeX is already available
      if (window.katex) {
        isKatexLoaded = true;
        resolve(window.katex);
        return;
      }

      let lastError: Error | null = null;

      // Try each CDN source
      for (const source of KATEX_SOURCES) {
        try {
          console.log(`Attempting to load KaTeX from: ${source.js}`);
          
          // Load CSS first (non-blocking)
          loadCSS(source.css, source.integrity?.css).catch(console.warn);
          
          // Load JavaScript
          await loadScript(source.js, source.integrity?.js);
          
          // Check if KaTeX is now available
          if (window.katex && typeof window.katex.render === 'function') {
            console.log(`KaTeX loaded successfully from: ${source.js}`);
            isKatexLoaded = true;
            resolve(window.katex);
            return;
          }
          
          // Wait a bit for the script to initialize
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (window.katex && typeof window.katex.render === 'function') {
            console.log(`KaTeX loaded successfully from: ${source.js} (after delay)`);
            isKatexLoaded = true;
            resolve(window.katex);
            return;
          }
          
        } catch (error) {
          console.warn(`Failed to load KaTeX from ${source.js}:`, error);
          lastError = error as Error;
          continue;
        }
      }
      
      // If we get here, all sources failed
      katexLoadPromise = null;
      reject(lastError || new Error('All KaTeX CDN sources failed to load'));
      
    } catch (error) {
      console.error('KaTeX loader error:', error);
      katexLoadPromise = null;
      reject(error);
    }
  });

  return katexLoadPromise;
};

// Reset function for testing
export const resetKatexLoader = () => {
  katexLoadPromise = null;
  isKatexLoaded = false;
};
