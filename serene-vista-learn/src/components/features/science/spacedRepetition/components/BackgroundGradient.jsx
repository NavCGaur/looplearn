import { Box } from '@mui/material';

export const BackgroundGradient = () => {
  return (
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
  );
};