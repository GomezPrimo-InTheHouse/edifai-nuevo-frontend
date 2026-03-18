import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { XCircle } from 'lucide-react';

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
}) => {
  return (
    <Box className="text-center py-12">
      <XCircle size={64} className="mx-auto text-red-400 mb-4" />
      <Typography variant="h5" className="mb-2 font-medium text-gray-900">
        {title}
      </Typography>
      <Typography variant="body1" className="mb-6 text-gray-600">
        {message}
      </Typography>
      {onRetry && (
        <Button variant="contained" onClick={onRetry}>
          Intentar de nuevo
        </Button>
      )}
    </Box>
  );
};
