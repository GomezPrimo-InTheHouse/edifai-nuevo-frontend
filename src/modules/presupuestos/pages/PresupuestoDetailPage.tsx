import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Divider, Grid,
  MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { ArrowLeft, Calendar, FileText, Pencil, DollarSign } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { PresupuestoEstadoChip } from '../components/PresupuestoEstadoChip';
import { MaterialesPresupuesto } from '../components/MaterialesPresupuesto';
import { usePresupuestoDetail, useCambiarEstadoPresupuesto } from '../hooks/usePresupuestos';
import { useLaboresList } from '../../labores/hooks/useLabores';
import { useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';
import { useNotify } from '../../../shared/hooks/useNotify';

function formatDate(v?: string | null) {
  if (!v) return '-';
  return new Date(v).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

export const PresupuestoDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const presupuestoId = Number(id);
  const notify = useNotify();

  const { data: presupuesto, isLoading, isError, refetch } = usePresupuestoDetail(presupuestoId);
  const { data: labores = [] } = useLaboresList();
  const { data: todosEstados = [] } = useEstadosGenerales();
  const estados = todosEstados.filter((e) => e.ambito === 'presupuesto');
  const cambiarEstadoMutation = useCambiarEstadoPresupuesto();

  if (isLoading) return <LoadingState message="Cargando presupuesto..." />;
  if (isError) return <ErrorState title="Error" message="No se pudo cargar el presupuesto." onRetry={refetch} />;
  if (!presupuesto) return <ErrorState title="No encontrado" message="El presupuesto no existe." />;

  const laborNombre = labores.find((l) => l.id === presupuesto.labor_id)?.nombre ?? '-';
  const estadoNombre = estados.find((e) => e.id === presupuesto.estado_id)?.nombre;
  const confirmado = estadoNombre === 'Confirmado';

  const costoManoObra = Number(presupuesto.costo_mano_obra ?? 0);
const totalEstimado = Number(presupuesto.total_estimado ?? 0);
// Nunca mostrar negativo — si no hay materiales, es 0
const costoMateriales = Math.max(0, totalEstimado - costoManoObra);

  const handleCambiarEstado = async (estado_id: number) => {
    const nuevoEstado = estados.find((e) => e.id === estado_id)?.nombre;
    const esConfirmar = nuevoEstado === 'Confirmado';
    const confirmed = await notify.confirm({
      title: esConfirmar ? '¿Confirmar presupuesto?' : '¿Cambiar estado?',
      message: esConfirmar
        ? 'Al confirmar, se descontará el stock de los materiales. Esta acción puede revertirse.'
        : '¿Seguro que querés cambiar el estado?',
      confirmLabel: esConfirmar ? 'Confirmar y descontar stock' : 'Cambiar',
      severity: esConfirmar ? 'warning' : undefined,
    });
    if (!confirmed) return;
    try {
      await cambiarEstadoMutation.mutateAsync({ id: presupuestoId, estado_id });
      notify.success('Estado actualizado.');
    } catch {
      notify.error('No se pudo cambiar el estado.');
    }
  };
console.log('PRESUPUESTO:', presupuesto);
  return (
    <AppLayout>
      <PageHeader
        title={presupuesto.nombre || `Presupuesto #${presupuesto.id}`}
        subtitle="Vista detallada del presupuesto."
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/presupuestos')}>Volver</Button>
            {!confirmado && (
              <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => navigate(`/presupuestos/${presupuesto.id}/editar`)}>Editar</Button>
            )}
          </Stack>
        }
      />

      <Grid container spacing={3}>
        {/* Panel principal */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Información general</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2.5}>
                <DetailRow icon={<FileText size={16} />} label="Labor asociada" value={laborNombre} />
                <DetailRow icon={<FileText size={16} />} label="Descripción" value={presupuesto.descripcion || '-'} />
                <DetailRow
                  icon={<DollarSign size={16} />}
                  label="Costo mano de obra"
                  value={`$${costoManoObra.toLocaleString('es-AR')}`}
                />
                <DetailRow icon={<Calendar size={16} />} label="Creado" value={formatDate(presupuesto.created_at)} />
                <DetailRow icon={<Calendar size={16} />} label="Actualizado" value={formatDate(presupuesto.updated_at)} />
              </Stack>
            </CardContent>
          </Card>

          {/* Materiales */}
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <MaterialesPresupuesto presupuestoId={presupuestoId} confirmado={confirmado} />
            </CardContent>
          </Card>
        </Grid>

        {/* Panel lateral */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Estado</Typography>
              <Divider sx={{ mb: 3 }} />
              <PresupuestoEstadoChip estadoNombre={estadoNombre} />

              {/* Cambio rápido de estado */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#64748B' }}>CAMBIAR ESTADO</Typography>
                <TextField
                  select fullWidth size="small"
                  value={presupuesto.estado_id ?? ''}
                  onChange={(e) => handleCambiarEstado(Number(e.target.value))}
                  disabled={cambiarEstadoMutation.isPending}
                >
                  {estados.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
                </TextField>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Desglose del total */}
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={700} sx={{ color: '#64748B' }}>DESGLOSE</Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Materiales</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ${costoMateriales.toLocaleString('es-AR')}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Mano de obra</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ${costoManoObra.toLocaleString('es-AR')}
                  </Typography>
                </Stack>
              </Stack>

              {/* Total */}
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#0F172A', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>TOTAL ESTIMADO</Typography>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#FFFFFF' }}>
                  ${totalEstimado.toLocaleString('es-AR')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
};