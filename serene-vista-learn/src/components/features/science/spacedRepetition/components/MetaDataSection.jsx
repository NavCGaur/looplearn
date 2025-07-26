import { Box, Typography } from '@mui/material';

export const MetadataSection = ({ partOfSpeech, difficulty, isMobile }) => {
  return (
    <Box 
      display="flex" 
      gap={isMobile ? 1 : 3} 
      sx={{ 
        backgroundColor: '#f9fafb', 
        p: { xs: 1.5, sm: 2, md: 2.5 }, 
        borderRadius: '12px',
        justifyContent: 'space-around'
    }}>
      {partOfSpeech && (
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
            {partOfSpeech}
          </Typography>
        </Box>
      )}
      {difficulty && (
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
            {difficulty}/5
          </Typography>
        </Box>
      )}
    </Box>
  );
};
