import React, { useState } from 'react';
import { Popover, Box, Typography, Divider, Switch } from '@mui/material';
import { Settings, Language, DarkMode, LightMode, Notifications, Dashboard, AttachMoney, OpenInNew } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../app/store/auth.store';
import { useGuardarPreferencias } from '../modules/configuracion/hooks/usePreferencias';
import type { UserPreferencias, Tema, Idioma, Moneda } from '../modules/configuracion/types/preferencias.types';

export const ConfiguracionPopover: React.FC = () => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();

  const preferencias = useAuthStore((s) => s.preferencias);
  const setPreferencias = useAuthStore((s) => s.setPreferencias);
  const { mutate: guardar } = useGuardarPreferencias();

  const open = Boolean(anchor);

  const update = (patch: Partial<UserPreferencias>) => {
    const updated = { ...preferencias, ...patch };
    setPreferencias(patch);
    guardar({ preferencias: updated });
  };

  // ── Estilos reutilizables ────────────────────────────────────
  const rowSx = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    px: 2, py: 0.75, cursor: 'default',
    '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
  };

  const labelSx = { fontSize: 13, color: '#0F172A', fontWeight: 500 };
  const subSx   = { fontSize: 11, color: '#94A3B8' };
  const sectionSx = {
    fontSize: 11, fontWeight: 700, color: '#94A3B8',
    letterSpacing: '0.06em', px: 2, pt: 1.25, pb: 0.5,
  };

  return (
    <>
      {/* Botón engranaje en el header */}
      <IconButton
        onClick={(e) => setAnchor(e.currentTarget)}
        size="small"
        sx={{
          width: 36, height: 36, borderRadius: 2,
          border: '0.5px solid',
          borderColor: open ? 'rgba(15,23,42,0.2)' : '#E2E8F0',
          bgcolor: open ? 'rgba(15,23,42,0.06)' : '#FFFFFF',
          color: open ? '#0F172A' : '#64748B',
          '&:hover': { bgcolor: 'rgba(15,23,42,0.05)', borderColor: 'rgba(15,23,42,0.2)' },
        }}
        aria-label="Configuración"
      >
        <Settings sx={{ fontSize: 17 }} />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 288, mt: 1, borderRadius: 3,
              border: '0.5px solid #E2E8F0',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            },
          },
        }}
      >

        {/* Header */}
        <Box sx={{ px: 2, pt: 1.75, pb: 1.25, borderBottom: '0.5px solid #E2E8F0' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
            Configuración
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#94A3B8', mt: 0.25 }}>
            Preferencias de tu cuenta
          </Typography>
        </Box>

        {/* ── SECCIÓN: Apariencia ── */}
        <Typography sx={sectionSx}>Apariencia</Typography>

        {/* Tema */}
        <Box sx={rowSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {preferencias.tema === 'dark'
              ? <DarkMode sx={{ fontSize: 16, color: '#94A3B8' }} />
              : <LightMode sx={{ fontSize: 16, color: '#94A3B8' }} />}
            <Typography sx={labelSx}>Tema</Typography>
          </Box>
          <PillGroup
            value={preferencias.tema}
            onChange={(v) => update({ tema: v as Tema })}
            options={[
              { value: 'light', label: 'Claro' },
              { value: 'dark',  label: 'Oscuro' },
            ]}
          />
        </Box>

        {/* Idioma */}
        <Box sx={rowSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Language sx={{ fontSize: 16, color: '#94A3B8' }} />
            <Typography sx={labelSx}>Idioma</Typography>
          </Box>
          <PillGroup
            value={preferencias.idioma}
            onChange={(v) => update({ idioma: v as Idioma })}
            options={[
              { value: 'es', label: 'ES' },
              { value: 'en', label: 'EN' },
              { value: 'br', label: 'BR' },
            ]}
          />
        </Box>

        <Divider sx={{ my: 0.5, borderColor: '#F1F5F9' }} />

        {/* ── SECCIÓN: Sistema ── */}
        <Typography sx={sectionSx}>Sistema</Typography>

        {/* Notificaciones */}
        <Box sx={rowSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Notifications sx={{ fontSize: 16, color: '#94A3B8' }} />
            <Box>
              <Typography sx={labelSx}>Notificaciones</Typography>
              <Typography sx={subSx}>Alertas en tiempo real</Typography>
            </Box>
          </Box>
          <Switch
            size="small"
            checked={preferencias.notificaciones}
            onChange={(e) => update({ notificaciones: e.target.checked })}
            sx={switchSx}
          />
        </Box>

        {/* Dashboard detallado */}
        <Box sx={rowSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Dashboard sx={{ fontSize: 16, color: '#94A3B8' }} />
            <Box>
              <Typography sx={labelSx}>Dashboard detallado</Typography>
              <Typography sx={subSx}>Vista expandida por defecto</Typography>
            </Box>
          </Box>
          <Switch
            size="small"
            checked={preferencias.dashboard_vista === 'detallado'}
            onChange={(e) => update({ dashboard_vista: e.target.checked ? 'detallado' : 'resumen' })}
            sx={switchSx}
          />
        </Box>

        {/* Moneda */}
        <Box sx={rowSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <AttachMoney sx={{ fontSize: 16, color: '#94A3B8' }} />
            <Typography sx={labelSx}>Moneda</Typography>
          </Box>
          <PillGroup
            value={preferencias.moneda}
            onChange={(v) => update({ moneda: v as Moneda })}
            options={[
              { value: 'ARS', label: 'ARS' },
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
            ]}
          />
        </Box>

        {/* Footer — link a configuración completa */}
        <Box
          onClick={() => { setAnchor(null); navigate('/configuracion'); }}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 2, py: 1.25, mt: 0.5,
            borderTop: '0.5px solid #F1F5F9',
            cursor: 'pointer', color: '#64748B',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.03)', color: '#0F172A' },
          }}
        >
          <OpenInNew sx={{ fontSize: 14 }} />
          <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
            Ver configuración completa
          </Typography>
        </Box>

      </Popover>
    </>
  );
};

// ── PillGroup helper ─────────────────────────────────────────
function PillGroup({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {options.map((o) => (
        <Box
          key={o.value}
          onClick={() => onChange(o.value)}
          sx={{
            fontSize: 11, px: 1, py: 0.4, borderRadius: 1.5,
            border: '0.5px solid',
            cursor: 'pointer', fontWeight: 500,
            borderColor: value === o.value ? '#0F172A' : '#E2E8F0',
            bgcolor:     value === o.value ? '#0F172A' : 'transparent',
            color:       value === o.value ? '#FFFFFF'  : '#64748B',
            '&:hover': {
              borderColor: '#0F172A',
              color: value === o.value ? '#FFFFFF' : '#0F172A',
            },
          }}
        >
          {o.label}
        </Box>
      ))}
    </Box>
  );
}

// ── Switch MUI override ──────────────────────────────────────
const switchSx = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: '#fff' },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#1D9E75' },
  '& .MuiSwitch-track': { bgcolor: '#CBD5E1' },
};