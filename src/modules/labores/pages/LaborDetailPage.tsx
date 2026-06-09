
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Avatar, Box, Button, Card, CardContent, Chip, Divider, Grid,
  LinearProgress, MenuItem, Stack, TextField, Typography, useTheme,
} from '@mui/material';
import {
  ArrowLeft, Briefcase, Building2, Calendar,
  FileText, Pencil, Star, User,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { LaborEstadoChip } from '../components/LaborEstadoChip';
import { useCambiarEstadoLabor, useLaborDetail } from '../hooks/useLabores';
import { useObrasList } from '../../obras/hooks/useObras';
import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
import { useEspecialidadesList } from '../../trabajadores/hooks/useEspecialidades';
import { estadoApi } from '../../../services/api/estado.api';
import { useNotify } from '../../../shared/hooks/useNotify';
import { AvancesLabor } from '../components/AvancesLabor';
import { useAuthStore } from '../../../app/store/auth.store';
import { useLocation } from 'react-router-dom';
import { LaborPresupuestosPanel } from '../components/LaboresPresupuestosPanel';

const ROLES_ADMIN = [1, 3, 4, 6, 9];

const PROGRESO_MAP: Record<string, number> = {
  'Planificada': 0, 'Labor en proceso': 25,
  'Avanzada': 50, 'Muy avanzada': 75, 'Finalizada': 100,
};

function getProgressColor(progreso: number): string {
  if (progreso === 100) return '#16A34A';
  if (progreso >= 75)  return '#2563EB';
  if (progreso >= 50)  return '#F59E0B';
  if (progreso >= 25)  return '#EA580C';
  return '#94A3B8';
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const LaborDetailPage: React.FC = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { id }    = useParams<{ id: string }>();
  const laborId   = Number(id);
  const notify    = useNotify();
  const theme     = useTheme();
  const { t }     = useTranslation();

  const user    = useAuthStore((s) => s.user);
  const esAdmin = ROLES_ADMIN.includes(user?.rol_id ?? 0);

  const { data: labor, isLoading, isError, refetch } = useLaborDetail(laborId);
  const { data: obras        = [] } = useObrasList();
  const { data: trabajadores = [] } = useTrabajadoresList();
  const { data: especialidades = [] } = useEspecialidadesList();
  const cambiarEstadoMutation = useCambiarEstadoLabor();

  const { data: estadosLabor = [] } = useQuery({
    queryKey: ['estados', 'labor'],
    queryFn:  () => estadoApi.getByAmbito('labor'),
  });

  if (isLoading) return <LoadingState message={t('labores.detail.loading')} />;
  if (isError)   return <ErrorState title="Error" message={t('labores.detail.error')} onRetry={refetch} />;
  if (!labor)    return <ErrorState title={t('labores.detail.no_encontrada')} message={t('labores.detail.no_encontrada_msg')} />;

  const obra              = obras.find(o => o.id === labor.obra_id);
  const trabajador        = trabajadores.find(t => t.id === labor.trabajador_id);
  const especialidadNombre = especialidades.find(e => e.id === trabajador?.especialidad_id)?.nombre;
  const estadoNombre      = estadosLabor.find(e => e.id === labor.estado_id)?.nombre;
  const progreso          = estadoNombre ? (PROGRESO_MAP[estadoNombre] ?? 0) : 0;
  const progressColor     = getProgressColor(progreso);
  const puntos            = trabajador?.puntos ?? 0;
  const asistenciaPct     = Number(trabajador?.porcentaje_asistencia_mes ?? 0);

  React.useEffect(() => {
  if (labor?.nombre && !location.state?.breadcrumbLabel) {
    window.history.replaceState(
      { ...location.state, breadcrumbLabel: labor.nombre },
      ''
    );
  }
}, [labor?.nombre]);

  const handleCambiarEstado = async (estado_id: number) => {
    try {
      await cambiarEstadoMutation.mutateAsync({ id: laborId, estado_id });
      notify.success('Estado actualizado.');
    } catch {
      notify.error('No se pudo cambiar el estado.');
    }
  };

  // ── Tokens de tema ────────────────────────────────────────────
  const cardBorder  = `1px solid ${theme.palette.divider}`;
  const infoBoxSx   = {
    p: 2, borderRadius: 2,
    bgcolor: theme.palette.action.hover,
    border: cardBorder,
  };

  return (
    <AppLayout>
      <PageHeader
        title={labor.nombre}
        subtitle={t('labores.detail.subtitle')}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate('/labores')}>
              {t('labores.detail.volver')}
            </Button>
            {esAdmin && (
              <Button variant="contained" startIcon={<Pencil size={16} />}
                onClick={() => navigate(`/labores/${labor.id}/editar`)}>
                {t('labores.detail.editar')}
              </Button>
            )}
          </Stack>
        }
      />

      <Grid container spacing={3}>

        {/* ── Panel principal ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>

            {/* Información general */}
            <Card elevation={0} sx={{ borderRadius: 3, border: cardBorder, bgcolor: 'background.paper' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" gap={1} mb={2}>
                  <FileText size={16} color="#F59E0B" />
                  <Typography variant="h6" fontWeight={700}>{t('labores.detail.info_general')}</Typography>
                </Stack>
                <Divider sx={{ mb: 3 }} />

                {/* Obra */}
                <Box sx={{ ...infoBoxSx, mb: 2 }}>
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={18} color="#F59E0B" />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {t('labores.detail.obra')}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="text.primary">
                        {obra?.nombre ?? '-'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Descripción */}
                {labor.descripcion && (
                  <Box sx={{ ...infoBoxSx, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                      {t('labores.detail.descripcion')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {labor.descripcion}
                    </Typography>
                  </Box>
                )}

                {/* Trabajador */}
                {trabajador ? (
                  <Box sx={{ p: 2, borderRadius: 2, border: cardBorder, bgcolor: 'background.paper' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1.5}>
                      {t('labores.detail.trabajador_asignado')}
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 44, height: 44, bgcolor: '#0F172A', fontSize: 15, fontWeight: 800 }}>
                        {trabajador.nombre[0]}{trabajador.apellido[0]}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={700} color="text.primary">
                          {trabajador.nombre} {trabajador.apellido}
                        </Typography>
                        {especialidadNombre && (
                          <Typography variant="caption" color="text.secondary">{especialidadNombre}</Typography>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Chip icon={<Star size={12} />} label={`${puntos} pts`} size="small"
                          sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#B45309', fontWeight: 700, fontSize: 11 }} />
                        <Chip icon={<Calendar size={12} />} label={`${asistenciaPct}% asist.`} size="small"
                          sx={{
                            fontWeight: 700, fontSize: 11,
                            bgcolor: asistenciaPct >= 80 ? '#F0FDF4' : asistenciaPct >= 50 ? '#FFFBEB' : '#FEF2F2',
                            color:   asistenciaPct >= 80 ? '#15803D' : asistenciaPct >= 50 ? '#B45309' : '#DC2626',
                          }} />
                      </Stack>
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={infoBoxSx}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <User size={16} color={theme.palette.text.disabled} />
                      <Typography variant="body2" color="text.disabled">
                        {t('labores.detail.sin_trabajador')}
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Fechas */}
            <Card elevation={0} sx={{ borderRadius: 3, border: cardBorder, bgcolor: 'background.paper' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" gap={1} mb={2}>
                  <Calendar size={16} color="#F59E0B" />
                  <Typography variant="h6" fontWeight={700}>{t('labores.detail.fechas')}</Typography>
                </Stack>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  {[
                    { label: t('labores.detail.inicio_estimado'), value: formatDate(labor.fecha_inicio_estimada) },
                    { label: t('labores.detail.fin_estimado'),    value: formatDate(labor.fecha_fin_estimada) },
                    { label: t('labores.detail.inicio_real'),     value: formatDate(labor.fecha_inicio_real) },
                    { label: t('labores.detail.fin_real'),        value: formatDate(labor.fecha_fin_real) },
                  ].map((item) => (
                    <Grid key={item.label} size={{ xs: 6 }}>
                      <Box sx={infoBoxSx}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.25}>
                          {item.label}
                        </Typography>
                        <Typography variant="body2" fontWeight={700}
                          color={item.value === '-' ? 'text.disabled' : 'text.primary'}>
                          {item.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* ── Panel lateral ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: cardBorder, bgcolor: 'background.paper', position: 'sticky', top: 80 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <Briefcase size={16} color="#F59E0B" />
                <Typography variant="h6" fontWeight={700}>{t('labores.detail.estado')}</Typography>
              </Stack>
              <Divider sx={{ mb: 3 }} />

              <LaborEstadoChip estadoNombre={estadoNombre} />

              {/* Barra de progreso */}
              <Box sx={{ mt: 2.5, ...infoBoxSx }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {t('labores.detail.progreso')}
                  </Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ color: progressColor }}>
                    {progreso}%
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={progreso} sx={{
                  height: 10, borderRadius: 5, bgcolor: theme.palette.divider,
                  '& .MuiLinearProgress-bar': { borderRadius: 5, backgroundColor: progressColor },
                }} />
              </Box>

              {/* Cambiar estado — solo admins */}
              {esAdmin && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                    {t('labores.detail.cambiar_estado')}
                  </Typography>
                  <TextField select fullWidth size="small"
                    value={labor.estado_id ?? ''}
                    onChange={(e) => handleCambiarEstado(Number(e.target.value))}
                    disabled={cambiarEstadoMutation.isPending}>
                    {estadosLabor.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
                  </TextField>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Metadata */}
              <Stack spacing={2}>
                {[
                  { label: t('labores.detail.creada'),     value: formatDate(labor.created_at) },
                  { label: t('labores.detail.actualizada'), value: formatDate(labor.updated_at) },
                ].map((item) => (
                  <Box key={item.label}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.25}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    {labor.obra_id && (
  <AvancesLabor obra_id={labor.obra_id} labor_id={laborId} />
)}

{labor.modo === 'cotizacion' && (
  <LaborPresupuestosPanel
    labor_id={laborId}
    estado_id={labor.estado_id}
    onPresupuestoConfirmado={refetch}
  />
)}
    </AppLayout>
  );
};