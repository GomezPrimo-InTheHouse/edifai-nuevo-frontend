import { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip,
  Grid, Stack, Tab, Tabs, Typography, useTheme,
} from '@mui/material';
import { ArrowLeft, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { TransaccionModal } from '../components/TransaccionModal';
import { useMisPublicaciones } from '../hooks/useMisPublicaciones';
import { useCancelarPublicacion } from '../hooks/usePublicarMaterial';
import { useTransacciones } from '../hooks/useTransacciones';
import { useNotify } from '../../../shared/hooks/useNotify';
import type { Transaccion } from '../types/market.types';

export const MisPublicacionesPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [tab, setTab] = useState(0);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState<Transaccion | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const { data: publicaciones = [], isLoading, isError, refetch } = useMisPublicaciones();
  const { data: transacciones = [] } = useTransacciones();
  const cancelarMutation = useCancelarPublicacion();

  const activas = publicaciones.filter((p) => p.estado === 'activa');
  const historial = publicaciones.filter((p) => p.estado !== 'activa');

  const handleCancelar = async (id: number) => {
    try {
      await cancelarMutation.mutateAsync(id);
      notify.success(t('market.notify.cancelado'));
    } catch (error: any) {
      notify.error(error?.response?.data?.message || t('market.notify.error_cancelar'));
    }
  };

  const handleVerChat = (transaccion: Transaccion) => {
    setTransaccionSeleccionada(transaccion);
    setChatOpen(true);
  };

  if (isLoading) return <AppLayout><LoadingState message={t('market.loading')} /></AppLayout>;
  if (isError) return <AppLayout><ErrorState title="Error" message={t('market.error')} onRetry={refetch} /></AppLayout>;

  const renderPublicacion = (pub: typeof publicaciones[0]) => {
    const txDeEstaPub = transacciones.filter((tx) => tx.publicacion_id === pub.id);

    return (
      <Card key={pub.id} sx={{
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
      }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {pub.nombre_material}
              </Typography>
              {pub.descripcion && (
                <Typography variant="body2" color="text.secondary">{pub.descripcion}</Typography>
              )}
            </Box>
            <Chip
              label={t(`market.estados.${pub.estado}`)}
              size="small"
              sx={{
                bgcolor: pub.estado === 'activa'
                  ? 'rgba(22,163,74,0.12)'
                  : pub.estado === 'vendida'
                    ? 'rgba(37,99,235,0.12)'
                    : 'rgba(220,38,38,0.12)',
                color: pub.estado === 'activa'
                  ? '#16A34A'
                  : pub.estado === 'vendida'
                    ? '#2563EB'
                    : '#DC2626',
                fontWeight: 700,
              }}
            />
          </Stack>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary" display="block">{t('market.card.cantidad')}</Typography>
              <Typography variant="body2" fontWeight={700} color="text.primary">
                {Number(pub.cantidad).toLocaleString('es-AR')} {pub.unidad}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary" display="block">{t('market.card.precio')}</Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: '#F59E0B' }}>
                ${Number(pub.precio_unitario).toLocaleString('es-AR')} {pub.moneda}
              </Typography>
            </Grid>
          </Grid>

          {/* Transacciones vinculadas */}
          {txDeEstaPub.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 1 }}>
                INTERESADOS
              </Typography>
              <Stack spacing={1}>
                {txDeEstaPub.map((tx) => (
                  <Box key={tx.id} sx={{
                    p: 1.5, borderRadius: 2,
                    bgcolor: theme.palette.action.hover,
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{tx.comprador_nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Number(tx.cantidad_comprada).toLocaleString('es-AR')} {tx.unidad} — ${Number(tx.total).toLocaleString('es-AR')}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {tx.mensajes_no_leidos > 0 && (
                        <Chip
                          label={tx.mensajes_no_leidos}
                          size="small"
                          sx={{ bgcolor: '#F59E0B', color: '#0F172A', fontWeight: 800, minWidth: 24 }}
                        />
                      )}
                      <Button size="small" variant="outlined" onClick={() => handleVerChat(tx)}>
                        Chat
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {pub.estado === 'activa' && (
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<X size={16} />}
              onClick={() => handleCancelar(pub.id)}
              disabled={cancelarMutation.isPending}
            >
              {t('market.publicacion.cancelar_pub')}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <PageHeader
        title={t('market.mis_pubs.title')}
        subtitle={t('market.mis_pubs.subtitle')}
        actions={
          <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/market')}>
            {t('materiales.acciones.volver')}
          </Button>
        }
      />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: `1px solid ${theme.palette.divider}` }}
      >
        <Tab label={`${t('market.mis_pubs.activas')} (${activas.length})`} />
        <Tab label={`${t('market.mis_pubs.historial')} (${historial.length})`} />
      </Tabs>

      {tab === 0 && (
        activas.length === 0
          ? <Typography color="text.secondary">{t('market.mis_pubs.empty')}</Typography>
          : <Stack spacing={2}>{activas.map(renderPublicacion)}</Stack>
      )}

      {tab === 1 && (
        historial.length === 0
          ? <Typography color="text.secondary">{t('market.mis_pubs.empty_historial')}</Typography>
          : <Stack spacing={2}>{historial.map(renderPublicacion)}</Stack>
      )}

      <TransaccionModal
        open={chatOpen}
        onClose={() => { setChatOpen(false); setTransaccionSeleccionada(null); }}
        transaccion={transaccionSeleccionada}
      />
    </AppLayout>
  );
};