import { Button } from '@mui/material';

export const ActionButton = ({ 
  onClick, 
  disabled = false, 
  isLoading = false, 
  isNext = true, 
  isMobile = false 
}) => {
  const isSubmit = !isNext;
  
  return (
    <Button
      variant="contained"
      sx={{
        backgroundColor: isSubmit ? '#4CAF50' : '#176DC2',
        color: 'white',
        '&:hover': {
          backgroundColor: isSubmit ? '#3d8b40' : '#145ca8'
        },
        textTransform: 'none',
        px: { xs: 2, sm: 3 },
        py: { xs: 1, sm: 1.5 },
        borderRadius: '8px',
        boxShadow: 'none',
        width: isMobile ? '90%' : 'auto'
      }}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? 'Submitting...' : isNext ? 'Next' : 'Finish & Submit'}
    </Button>
  );
};
