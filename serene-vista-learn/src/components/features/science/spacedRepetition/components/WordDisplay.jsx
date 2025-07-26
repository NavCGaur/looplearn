import { Box, Typography } from '@mui/material';
import { AudioButton } from './AudioButton';

export const WordDisplay = ({ word, pronunciationUrl, isMobile }) => {
  return (
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
        {word}
      </Typography>
      {pronunciationUrl && (
        <AudioButton url={pronunciationUrl} size={isMobile ? 20 : 24} />
      )}
    </Box>
  );
};