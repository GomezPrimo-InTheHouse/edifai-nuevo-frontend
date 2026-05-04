import React, { useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip,
  CircularProgress, Divider, MenuItem, Paper,
  Stack, Table, TableBody, TableCell, TableHead,
  TableRow, TextField, Typography,
} from '@mui/material';
import {
  MapPin, CheckCircle, Clock,
  Building2, CalendarDays, Navigation,
} from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { useNotify } from '../../../shared/hooks/useNotify';
import {
  useMisObras,
  useHistorialPresentismo,
  useMarcarPresentismo,
} from '../hooks/usePresentismo';

// ── Helper tiempo ────────────────────────────────────────────
function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function formatHora(fecha: string) {
  return new Date(fecha).toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Componente ───────────────────────────────────────────────
export const PresentismoPage: React.FC = () => {
  const notify = useNotify();

  const [obraId, setObraId] = useState<number | ''>('');
  const [observaciones, setObservaciones] = useState('');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [obteniendo, setObteniendo] = useState(false);

  const { data: misObrasData, isLoading: loadingObras } = useMisObras();
  const { data: historial = [], isLoading: loadingHistorial } = useHistorialPresentismo();
  const marcarMutation = useMarcarPresentismo();

  const obras      = misObrasData?.data ?? [];
  const trabajador = misObrasData?.trabajador;

  const handleMarcar = () => {
    if (!obraId) {
      notify.warning('Seleccioná una obra primero');
      return;
    }

    setGeoError(null);
    setObteniendo(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setObteniendo(false);
        try {
          await marcarMutation.mutateAsync({
            obra_id:      Number(obraId),
            latitud:      position.coords.latitude,
            longitud:     position.coords.longitude,
            observaciones: observaciones || undefined,
          });
          notify.success('Presentismo marcado correctamente');
          setObraId('');
          setObservaciones('');
        } catch (err: any) {
          const msg = err?.response?.data?.message || 'No se pudo marcar el presentismo';
          notify.error(msg);
        }
      },
      (error) => {
        setObteniendo(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Permiso de ubicación denegado. Habilitá la geolocalización en tu navegador.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError('No se pudo obtener tu ubicación. Intentá de nuevo.');
            break;
          case error.TIMEOUT:
            setGeoError('Tiempo de espera agotado. Intentá de nuevo.');
            break;
          default:
            setGeoError('Error al obtener ubicación.');
        }
      },
      { timeout: 10000, maximumAge: 0 }
    );
  };

  const isLoading = obteniendo || marcarMutation.isPending;

  if (loadingObras) return <AppLayout><LoadingState message="Cargando tus obras..." /></AppLayout>;

  return (
    <AppLayout>
      <PageHeader
        title="Presentismo"
        subtitle={
          trabajador
            ? `Hola, ${trabajador.nombre} ${trabajador.apellido} — marcá tu asistencia`
            : 'Marcá tu asistencia diaria'
        }
      />

      <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 0, md: 1 } }}>
        <Stack spacing={3}>

          {/* ── Card marcar ── */}
          <Card sx={{
            borderRadius: 3,
            boxShadow: 'none',
            border: '1px solid #E2E8F0',
            overflow: 'visible',
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack direction="row" alignItems="center" gap={1.5} mb={3}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: 2,
                  bgcolor: 'rgba(245,158,11,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MapPin size={20} color="#F59E0B" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#0F172A' }}>
                    Marcar presentismo
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Se registrará tu ubicación al confirmar
                  </Typography>
                </Box>
              </Stack>

              {obras.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  No tenés obras asignadas actualmente. Contactá a tu administrador.
                </Alert>
              ) : (
                <Stack spacing={2}>

                  {/* Selector obra */}
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Seleccioná tu obra"
                    value={obraId}
                    onChange={(e) => setObraId(Number(e.target.value))}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  >
                    <MenuItem value="">Elegí una obra...</MenuItem>
                    {obras.map((obra) => (
                      <MenuItem key={obra.id} value={obra.id}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Building2 size={14} color="#64748B" />
                          <Typography variant="body2">{obra.nombre}</Typography>
                          {obra.rol_en_obra && (
                            <Chip
                              label={obra.rol_en_obra}
                              size="small"
                              sx={{
                                fontSize: 10, height: 18,
                                bgcolor: 'rgba(245,158,11,0.12)',
                                color: '#B45309', fontWeight: 700,
                              }}
                            />
                          )}
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* Info obra seleccionada */}
                  {obraId && (() => {
                    const obra = obras.find((o) => o.id === obraId);
                    return obra ? (
                      <Box sx={{
                        p: 1.5, borderRadius: 2,
                        bgcolor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                      }}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Building2 size={14} color="#64748B" />
                          <Typography variant="caption" color="text.secondary">
                            {obra.ubicacion ?? 'Sin dirección registrada'}
                          </Typography>
                        </Stack>
                        {obra.fecha_hasta && (
                          <Stack direction="row" alignItems="center" gap={1} mt={0.5}>
                            <CalendarDays size={14} color="#64748B" />
                            <Typography variant="caption" color="text.secondary">
                              Asignado hasta: {formatFecha(obra.fecha_hasta)}
                            </Typography>
                          </Stack>
                        )}
                      </Box>
                    ) : null;
                  })()}

                  {/* Observaciones */}
                  <TextField
                    fullWidth
                    size="small"
                    label="Observaciones (opcional)"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    multiline
                    rows={2}
                    placeholder="Ej: llegué tarde por tráfico..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* Error geo */}
                  {geoError && (
                    <Alert
                      severity="error"
                      onClose={() => setGeoError(null)}
                      sx={{ borderRadius: 2 }}
                    >
                      {geoError}
                    </Alert>
                  )}

                  {/* Botón */}
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading || !obraId}
                    onClick={handleMarcar}
                    startIcon={
                      isLoading
                        ? <CircularProgress size={18} color="inherit" />
                        : obteniendo
                          ? <Navigation size={18} />
                          : <CheckCircle size={18} />
                    }
                    sx={{
                      bgcolor: '#F59E0B',
                      color: '#0F172A',
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#D97706' },
                      '&.Mui-disabled': { bgcolor: '#F59E0B', opacity: 0.55 },
                    }}
                  >
                    {obteniendo
                      ? 'Obteniendo ubicación...'
                      : marcarMutation.isPending
                        ? 'Registrando...'
                        : 'Confirmar presencia'
                    }
                  </Button>

                  <Stack direction="row" alignItems="center" justifyContent="center" gap={0.5}>
                    <Navigation size={12} color="#94A3B8" />
                    <Typography variant="caption" color="text.secondary">
                      Tu ubicación GPS se registrará automáticamente
                    </Typography>
                  </Stack>

                </Stack>
              )}
            </CardContent>
          </Card>

          {/* ── Historial ── */}
          <Box>
            <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
              <Clock size={16} color="#64748B" />
              <Typography variant="body2" fontWeight={700} color="text.secondary">
                HISTORIAL DE ASISTENCIA
              </Typography>
            </Stack>

            {loadingHistorial ? (
              <LoadingState message="Cargando historial..." />
            ) : historial.length === 0 ? (
              <Paper sx={{
                p: 3, borderRadius: 3, textAlign: 'center',
                border: '1px solid #E2E8F0', boxShadow: 'none',
              }}>
                <Clock size={32} color="#CBD5E1" />
                <Typography variant="body2" color="text.secondary" mt={1}>
                  No hay registros de asistencia aún.
                </Typography>
              </Paper>
            ) : (
              <>
                {/* Mobile — cards */}
                <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
                  {historial.map((p) => (
                    <Paper key={p.id} sx={{
                      p: 2, borderRadius: 3,
                      border: '1px solid #E2E8F0',
                      boxShadow: 'none',
                    }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="body2" fontWeight={700} color="#0F172A">
                            {formatFecha(p.fecha)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatHora(p.fecha)}
                          </Typography>
                        </Box>
                        <Chip
                          label={p.obra_nombre}
                          size="small"
                          sx={{
                            fontSize: 11,
                            bgcolor: 'rgba(245,158,11,0.1)',
                            color: '#B45309',
                            fontWeight: 600,
                          }}
                        />
                      </Stack>
                      {p.observaciones && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            {p.observaciones}
                          </Typography>
                        </>
                      )}
                      <Stack direction="row" alignItems="center" gap={0.5} mt={1}>
                        <Navigation size={11} color="#94A3B8" />
                        <Typography variant="caption" color="text.secondary">
{Number(p.latitud)?.toFixed(5)}, {Number(p.longitud)?.toFixed(5)}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>

                {/* Desktop — tabla */}
                <Paper sx={{
                  display: { xs: 'none', md: 'block' },
                  borderRadius: 3, overflow: 'hidden',
                  border: '1px solid #E2E8F0', boxShadow: 'none',
                }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Hora</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Obra</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Coordenadas</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Observaciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historial.map((p) => (
                        <TableRow key={p.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {formatFecha(p.fecha)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatHora(p.fecha)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={p.obra_nombre}
                              size="small"
                              sx={{
                                fontSize: 11,
                                bgcolor: 'rgba(245,158,11,0.1)',
                                color: '#B45309',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" gap={0.5}>
                              <Navigation size={12} color="#94A3B8" />
                              <Typography variant="caption" color="text.secondary">
                        {parseFloat(p.latitud as any)?.toFixed(5)}, {parseFloat(p.longitud as any)?.toFixed(5)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {p.observaciones ?? '—'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </>
            )}
          </Box>

        </Stack>
      </Box>
    </AppLayout>
  );
};