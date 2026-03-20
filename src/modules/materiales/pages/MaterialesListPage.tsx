import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, IconButton, Paper, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { Eye, Pencil, Plus, Settings, Trash2, TrendingUp } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { StockBadge } from '../components/StockBadge';
import { TipoMaterialModal } from '../components/TipoMaterialModal';
import { AjustePreciosModal } from '../components/AjustePreciosModal';
import { useDeleteMaterial, useMaterialesList } from '../hooks/useMateriales';
import { useTiposMaterialList } from '../hooks/useTipoMaterial';
import { useNotify } from '../../../shared/hooks/useNotify';

export const MaterialesListPage = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { data, isLoading, isError, refetch } = useMaterialesList();
  const { data: tipos = [] } = useTiposMaterialList();
  const deleteMutation = useDeleteMaterial();
  const [search, setSearch] = useState('');
  const [tipoModalOpen, setTipoModalOpen] = useState(false);
  const [ajusteModalOpen, setAjusteModalOpen] = useState(false);

  const filteredData = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((m) =>
      m.nombre?.toLowerCase().includes(term) ||
      m.descripcion?.toLowerCase().includes(term)
    );
  }, [data, search]);

  const getTipoNombre = (id?: number | null) => tipos.find((t) => t.id === id)?.nombre ?? '-';

  const handleDelete = async (id: number) => {
    const confirmed = await notify.confirm({
      title: '¿Eliminar material?',
      message: 'Solo se puede eliminar si no está en presupuestos activos.',
      confirmLabel: 'Eliminar',
      severity: 'error',
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(id);
      notify.success('Material eliminado.');
    } catch (error: any) {
      notify.error(error?.response?.data?.message || 'No se pudo eliminar.');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Materiales"
        subtitle="Gestión de materiales y stock."
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Settings size={16} />} onClick={() => setTipoModalOpen(true)}>
              Tipos
            </Button>
            <Button variant="outlined" color="warning" startIcon={<TrendingUp size={16} />} onClick={() => setAjusteModalOpen(true)}>
              Ajuste de precios
            </Button>
            <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/materiales/nuevo')}>
              Nuevo material
            </Button>
          </Stack>
        }
      />

      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <TextField fullWidth label="Buscar por nombre o descripción" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Paper>

      {isLoading && <LoadingState message="Cargando materiales..." />}
      {isError && <ErrorState title="Error al cargar materiales" message="Revisa la conexión con el microservicio." onRetry={refetch} />}
      {!isLoading && !isError && filteredData.length === 0 && (
        <EmptyState
          title="No hay materiales"
          description="No existen materiales o la búsqueda no devolvió resultados."
          action={<Button variant="contained" onClick={() => navigate('/materiales/nuevo')}>Crear primero</Button>}
        />
      )}

      {!isLoading && !isError && filteredData.length > 0 && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Unidad</TableCell>
                <TableCell>Precio unitario</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell><Typography fontWeight={600}>{m.nombre}</Typography></TableCell>
                  <TableCell>{getTipoNombre(m.tipo_material_id)}</TableCell>
                  <TableCell>{m.unidad}</TableCell>
                  <TableCell>${Number(m.precio_unitario).toLocaleString('es-AR')}</TableCell>
                  <TableCell><StockBadge stock={Number(m.stock_actual)} unidad={m.unidad} /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <IconButton onClick={() => navigate(`/materiales/${m.id}`)}><Eye size={18} /></IconButton>
                      <IconButton onClick={() => navigate(`/materiales/${m.id}/editar`)}><Pencil size={18} /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(m.id)} disabled={deleteMutation.isPending}><Trash2 size={18} /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <TipoMaterialModal open={tipoModalOpen} onClose={() => setTipoModalOpen(false)} />
      <AjustePreciosModal open={ajusteModalOpen} onClose={() => setAjusteModalOpen(false)} />
    </AppLayout>
  );
};