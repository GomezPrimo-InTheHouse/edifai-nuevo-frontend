import React from 'react';
import { Chip } from '@mui/material';

const colorMap: Record<string, 'success' | 'error' | 'default'> = {
  'activo': 'success',
  'inactivo': 'error',
};

export const UsuarioEstadoChip: React.FC<{ estado?: string | null }> = ({ estado }) => {
  const label = estado ?? 'Sin estado';
  const color = colorMap[label.toLowerCase()] ?? 'default';
  return <Chip label={label} color={color} size="small" sx={{ fontWeight: 700, fontSize: 12 }} />;
};