
import { Box, Paper, Typography, Chip, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
import type { Compra } from '../types/compra.types';

interface ComprasCardsProps {
  compras: Compra[];
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export function ComprasCards({ compras }: ComprasCardsProps) {
  const theme = useTheme();
//   const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {compras.map((compra) => (
        <Paper
          key={compra.id}
          onClick={() => navigate(`/compras/${compra.id}`)}
          sx={{
            p: 2, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none', borderRadius: 3, cursor: 'pointer',
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>{compra.descripcion}</Typography>
          <Typography variant="body2" color="text.secondary">
            {compra.obra_nombre} · {new Date(compra.fecha).toLocaleDateString('es-AR')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {compra.especialidad_nombre}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>{formatMoney(compra.monto)}</Typography>
            {compra.material_id && <Chip size="small" label={compra.material_nombre} />}
          </Box>
        </Paper>
      ))}
    </Box>
  );
}