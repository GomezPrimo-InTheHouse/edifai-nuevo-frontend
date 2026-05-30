import React, { useState } from 'react';
import {
  Badge, Box, Button, CircularProgress, Divider,
  IconButton, Popover, Tab, Tabs, Tooltip, Typography,
  useTheme,
} from '@mui/material';
import {
  Bell, CheckCheck, LogIn, Hammer, DollarSign,
  Building2, User, ClipboardList, AlertTriangle, Info,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotificaciones } from '../shared/hooks/useNotificaciones';
import type { Notificacion } from '../services/api/notificaciones.api';

const TIPO_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  login:              { icon: <LogIn size={14} />,         color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
  labor_creada:       { icon: <Hammer size={14} />,        color: '#16A34A', bg: 'rgba(22,163,74,0.1)' },
  labor_modificada:   { icon: <Hammer size={14} />,        color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  pago_realizado:     { icon: <DollarSign size={14} />,    color: '#16A34A', bg: 'rgba(22,163,74,0.1)' },
  obra_creada:        { icon: <Building2 size={14} />,     color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  obra_modificada:    { icon: <Building2 size={14} />,     color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
  obra_archivada:     { icon: <Building2 size={14} />,     color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' },
  obra_desarchivada:  { icon: <Building2 size={14} />,     color: '#0891B2', bg: 'rgba(8,145,178,0.1)' },
  usuario_creado:     { icon: <User size={14} />,          color: '#16A34A', bg: 'rgba(22,163,74,0.1)' },
  usuario_modificado: { icon: <User size={14} />,          color: '#0891B2', bg: 'rgba(8,145,178,0.1)' },
  cambio_password:    { icon: <User size={14} />,          color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
  baja_usuario:       { icon: <User size={14} />,          color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
  presentismo:        { icon: <ClipboardList size={14} />, color: '#059669', bg: 'rgba(5,150,105,0.1)' },
  error_sistema:      { icon: <AlertTriangle size={14} />, color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
};

const DEFAULT_CONFIG = { icon: <Info size={14} />, color: '#64748B', bg: 'rgba(100,116,139,0.1)' };

function tiempoRelativo(fecha: string, t: any): string {
  const diff = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return t('notificaciones.ahora');
  if (min < 60) return t('notificaciones.hace_min', { min });
  const hs = Math.floor(min / 60);
  if (hs < 24) return t('notificaciones.hace_h', { hs });
  const dias = Math.floor(hs / 24);
  return t('notificaciones.hace_d', { dias });
}

const NotifItem: React.FC<{
  notif: Notificacion;
  onMarcarLeida: (id: number) => void;
}> = ({ notif, onMarcarLeida }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const config = TIPO_CONFIG[notif.tipo] ?? DEFAULT_CONFIG;

  return (
    <Box
      sx={{
        px: 2, py: 1.5,
        display: 'flex', gap: 1.5, alignItems: 'flex-start',
        bgcolor: notif.leida ? 'transparent' : 'rgba(245,158,11,0.04)',
        borderLeft: notif.leida ? '3px solid transparent' : '3px solid #F59E0B',
        cursor: notif.leida ? 'default' : 'pointer',
        transition: 'background 0.15s',
        '&:hover': { bgcolor: theme.palette.action.hover },
      }}
      onClick={() => !notif.leida && onMarcarLeida(notif.id)}
    >
      <Box sx={{
        width: 32, height: 32, borderRadius: '50%',
        bgcolor: config.bg, color: config.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {config.icon}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, color: 'text.primary', lineHeight: 1.4 }}>
          {notif.mensaje}
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.25 }}>
          {tiempoRelativo(notif.created_at, t)}
        </Typography>
      </Box>

      {!notif.leida && (
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B', flexShrink: 0, mt: 0.5 }} />
      )}
    </Box>
  );
};

export const NotificacionesPopover: React.FC = () => {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const { t } = useTranslation();
  const { notificaciones, noLeidas, loading, marcarLeida, marcarTodasLeidas } = useNotificaciones();

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);

  const sinLeer = notificaciones.filter((n) => !n.leida);
  const todas = notificaciones;
  const listaActual = tab === 0 ? sinLeer : todas;

  return (
    <>
      <Tooltip title={t('notificaciones.titulo')}>
        <IconButton
          onClick={handleOpen}
          sx={{
            mr: 1,
            width: 36, height: 36, borderRadius: 2,
            border: `0.5px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: theme.palette.action.hover },
          }}
        >
          <Badge badgeContent={noLeidas > 0 ? noLeidas : undefined} color="warning">
            <Bell size={18} color={theme.palette.text.secondary} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1, width: 360, borderRadius: 3,
              border: `0.5px solid ${theme.palette.divider}`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        {/* Header */}
        <Box sx={{
          px: 2, pt: 1.75, pb: 1.25,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `0.5px solid ${theme.palette.divider}`,
        }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>
            {t('notificaciones.titulo')}
          </Typography>
          {noLeidas > 0 && (
            <Button
              size="small"
              startIcon={<CheckCheck size={14} />}
              onClick={marcarTodasLeidas}
              sx={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}
            >
              {t('notificaciones.marcar_todas')}
            </Button>
          )}
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 2, minHeight: 36,
            '& .MuiTab-root': { minHeight: 36, fontSize: 12, fontWeight: 600, px: 1 },
          }}
        >
          <Tab label={`${t('notificaciones.sin_leer')}${noLeidas > 0 ? ` (${noLeidas})` : ''}`} />
          <Tab label={`${t('notificaciones.todas')}${todas.length > 0 ? ` (${todas.length})` : ''}`} />
        </Tabs>

        <Divider />

        {/* Lista */}
        <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!loading && listaActual.length === 0 && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Bell size={32} color={theme.palette.text.disabled} />
              <Typography sx={{ fontSize: 13, color: 'text.disabled', mt: 1 }}>
                {tab === 0 ? t('notificaciones.empty_sin_leer') : t('notificaciones.empty_todas')}
              </Typography>
            </Box>
          )}

          {!loading && listaActual.map((n, i) => (
            <React.Fragment key={n.id}>
              <NotifItem notif={n} onMarcarLeida={marcarLeida} />
              {i < listaActual.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Box>
      </Popover>
    </>
  );
};