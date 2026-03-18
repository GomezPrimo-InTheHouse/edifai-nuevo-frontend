import { useMemo, useState } from 'react';
import {
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { useDeleteObra, useObrasList } from '../hooks/useObras';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';

export function ObrasListPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useObrasList();
  const deleteMutation = useDeleteObra();
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();

    if (!term) return data;

    return data.filter(
      (obra) =>
        obra.nombre?.toLowerCase().includes(term) ||
        obra.ubicacion?.toLowerCase().includes(term) ||
        obra.descripcion?.toLowerCase().includes(term)
    );
  }, [data, search]);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar esta obra?');
    if (!confirmed) return;

    await deleteMutation.mutateAsync(id);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Obras"
        subtitle="Gestión general de obras y proyectos."
        actions={
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => navigate('/obras/nueva')}
          >
            Nueva obra
          </Button>
        }
      />

      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <TextField
          fullWidth
          label="Buscar por nombre, ubicación o descripción"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Paper>

      {isLoading && <LoadingState message="Cargando obras..." />}

      {isError && (
        <ErrorState
          title="No se pudieron cargar las obras"
          message="Revisa la conexión con el microservicio de obras."
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && filteredData.length === 0 && (
        <EmptyState
          title="No hay obras cargadas"
          description="Aún no existen obras o la búsqueda no devolvió resultados."
          action={
            <Button variant="contained" onClick={() => navigate('/obras/nueva')}>
              Crear primera obra
            </Button>
          }
        />
      )}

      {!isLoading && !isError && filteredData.length > 0 && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Inicio estimado</TableCell>
                <TableCell>Fin estimado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredData.map((obra) => (
                <TableRow key={obra.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{obra.nombre}</Typography>
                  </TableCell>
                  <TableCell>{obra.ubicacion || '-'}</TableCell>
                  <TableCell>{obra.fecha_inicio_estimado || '-'}</TableCell>
                  <TableCell>{obra.fecha_fin_estimado || '-'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <IconButton onClick={() => navigate(`/obras/${obra.id}`)}>
                        <Eye size={18} />
                      </IconButton>
                      <IconButton
                        onClick={() => navigate(`/obras/${obra.id}/editar`)}
                      >
                        <Pencil size={18} />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(obra.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={18} />
                      </IconButton>
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
}