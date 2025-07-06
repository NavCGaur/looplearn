import { Box, Typography } from '@mui/material';

export const InfoPanel = ({ title, content, color = '#176DC2', fontFamily }) => {
  return (
    <Box sx={{ 
      backgroundColor: '#f9fafb', 
      p: { xs: 1.5, sm: 2, md: 2.5 }, 
      borderRadius: '12px',
      borderLeft: `4px solid ${color}`
    }}>
      <Typography variant="h6" sx={{ 
        fontWeight: '600', 
        color: color,
        fontSize: '0.875rem',
        mb: 1,
        ...(fontFamily && { fontFamily }),
      }}>
        {title}
      </Typography>
      <Typography sx={{ 
        color: 'text.primary', 
        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
        lineHeight: 1.6,
        textAlign: 'left',
        letterSpacing: '0.3px',
        ...(fontFamily && { fontFamily }),
        ...(typeof content === 'string' && content.startsWith('"') && { fontStyle: 'italic' })
      }}>
        {content}  
      </Typography>
    </Box>
  );
};
