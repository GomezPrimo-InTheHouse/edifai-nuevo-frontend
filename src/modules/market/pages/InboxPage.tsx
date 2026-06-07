import { useState } from 'react';
import {
  Avatar, Badge, Box, Button, Chip, CircularProgress,
  Divider, Stack, Tab, Tabs, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { MessageSquare, Check, X } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { ChatTransaccion } from '../components/ChatTransaccion';
import { useInbox, useHistorialInbox } from '../hooks/useInbox';
import { useActualizarTransaccion } from '../hooks/useTransacciones';
import { useAuthStore } from '../../../app/store/auth.store';
import { useNotify } from '../../../shared/hooks/useNotify';
import type { Transaccion } from '../types/market.types';

export const InboxPage: React.FC = () => {
  const theme = useTheme();
  // const { t } = useTranslation();
  const notify = useNotify();
  const user = useAuthStore((s) => s.user);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [seleccionada, setSeleccionada] = useState<Transaccion | null>(null);
  const [tab, setTab] = useState(0);

  const { data: conversaciones = [], isLoading } = useInbox();
  const { data: historial = [], isLoading: isLoadingHistorial } = useHistorialInbox();
  const actualizarMutation = useActualizarTransaccion();

  const listaActual = tab === 0 ? conversaciones : historial;
  const isLoadingActual = tab === 0 ? isLoading : isLoadingHistorial;

  const getInterlocutor = (tx: Transaccion) => {
    const esSoyComprador = tx.comprador_id === user?.id;
    return {
      nombre: esSoyComprador ? tx.vendedor_nombre : tx.comprador_nombre,
      email: esSoyComprador ? tx.vendedor_email : tx.comprador_email,
    };
  };

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    const hoy = new Date();
    const esHoy = d.toDateString() === hoy.toDateString();
    return esHoy
      ? d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  };

  const handleAccion = async (tx: Transaccion, estado: 'confirmada' | 'cancelada') => {
    const esConfirmar = estado === 'confirmada';
    const confirmed = await notify.confirm({
      title: esConfirmar ? '¿Confirmar venta?' : '¿Cancelar transacción?',
      message: esConfirmar
        ? `Confirmás que recibiste el pago por "${tx.nombre_material}". Se descontará el stock y la conversación se archivará.`
        : `¿Cancelar la transacción de "${tx.nombre_material}"?`,
      confirmLabel: esConfirmar ? 'Confirmar venta' : 'Cancelar transacción',
      severity: esConfirmar ? 'warning' : 'error',
    });
    if (!confirmed) return;

    try {
      await actualizarMutation.mutateAsync({ id: tx.id, estado });
      notify.success(esConfirmar ? 'Venta confirmada y conversación archivada.' : 'Transacción cancelada.');
      if (seleccionada?.id === tx.id) setSeleccionada(null);
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'No se pudo procesar la acción.');
    }
  };

  const AccionesTx = ({ tx }: { tx: Transaccion }) => {
  if (tx.estado !== 'pendiente') return null;
  const esVendedor = tx.vendedor_id === user?.id;

  return (
    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
      {esVendedor && (
        <Button
          size="small"
          variant="contained"
          startIcon={<Check size={14} />}
          onClick={() => handleAccion(tx, 'confirmada')}
          disabled={actualizarMutation.isPending}
          sx={{ bgcolor: '#16A34A', color: '#fff', '&:hover': { bgcolor: '#15803D' }, flex: 1, borderRadius: 2 }}
        >
          Confirmar venta
        </Button>
      )}
      {esVendedor && (
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<X size={14} />}
          onClick={() => handleAccion(tx, 'cancelada')}
          disabled={actualizarMutation.isPending}
          sx={{ flex: 1, borderRadius: 2 }}
        >
          Cancelar
        </Button>
      )}
    </Stack>
  );
};

  const ListaConversaciones = () => (
    <Box sx={{
      width: isMobile ? '100%' : 320,
      flexShrink: 0,
      borderRight: { md: `1px solid ${theme.palette.divider}` },
      height: { md: 'calc(100vh - 160px)' },
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.paper',
      borderRadius: { xs: 3, md: '12px 0 0 12px' },
      border: `1px solid ${theme.palette.divider}`,
      overflow: 'hidden',
    }}>
      <Tabs
        value={tab}
        onChange={(_, v) => { setTab(v); setSeleccionada(null); }}
        sx={{ borderBottom: `1px solid ${theme.palette.divider}`, minHeight: 40 }}
        variant="fullWidth"
      >
        <Tab label={`Activas (${conversaciones.length})`} sx={{ fontSize: 12, minHeight: 40 }} />
        <Tab label={`Historial (${historial.length})`} sx={{ fontSize: 12, minHeight: 40 }} />
      </Tabs>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {isLoadingActual && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!isLoadingActual && listaActual.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center', px: 2 }}>
            <MessageSquare size={32} color={theme.palette.text.disabled} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {tab === 0 ? 'No tenés conversaciones activas' : 'Sin historial de conversaciones'}
            </Typography>
          </Box>
        )}

        {listaActual.map((tx) => {
          const interlocutor = getInterlocutor(tx);
          const isSelected = seleccionada?.id === tx.id;
          const initials = interlocutor.nombre.slice(0, 2).toUpperCase();
          const noLeidos = Number(tx.mensajes_no_leidos);

          return (
            <Box key={tx.id}>
              <Box
                onClick={() => setSeleccionada(tx)}
                sx={{
                  px: 2, py: 1.5,
                  cursor: 'pointer',
                  bgcolor: isSelected ? 'rgba(245,158,11,0.08)' : 'transparent',
                  borderLeft: isSelected ? '3px solid #F59E0B' : '3px solid transparent',
                  '&:hover': { bgcolor: isSelected ? 'rgba(245,158,11,0.08)' : theme.palette.action.hover },
                  transition: 'all 0.15s',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Badge badgeContent={noLeidos} color="warning" invisible={noLeidos === 0}>
                    <Avatar sx={{
                      width: 40, height: 40,
                      bgcolor: isSelected ? '#F59E0B' : theme.palette.action.hover,
                      color: isSelected ? '#0F172A' : theme.palette.text.primary,
                      fontSize: 14, fontWeight: 700,
                    }}>
                      {initials}
                    </Avatar>
                  </Badge>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={noLeidos > 0 ? 800 : 600} color="text.primary" noWrap>
                        {interlocutor.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, ml: 1 }}>
                        {formatFecha(tx.ultimo_mensaje_at)}
                      </Typography>
                    </Stack>

                    <Typography variant="caption" color="text.secondary" noWrap display="block" fontWeight={600}>
                      {tx.nombre_material}
                    </Typography>

                    {tx.ultimo_mensaje && (
                      <Typography variant="caption" color={noLeidos > 0 ? 'text.primary' : 'text.disabled'} noWrap display="block">
                        {tx.ultimo_mensaje}
                      </Typography>
                    )}

                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      <Chip
                        label={
                          tx.estado === 'confirmada' ? 'Confirmada'
                            : tx.estado === 'cancelada' ? 'Cancelada'
                              : 'Pendiente'
                        }
                        size="small"
                        sx={{
                          height: 16, fontSize: 10,
                          bgcolor: tx.estado === 'confirmada'
                            ? 'rgba(22,163,74,0.12)'
                            : tx.estado === 'cancelada'
                              ? 'rgba(220,38,38,0.12)'
                              : 'rgba(245,158,11,0.12)',
                          color: tx.estado === 'confirmada' ? '#16A34A'
                            : tx.estado === 'cancelada' ? '#DC2626'
                              : '#B45309',
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>
              </Box>
              <Divider />
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  const PanelChat = () => (
    <Box sx={{
      flex: 1,
      height: { md: 'calc(100vh - 160px)' },
      border: { md: `1px solid ${theme.palette.divider}` },
      borderLeft: { md: 'none' },
      borderRadius: { xs: 3, md: '0 12px 12px 0' },
      overflow: 'hidden',
      bgcolor: 'background.paper',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {seleccionada ? (
        <>
          {/* Info de la transacción + acciones */}
          <Box sx={{
            px: 2, py: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.action.hover,
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {getInterlocutor(seleccionada).nombre}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {seleccionada.nombre_material} — {Number(seleccionada.cantidad_comprada).toLocaleString('es-AR')} {seleccionada.unidad} —{' '}
                  <strong>${Number(seleccionada.total).toLocaleString('es-AR')}</strong>
                </Typography>
              </Box>
              <Chip
                label={
                  seleccionada.estado === 'confirmada' ? 'Confirmada'
                    : seleccionada.estado === 'cancelada' ? 'Cancelada'
                      : 'Pendiente'
                }
                size="small"
                sx={{
                  bgcolor: seleccionada.estado === 'confirmada'
                    ? 'rgba(22,163,74,0.12)'
                    : seleccionada.estado === 'cancelada'
                      ? 'rgba(220,38,38,0.12)'
                      : 'rgba(245,158,11,0.12)',
                  color: seleccionada.estado === 'confirmada' ? '#16A34A'
                    : seleccionada.estado === 'cancelada' ? '#DC2626'
                      : '#B45309',
                  fontWeight: 700,
                }}
              />
            </Stack>

            <AccionesTx tx={seleccionada} />
          </Box>

          <Box sx={{ flex: 1, overflow: 'hidden' }}>
<ChatTransaccion
  transaccion_id={seleccionada.id}
  interlocutor_nombre={getInterlocutor(seleccionada).nombre}
  es_comprador={seleccionada.comprador_id === user?.id}
  transaccion_estado={seleccionada.estado}
/>
          </Box>
        </>
      ) : (
        <Box sx={{
          height: '100%', display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 1,
        }}>
          <MessageSquare size={48} color={theme.palette.text.disabled} />
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            Seleccioná una conversación
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Tus mensajes del Market aparecen acá
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <AppLayout>
      <PageHeader
        title="Inbox"
        subtitle="Tus conversaciones del Market"
      />

      {isMobile ? (
        seleccionada ? (
          <Box sx={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
            <Box
              onClick={() => setSeleccionada(null)}
              sx={{ mb: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <Typography variant="body2" color="text.secondary">← Volver</Typography>
            </Box>
            <PanelChat />
          </Box>
        ) : (
          <ListaConversaciones />
        )
      ) : (
        <Stack direction="row" sx={{ height: 'calc(100vh - 160px)' }}>
          <ListaConversaciones />
          <PanelChat />
        </Stack>
      )}
    </AppLayout>
  );
};