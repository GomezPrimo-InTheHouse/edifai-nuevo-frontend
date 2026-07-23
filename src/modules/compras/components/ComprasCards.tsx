import { Box, Paper, Typography, Chip, IconButton, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Eye, Pencil, MapPin, Calendar, Package } from 'lucide-react';
import type { Compra } from '../types/compra.types';

interface ComprasCardsProps {
  compras: Compra[];
  onView: (compra: Compra) => void;
  onEdit: (compra: Compra) => void;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

export function ComprasCards({ compras, onView, onEdit }: ComprasCardsProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {compras.map((compra) => (
        <Paper
          key={compra.id}
          sx={{
            p: 2.5, borderRadius: 3, boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ pr: 1 }}>
              {compra.descripcion}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
              <IconButton size="small" onClick={() => onView(compra)}>
                <Eye size={18} />
              </IconButton>
              <IconButton size="small" onClick={() => onEdit(compra)}>
                <Pencil size={18} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            {compra.material_id && (
              <Chip label={t('compras.tabla.material')} size="small" color="success" variant="outlined" />
            )}
            {compra.especialidad_nombre && (
              <Typography variant="caption" color="text.secondary">{compra.especialidad_nombre}</Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapPin size={14} color={theme.palette.text.secondary} />
              <Typography variant="body2" color="text.secondary">{compra.obra_nombre}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calendar size={14} color={theme.palette.text.secondary} />
              <Typography variant="body2" color="text.secondary">
                {new Date(compra.fecha).toLocaleDateString('es-AR')}
              </Typography>
            </Box>
            {compra.material_nombre && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Package size={14} color={theme.palette.text.secondary} />
                <Typography variant="body2" color="text.secondary">
                  {compra.material_nombre} — {compra.cantidad} u.
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{
            bgcolor: theme.palette.action.hover, px: 1.5, py: 1, borderRadius: 2,
            display: 'inline-block',
          }}>
            <Typography variant="body2" fontWeight={700} color="text.primary">
              {formatMoney(compra.monto)}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}