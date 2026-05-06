import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Divider, Grid,
  Stack, Typography,
} from '@mui/material';
import { ArrowLeft, MapPin, FileText, Calendar, Hammer, Pencil, Clock, CheckCircle2, Building2 } from 'lucide-react';

import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { useObraDetail, useEstadosObraOptions, useTiposObraOptions } from '../hooks/useObras';
import { LaboresDeObra } from '../components/LaboresDeObra';

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const OBRA_ESTADO_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  'En proceso': { bg: '#DCFCE7', text: '#15803D', dot: '#22C55E' },
  'Pausada':    { bg: '#FEF9C3', text: '#A16207', dot: '#EAB308' },
  'Finalizada': { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' },
  'Cancelada':  { bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444' },
};

function ObraEstadoBadge({ nombre }: { nombre: string }) {
  const config = OBRA_ESTADO_CONFIG[nombre] ?? { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' };
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.75,
      px: 1.5, py: 0.6, borderRadius: 99, bgcolor: config.bg,
    }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: config.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: config.text, lineHeight: 1 }}>
        {nombre}
      </Typography>
    </Box>
  );
}

function FechaPill({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <Box sx={{
      p: 2, borderRadius: 2.5,
      bgcolor: accent ? '#0F172A' : '#F8FAFC',
      border: accent ? 'none' : '1px solid #E2E8F0',
      flex: 1,
    }}>
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
        <Box sx={{ color: '#94A3B8' }}>{icon}</Box>
        <Typography variant="caption" sx={{ color: accent ? '#94A3B8' : '#64748B', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Typography>
      </Stack>
      <Typography sx={{ fontWeight: 700, color: accent ? '#FFFFFF' : '#0F172A', fontSize: 15 }}>
        {value}
      </Typography>
    </Box>
  );
}

export const ObraDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const obraId = Number(id);

  const { data: obra, isLoading, isError, refetch } = useObraDetail(obraId);
  const { data: estados = [] } = useEstadosObraOptions();
  const { data: tiposObra = [] } = useTiposObraOptions();

  if (isLoading) return <LoadingState message="Cargando obra..." />;
  if (isError)   return <ErrorState title="Error" message="No se pudo cargar la obra." onRetry={refetch} />;
  if (!obra)     return <ErrorState title="Obra no encontrada" message="La obra solicitada no existe." />;

  const estadoNombre = estados.find((e) => e.id === obra.estado_id)?.nombre ?? 'Sin estado';
  const tipoNombre   = tiposObra.find((t) => t.id === obra.tipo_obra_id)?.nombre ?? 'Sin tipo';

  const hoy = new Date();
  const finEstimado = obra.fecha_fin_estimado ? new Date(obra.fecha_fin_estimado) : null;
  const diasRestantes = finEstimado
    ? Math.ceil((finEstimado.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <AppLayout>
      <PageHeader
        title={obra.nombre}
        subtitle="Vista detallada de la obra."
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/obras')}>
              Volver
            </Button>
            <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => navigate(`/obras/${obra.id}/editar`)}>
              Editar
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>

        {/* ── Columna principal ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>

            {/* Información general */}
            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ color: '#0F172A', mb: 0.75 }}>
                      {obra.nombre}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ObraEstadoBadge nombre={estadoNombre} />
                      <Box sx={{ px: 1.5, py: 0.5, borderRadius: 99, bgcolor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{tipoNombre}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>

                <Stack spacing={2.5} sx={{ mb: 3 }}>
                  {obra.ubicacion && (
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{ mt: 0.2, color: '#F59E0B', flexShrink: 0 }}><MapPin size={16} /></Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mb: 0.25, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.5 }}>Ubicación</Typography>
                        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>{obra.ubicacion}</Typography>
                      </Box>
                    </Stack>
                  )}
                  {obra.descripcion && (
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{ mt: 0.2, color: '#F59E0B', flexShrink: 0 }}><FileText size={16} /></Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mb: 0.25, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.5 }}>Descripción</Typography>
                        <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>{obra.descripcion}</Typography>
                      </Box>
                    </Stack>
                  )}
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block', mb: 1.5, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.5 }}>
                  FECHAS ESTIMADAS
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                  <FechaPill icon={<Calendar size={13} />} label="Inicio estimado" value={formatDate(obra.fecha_inicio_estimado)} />
                  <FechaPill icon={<Calendar size={13} />} label="Fin estimado" value={formatDate(obra.fecha_fin_estimado)} accent />
                </Stack>

                {(obra.fecha_inicio_real || obra.fecha_fin_real) && (
                  <>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block', mb: 1.5, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.5 }}>
                      FECHAS REALES
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <FechaPill icon={<CheckCircle2 size={13} />} label="Inicio real" value={formatDate(obra.fecha_inicio_real)} />
                      <FechaPill icon={<CheckCircle2 size={13} />} label="Fin real"    value={formatDate(obra.fecha_fin_real)} />
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Labores */}
            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Hammer size={18} color="#FFFFFF" />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ color: '#0F172A', lineHeight: 1 }}>Labores</Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>Tareas asociadas a esta obra</Typography>
                  </Box>
                </Stack>
                <Divider sx={{ mb: 3 }} />
                <LaboresDeObra obraId={obraId} />
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* ── Panel lateral ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>

            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <Box sx={{ bgcolor: '#0F172A', p: 3 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.5, display: 'block', mb: 1 }}>
                  ESTADO ACTUAL
                </Typography>
                <ObraEstadoBadge nombre={estadoNombre} />
              </Box>

              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  {diasRestantes !== null && estadoNombre !== 'Finalizada' && estadoNombre !== 'Cancelada' && (
                    <Box sx={{
                      p: 2, borderRadius: 2.5,
                      bgcolor: diasRestantes < 0 ? '#FEE2E2' : diasRestantes < 7 ? '#FEF9C3' : '#F0FDF4',
                      border: `1px solid ${diasRestantes < 0 ? '#FECACA' : diasRestantes < 7 ? '#FDE68A' : '#BBF7D0'}`,
                    }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Clock size={16} color={diasRestantes < 0 ? '#B91C1C' : diasRestantes < 7 ? '#A16207' : '#15803D'} />
                        <Box>
                          <Typography sx={{ fontSize: 16, fontWeight: 800, color: diasRestantes < 0 ? '#B91C1C' : diasRestantes < 7 ? '#A16207' : '#15803D', lineHeight: 1 }}>
                            {diasRestantes < 0
                              ? `${Math.abs(diasRestantes)} días vencida`
                              : `${diasRestantes} días restantes`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>hasta el fin estimado</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}

                  <Divider />

                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Calendar size={14} color="#94A3B8" />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Creada</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#0F172A' }}>{formatDate(obra.created_at)}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Calendar size={14} color="#94A3B8" />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Actualizada</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#0F172A' }}>{formatDate(obra.updated_at)}</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.5, display: 'block', mb: 2 }}>
                  DATOS DE LA OBRA
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ color: '#F59E0B' }}><Building2 size={18} /></Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Tipo</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#0F172A' }}>{tipoNombre}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </AppLayout>
  );
};