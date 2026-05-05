import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Button, IconButton, LinearProgress, MenuItem, Paper,
  Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { LaborEstadoChip } from '../components/LaborEstadoChip';
import { LaborCardMobile } from '../components/LaborCardMobile';
import { TrabajadoresAsignados } from '../components/TrabajadoresAsignados';
import { useDeleteLabor, useLaboresList, useMisLabores } from '../hooks/useLabores';
import { useObrasList } from '../../obras/hooks/useObras';
import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
import { useEspecialidadesList } from '../../trabajadores/hooks/useEspecialidades';
import { estadoApi } from '../../../services/api/estado.api';
import { useNotify } from '../../../shared/hooks/useNotify';
import { useAuthStore } from '../../../app/store/auth.store';

const PROGRESO_MAP: Record<string, number> = {
  'Planificada': 0,
  'Labor en proceso': 25,
  'Avanzada': 50,
  'Muy avanzada': 75,
  'Finalizada': 100,
};

export function getProgressColor(progreso: number): string {
  if (progreso === 100) return '#16A34A';
  if (progreso >= 75) return '#2563EB';
  if (progreso >= 50) return '#F59E0B';
  if (progreso >= 25) return '#EA580C';
  return '#94A3B8';
}

export const LaboresListPage = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const user = useAuthStore((s) => s.user);
  const esWorker = user?.rol_id === 7 || user?.rol_id === 8;

  const { data: dataAdmin, isLoading: loadingAdmin, isError: errorAdmin, refetch: refetchAdmin } = useLaboresList();
  const { data: dataMisLabores, isLoading: loadingWorker, isError: errorWorker, refetch: refetchWorker } = useMisLabores();

  const data      = esWorker ? dataMisLabores : dataAdmin;
  const isLoading = esWorker ? loadingWorker  : loadingAdmin;
  const isError   = esWorker ? errorWorker    : errorAdmin;
  const refetch   = esWorker ? refetchWorker  : refetchAdmin;

  const { data: obras = [] }          = useObrasList();
  const { data: trabajadores = [] }   = useTrabajadoresList();
  const { data: especialidades = [] } = useEspecialidadesList();
  const deleteMutation = useDeleteLabor();

  const { data: estadosLabor = [] } = useQuery({
    queryKey: ['estados', 'labor'],
    queryFn: () => estadoApi.getByAmbito('labor'),
  });

  const obraIdFiltro = searchParams.get('obra_id') ? Number(searchParams.get('obra_id')) : '';

  const filteredData = useMemo(() => {
    if (!data) return [];
    let result = data;
    if (obraIdFiltro) result = result.filter((l) => l.obra_id === obraIdFiltro);
    const term = search.trim().toLowerCase();
    if (term) result = result.filter((l) =>
      l.nombre?.toLowerCase().includes(term) || l.descripcion?.toLowerCase().includes(term)
    );
    return result;
  }, [data, search, obraIdFiltro]);

  const laboresConTrabajador = useMemo(() => (data ?? []).filter((l) => l.trabajador_id != null), [data]);

  const getObraNombre         = (id?: number | null) => obras.find((o) => o.id === id)?.nombre ?? '-';
  const getEstadoNombre       = (id?: number | null) => estadosLabor.find((e) => e.id === id)?.nombre;
  const getTrabajador         = (id?: number | null) => trabajadores.find((t) => t.id === id);
  const getEspecialidadNombre = (id?: number | null) => especialidades.find((e) => e.id === id)?.nombre ?? '-';
  const getProgreso           = (estadoId?: number | null) => {
    const nombre = getEstadoNombre(estadoId);
    return nombre ? PROGRESO_MAP[nombre] ?? 0 : 0;
  };

  const handleDelete = async (id: number) => {
    if (!await notify.confirm({ title: '¿Dar de baja esta labor?', message: 'Esta acción no se puede deshacer.', confirmLabel: 'Eliminar', severity: 'error' })) return;
    try {
      await deleteMutation.mutateAsync(id);
      notify.success('Labor eliminada.');
    } catch {
      notify.error('No se pudo eliminar la labor.');
    }
  };

  return (
    <AppLayout noPadding>
      <Box sx={{ px: { xs: 0.5, md: 1 }, py: { xs: 1, md: 1.5 }, width: '100%', boxSizing: 'border-box' }}>
        <PageHeader
          title="Labores"
          subtitle={esWorker ? 'Tus labores asignadas.' : 'Gestión de labores y tareas por obra.'}
          actions={
            !esWorker ? (
              <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/labores/nueva')}>
                Nueva labor
              </Button>
            ) : undefined
          }
        />

        <Paper sx={{ p: 1.5, borderRadius: 3, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField fullWidth size="small" label="Buscar por nombre o descripción" value={search} onChange={(e) => setSearch(e.target.value)} />
            {!esWorker && (
              <TextField
                select fullWidth size="small" label="Filtrar por obra"
                value={obraIdFiltro}
                onChange={(e) => e.target.value ? setSearchParams({ obra_id: String(e.target.value) }) : setSearchParams({})}
              >
                <MenuItem value="">Todas las obras</MenuItem>
                {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
              </TextField>
            )}
          </Stack>
        </Paper>

        {isLoading && <LoadingState message="Cargando labores..." />}
        {isError && <ErrorState title="Error al cargar labores" message="Revisa la conexión con el microservicio." onRetry={refetch} />}

        {!isLoading && !isError && (
          <>
            {filteredData.length === 0 ? (
              <EmptyState
                title="No hay labores"
                description={esWorker ? 'No tenés labores asignadas.' : 'No existen labores o la búsqueda no devolvió resultados.'}
                action={!esWorker ? <Button variant="contained" onClick={() => navigate('/labores/nueva')}>Crear primera labor</Button> : undefined}
              />
            ) : (
              <>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, color: '#64748B' }}>
                  LABORES REGISTRADAS ({filteredData.length})
                </Typography>

                {/* VISTA MÓVIL */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                  {filteredData.map((l) => (
                    <LaborCardMobile
                      key={l.id}
                      labor={l}
                      estadoNombre={getEstadoNombre(l.estado_id)}
                      obraNombre={getObraNombre(l.obra_id)}
                      progreso={getProgreso(l.estado_id)}
                      color={getProgressColor(getProgreso(l.estado_id))}
                      esWorker={esWorker}
                      onDelete={handleDelete}
                      isDeleting={deleteMutation.isPending}
                    />
                  ))}
                </Box>

                {/* VISTA ESCRITORIO */}
                <Paper sx={{ display: { xs: 'none', md: 'block' }, borderRadius: 3, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Obra</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Inicio estimado</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Fin estimado</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Progreso</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredData.map((l) => {
                        const progreso = getProgreso(l.estado_id);
                        const color = getProgressColor(progreso);
                        return (
                          <TableRow key={l.id} hover>
                            <TableCell><Typography variant="body2" fontWeight={600}>{l.nombre}</Typography></TableCell>
                            <TableCell><Typography variant="body2">{getObraNombre(l.obra_id)}</Typography></TableCell>
                            <TableCell><Typography variant="body2">{l.fecha_inicio_estimada ? new Date(l.fecha_inicio_estimada).toLocaleDateString('es-AR') : '-'}</Typography></TableCell>
                            <TableCell><Typography variant="body2">{l.fecha_fin_estimada ? new Date(l.fecha_fin_estimada).toLocaleDateString('es-AR') : '-'}</Typography></TableCell>
                            <TableCell sx={{ minWidth: 160 }}>
                              <Stack spacing={0.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <LaborEstadoChip estadoNombre={getEstadoNombre(l.estado_id)} />
                                  <Typography variant="caption" fontWeight={700} sx={{ color }}>{progreso}%</Typography>
                                </Stack>
                                <LinearProgress variant="determinate" value={progreso} sx={{ height: 6, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { borderRadius: 3, backgroundColor: color } }} />
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                                <IconButton size="small" onClick={() => navigate(`/labores/${l.id}`)}><Eye size={16} /></IconButton>
                                {!esWorker && (
                                  <>
                                    <IconButton size="small" onClick={() => navigate(`/labores/${l.id}/editar`)}><Pencil size={16} /></IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(l.id)} disabled={deleteMutation.isPending}><Trash2 size={16} /></IconButton>
                                  </>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Paper>
              </>
            )}

            <TrabajadoresAsignados
              laboresConTrabajador={laboresConTrabajador}
              getObraNombre={getObraNombre}
              getEstadoNombre={getEstadoNombre}
              getTrabajador={getTrabajador}
              getEspecialidadNombre={getEspecialidadNombre}
              getProgreso={getProgreso}
              getProgressColor={getProgressColor}
              esWorker={esWorker}
            />
          </>
        )}
      </Box>
    </AppLayout>
  );
};