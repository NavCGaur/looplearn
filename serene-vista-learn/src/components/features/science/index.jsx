import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, CardContent, Typography, Button, useMediaQuery, useTheme } from '@mui/material';
import { useSubmitRatingsMutation } from '../../../state/api/vocabApi.ts';
import VocabCardDetail from './VocabCardDetail';

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

  const [submitRatings, { isLoading, isSuccess, isError }] = useSubmitRatingsMutation();

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

  const handleNext = () => {
    // Set default rating of 1 when moving to next card
    setRatings(prev => ({ ...prev, [current.word]: 1 }));
    setShowDetails(false);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSubmit = async () => {
    // Create ratings array with default rating of 1 for all words
    const ratingsArray = words.map(word => ({ word: word.word, rating: 1 }));
    try {
      await submitRatings({ userId, ratings: ratingsArray }).unwrap();
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting ratings:', error);
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
              <VocabCardDetail 
                word={current} 
                expanded={showDetails}
                onClick={handleCardClick}
                isMobile={isMobile}
              />
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
          disabled={isLoading}
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