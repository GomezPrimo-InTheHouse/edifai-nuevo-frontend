import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button, Chip, IconButton, MenuItem, Paper, Stack,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { LaborEstadoChip } from '../components/LaborEstadoChip';
import { useDeleteLabor, useLaboresList } from '../hooks/useLabores';
import { useObrasList } from '../../obras/hooks/useObras';
import { useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';

export const LaboresListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useLaboresList();
  const { data: obras = [] } = useObrasList();
  const { data: estados = [] } = useEstadosGenerales();
  const deleteMutation = useDeleteLabor();

  // Filtro por obra desde query param ?obra_id=
  const obraIdFiltro = searchParams.get('obra_id') ? Number(searchParams.get('obra_id')) : '';

  const filteredData = useMemo(() => {
    if (!data) return [];
    let result = data;
    if (obraIdFiltro) result = result.filter((l) => l.obra_id === obraIdFiltro);
    const term = search.trim().toLowerCase();
    if (term) result = result.filter((l) => l.nombre?.toLowerCase().includes(term) || l.descripcion?.toLowerCase().includes(term));
    return result;
  }, [data, search, obraIdFiltro]);

  const getObraNombre = (id?: number | null) => obras.find((o) => o.id === id)?.nombre ?? '-';
  const getEstadoNombre = (id?: number | null) => estados.find((e) => e.id === id)?.nombre;

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Dar de baja esta labor?')) return;
    await deleteMutation.mutateAsync(id);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Labores"
        subtitle="Gestión de labores y tareas por obra."
        actions={
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/labores/nueva')}>
            Nueva labor
          </Button>
        }
      />

      {/* Filtros */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth label="Buscar por nombre o descripción"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
          <TextField
            select fullWidth label="Filtrar por obra"
            value={obraIdFiltro}
            onChange={(e) => {
              const val = e.target.value;
              val ? setSearchParams({ obra_id: String(val) }) : setSearchParams({});
            }}
          >
            <MenuItem value="">Todas las obras</MenuItem>
            {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
          </TextField>
        </Stack>
      </Paper>

      {isLoading && <LoadingState message="Cargando labores..." />}
      {isError && <ErrorState title="Error al cargar labores" message="Revisa la conexión con el microservicio." onRetry={refetch} />}
      {!isLoading && !isError && filteredData.length === 0 && (
        <EmptyState
          title="No hay labores"
          description="No existen labores o la búsqueda no devolvió resultados."
          action={<Button variant="contained" onClick={() => navigate('/labores/nueva')}>Crear primera labor</Button>}
        />
      )}

      {/* Tabla */}
      {!isLoading && !isError && filteredData.length > 0 && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Obra</TableCell>
                <TableCell>Inicio estimado</TableCell>
                <TableCell>Fin estimado</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((l) => (
                <TableRow key={l.id} hover>
                  <TableCell><Typography fontWeight={600}>{l.nombre}</Typography></TableCell>
                  <TableCell>{getObraNombre(l.obra_id)}</TableCell>
                  <TableCell>{l.fecha_inicio_estimada ? new Date(l.fecha_inicio_estimada).toLocaleDateString('es-AR') : '-'}</TableCell>
                  <TableCell>{l.fecha_fin_estimada ? new Date(l.fecha_fin_estimada).toLocaleDateString('es-AR') : '-'}</TableCell>
                  <TableCell><LaborEstadoChip estadoNombre={getEstadoNombre(l.estado_id)} /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <IconButton onClick={() => navigate(`/labores/${l.id}`)}><Eye size={18} /></IconButton>
                      <IconButton onClick={() => navigate(`/labores/${l.id}/editar`)}><Pencil size={18} /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(l.id)} disabled={deleteMutation.isPending}><Trash2 size={18} /></IconButton>
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