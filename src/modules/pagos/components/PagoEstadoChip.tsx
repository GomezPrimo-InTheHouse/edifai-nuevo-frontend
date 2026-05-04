import React from 'react';
import { Chip } from '@mui/material';

const colorMap: Record<string, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  'Pendiente': 'warning',
  'Pagado': 'success',
  'Parcial': 'info',
  'Cancelado': 'error',
};

export const PagoEstadoChip: React.FC<{ estado?: string }> = ({ estado = 'Pendiente' }) => (
  <Chip label={estado} color={colorMap[estado] ?? 'default'} size="small" sx={{ fontWeight: 700, fontSize: 12 }} />
);