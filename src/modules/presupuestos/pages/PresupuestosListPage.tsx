import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, IconButton, Paper, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { PresupuestoEstadoChip } from '../components/PresupuestoEstadoChip';
import { useDeletePresupuesto, usePresupuestosList } from '../hooks/usePresupuestos';
import { useLaboresList } from '../../labores/hooks/useLabores';
import { useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';
import { useNotify } from '../../../shared/hooks/useNotify';

export const PresupuestosListPage = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { data, isLoading, isError, refetch } = usePresupuestosList();
  const { data: labores = [] } = useLaboresList();
  const { data: todosEstados = [] } = useEstadosGenerales();
  const estados = todosEstados.filter((e) => e.ambito === 'presupuesto');
  const deleteMutation = useDeletePresupuesto();
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((p) => p.nombre?.toLowerCase().includes(term));
  }, [data, search]);

  const getLaborNombre = (id?: number | null) => labores.find((l) => l.id === id)?.nombre ?? '-';
  const getEstadoNombre = (id?: number | null) => estados.find((e) => e.id === id)?.nombre;

  const handleDelete = async (id: number) => {
    const confirmed = await notify.confirm({
      title: '¿Eliminar presupuesto?',
      message: 'Se eliminarán también los materiales asociados.',
      confirmLabel: 'Eliminar',
      severity: 'error',
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(id);
      notify.success('Presupuesto eliminado.');
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'No se pudo eliminar.');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Presupuestos"
        subtitle="Gestión de presupuestos vinculados a labores."
        actions={
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/presupuestos/nuevo')}>
            Nuevo presupuesto
          </Button>
        }
      />

      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <TextField fullWidth label="Buscar por nombre" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Paper>

      {isLoading && <LoadingState message="Cargando presupuestos..." />}
      {isError && <ErrorState title="Error" message="No se pudieron cargar los presupuestos." onRetry={refetch} />}
      {!isLoading && !isError && filteredData.length === 0 && (
        <EmptyState
          title="Sin presupuestos"
          description="No hay presupuestos creados."
          action={<Button variant="contained" onClick={() => navigate('/presupuestos/nuevo')}>Crear primero</Button>}
        />
      )}

      {!isLoading && !isError && filteredData.length > 0 && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Labor</TableCell>
                <TableCell>Total estimado</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell><Typography fontWeight={600}>{p.nombre || `Presupuesto #${p.id}`}</Typography></TableCell>
                  <TableCell>{getLaborNombre(p.labor_id)}</TableCell>
                  <TableCell>${Number(p.total_estimado ?? 0).toLocaleString('es-AR')}</TableCell>
                  <TableCell><PresupuestoEstadoChip estadoNombre={getEstadoNombre(p.estado_id)} /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <IconButton onClick={() => navigate(`/presupuestos/${p.id}`)}><Eye size={18} /></IconButton>
                      <IconButton onClick={() => navigate(`/presupuestos/${p.id}/editar`)}><Pencil size={18} /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(p.id)} disabled={deleteMutation.isPending}><Trash2 size={18} /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </AppLayout>
  );
};