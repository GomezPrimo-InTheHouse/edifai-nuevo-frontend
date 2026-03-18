import React from 'react';
import { Chip } from '@mui/material';

type StatusVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'default';

interface StatusChipProps {
  label: string;
  variant?: StatusVariant;
}

const colorMap = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  default: 'default',
} as const;

export const StatusChip: React.FC<StatusChipProps> = ({
  label,
  variant = 'default',
}) => {
  return (
    <Chip
      label={label}
      color={colorMap[variant]}
      size="small"
      variant="filled"
    />
  );
};