import { Chip } from '@mui/material';

interface Props {
  estadoId?: number | null;
}

export function ClienteEstadoChip({ estadoId }: Props) {
  const activo = estadoId === 1 || estadoId == null;
  return (
    <Chip
      label={activo ? 'Activo' : 'Inactivo'}
      size="small"
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        bgcolor: activo ? '#DCFCE7' : '#FEE2E2',
        color:   activo ? '#15803D' : '#DC2626',
      }}
    />
  );
}