import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Divider, Grid,
  MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { ArrowLeft, Briefcase, Calendar, FileText, Pencil, User } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { LaborEstadoChip } from '../components/LaborEstadoChip';
import { useCambiarEstadoLabor, useLaborDetail } from '../hooks/useLabores';
import { useObrasList } from '../../obras/hooks/useObras';
import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
import { useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

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

export const LaborDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const laborId = Number(id);

  const { data: labor, isLoading, isError, refetch } = useLaborDetail(laborId);
  const { data: obras = [] } = useObrasList();
  const { data: trabajadores = [] } = useTrabajadoresList();
  const { data: estados = [] } = useEstadosGenerales();
  const cambiarEstadoMutation = useCambiarEstadoLabor();

  if (isLoading) return <LoadingState message="Cargando labor..." />;
  if (isError) return <ErrorState title="Error" message="No se pudo cargar la labor." onRetry={refetch} />;
  if (!labor) return <ErrorState title="No encontrada" message="La labor no existe." />;

  const obraNombre = obras.find((o) => o.id === labor.obra_id)?.nombre ?? '-';
  const trabajadorNombre = trabajadores.find((t) => t.id === labor.trabajador_id);
  const estadoNombre = estados.find((e) => e.id === labor.estado_id)?.nombre;

  // Handler de cambio rápido de estado
  const handleCambiarEstado = async (estado_id: number) => {
    await cambiarEstadoMutation.mutateAsync({ id: laborId, estado_id });
  };

  return (
    <AppLayout>
      <PageHeader
        title={labor.nombre}
        subtitle="Vista detallada de la labor."
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/labores')}>Volver</Button>
            <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => navigate(`/labores/${labor.id}/editar`)}>Editar</Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        {/* Panel principal */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Información general</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2.5}>
                <DetailRow icon={<Briefcase size={16} />} label="Obra" value={obraNombre} />
                <DetailRow icon={<FileText size={16} />} label="Descripción" value={labor.descripcion || '-'} />
                <DetailRow
                  icon={<User size={16} />}
                  label="Trabajador asignado"
                  value={trabajadorNombre ? `${trabajadorNombre.nombre} ${trabajadorNombre.apellido}` : 'Sin asignar'}
                />
              </Stack>
              <Divider sx={{ my: 3 }} />
              <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>FECHAS</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}><DetailRow icon={<Calendar size={16} />} label="Inicio estimado" value={formatDate(labor.fecha_inicio_estimada)} /></Grid>
                <Grid size={{ xs: 6 }}><DetailRow icon={<Calendar size={16} />} label="Fin estimado" value={formatDate(labor.fecha_fin_estimada)} /></Grid>
                <Grid size={{ xs: 6 }}><DetailRow icon={<Calendar size={16} />} label="Inicio real" value={formatDate(labor.fecha_inicio_real)} /></Grid>
                <Grid size={{ xs: 6 }}><DetailRow icon={<Calendar size={16} />} label="Fin real" value={formatDate(labor.fecha_fin_real)} /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel lateral — estado con cambio rápido */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Estado</Typography>
              <Divider sx={{ mb: 3 }} />
              <LaborEstadoChip estadoNombre={estadoNombre} />

              {/* Cambio rápido de estado */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#64748B' }}>CAMBIAR ESTADO</Typography>
                <TextField
                  select fullWidth size="small"
                  value={labor.estado_id ?? ''}
                  onChange={(e) => handleCambiarEstado(Number(e.target.value))}
                  disabled={cambiarEstadoMutation.isPending}
                >
                  {estados.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
                </TextField>
              </Box>

              <Divider sx={{ my: 3 }} />
              <Stack spacing={2}>
                <DetailRow icon={<Calendar size={16} />} label="Creada" value={formatDate(labor.created_at)} />
                <DetailRow icon={<Calendar size={16} />} label="Actualizada" value={formatDate(labor.updated_at)} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
};