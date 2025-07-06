import { Typography } from '@mui/material';

export const CardProgressIndicator = ({ current, total }) => {
  return (
    <Typography variant="subtitle1" sx={{ color: '#6b7280', fontWeight: 600 }}>
      🌟 Word {current} of {total}
    </Typography>
  );
};