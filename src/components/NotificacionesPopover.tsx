

import React, { useState } from 'react';
import {
  Badge, Box, Button, CircularProgress, Divider,
  IconButton, Popover, Tab, Tabs, Tooltip, Typography,
} from '@mui/material';
import {
  Bell, CheckCheck, LogIn, Hammer, DollarSign,
  Building2, User, ClipboardList, AlertTriangle, Info,
} from 'lucide-react';
import { useNotificaciones } from '../shared/hooks/useNotificaciones';
import type { Notificacion } from '../services/api/notificaciones.api';

const TIPO_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  login:              { icon: <LogIn size={14} />,         color: '#2563EB', bg: '#EFF6FF' },
  labor_creada:       { icon: <Hammer size={14} />,        color: '#16A34A', bg: '#F0FDF4' },
  labor_modificada:   { icon: <Hammer size={14} />,        color: '#F59E0B', bg: '#FFFBEB' },
  pago_realizado:     { icon: <DollarSign size={14} />,    color: '#16A34A', bg: '#F0FDF4' },
  obra_creada:        { icon: <Building2 size={14} />,     color: '#7C3AED', bg: '#F5F3FF' },
  obra_modificada:    { icon: <Building2 size={14} />,     color: '#D97706', bg: '#FFFBEB' },
  obra_archivada:     { icon: <Building2 size={14} />,     color: '#94A3B8', bg: '#F8FAFC' },
  obra_desarchivada:  { icon: <Building2 size={14} />,     color: '#0891B2', bg: '#ECFEFF' },
  usuario_creado:     { icon: <User size={14} />,          color: '#16A34A', bg: '#F0FDF4' },
  usuario_modificado: { icon: <User size={14} />,          color: '#0891B2', bg: '#ECFEFF' },
  cambio_password:    { icon: <User size={14} />,          color: '#DC2626', bg: '#FEF2F2' },
  baja_usuario:       { icon: <User size={14} />,          color: '#DC2626', bg: '#FEF2F2' },
  presentismo:        { icon: <ClipboardList size={14} />, color: '#059669', bg: '#ECFDF5' },
  error_sistema:      { icon: <AlertTriangle size={14} />, color: '#DC2626', bg: '#FEF2F2' },
};

const DEFAULT_CONFIG = { icon: <Info size={14} />, color: '#64748B', bg: '#F8FAFC' };

function tiempoRelativo(fecha: string): string {
  const diff = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const hs = Math.floor(min / 60);
  if (hs < 24) return `hace ${hs}h`;
  const dias = Math.floor(hs / 24);
  return `hace ${dias}d`;
}

const NotifItem: React.FC<{
  notif: Notificacion;
  onMarcarLeida: (id: number) => void;
}> = ({ notif, onMarcarLeida }) => {
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
        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
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
        <Typography sx={{ fontSize: 13, color: '#1E293B', lineHeight: 1.4 }}>
          {notif.mensaje}
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#94A3B8', mt: 0.25 }}>
          {tiempoRelativo(notif.created_at)}
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
  const { notificaciones, noLeidas, loading, marcarLeida, marcarTodasLeidas } = useNotificaciones();

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);

  const sinLeer = notificaciones.filter((n) => !n.leida);
  const todas = notificaciones;
  const listaActual = tab === 0 ? sinLeer : todas;

  return (
    <>
      <Tooltip title="Notificaciones">
        <IconButton
          onClick={handleOpen}
          sx={{ mr: 1, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}
        >
          <Badge badgeContent={noLeidas > 0 ? noLeidas : undefined} color="warning">
            <Bell size={20} color="#334155" />
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
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
              overflow: 'hidden',
            },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, pt: 1.5, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
            Notificaciones
          </Typography>
          {noLeidas > 0 && (
            <Button
              size="small"
              startIcon={<CheckCheck size={14} />}
              onClick={marcarTodasLeidas}
              sx={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}
            >
              Marcar todas
            </Button>
          )}
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ px: 2, minHeight: 36, '& .MuiTab-root': { minHeight: 36, fontSize: 12, fontWeight: 600, px: 1 } }}
        >
          <Tab label={`Sin leer${noLeidas > 0 ? ` (${noLeidas})` : ''}`} />
          <Tab label={`Todas${todas.length > 0 ? ` (${todas.length})` : ''}`} />
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
              <Bell size={32} color="#CBD5E1" />
              <Typography sx={{ fontSize: 13, color: '#94A3B8', mt: 1 }}>
                {tab === 0 ? 'No tenés notificaciones sin leer' : 'No hay notificaciones'}
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