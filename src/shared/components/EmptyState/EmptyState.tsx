import React from 'react';
import { Box, Typography } from '@mui/material';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon = <AlertCircle size={64} className="mx-auto text-gray-400" />,
}) => {
  return (
    <Box className="text-center py-12">
      <div className="mx-auto mb-4">{icon}</div>
      <Typography variant="h5" className="mb-2 font-medium">
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" className="mb-6">
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
};
