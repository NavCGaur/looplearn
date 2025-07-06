import { Typography } from '@mui/material';

export const StatusMessage = ({ success = true, message }) => {
  return (
    <Typography sx={{ 
      color: success ? '#4CAF50' : 'error.main', 
      fontSize: { xs: "1rem", sm: "1.25rem" }, 
      fontWeight: success ? "bold" : "normal",
      textAlign: 'center',
      width: '100%',
      px: 2
    }}>
      {message}
    </Typography>
  );
};
