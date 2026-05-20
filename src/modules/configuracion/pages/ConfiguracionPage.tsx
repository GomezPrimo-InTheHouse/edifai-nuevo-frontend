import React from 'react';
import { Box, Typography, Paper, ToggleButton, ToggleButtonGroup,
  CircularProgress, Button, Divider } from '@mui/material';
import { Check } from '@mui/icons-material';
import { usePreferencias, useGuardarPreferencias } from '../hooks/usePreferencias';
import { useAuthStore } from '../../../app/store/auth.store';
import {
  type UserPreferencias, PREFERENCIAS_DEFAULT,
  type Idioma, type Tema, type Moneda, type FormatoDashboard,
} from '../types/preferencias.types';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';


export const ConfiguracionPage: React.FC = () => {
  const { data, isLoading } = usePreferencias();
  const { mutate: guardar, isPending } = useGuardarPreferencias();
  const setPreferencias = useAuthStore((s) => s.setPreferencias);

  const [prefs, setPrefs] = React.useState<UserPreferencias>(PREFERENCIAS_DEFAULT);

  // Cargar preferencias desde DB al montar
  React.useEffect(() => {
    if (data?.preferencias) {
      setPrefs({ ...PREFERENCIAS_DEFAULT, ...data.preferencias });
    }
  }, [data]);

  const set = <K extends keyof UserPreferencias>(key: K, value: UserPreferencias[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  const handleGuardar = () => {
    guardar(
      { preferencias: prefs },
      {
        onSuccess: () => {
          setPreferencias(prefs); // Sincronizar store local
        },
      }
    );
  };

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <PageHeader title="Configuración" subtitle="Personalizá tu experiencia en EdifAI" />

      <Paper sx={{ p: 3, borderRadius: 3, maxWidth: 600 }}>

        <Section label="Idioma">
          <TG value={prefs.idioma} onChange={(v) => set('idioma', v as Idioma)}
            options={[{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }]} />
        </Section>

        <Divider sx={{ my: 2.5 }} />

        <Section label="Apariencia">
          <TG value={prefs.tema} onChange={(v) => set('tema', v as Tema)}
            options={[{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Oscuro' }]} />
        </Section>

        <Divider sx={{ my: 2.5 }} />

        <Section label="Notificaciones">
          <TG value={String(prefs.notificaciones)} onChange={(v) => set('notificaciones', v === 'true')}
            options={[{ value: 'true', label: 'Activadas' }, { value: 'false', label: 'Desactivadas' }]} />
        </Section>

        <Divider sx={{ my: 2.5 }} />

        <Section label="Moneda">
          <TG value={prefs.moneda} onChange={(v) => set('moneda', v as Moneda)}
            options={[
              { value: 'ARS', label: 'Peso (ARS)' },
              { value: 'USD', label: 'Dólar (USD)' },
              { value: 'EUR', label: 'Euro (EUR)' },
            ]} />
        </Section>

        <Divider sx={{ my: 2.5 }} />

        <Section label="Vista del Dashboard">
          <TG value={prefs.dashboard_vista} onChange={(v) => set('dashboard_vista', v as FormatoDashboard)}
            options={[{ value: 'resumen', label: 'Resumen' }, { value: 'detallado', label: 'Detallado' }]} />
        </Section>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            endIcon={isPending ? <CircularProgress size={16} /> : <Check />}
            onClick={handleGuardar}
            disabled={isPending}
            sx={{ bgcolor: '#F59E0B', color: '#0F172A', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#D97706' } }}
          >
            Guardar cambios
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 600, mb: 1.5, color: '#0F172A' }}>{label}</Typography>
      {children}
    </Box>
  );
}

function TG({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <ToggleButtonGroup value={value} exclusive onChange={(_, v) => { if (v !== null) onChange(v); }}>
      {options.map((o) => (
        <ToggleButton key={o.value} value={o.value}
          sx={{ fontSize: 13, px: 2, '&.Mui-selected': { bgcolor: 'rgba(245,158,11,0.12)', color: '#B45309' } }}>
          {o.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}