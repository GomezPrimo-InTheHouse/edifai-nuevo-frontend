import { useState } from 'react';
import {
  Avatar, Badge, Box, Chip, CircularProgress,
  Divider, Stack, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { MessageSquare } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { ChatTransaccion } from '../components/ChatTransaccion';
import { useInbox } from '../hooks/useInbox';
import { useAuthStore } from '../../../app/store/auth.store';
import type { Transaccion } from '../types/market.types';

export const InboxPage: React.FC = () => {
  const theme = useTheme();
//   const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data: conversaciones = [], isLoading } = useInbox();
  const [seleccionada, setSeleccionada] = useState<Transaccion | null>(null);

  const getInterlocutor = (tx: Transaccion) => {
    const esSoy = tx.comprador_id === user?.id;
    return {
      nombre: esSoy ? tx.vendedor_nombre : tx.comprador_nombre,
      email: esSoy ? tx.vendedor_email : tx.comprador_email,
      esComprador: esSoy,
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

  const ListaConversaciones = () => (
    <Box sx={{
      width: isMobile ? '100%' : 320,
      flexShrink: 0,
      borderRight: { md: `1px solid ${theme.palette.divider}` },
      height: { md: 'calc(100vh - 140px)' },
      overflowY: 'auto',
      bgcolor: 'background.paper',
      borderRadius: { xs: 3, md: '12px 0 0 12px' },
      border: `1px solid ${theme.palette.divider}`,
    }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="body2" fontWeight={700} color="text.secondary">
          CONVERSACIONES ({conversaciones.length})
        </Typography>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!isLoading && conversaciones.length === 0 && (
        <Box sx={{ py: 6, textAlign: 'center', px: 2 }}>
          <MessageSquare size={32} color={theme.palette.text.disabled} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No tenés conversaciones aún
          </Typography>
        </Box>
      )}

      {conversaciones.map((tx) => {
        const interlocutor = getInterlocutor(tx);
        const isSelected = seleccionada?.id === tx.id;
        const initials = interlocutor.nombre.slice(0, 2).toUpperCase();

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
                <Badge
                  badgeContent={Number(tx.mensajes_no_leidos)}
                  color="warning"
                  invisible={Number(tx.mensajes_no_leidos) === 0}
                >
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
                    <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
                      {interlocutor.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, ml: 1 }}>
                      {formatFecha(tx.ultimo_mensaje_at)}
                    </Typography>
                  </Stack>

                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {tx.nombre_material}
                  </Typography>

                  {tx.ultimo_mensaje && (
                    <Typography variant="caption" color="text.disabled" noWrap display="block">
                      {tx.ultimo_mensaje}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                    <Chip
                      label={tx.estado === 'confirmada' ? 'Confirmada' : tx.estado === 'cancelada' ? 'Cancelada' : 'Pendiente'}
                      size="small"
                      sx={{
                        height: 16, fontSize: 10,
                        bgcolor: tx.estado === 'confirmada'
                          ? 'rgba(22,163,74,0.12)'
                          : tx.estado === 'cancelada'
                            ? 'rgba(220,38,38,0.12)'
                            : 'rgba(245,158,11,0.12)',
                        color: tx.estado === 'confirmada'
                          ? '#16A34A'
                          : tx.estado === 'cancelada'
                            ? '#DC2626'
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
  );

  const PanelChat = () => (
    <Box sx={{
      flex: 1,
      height: { md: 'calc(100vh - 140px)' },
      border: { md: `1px solid ${theme.palette.divider}` },
      borderLeft: 'none',
      borderRadius: { xs: 3, md: '0 12px 12px 0' },
      overflow: 'hidden',
      bgcolor: 'background.paper',
    }}>
      {seleccionada ? (
        <ChatTransaccion
          transaccion_id={seleccionada.id}
          interlocutor_nombre={getInterlocutor(seleccionada).nombre}
        />
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
          <Box sx={{ height: 'calc(100vh - 140px)' }}>
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
        <Stack direction="row" sx={{ height: 'calc(100vh - 140px)' }}>
          <ListaConversaciones />
          <PanelChat />
        </Stack>
      )}
    </AppLayout>
  );
};