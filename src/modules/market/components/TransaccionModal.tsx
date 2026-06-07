import {
  Box, Button, Chip, Dialog, DialogContent,
  Divider, Grid, InputAdornment, Stack,
  TextField, Typography, useTheme,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIniciarTransaccion } from '../hooks/useTransacciones';
import { ChatTransaccion } from './ChatTransaccion';
import { useNotify } from '../../../shared/hooks/useNotify';
import { useAuthStore } from '../../../app/store/auth.store';
import type { Publicacion, Transaccion } from '../types/market.types';

interface Props {
  open: boolean;
  onClose: () => void;
  publicacion?: Publicacion | null;
  transaccion?: Transaccion | null;
}

export const TransaccionModal: React.FC<Props> = ({ open, onClose, publicacion, transaccion }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const notify = useNotify();
  const user = useAuthStore((s) => s.user);
  const [cantidad, setCantidad] = useState<number>(1);
  const iniciarMutation = useIniciarTransaccion();

  const esNuevaCompra = Boolean(publicacion) && !transaccion;

  // ← fix: parsear cantidad como número explícitamente
  const cantidadMaxima = publicacion ? Number(publicacion.cantidad) : 0;
  const cantidadValida = cantidad > 0 && cantidad <= cantidadMaxima;

  const total = publicacion
    ? (cantidad * Number(publicacion.precio_unitario)).toLocaleString('es-AR')
    : '0';

  const interlocutorNombre = transaccion
    ? (transaccion.comprador_id === user?.id
      ? transaccion.vendedor_nombre
      : transaccion.comprador_nombre)
    : publicacion?.vendedor_nombre ?? '';

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) setCantidad(val);
  };

  const handleComprar = async () => {
    if (!publicacion || !cantidadValida) return;
    try {
      await iniciarMutation.mutateAsync({ publicacion_id: publicacion.id, cantidad_comprada: cantidad });
      notify.success(t('market.notify.transaccion_iniciada'));
      onClose();
    } catch (error: any) {
      notify.error(error?.response?.data?.message || t('market.notify.error_transaccion'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}>
      <DialogContent sx={{ p: 0 }}>
        <Grid container sx={{ height: { md: 520 } }}>

          {/* Panel izquierdo */}
          <Grid size={{ xs: 12, md: 5 }} sx={{
            p: 3,
            borderRight: { md: `1px solid ${theme.palette.divider}` },
            borderBottom: { xs: `1px solid ${theme.palette.divider}`, md: 'none' },
          }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              {t('market.transaccion.title')}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {(publicacion || transaccion) && (
              <Stack spacing={1.5}>
                <Typography variant="body1" fontWeight={700} color="text.primary">
                  {publicacion?.nombre_material ?? transaccion?.nombre_material}
                </Typography>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">{t('market.card.precio')}</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#F59E0B' }}>
                    ${Number(publicacion?.precio_unitario ?? transaccion?.precio_unitario).toLocaleString('es-AR')}
                    {' '}/{' '}{publicacion?.unidad ?? transaccion?.unidad}
                  </Typography>
                </Stack>

                {transaccion && (
                  <>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">{t('market.transaccion.vendedor')}</Typography>
                      <Typography variant="body2" fontWeight={600}>{transaccion.vendedor_nombre}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">{t('market.transaccion.comprador')}</Typography>
                      <Typography variant="body2" fontWeight={600}>{transaccion.comprador_nombre}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Estado</Typography>
                      <Chip
                        label={t(`market.transaccion.${transaccion.estado}`)}
                        size="small"
                        sx={{
                          bgcolor: transaccion.estado === 'confirmada'
                            ? 'rgba(22,163,74,0.12)'
                            : transaccion.estado === 'cancelada'
                              ? 'rgba(220,38,38,0.12)'
                              : 'rgba(245,158,11,0.12)',
                          color: transaccion.estado === 'confirmada'
                            ? '#16A34A'
                            : transaccion.estado === 'cancelada'
                              ? '#DC2626'
                              : '#B45309',
                          fontWeight: 700,
                        }}
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">{t('market.transaccion.total')}</Typography>
                      <Typography variant="body2" fontWeight={800} sx={{ color: '#F59E0B' }}>
                        ${Number(transaccion.total).toLocaleString('es-AR')} {transaccion.moneda}
                      </Typography>
                    </Stack>
                  </>
                )}

                {esNuevaCompra && publicacion && (
                  <>
                    <TextField
                      label={t('market.transaccion.cantidad_comprar')}
                      type="number"
                      size="small"
                      value={cantidad}
                      onChange={handleCantidadChange}
                      inputProps={{ min: 0.01, max: cantidadMaxima, step: 0.01 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">{publicacion.unidad}</InputAdornment>
                      }}
                      helperText={`Máximo disponible: ${cantidadMaxima} ${publicacion.unidad}`}
                      error={cantidad > cantidadMaxima || cantidad <= 0}
                    />
                    <Box sx={{
                      p: 1.5, borderRadius: 2,
                      bgcolor: 'rgba(245,158,11,0.08)',
                      border: '1px solid rgba(245,158,11,0.2)',
                    }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">{t('market.transaccion.total')}</Typography>
                        <Typography variant="h6" fontWeight={800} sx={{ color: '#F59E0B' }}>${total}</Typography>
                      </Stack>
                    </Box>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleComprar}
                      disabled={iniciarMutation.isPending || !cantidadValida}
                      sx={{ bgcolor: '#F59E0B', color: '#0F172A', '&:hover': { bgcolor: '#D97706' }, borderRadius: 2 }}
                    >
                      {t('market.transaccion.confirmar')}
                    </Button>
                    <Button fullWidth variant="outlined" onClick={onClose}>
                      {t('market.transaccion.cancelar')}
                    </Button>
                  </>
                )}
              </Stack>
            )}
          </Grid>

          {/* Panel derecho — chat */}
          <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex', flexDirection: 'column', height: { md: 520 } }}>
            {transaccion ? (
              <ChatTransaccion
                transaccion_id={transaccion.id}
                interlocutor_nombre={interlocutorNombre}
                es_comprador={transaccion.comprador_id === user?.id}
                transaccion_estado={transaccion.estado}
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  El chat estará disponible una vez iniciada la transacción.
                </Typography>
              </Box>
            )}
          </Grid>

        </Grid>
      </DialogContent>
    </Dialog>
  );
};