import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, MobileStepper, Paper, ToggleButton,
  ToggleButtonGroup, CircularProgress, Fade,
} from '@mui/material';
import {
  Language, DarkMode, LightMode, Notifications, NotificationsOff,
  BarChart, TableChart, AttachMoney, MyLocation, Check, ArrowForward,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuthStore } from '../../../app/store/auth.store';
import { useGuardarPreferencias } from '../hooks/usePreferencias';
import {
  type UserPreferencias, PREFERENCIAS_DEFAULT,
  type Idioma, type Tema, type  Moneda, type FormatoDashboard,
} from '../types/preferencias.types';

// Fix icono Leaflet con Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Componente interno para capturar click en el mapa
function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e:any) => onSelect(e.latlng.lat, e.latlng.lng) });
  return null;
}

const STEPS = [
  { key: 'idioma',          label: 'Idioma' },
  { key: 'tema',            label: 'Apariencia' },
  { key: 'notificaciones',  label: 'Notificaciones' },
  { key: 'moneda',          label: 'Moneda' },
  { key: 'dashboard_vista', label: 'Dashboard' },
  { key: 'ubicacion',       label: 'Ubicación' },
];

interface Props {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep]               = useState(0);
  const [prefs, setPrefs]             = useState<UserPreferencias>(PREFERENCIAS_DEFAULT);
  const [mapPos, setMapPos]           = useState<{ lat: number; lng: number } | null>(null);
  const [detectando, setDetectando]   = useState(false);

  const setPreferencias       = useAuthStore((s) => s.setPreferencias);
  const setOnboardingCompletado = useAuthStore((s) => s.setOnboardingCompletado);
  const { mutate: guardar, isPending } = useGuardarPreferencias();

  // Intentar geolocalización automática al llegar al paso de ubicación
  useEffect(() => {
    if (STEPS[step].key === 'ubicacion' && !mapPos) {
      setDetectando(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setDetectando(false);
        },
        () => setDetectando(false) // Si el usuario rechaza, mapa vacío
      );
    }
  }, [step]);

  const set = <K extends keyof UserPreferencias>(key: K, value: UserPreferencias[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  const handleFinish = (skip = false) => {
    const finalPrefs = skip ? PREFERENCIAS_DEFAULT : {
      ...prefs,
      ...(mapPos ? { ubicacion: { lat: mapPos.lat, lng: mapPos.lng, label: '' } } : {}),
    };

    // Persistir en DB
    guardar(
      { preferencias: finalPrefs, onboarding_completado: true },
      {
        onSuccess: () => {
          // Sincronizar store local
          setPreferencias(finalPrefs);
          setOnboardingCompletado();
          onComplete();
        },
      }
    );
  };

  const isLast = step === STEPS.length - 1;

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0F172A',
    }}>
      <Paper elevation={0} sx={{
        width: { xs: '95vw', sm: 520 }, borderRadius: 4,
        overflow: 'hidden', background: '#1E293B',
      }}>

        {/* Header */}
        <Box sx={{ px: 4, pt: 4, pb: 2 }}>
          <Typography variant="h5" sx={{ color: '#F8FAFC', fontWeight: 800 }}>
            Bienvenido a EdifAI
          </Typography>
          <Typography sx={{ color: '#94A3B8', mt: 0.5, fontSize: 14 }}>
            Configuremos tu experiencia en unos pasos. Podés saltear cuando quieras.
          </Typography>
        </Box>

        {/* Step indicator */}
        <MobileStepper
          variant="dots"
          steps={STEPS.length}
          position="static"
          activeStep={step}
          sx={{
            background: 'transparent', px: 4,
            '& .MuiMobileStepper-dot': { bgcolor: '#334155' },
            '& .MuiMobileStepper-dotActive': { bgcolor: '#F59E0B' },
          }}
          nextButton={null}
          backButton={null}
        />

        {/* Contenido del paso */}
        <Box sx={{ px: 4, py: 3, minHeight: 260 }}>
          <Fade key={step} in timeout={300}>
            <Box>

              {/* PASO 1 — Idioma */}
              {STEPS[step].key === 'idioma' && (
                <StepWrapper title="¿En qué idioma preferís usar el sistema?" icon={<Language />}>
                  <ToggleGroup
                    value={prefs.idioma}
                    onChange={(v) => set('idioma', v as Idioma)}
                    options={[
                      { value: 'es', label: 'Español' },
                      { value: 'en', label: 'English' },
                    ]}
                  />
                </StepWrapper>
              )}

              {/* PASO 2 — Tema */}
              {STEPS[step].key === 'tema' && (
                <StepWrapper title="¿Cómo preferís ver la interfaz?" icon={<DarkMode />}>
                  <ToggleGroup
                    value={prefs.tema}
                    onChange={(v) => set('tema', v as Tema)}
                    options={[
                      { value: 'light', label: 'Claro', icon: <LightMode /> },
                      { value: 'dark',  label: 'Oscuro', icon: <DarkMode /> },
                    ]}
                  />
                </StepWrapper>
              )}

              {/* PASO 3 — Notificaciones */}
              {STEPS[step].key === 'notificaciones' && (
                <StepWrapper title="¿Querés recibir notificaciones en tiempo real?" icon={<Notifications />}>
                  <ToggleGroup
                    value={String(prefs.notificaciones)}
                    onChange={(v) => set('notificaciones', v === 'true')}
                    options={[
                      { value: 'true',  label: 'Sí, activar', icon: <Notifications /> },
                      { value: 'false', label: 'No por ahora', icon: <NotificationsOff /> },
                    ]}
                  />
                </StepWrapper>
              )}

              {/* PASO 4 — Moneda */}
              {STEPS[step].key === 'moneda' && (
                <StepWrapper title="¿Con qué moneda trabajás habitualmente?" icon={<AttachMoney />}>
                  <ToggleGroup
                    value={prefs.moneda}
                    onChange={(v) => set('moneda', v as Moneda)}
                    options={[
                      { value: 'ARS', label: '🇦🇷 Peso argentino' },
                      { value: 'USD', label: '🇺🇸 Dólar' },
                      { value: 'EUR', label: '🇪🇺 Euro' },
                    ]}
                  />
                </StepWrapper>
              )}

              {/* PASO 5 — Dashboard */}
              {STEPS[step].key === 'dashboard_vista' && (
                <StepWrapper title="¿Cómo preferís ver tu dashboard?" icon={<BarChart />}>
                  <ToggleGroup
                    value={prefs.dashboard_vista}
                    onChange={(v) => set('dashboard_vista', v as FormatoDashboard)}
                    options={[
                      { value: 'resumen',   label: 'Resumen', icon: <BarChart /> },
                      { value: 'detallado', label: 'Detallado', icon: <TableChart /> },
                    ]}
                  />
                </StepWrapper>
              )}

              {/* PASO 6 — Ubicación */}
              {STEPS[step].key === 'ubicacion' && (
                <StepWrapper title="¿Dónde está ubicada tu empresa?" icon={<MyLocation />}>
                  {detectando ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress sx={{ color: '#F59E0B' }} />
                    </Box>
                  ) : (
                    <Box sx={{ height: 220, borderRadius: 2, overflow: 'hidden', mt: 1 }}>
                      <MapContainer
                        center={mapPos ? [mapPos.lat, mapPos.lng] : [-32.4, -63.2]}
                        zoom={mapPos ? 13 : 5}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapClickHandler onSelect={(lat, lng) => setMapPos({ lat, lng })} />
                        {mapPos && <Marker position={[mapPos.lat, mapPos.lng]} />}
                      </MapContainer>
                    </Box>
                  )}
                  <Typography sx={{ color: '#64748B', fontSize: 12, mt: 1 }}>
                    {mapPos
                      ? `Lat: ${mapPos.lat.toFixed(4)}, Lng: ${mapPos.lng.toFixed(4)}`
                      : 'Hacé clic en el mapa para marcar tu ubicación'}
                  </Typography>
                </StepWrapper>
              )}

            </Box>
          </Fade>
        </Box>

        {/* Footer navegación */}
        <Box sx={{
          px: 4, pb: 4, display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Button
            variant="text"
            onClick={() => handleFinish(true)}
            disabled={isPending}
            sx={{ color: '#64748B', fontSize: 13 }}
          >
            Saltear todo
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {step > 0 && (
              <Button
                variant="outlined"
                onClick={() => setStep((s) => s - 1)}
                disabled={isPending}
                sx={{ borderColor: '#334155', color: '#94A3B8', borderRadius: 2 }}
              >
                Atrás
              </Button>
            )}

            {!isLast ? (
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={() => setStep((s) => s + 1)}
                sx={{ bgcolor: '#F59E0B', color: '#0F172A', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#D97706' } }}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={isPending ? <CircularProgress size={16} /> : <Check />}
                onClick={() => handleFinish(false)}
                disabled={isPending}
                sx={{ bgcolor: '#F59E0B', color: '#0F172A', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#D97706' } }}
              >
                Finalizar
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

// ── Helpers internos ─────────────────────────────────────────

function StepWrapper({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ color: '#F59E0B' }}>{icon}</Box>
        <Typography sx={{ color: '#F8FAFC', fontWeight: 600, fontSize: 16 }}>{title}</Typography>
      </Box>
      {children}
    </Box>
  );
}

function ToggleGroup({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, v) => { if (v !== null) onChange(v); }}
      sx={{ flexWrap: 'wrap', gap: 1 }}
    >
      {options.map((o) => (
        <ToggleButton
          key={o.value}
          value={o.value}
          sx={{
            border: '1px solid #334155 !important',
            borderRadius: '10px !important',
            color: '#94A3B8',
            px: 2.5, py: 1,
            '&.Mui-selected': {
              bgcolor: 'rgba(245,158,11,0.15)',
              borderColor: '#F59E0B !important',
              color: '#F59E0B',
            },
          }}
        >
          {o.icon && <Box sx={{ mr: 0.75, display: 'flex' }}>{o.icon}</Box>}
          {o.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}