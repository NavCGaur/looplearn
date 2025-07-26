import { useEffect } from 'react';
import { Howl } from 'howler';

export const useAudioPreload = (url) => {
  useEffect(() => {
    if (!url) return;
    
    try {
      new Howl({
        src: [url],
        preload: true,
        html5: true,
      });
    } catch (error) {
      console.error("Error preloading audio:", error);
    }
  }, [url]);
};