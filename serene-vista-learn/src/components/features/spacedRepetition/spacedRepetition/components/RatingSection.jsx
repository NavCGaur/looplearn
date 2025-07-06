import { Box, Typography, Button } from '@mui/material';

export const RatingSection = ({ word, rating, onRating, isMobile }) => {
  const handleRatingClick = (value) => (e) => {
    e.stopPropagation();
    onRating(word, value);
  };

  return (
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
            variant={rating === value ? 'contained' : 'outlined'}
            sx={{
              backgroundColor: rating === value ? '#176DC2' : 'transparent',
              color: rating === value ? 'white' : '#176DC2',
              borderColor: '#176DC2',
              '&:hover': {
                backgroundColor: rating === value ? '#145ca8' : 'rgba(23,109,194,0.1)'
              },
              textTransform: 'none',
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 },
              py: 1,
              borderRadius: '8px',
              minWidth: isMobile ? '100%' : '90px'
            }}
            onClick={handleRatingClick(value)}
          >
            {label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};