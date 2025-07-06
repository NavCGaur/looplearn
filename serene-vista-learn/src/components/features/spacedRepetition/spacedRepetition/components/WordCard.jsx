import { Card, CardContent, Box, Typography, Collapse } from '@mui/material';
import { WordDisplay } from './WordDisplay';
import { InfoPanel } from './InfoPanel';
import { MetadataSection } from './MetaDataSection';
import { RatingSection } from './RatingSection';

export const WordCard = ({ 
  word, 
  showDetails, 
  onCardClick, 
  onRating, 
  isMobile, 
  ratings 
}) => {
  return (
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
    }} onClick={onCardClick}>
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
            <WordDisplay 
              word={word.word} 
              pronunciationUrl={word.pronunciationUrl}
              isMobile={isMobile} 
            />

            {/* Definition Section */}
            <InfoPanel 
              title="DEFINITION"
              content={word.definition.charAt(0).toUpperCase() + word.definition.slice(1)}
              color="#176DC2"
            />

            {/* Definition Section Hindi */}
            <InfoPanel 
              title={`${word.wordHindi} का अर्थ`}
              content={word.definitionHindi}
              color="#176DC2"
              fontFamily="Noto Sans Hindi, sans-serif"
            />

            {/* Example Section */}
            {word.exampleSentence && (
              <InfoPanel 
                title="EXAMPLE"
                content={`"${word.exampleSentence}"`}
                color="#eab308"
              />
            )}

            {/* Metadata Section */}
            <MetadataSection 
              partOfSpeech={word.partOfSpeech}
              difficulty={word.difficulty}
              isMobile={isMobile}
            />

            {/* Rating Section */}
            <RatingSection 
              word={word.word}
              rating={ratings[word.word]}
              onRating={onRating}
              isMobile={isMobile}
            />
          </Collapse>

          {!showDetails && (
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
      </CardContent>
    </Card>
  );
};
