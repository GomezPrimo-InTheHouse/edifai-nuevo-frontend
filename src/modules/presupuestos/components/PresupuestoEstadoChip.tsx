import React from 'react';
import { Chip } from '@mui/material';

interface Props { estadoNombre?: string; }

const colorMap: Record<string, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  'Borrador': 'default',
  'En revisión': 'info',
  'Confirmado': 'success',
  'Cancelado': 'error',
};

export const PresupuestoEstadoChip: React.FC<Props> = ({ estadoNombre = 'Sin estado' }) => (
  <Chip
    label={estadoNombre}
    color={colorMap[estadoNombre] ?? 'default'}
    size="small"
    sx={{ fontWeight: 700, fontSize: 12 }}
  />
);