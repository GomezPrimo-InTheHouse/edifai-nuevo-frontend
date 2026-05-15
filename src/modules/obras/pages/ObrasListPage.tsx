

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
  Box,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import { Eye, Pencil, Plus, Settings, Trash2, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { useDeleteObra, useObrasList } from '../hooks/useObras';
import { TipoObraModal } from '../modal/tipoObraModal';

export function ObrasListPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data, isLoading, isError, refetch } = useObrasList();
  const deleteMutation = useDeleteObra();

  const [search, setSearch] = useState('');
  const [tipoObraModalOpen, setTipoObraModalOpen] = useState(false);

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
          <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="outlined"
              fullWidth={isMobile}
              startIcon={<Settings size={16} />}
              onClick={() => setTipoObraModalOpen(true)}
              sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
            >
              Tipos
            </Button>
            <Button
              variant="contained"
              fullWidth={isMobile}
              startIcon={<Plus size={18} />}
              onClick={() => navigate('/obras/nueva')}
              sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, whiteSpace: 'nowrap' }}
            >
              Nueva Obra
            </Button>
          </Stack>
        }
      />

      {/* Buscador Optimizado */}
      <Paper sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3, mb: 3, boxShadow: 'none', border: '1px solid var(--border)' }}>
        <TextField
          fullWidth
          size={isMobile ? "small" : "medium"}
          placeholder="Buscar obra o ubicación..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Paper>

      {isLoading && <LoadingState message="Cargando obras..." />}
      {isError && <ErrorState title="Error" message="No se cargaron las obras." onRetry={refetch} />}
      {!isLoading && !isError && filteredData.length === 0 && (
        <EmptyState title="Sin resultados" action={<Button variant="contained" onClick={() => navigate('/obras/nueva')}>Crear obra</Button>} />
      )}

      {/* VISTA MÓVIL (Cards) */}
      {!isLoading && !isError && filteredData.length > 0 && isMobile && (
        <Stack spacing={2}>
          {filteredData.map((obra) => (
            <Paper key={obra.id} sx={{ p: 2, borderRadius: 3, border: '1px solid var(--border)', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} color="primary">
                  {obra.nombre}
                </Typography>
                <Typography variant="caption" sx={{ bgcolor: 'var(--accent-bg)', px: 1, py: 0.5, borderRadius: 1, color: 'var(--accent)' }}>
                  ID: {obra.id}
                </Typography>
              </Box>

              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MapPin size={14} color="#64748B" />
                  <Typography variant="body2" color="text.secondary">{obra.ubicacion || 'Sin ubicación'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Calendar size={14} color="#64748B" />
                  <Typography variant="caption" color="text.secondary">
                    {obra.fecha_inicio_estimado || '-'} / {obra.fecha_fin_estimado || '-'}
                  </Typography>
                </Box>
              </Stack>
              
              <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Button size="small" startIcon={<Eye size={18} />} onClick={() => navigate(`/obras/${obra.id}`)}>Ver</Button>
                <Button size="small" startIcon={<Pencil size={18} />} onClick={() => navigate(`/obras/${obra.id}/editar`)}>Editar</Button>
                <IconButton color="error" size="small" onClick={() => handleDelete(obra.id)} disabled={deleteMutation.isPending}>
                  <Trash2 size={18} />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      {/* VISTA DESKTOP (Tabla) */}
      {!isLoading && !isError && filteredData.length > 0 && !isMobile && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'none' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'var(--social-bg)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ubicación</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Inicio estimado</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fin estimado</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((obra) => (
                <TableRow key={obra.id} hover>
                  <TableCell><Typography variant="body2" fontWeight={600}>{obra.nombre}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{obra.ubicacion || '-'}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{obra.fecha_inicio_estimado || '-'}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{obra.fecha_fin_estimado || '-'}</Typography></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                      <IconButton size="small" onClick={() => navigate(`/obras/${obra.id}`)}><Eye size={18} /></IconButton>
                      <IconButton size="small" onClick={() => navigate(`/obras/${obra.id}/editar`)}><Pencil size={18} /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(obra.id)} disabled={deleteMutation.isPending}><Trash2 size={18} /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <TipoObraModal open={tipoObraModalOpen} onClose={() => setTipoObraModalOpen(false)} />
    </AppLayout>
  );
}