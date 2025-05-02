import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, CardContent, Typography, Button, Collapse, useMediaQuery, useTheme } from '@mui/material';
import { useSubmitRatingsMutation } from '../../../state/api/vocabApi.ts';
import { Volume2 } from 'lucide-react'; 

const SpacedRepetition = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const words = useSelector(state => state.vocab.words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [ratings, setRatings] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const userId = useSelector((state) => state.auth?.user?.uid); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const audioRef = useRef(null);


  const [submitRatings, { isLoading, isSuccess, isError }] = useSubmitRatingsMutation();

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Preload first audio
  useEffect(() => {
    if (words.length > 0) {
      const audio = new Audio(words[0].pronunciationUrl);
      audio.preload = 'auto';
    }
  }, [words]);


  if (!words || words.length === 0) {
    return (
      <Typography textAlign="left" mt={4} fontSize={isMobile ? 16 : 20} color="text.primary">
        📚✨ <strong>All Caught Up!</strong> <br />
        No words to review right now — keep up the good work! 🌟
      </Typography>
    );
  }
  
  const current = words[currentIndex];
  const isLastCard = currentIndex === words.length - 1;

  const handleCardClick = () => setShowDetails(!showDetails);

  const handleRating = (level) => {
    setRatings(prev => ({ ...prev, [current.word]: level }));
  };

  const handleNext = () => {
    if (ratings[current.word] === undefined) return;
    setShowDetails(false);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSubmit = async () => {
    const ratingsArray = Object.entries(ratings).map(([word, rating]) => ({ word, rating }));
    try {
      await submitRatings({ userId, ratings: ratingsArray }).unwrap();
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting ratings:', error);
    }
  };

  const handleAudioPlay = async (e) => {
    e.stopPropagation();
    setAudioError(false);
    
    try {
      // Pause and reset any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Create new audio instance
      audioRef.current = new Audio(current.pronunciationUrl);
      setIsPlaying(true);
      
      // Set up event listeners
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        setIsPlaying(false);
        setAudioError(true);
      };
      
      // Small delay to avoid race conditions
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Play the audio
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise.catch(err => {
          console.error("Playback failed:", err);
          setIsPlaying(false);
          setAudioError(true);
        });
      }
    } catch (err) {
      console.error("Audio error:", err);
      setIsPlaying(false);
      setAudioError(true);
    }
  };


  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3} width="100%">

    <Typography variant="subtitle1" sx={{ color: '#6b7280', fontWeight:600 }}>
      🌟 Word {currentIndex + 1} of {words.length}
    </Typography>
      {/* Added the gradient background effect */}
      <Box sx={{ 
        position: 'relative', 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center'
      }}>
         <Box sx={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle, rgba(255,223,186,0.4) 0%, transparent 80%)',
        borderRadius: '50%',
        filter: 'blur(28px)',
        zIndex: 0,
        width: '100%',
        height: '100%',
      }} />
        
        <Card sx={{ 
          position: 'relative',
          width: '100%', 
          maxWidth: {
            xs: '95%', 
            sm: '450px', 
            md: '500px'
          },
          minHeight: {
            xs: 350,
            sm: 380,
            md: 420
          },
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f3f4f6',
          zIndex: 1,
          cursor: 'pointer'
        }} onClick={handleCardClick}>
          <CardContent sx={{ 
            p: { xs: 2, sm: 3 }, 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            gap: 2
          }}>
            {/* Main Content */}
            <Box sx={{ 
              flexGrow: 1, 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 2, sm: 3 }
            }}>
              <Collapse in={showDetails}>
                {/* Word Display */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  py: 1,
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <Typography variant="h3" align="center" sx={{ 
                    fontWeight: 'bold', 
                    color: 'text.primary',
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                  }}>
                    {current.word}
                  </Typography>
                  <Volume2 
                      color={isPlaying ? "#176DC2" : audioError ? "red" : "#eab308"} 
                      size={isMobile ? 20 : 24} 
                      style={{ cursor: 'pointer', marginLeft: '8px', marginTop: '2px' }} 
                      onClick={handleAudioPlay}
                    />
                </Box>

                {/* Definition Section */}
                <Box sx={{ 
                  backgroundColor: '#f9fafb', 
                  p: { xs: 1.5, sm: 2, md: 2.5 }, 
                  borderRadius: '12px',
                  borderLeft: '4px solid #176DC2'
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
                    {current.definition.charAt(0).toUpperCase() + current.definition.slice(1)}  
                  </Typography>
                </Box>

                {/* Definition Section Hindi */}
                <Box sx={{ 
                  backgroundColor: '#f9fafb', 
                  p: { xs: 1.5, sm: 2, md: 2.5 }, 
                  borderRadius: '12px',
                  borderLeft: '4px solid #176DC2'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: '600', 
                    color: '#176DC2',
                    fontSize: '0.875rem',
                    mb: 1,
                    letterSpacing: '0.4px',
                    fontFamily: 'Noto Sans Hindi, sans-serif', 
                  }}>
                    {current.wordHindi} का अर्थ
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
                    {current.definitionHindi}  
                  </Typography>
                </Box>

                {/* Example Section */}
                {current.exampleSentence && (
                  <Box sx={{ 
                    backgroundColor: '#f9fafb', 
                    p: { xs: 1.5, sm: 2, md: 2.5 }, 
                    borderRadius: '12px',
                    borderLeft: '4px solid #eab308'
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
                      "{current.exampleSentence}"
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
                  {current.partOfSpeech && (
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
                        {current.partOfSpeech}
                      </Typography>
                    </Box>
                  )}
                  {current.difficulty && (
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
                        {current.difficulty}/5
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Rating Section */}
                <Box sx={{ 
                  mt: 2,
                  p: { xs: 1.5, sm: 2 },
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px'
                }}>
                  <Typography sx={{ 
                    fontWeight: '600', 
                    color: 'text.secondary',
                    mb: { xs: 1.5, sm: 2 },
                    textAlign: 'center',
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                  }}>
                    How well did you remember this word?
                  </Typography>
                  <Box 
                    display="flex" 
                    gap={isMobile ? 1 : 2} 
                    flexDirection={isMobile ? 'column' : 'row'}
                    sx={{ justifyContent: 'center' }}
                  >
                    {[['Easy 😎', 5], ['Average 😊', 3], ['Difficult 😕', 1]].map(([label, value]) => (
                      <Button
                        key={value}
                        variant={ratings[current.word] === value ? 'contained' : 'outlined'}
                        sx={{
                          backgroundColor: ratings[current.word] === value ? '#176DC2' : 'transparent',
                          color: ratings[current.word] === value ? 'white' : '#176DC2',
                          borderColor: '#176DC2',
                          '&:hover': {
                            backgroundColor: ratings[current.word] === value ? '#145ca8' : 'rgba(23,109,194,0.1)'
                          },
                          textTransform: 'none',
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          px: { xs: 1, sm: 2 },
                          py: 1,
                          borderRadius: '8px',
                          minWidth: isMobile ? '100%' : '90px'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRating(value);
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Collapse>

              {!showDetails && (
                <Box height="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="space-around">
                  <Typography variant="h2" align="center" sx={{ 
                    fontWeight: 'bold', 
                    color: 'text.primary',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  }}>
                    {current.word}
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
          </CardContent>
        </Card>
      </Box>

      {showDetails && !isLastCard && (
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#176DC2',
            color: 'white',
            '&:hover': {
              backgroundColor: '#145ca8'
            },
            textTransform: 'none',
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            borderRadius: '8px',
            boxShadow: 'none',
            width: isMobile ? '90%' : 'auto'
          }}
          onClick={handleNext}
          disabled={ratings[current.word] === undefined}
        >
          Next
        </Button>
      )}

      {isLastCard && showDetails && !submitted && (
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#4CAF50',
            color: 'white',
            '&:hover': {
              backgroundColor: '#3d8b40'
            },
            textTransform: 'none',
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            borderRadius: '8px',
            boxShadow: 'none',
            width: isMobile ? '90%' : 'auto'
          }}
          onClick={handleSubmit}
          disabled={isLoading || ratings[current.word] === undefined}
        >
          {isLoading ? 'Submitting...' : 'Finish & Submit'}
        </Button>
      )}

      {submitted && isSuccess && (
        <Typography sx={{ 
          color: '#4CAF50', 
          fontSize: { xs: "1rem", sm: "1.25rem" }, 
          fontWeight: "bold",
          textAlign: 'center',
          width: '100%',
          px: 2
        }}>
          Practice submitted successfully!
        </Typography>
      )}
      {isError && (
        <Typography 
          color="error.main"
          sx={{ 
            width: '100%',
            textAlign: 'center',
            px: 2
          }}
        >
          Error submitting ratings.
        </Typography>
      )}
    </Box>
  );
};

export default SpacedRepetition;