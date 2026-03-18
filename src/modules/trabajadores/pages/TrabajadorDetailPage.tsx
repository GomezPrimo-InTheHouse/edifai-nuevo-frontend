import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import { ArrowLeft, Pencil, User, Phone, CreditCard, Calendar, Briefcase } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { useTrabajadorDetail } from '../hooks/useTrabajadores';
import { useEspecialidadesList } from '../hooks/useEspecialidades';

// Formatea fecha ISO → "dd/mm/yyyy"
function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Fila de detalle reutilizable
function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Box sx={{ color: '#94A3B8', mt: 0.3 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>{label}</Typography>
        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 500 }}>{value}</Typography>
      </Box>
    </Box>
  );
}

export const TrabajadorDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const trabajadorId = Number(id);

  const { data: trabajador, isLoading, isError, refetch } = useTrabajadorDetail(trabajadorId);
  const { data: especialidades = [] } = useEspecialidadesList();

  if (isLoading) return <LoadingState message="Cargando trabajador..." />;
  if (isError) return <ErrorState title="Error" message="No se pudo cargar el trabajador." onRetry={refetch} />;
  if (!trabajador) return <ErrorState title="No encontrado" message="El trabajador no existe." />;

  // Resuelve nombre de especialidad
  const especialidadNombre = especialidades.find((e) => e.id === trabajador.especialidad_id)?.nombre ?? 'Sin especialidad';

  return (
    <AppLayout>
      <PageHeader
        title={`${trabajador.nombre} ${trabajador.apellido}`}
        subtitle="Vista detallada del trabajador."
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/trabajadores')}>Volver</Button>
            <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => navigate(`/trabajadores/${trabajador.id}/editar`)}>Editar</Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        {/* Panel principal */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Información personal</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2.5}>
                <DetailRow icon={<User size={16} />} label="Nombre completo" value={`${trabajador.nombre} ${trabajador.apellido}`} />
                <DetailRow icon={<CreditCard size={16} />} label="DNI" value={trabajador.dni} />
                <DetailRow icon={<Phone size={16} />} label="Teléfono" value={trabajador.telefono || '-'} />
                <DetailRow icon={<Briefcase size={16} />} label="Especialidad" value={especialidadNombre} />
                <DetailRow icon={<Calendar size={16} />} label="Fecha de ingreso" value={formatDate(trabajador.fecha_ingreso)} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel lateral */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Estado</Typography>
              <Divider sx={{ mb: 3 }} />
              <Chip
                label={trabajador.estado_id ? 'Activo' : 'Inactivo'}
                color={trabajador.estado_id ? 'success' : 'default'}
                sx={{ fontWeight: 700, fontSize: 13 }}
              />
              <Divider sx={{ my: 3 }} />
              <Stack spacing={2}>
                <DetailRow icon={<Calendar size={16} />} label="Fecha de registro" value={formatDate(trabajador.created_at)} />
                <DetailRow icon={<Calendar size={16} />} label="Última actualización" value={formatDate(trabajador.updated_at)} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
};