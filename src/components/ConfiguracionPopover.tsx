
import React, { useState } from 'react';
import { Popover, Box, Typography, Divider, Switch } from '@mui/material';
import { Settings, Language, DarkMode, LightMode, Notifications, Dashboard, AttachMoney, OpenInNew } from '@mui/icons-material';
import { IconButton, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../app/store/auth.store';
import { useGuardarPreferencias } from '../modules/configuracion/hooks/usePreferencias';
import type { UserPreferencias, Tema, Idioma, Moneda } from '../modules/configuracion/types/preferencias.types';

export const ConfiguracionPopover: React.FC = () => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();

  const preferencias = useAuthStore((s) => s.preferencias);
  const setPreferencias = useAuthStore((s) => s.setPreferencias);
  const { mutate: guardar } = useGuardarPreferencias();

  const open = Boolean(anchor);

  const update = (patch: Partial<UserPreferencias>) => {
    console.log('🔧 Actualizando preferencias:', patch);
    const updated = { ...preferencias, ...patch };
    setPreferencias(patch);
    guardar({ preferencias: updated });
  };

  const rowSx = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    px: 2, py: 0.75, cursor: 'default',
    '&:hover': { bgcolor: theme.palette.action.hover },
  };

  const labelSx = { fontSize: 13, color: 'text.primary', fontWeight: 500 };
  const subSx   = { fontSize: 11, color: 'text.disabled' };
  const sectionSx = {
    fontSize: 11, fontWeight: 700, color: 'text.disabled',
    letterSpacing: '0.06em', px: 2, pt: 1.25, pb: 0.5,
  };

  return (
    <>
      <IconButton
        onClick={(e) => setAnchor(e.currentTarget)}
        size="small"
        sx={{
          width: 36, height: 36, borderRadius: 2,
          border: '0.5px solid',
          borderColor: open ? theme.palette.divider : theme.palette.divider,
          bgcolor: open ? theme.palette.action.selected : 'background.paper',
          color: open ? 'text.primary' : 'text.secondary',
          '&:hover': { bgcolor: theme.palette.action.hover, borderColor: theme.palette.divider },
        }}
        aria-label={t('config.titulo')}
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
              border: `0.5px solid ${theme.palette.divider}`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, pt: 1.75, pb: 1.25, borderBottom: `0.5px solid ${theme.palette.divider}` }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>
            {t('config.titulo')}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.25 }}>
            {t('config.subtitulo')}
          </Typography>
        </Box>

        {/* Apariencia */}
        <Typography sx={sectionSx}>{t('config.apariencia')}</Typography>

        <Box sx={rowSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {preferencias.tema === 'dark'
              ? <DarkMode sx={{ fontSize: 16, color: 'text.disabled' }} />
              : <LightMode sx={{ fontSize: 16, color: 'text.disabled' }} />}
            <Typography sx={labelSx}>{t('config.tema')}</Typography>
          </Box>
          <PillGroup
            value={preferencias.tema}
            onChange={(v) => update({ tema: v as Tema })}
            options={[
              { value: 'light', label: t('config.claro') },
              { value: 'dark',  label: t('config.oscuro') },
            ]}
          />
        </Box>

        <Box sx={rowSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Language sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Typography sx={labelSx}>{t('config.idioma')}</Typography>
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

        <Divider sx={{ my: 0.5 }} />

        {/* Sistema */}
        <Typography sx={sectionSx}>{t('config.sistema')}</Typography>

        <Box sx={rowSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Notifications sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Box>
              <Typography sx={labelSx}>{t('config.notificaciones')}</Typography>
              <Typography sx={subSx}>{t('config.notificaciones_sub')}</Typography>
            </Box>
          </Box>
          <Switch
            size="small"
            checked={preferencias.notificaciones}
            onChange={(e) => update({ notificaciones: e.target.checked })}
            sx={switchSx}
          />
        </Box>

        <Box sx={rowSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Dashboard sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Box>
              <Typography sx={labelSx}>{t('config.dashboard')}</Typography>
              <Typography sx={subSx}>{t('config.dashboard_sub')}</Typography>
            </Box>
          </Box>
          <Switch
            size="small"
            checked={preferencias.dashboard_vista === 'detallado'}
            onChange={(e) => update({ dashboard_vista: e.target.checked ? 'detallado' : 'resumen' })}
            sx={switchSx}
          />
        </Box>

        <Box sx={rowSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <AttachMoney sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Typography sx={labelSx}>{t('config.moneda')}</Typography>
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

        <Box
          onClick={() => { setAnchor(null); navigate('/configuracion'); }}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 2, py: 1.25, mt: 0.5,
            borderTop: `0.5px solid ${theme.palette.divider}`,
            cursor: 'pointer', color: 'text.secondary',
            '&:hover': { bgcolor: theme.palette.action.hover, color: 'text.primary' },
          }}
        >
          <OpenInNew sx={{ fontSize: 14 }} />
          <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
            {t('config.ver_completa')}
          </Typography>
        </Box>

      </Popover>
    </>
  );
};

function PillGroup({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const theme = useTheme();
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
            borderColor: value === o.value ? theme.palette.text.primary : theme.palette.divider,
            bgcolor:     value === o.value ? theme.palette.text.primary : 'transparent',
            color:       value === o.value ? theme.palette.background.paper : 'text.secondary',
            '&:hover': {
              borderColor: theme.palette.text.primary,
              color: value === o.value ? theme.palette.background.paper : 'text.primary',
            },
          }}
        >
          {o.label}
        </Box>
      ))}
    </Box>
  );
}

const switchSx = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: '#fff' },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#1D9E75' },
  '& .MuiSwitch-track': { bgcolor: '#CBD5E1' },
};