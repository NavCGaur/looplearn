import { useRef, useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { Howl } from 'howler';
import { Box } from '@mui/material';

export const AudioButton = ({ url, size = 24 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const soundRef = useRef(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.unload();
        soundRef.current = null;
      }
    };
  }, []);

  const handleAudioPlay = (e) => {
    e.stopPropagation(); // Prevent parent click events
    setAudioError(false);
    
    // Stop and unload any existing sound
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.unload();
      soundRef.current = null;
    }
    
    // Don't proceed if URL is invalid
    if (!url) {
      setAudioError(true);
      return;
    }
    
    try {
      // Create new Howl instance with enhanced error handling
      const sound = new Howl({
        src: [url],
        html5: true, // Better for streaming audio
        volume: 1.0,
        onplay: () => {
          setIsPlaying(true);
        },
        onend: () => {
          setIsPlaying(false);
        },
        onloaderror: () => {
          console.error("Howler: Loading error");
          setIsPlaying(false);
          setAudioError(true);
          soundRef.current = null;
        },
        onplayerror: () => {
          console.error("Howler: Play error - trying to recover");
          setIsPlaying(false);
          
          // Try to recover with a forced play
          sound._unlockAudio();
          
          // If still can't play, mark as error
          if (!sound.playing()) {
            setAudioError(true);
            soundRef.current = null;
          }
        },
        onstop: () => {
          setIsPlaying(false);
        }
      });
      
      // Keep reference to control sound
      soundRef.current = sound;
      
      // Play the sound
      sound.play();
      
    } catch (err) {
      console.error("Audio setup error:", err);
      setIsPlaying(false);
      setAudioError(true);
    }
  };

  return (
    <Box 
      component="div" 
      role="button"
      onClick={handleAudioPlay}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ml: 1,
        cursor: 'pointer',
        p: 0.5,
        borderRadius: '50%',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)'
        }
      }}
    >
      <Volume2 
        color={isPlaying ? "#176DC2" : audioError ? "red" : "#eab308"} 
        size={size} 
      />
    </Box>
  );
};