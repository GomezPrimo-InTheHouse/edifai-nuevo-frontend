import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Cargando...' }) => {
  return (
    <Box className="flex flex-col items-center justify-center py-12">
      <CircularProgress size={48} className="mb-4" />
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
};
