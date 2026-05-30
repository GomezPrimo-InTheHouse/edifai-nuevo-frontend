import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, Typography, useTheme } from '@mui/material';
import { ArrowLeft, Pencil, User, Phone, CreditCard, Calendar, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { useTrabajadorDetail } from '../hooks/useTrabajadores';
import { useEspecialidadesList } from '../hooks/useEspecialidades';

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Box sx={{ color: 'text.disabled', mt: 0.3 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>{label}</Typography>
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>{value}</Typography>
      </Box>
    </Box>
  );
}

export const TrabajadorDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const trabajadorId = Number(id);

  const { data: trabajador, isLoading, isError, refetch } = useTrabajadorDetail(trabajadorId);
  const { data: especialidades = [] } = useEspecialidadesList();

  if (isLoading) return <LoadingState message={t('trabajadores.detail.loading')} />;
  if (isError) return <ErrorState title="Error" message={t('trabajadores.detail.error')} onRetry={refetch} />;
  if (!trabajador) return <ErrorState title={t('trabajadores.detail.no_encontrado')} message={t('trabajadores.detail.no_encontrado_msg')} />;

  const especialidadNombre = especialidades.find((e) => e.id === trabajador.especialidad_id)?.nombre ?? t('trabajadores.detail.sin_especialidad');

  return (
    <AppLayout>
      <PageHeader
        title={`${trabajador.nombre} ${trabajador.apellido}`}
        subtitle={t('trabajadores.detail.subtitle')}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/trabajadores')}>
              {t('trabajadores.acciones.volver')}
            </Button>
            <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => navigate(`/trabajadores/${trabajador.id}/editar`)}>
              {t('trabajadores.acciones.editar')}
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{t('trabajadores.detail.info')}</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2.5}>
                <DetailRow icon={<User size={16} />} label={t('trabajadores.detail.nombre_completo')} value={`${trabajador.nombre} ${trabajador.apellido}`} />
                <DetailRow icon={<CreditCard size={16} />} label={t('trabajadores.detail.dni')} value={trabajador.dni} />
                <DetailRow icon={<Phone size={16} />} label={t('trabajadores.detail.telefono')} value={trabajador.telefono || '-'} />
                <DetailRow icon={<Briefcase size={16} />} label={t('trabajadores.detail.especialidad')} value={especialidadNombre} />
                <DetailRow icon={<Calendar size={16} />} label={t('trabajadores.detail.fecha_ingreso')} value={formatDate(trabajador.fecha_ingreso)} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{t('trabajadores.detail.estado')}</Typography>
              <Divider sx={{ mb: 3 }} />
              <Chip
                label={trabajador.estado_id ? t('trabajadores.detail.activo') : t('trabajadores.detail.inactivo')}
                color={trabajador.estado_id ? 'success' : 'default'}
                sx={{ fontWeight: 700, fontSize: 13 }}
              />
              <Divider sx={{ my: 3 }} />
              <Stack spacing={2}>
                <DetailRow icon={<Calendar size={16} />} label={t('trabajadores.detail.fecha_registro')} value={formatDate(trabajador.created_at)} />
                <DetailRow icon={<Calendar size={16} />} label={t('trabajadores.detail.ultima_actualizacion')} value={formatDate(trabajador.updated_at)} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
};