import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, CardContent, Typography, Button, Collapse } from '@mui/material';
import { useSubmitRatingsMutation } from '../../../state/api/vocabApi.ts';
import { Volume2 } from 'lucide-react'; 

const SpacedRepetition = () => {
  const words = useSelector(state => state.vocab.words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [ratings, setRatings] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const userId = useSelector((state) => state.auth?.user?.uid); 

  const [submitRatings, { isLoading, isSuccess, isError }] = useSubmitRatingsMutation();

  if (!words || words.length === 0) {
    return (
      <Typography textAlign="left" mt={4} fontSize={20} color="text.primary">
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

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3} >
      {/* Added the gradient background effect */}
      <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Box sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle, rgba(30,136,229,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(32px)',
          zIndex: 0,
          width: '100%',
          height: '100%'
        }} />
        
      <Card sx={{ 
        position: 'relative',
        minWidth: 400, 
        maxWidth: 500, // Slightly wider for better content flow
        minHeight: 420,
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #f3f4f6',
        zIndex: 1,
        cursor: 'pointer'
      }} onClick={handleCardClick}>
        <CardContent sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          gap: 2  // Added consistent gap between sections
        }}>
          {/* <Box sx={{ 
            borderBottom: '1px solid #f3f4f6', 
            pb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>

            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              fontSize: '1.25rem'
            }}>
              Vocabulary Card
            </Typography>
            <Box sx={{ 
              backgroundColor: '#e1f0ff',
              color: '#176DC2',
              fontSize: '0.75rem',
              px: 1.5,
              py: 0.5,
              borderRadius: '9999px',
              fontWeight: 500
            }}>
              Learning Mode
            </Box>
          </Box> */}
          

          {/* Main Content */}
          <Box sx={{ 
            flexGrow: 1, 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 3  // Increased gap between content sections
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
                    fontSize: '2rem',
                  }}>
                    {current.word}
                  </Typography>
                  <Volume2 
                    
                    color="#eab308" 
                    size={24} 
                    style={{ marginLeft: '8px', cursor: 'pointer' }} 
                    onClick={(e) => {
                      // Stop event propagation to parent card
                      e.stopPropagation();
                      // Play the pronunciation audio when clicked
                      const audio = new Audio(current.pronunciationUrl);
                      audio.play();
                    }}
                  />
                </Box>


              {/* Definition Section */}
              <Box sx={{ 
                backgroundColor: '#f9fafb', 
                p: 2.5, 
                borderRadius: '12px',
                borderLeft: '4px solid #176DC2' // Accent border
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
                  fontSize: '1.2rem',
                  lineHeight: 1.6,
                  textAlign: 'left',
                  letterSpacing: '0.3px'
                }}>
                    {current.definition.charAt(0).toUpperCase() + current.definition.slice(1)}  
                  </Typography>
              </Box>

               {/* Definition Section Hindi*/}
               <Box sx={{ 
                backgroundColor: '#f9fafb', 
                p: 2.5, 
                borderRadius: '12px',
                borderLeft: '4px solid #176DC2' // Accent border
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
                  fontSize: '1rem',
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
                  p: 2.5, 
                  borderRadius: '12px',
                  borderLeft: '4px solid #eab308' // Different accent color
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
                    fontSize: '1.2rem',
                    lineHeight: 1.6,
                    textAlign: 'left',
                    letterSpacing: '0.3px'

                  }}>
                    "{current.exampleSentence}"
                  </Typography>
                </Box>
              )}

              {/* Metadata Section */}
              <Box display="flex" gap={3} sx={{ 
                backgroundColor: '#f9fafb', 
                p: 2.5, 
                borderRadius: '12px',
                justifyContent: 'space-around'
              }}>
                {current.partOfSpeech && (
                  <Box textAlign="center">
                    <Typography sx={{ 
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      Part of Speech
                    </Typography>
                    <Typography sx={{ 
                      color: 'text.primary',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {current.partOfSpeech}
                    </Typography>
                  </Box>
                )}
                {current.difficulty && (
                  <Box textAlign="center">
                    <Typography sx={{ 
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      Difficulty
                    </Typography>
                    <Typography sx={{ 
                      color: 'text.primary',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {current.difficulty}/5
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Rating Section */}
              <Box sx={{ 
                mt: 2,
                p: 2,
                backgroundColor: '#f9fafb',
                borderRadius: '12px'
              }}>
                <Typography sx={{ 
                  fontWeight: '600', 
                  color: 'text.secondary',
                  mb: 2,
                  textAlign: 'center',
                  fontSize: '0.9375rem'
                }}>
                  How well did you remember this word?
                </Typography>
                <Box display="flex" gap={2} sx={{ justifyContent: 'center' }}>
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
                        fontSize: '0.875rem',
                        px: 2,
                        py: 1,
                        borderRadius: '8px',
                        minWidth: '90px'
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
              <Box height="100%" display="flex" alignItems="center" justifyContent="center">
                <Typography variant="body2" sx={{ 
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  fontSize: '1rem'
                }}>
                  Click to reveal vocabulary details
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
            px: 3,
            py: 1.5,
            borderRadius: '8px',
            boxShadow: 'none'
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
            px: 3,
            py: 1.5,
            borderRadius: '8px',
            boxShadow: 'none'
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
          fontSize: "1.25rem", 
          fontWeight: "bold",
          textAlign: 'center'
        }}>
          Practice submitted successfully!
        </Typography>
      )}
      {isError && (
        <Typography color="error.main">Error submitting ratings.</Typography>
      )}
    </Box>
  );
};

export default SpacedRepetition;