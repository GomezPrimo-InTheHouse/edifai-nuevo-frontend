import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, IconButton, Paper, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { Eye, Pencil, Plus, Settings, Trash2 } from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { EspecialidadModal } from '../components/EspecialidadModal';
import { useDeleteTrabajador, useTrabajadoresList } from '../hooks/useTrabajadores';
import { useEspecialidadesList } from '../hooks/useEspecialidades';

export const TrabajadoresListPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useTrabajadoresList();
  const { data: especialidades = [] } = useEspecialidadesList();
  const deleteMutation = useDeleteTrabajador();
  const [search, setSearch] = useState('');
  const [especialidadModalOpen, setEspecialidadModalOpen] = useState(false);

  // Filtrado por nombre, apellido o DNI
  const filteredData = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((t) =>
      t.nombre?.toLowerCase().includes(term) ||
      t.apellido?.toLowerCase().includes(term) ||
      t.dni?.toLowerCase().includes(term)
    );
  }, [data, search]);

  // Handler de eliminación
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar este trabajador?');
    if (!confirmed) return;
    await deleteMutation.mutateAsync(id);
  };

  // Resuelve nombre de especialidad desde ID
  const getEspecialidadNombre = (id?: number | null) =>
    especialidades.find((e) => e.id === id)?.nombre ?? '-';

  return (
    <AppLayout>
      <PageHeader
        title="Trabajadores"
        subtitle="Gestión del personal registrado en el sistema."
        actions={
          <Stack direction="row" spacing={1}>
            {/* Botón para gestionar especialidades */}
            <Button variant="outlined" startIcon={<Settings size={16} />} onClick={() => setEspecialidadModalOpen(true)}>
              Especialidades
            </Button>
            <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/trabajadores/nuevo')}>
              Nuevo trabajador
            </Button>
          </Stack>
        }
      />

      {/* Buscador */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <TextField fullWidth label="Buscar por nombre, apellido o DNI" value={search} onChange={(e) => setSearch(e.target.value)} />
      </Paper>

      {isLoading && <LoadingState message="Cargando trabajadores..." />}
      {isError && <ErrorState title="Error al cargar trabajadores" message="Revisa la conexión con el microservicio." onRetry={refetch} />}
      {!isLoading && !isError && filteredData.length === 0 && (
        <EmptyState
          title="No hay trabajadores"
          description="Aún no existen trabajadores o la búsqueda no devolvió resultados."
          action={<Button variant="contained" onClick={() => navigate('/trabajadores/nuevo')}>Crear primero</Button>}
        />
      )}

      {/* Tabla principal */}
      {!isLoading && !isError && filteredData.length > 0 && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>DNI</TableCell>
                <TableCell>Especialidad</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{t.nombre} {t.apellido}</Typography>
                  </TableCell>
                  <TableCell>{t.dni}</TableCell>
                  <TableCell>{getEspecialidadNombre(t.especialidad_id)}</TableCell>
                  <TableCell>{t.telefono || '-'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <IconButton onClick={() => navigate(`/trabajadores/${t.id}`)}><Eye size={18} /></IconButton>
                      <IconButton onClick={() => navigate(`/trabajadores/${t.id}/editar`)}><Pencil size={18} /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(t.id)} disabled={deleteMutation.isPending}><Trash2 size={18} /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Modal de especialidades */}
      <EspecialidadModal open={especialidadModalOpen} onClose={() => setEspecialidadModalOpen(false)} />
    </AppLayout>
  );
};