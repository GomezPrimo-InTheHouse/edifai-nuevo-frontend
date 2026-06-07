import {
  Box, Button, Card, CardContent, Chip,
  Stack, Typography, useTheme,
} from '@mui/material';
import { ShoppingCart, User, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Publicacion } from '../types/market.types';
import { useAuthStore } from '../../../app/store/auth.store';

interface Props {
  publicacion: Publicacion;
  onComprar: (publicacion: Publicacion) => void;
  yaTieneSolicitud?: boolean;
}

export const PublicacionCard: React.FC<Props> = ({ publicacion, onComprar, yaTieneSolicitud = false }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const esMia = publicacion.vendedor_id === user?.id;

  return (
    <Card sx={{
      borderRadius: 3, height: '100%',
      bgcolor: 'background.paper',
      border: `1px solid ${yaTieneSolicitud ? '#F59E0B' : theme.palette.divider}`,
      boxShadow: 'none',
      transition: 'border-color 0.2s',
      '&:hover': { borderColor: '#F59E0B' },
    }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ flex: 1, pr: 1 }}>
            {publicacion.nombre_material}
          </Typography>
          <Chip
            label={publicacion.moneda}
            size="small"
            sx={{ bgcolor: 'rgba(245,158,11,0.12)', color: '#B45309', fontWeight: 700, fontSize: 11 }}
          />
        </Stack>

        {/* Descripcion */}
        {publicacion.descripcion && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {publicacion.descripcion}
          </Typography>
        )}

        {/* Info */}
        <Stack spacing={1} sx={{ flex: 1, mb: 2 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">{t('market.card.cantidad')}</Typography>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {Number(publicacion.cantidad).toLocaleString('es-AR')} {publicacion.unidad}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">{t('market.card.precio')}</Typography>
            <Typography variant="body2" fontWeight={700} sx={{ color: '#F59E0B' }}>
              ${Number(publicacion.precio_unitario).toLocaleString('es-AR')} / {publicacion.unidad}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">{t('market.card.total')}</Typography>
            <Typography variant="body2" fontWeight={700} color="text.primary">
              ${(Number(publicacion.cantidad) * Number(publicacion.precio_unitario)).toLocaleString('es-AR')}
            </Typography>
          </Stack>
        </Stack>

        {/* Vendedor */}
        <Box sx={{
          p: 1.5, borderRadius: 2,
          bgcolor: theme.palette.action.hover,
          border: `1px solid ${theme.palette.divider}`,
          mb: 2,
        }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <User size={14} color={theme.palette.text.disabled} />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('market.card.vendedor')}
              </Typography>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {publicacion.vendedor_nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {publicacion.vendedor_email}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Accion */}
        {!esMia && (
          <>
            {yaTieneSolicitud ? (
              <Box sx={{
                p: 1.5, borderRadius: 2, textAlign: 'center',
                bgcolor: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.3)',
              }}>
                <Stack direction="row" alignItems="center" justifyContent="center" gap={1}>
                  <Clock size={14} color="#B45309" />
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#B45309' }}>
                    Solicitud enviada
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Revisá tu inbox para ver el estado
                </Typography>
              </Box>
            ) : (
              <Button
                fullWidth
                variant="contained"
                startIcon={<ShoppingCart size={16} />}
                onClick={() => onComprar(publicacion)}
                sx={{ bgcolor: '#F59E0B', color: '#0F172A', '&:hover': { bgcolor: '#D97706' }, borderRadius: 2 }}
              >
                Enviar solicitud de compra
              </Button>
            )}
          </>
        )}

        {esMia && (
          <Chip
            label="Tu publicación"
            size="small"
            sx={{ alignSelf: 'center', bgcolor: theme.palette.action.hover, color: 'text.secondary' }}
          />
        )}
      </CardContent>
    </Card>
  );
};