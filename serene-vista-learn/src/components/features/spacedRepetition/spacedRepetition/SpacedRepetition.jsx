import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useSubmitRatingsMutation, useAddPointsMutation  } from '../../../../state/api/vocabApi.ts';

// Import all component parts
import { WordCard } from './components/WordCard';
import { CardProgressIndicator } from './components/CardProgressIndicator';
import { ActionButton } from './components/ActionButton';
import { StatusMessage } from './components/StatusMessage';
import { BackgroundGradient } from './components/BackgroundGradient';
import { useAudioPreload } from './hooks/useAudioPreload';

const SpacedRepetition = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const words = useSelector(state => state.vocab.words);
  console.log("Words for Spaced Repetition:", words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [ratings, setRatings] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const userId = useSelector((state) => state.auth?.user?.uid);

  const [submitRatings, { isLoading, isSuccess, isError }] = useSubmitRatingsMutation();

  const [addPoints] = useAddPointsMutation();

  
  // Preload current word's audio
  const currentWord = words?.[currentIndex];
  useAudioPreload(currentWord?.pronunciationUrl);
  
  // Preload next word's audio
  const nextWord = words?.[currentIndex + 1];
  useAudioPreload(nextWord?.pronunciationUrl);

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

  const handleRating = (word, level) => {
    setRatings(prev => ({ ...prev, [word]: level }));
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
    
    // Submit points after successful rating submission
    await addPoints({
      userId,
      points: 10, // adjust as per logic
      reason: 'spacedRepetitionComplete',
    }).unwrap();

    setSubmitted(true);
  } catch (error) {
    console.error('Error submitting ratings or points:', error);
  }
};


  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3} width="100%">
      <CardProgressIndicator current={currentIndex + 1} total={words.length} />
      
      {/* Card container with gradient background */}
      <Box sx={{ 
        position: 'relative', 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center'
      }}>
        <BackgroundGradient />
        
        <WordCard 
          word={current}
          showDetails={showDetails}
          onCardClick={handleCardClick}
          onRating={handleRating}
          isMobile={isMobile}
          ratings={ratings}
        />
      </Box>

      {showDetails && !isLastCard && (
        <ActionButton 
          onClick={handleNext}
          disabled={ratings[current.word] === undefined}
          isNext={true}
          isMobile={isMobile}
        />
      )}

      {isLastCard && showDetails && !submitted && (
        <ActionButton 
          onClick={handleSubmit}
          disabled={ratings[current.word] === undefined || isLoading}
          isLoading={isLoading}
          isNext={false}
          isMobile={isMobile}
        />
      )}

      {submitted && isSuccess && (
        <StatusMessage 
          success={true} 
          message="Practice submitted successfully! 🎯 +10 points for completing spaced repetition!" 
        />
      )}
      
      {isError && (
        <StatusMessage 
          success={false} 
          message="Error submitting ratings." 
        />
      )}
    </Box>
  );
};

export default SpacedRepetition;