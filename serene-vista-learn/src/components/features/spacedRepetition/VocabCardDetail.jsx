import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import { Volume2, X } from 'lucide-react';
import { Howl } from 'howler';

const VocabCardDetail = ({ 
  word, 
  expanded = true, 
  onClick = null, 
  showCloseButton = false,
  onClose = () => {},
  isMobile = false 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  
  // Use ref to store current sound object
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

  // Preload audio when word changes
  useEffect(() => {
    if (word?.pronunciationUrl) {
      preloadAudio(word.pronunciationUrl);
    }
  }, [word]);

  const preloadAudio = (url) => {
    // Create a new Howl instance but don't play it yet
    try {
      new Howl({
        src: [url],
        preload: true,
        html5: true, // Force HTML5 Audio to handle streaming audio better
      });
    } catch (error) {
      console.error("Error preloading audio:", error);
    }
  };

  const handleAudioPlay = (e) => {
    e.stopPropagation(); // Prevent card flip when clicking audio button
    setAudioError(false);
    
    // Stop and unload any existing sound
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.unload();
      soundRef.current = null;
    }
    
    // Don't proceed if URL is invalid
    if (!word?.pronunciationUrl) {
      setAudioError(true);
      return;
    }
    
    try {
      // Create new Howl instance with enhanced error handling
      const sound = new Howl({
        src: [word.pronunciationUrl],
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

  if (!word) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        position: 'relative',
        width: '100%',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      {/* Word Display */}
      <Collapse in={expanded}>
        {/* Word Header with Close Button */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          py: 1,
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          position: 'relative'
        }}>
          <Typography variant="h3" align="center" sx={{ 
            fontWeight: 'bold', 
            color: 'text.primary',
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          }}>
            {word.word}
          </Typography>
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
              size={isMobile ? 20 : 24} 
            />
          </Box>
          
          {showCloseButton && (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                cursor: 'pointer',
                p: 0.5,
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <X size={24} />
            </Box>
          )}
        </Box>

        {/* Definition Section */}
        <Box sx={{ 
          backgroundColor: '#f9fafb', 
          p: { xs: 1.5, sm: 2, md: 2.5 }, 
          borderRadius: '12px',
          borderLeft: '4px solid #176DC2',
          mb: 2
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: '600', 
            color: '#176DC2',
            fontSize: '0.875rem',
            mb: 1
          }}>
            DEFINITION
          </Typography>
          <Typography sx={{ 
            color: 'text.primary', 
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
            lineHeight: 1.6,
            textAlign: 'left',
            letterSpacing: '0.3px'
          }}>
            {word.definition.charAt(0).toUpperCase() + word.definition.slice(1)}  
          </Typography>
        </Box>

        {/* Definition Section Hindi (if available) */}
        {word.wordHindi && word.definitionHindi && (
          <Box sx={{ 
            backgroundColor: '#f9fafb', 
            p: { xs: 1.5, sm: 2, md: 2.5 }, 
            borderRadius: '12px',
            borderLeft: '4px solid #176DC2',
            mb: 2
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: '600', 
              color: '#176DC2',
              fontSize: '0.875rem',
              mb: 1,
              letterSpacing: '0.4px',
              fontFamily: 'Noto Sans Hindi, sans-serif', 
            }}>
              {word.wordHindi} का अर्थ
            </Typography>
            <Typography sx={{ 
              color: 'text.primary', 
              fontSize: { xs: '0.875rem', sm: '0.925rem', md: '1rem' },
              lineHeight: 1.5,
              textAlign: 'left',
              letterSpacing: '0.4px',
              fontFamily: 'Noto Sans Hindi, sans-serif', 
              fontWeight: '500'
            }}>
              {word.definitionHindi}  
            </Typography>
          </Box>
        )}

        {/* Example Section */}
        {word.exampleSentence && (
          <Box sx={{ 
            backgroundColor: '#f9fafb', 
            p: { xs: 1.5, sm: 2, md: 2.5 }, 
            borderRadius: '12px',
            borderLeft: '4px solid #eab308',
            mb: 2
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: '600', 
              color: '#eab308',
              fontSize: '0.875rem',
              mb: 1,
            }}>
              EXAMPLE
            </Typography>
            <Typography sx={{ 
              color: 'text.primary',
              fontStyle: 'italic',
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
              lineHeight: 1.6,
              textAlign: 'left',
              letterSpacing: '0.3px'
            }}>
              "{word.exampleSentence}"
            </Typography>
          </Box>
        )}

        {/* Metadata Section */}
        <Box 
          display="flex" 
          gap={isMobile ? 1 : 3} 
          sx={{ 
            backgroundColor: '#f9fafb', 
            p: { xs: 1.5, sm: 2, md: 2.5 }, 
            borderRadius: '12px',
            justifyContent: 'space-around'
        }}>
          {word.partOfSpeech && (
            <Box textAlign="center">
              <Typography sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                Part of Speech
              </Typography>
              <Typography sx={{ 
                color: 'text.primary',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                {word.partOfSpeech}
              </Typography>
            </Box>
          )}
          {word.difficulty && (
            <Box textAlign="center">
              <Typography sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                Difficulty
              </Typography>
              <Typography sx={{ 
                color: 'text.primary',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                {word.difficulty}/5
              </Typography>
            </Box>
          )}
          {word.mastered !== undefined && (
            <Box textAlign="center">
              <Typography sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                Status
              </Typography>
              <Typography sx={{ 
                color: word.mastered ? 'success.main' : 'info.main',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}>
                {word.mastered ? 'Mastered' : 'Learning'}
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
      
      {!expanded && (
        <Box height="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="space-around">
          <Typography variant="h2" align="center" sx={{ 
            fontWeight: 'bold', 
            color: 'text.primary',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          }}>
            {word.word}
          </Typography>

          <Typography variant="body2" sx={{ 
            color: 'text.secondary',
            fontStyle: 'italic',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
          👆 Click the card to flip and see the meaning, example!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VocabCardDetail;