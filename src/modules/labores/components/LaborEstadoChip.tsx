import { Chip } from '@mui/material';

interface LaborEstadoChipProps {
  estadoNombre?: string;
}

const colorMap: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
  'En proceso': 'success',
  'Pausada': 'warning',
  'Cancelada': 'error',
  'Finalizada': 'default',
  'Pendiente': 'info',
};

export const LaborEstadoChip: React.FC<LaborEstadoChipProps> = ({ estadoNombre = 'Sin estado' }) => (
  <Chip
    label={estadoNombre}
    color={colorMap[estadoNombre] ?? 'default'}
    size="small"
    sx={{ fontWeight: 700, fontSize: 12 }}
  />
);