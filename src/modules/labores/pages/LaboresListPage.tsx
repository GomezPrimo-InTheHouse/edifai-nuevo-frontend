import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Button, Chip, IconButton, LinearProgress, MenuItem, Paper,
  Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow,
  Tabs, TextField, Typography,
} from '@mui/material';
import { Archive, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { LaborEstadoChip } from '../components/LaborEstadoChip';
import { LaborCardMobile } from '../components/LaborCardMobile';
import { TrabajadoresAsignados } from '../components/TrabajadoresAsignados';
import { useDeleteLabor, useLaboresList, useLaboresArchivadas, useMisLabores } from '../hooks/useLabores';
import { useObrasList } from '../../obras/hooks/useObras';
import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
import { useEspecialidadesList } from '../../trabajadores/hooks/useEspecialidades';
import { estadoApi } from '../../../services/api/estado.api';
import { useNotify } from '../../../shared/hooks/useNotify';
import { useAuthStore } from '../../../app/store/auth.store';

const PROGRESO_MAP: Record<string, number> = {
  'Planificada': 0, 'Labor en proceso': 25, 'Avanzada': 50, 'Muy avanzada': 75, 'Finalizada': 100,
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
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [tab, setTab] = useState(0);

  const user = useAuthStore((s) => s.user);
  const esWorker = user?.rol_id === 7 || user?.rol_id === 8;

  const { data: dataAdmin, isLoading: loadingAdmin, isError: errorAdmin, refetch: refetchAdmin } = useLaboresList();
  const { data: dataMisLabores, isLoading: loadingWorker, isError: errorWorker, refetch: refetchWorker } = useMisLabores();
  const { data: laboresArchivadas = [], isLoading: loadingArchivadas } = useLaboresArchivadas();

  const data      = esWorker ? dataMisLabores : dataAdmin;
  const isLoading = tab === 1 ? loadingArchivadas : (esWorker ? loadingWorker : loadingAdmin);
  const isError   = esWorker ? errorWorker : errorAdmin;
  const refetch   = esWorker ? refetchWorker : refetchAdmin;

  const { data: obras = [] }          = useObrasList();
  const { data: trabajadores = [] }   = useTrabajadoresList();
  const { data: especialidades = [] } = useEspecialidadesList();
  const deleteMutation = useDeleteLabor();

  const { data: estadosLabor = [] } = useQuery({
    queryKey: ['estados', 'labor'],
    queryFn: () => estadoApi.getByAmbito('labor'),
  });

  const obraIdFiltro = searchParams.get('obra_id') ? Number(searchParams.get('obra_id')) : '';

  const especialidadesOpciones = useMemo(() => {
    const base = tab === 1 ? laboresArchivadas : (data ?? []);
    const filtered = obraIdFiltro ? base.filter((l) => l.obra_id === obraIdFiltro) : base;
    const seen = new Set<string>();
    return filtered
      .filter((l) => l.especialidad_nombre && !seen.has(l.especialidad_nombre) && seen.add(l.especialidad_nombre))
      .map((l) => l.especialidad_nombre as string);
  }, [data, laboresArchivadas, tab, obraIdFiltro]);

  const filteredData = useMemo(() => {
    const base = tab === 1 ? laboresArchivadas : (data ?? []);
    let result = base;
    if (obraIdFiltro) result = result.filter((l) => l.obra_id === obraIdFiltro);
    if (filtroEspecialidad) result = result.filter((l) => l.especialidad_nombre === filtroEspecialidad);
    const term = search.trim().toLowerCase();
    if (term) result = result.filter((l) =>
      l.nombre?.toLowerCase().includes(term) || l.descripcion?.toLowerCase().includes(term)
    );
    return result;
  }, [data, laboresArchivadas, tab, search, obraIdFiltro, filtroEspecialidad]);

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

  const handleTabChange = (_: any, v: number) => {
    setTab(v);
    setSearch('');
    setFiltroEspecialidad('');
    setSearchParams({});
  };

  return (
    <AppLayout noPadding>
      <Box sx={{ px: { xs: 0.5, md: 1 }, py: { xs: 1, md: 1.5 }, width: '100%', boxSizing: 'border-box' }}>
        <PageHeader
          title="Labores"
          subtitle={esWorker ? 'Tus labores asignadas.' : 'Gestión de labores y tareas por obra.'}
          actions={
            !esWorker && tab === 0 ? (
              <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/labores/nueva')}>
                Nueva labor
              </Button>
            ) : undefined
          }
        />

        {!esWorker && (
          <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label={`Activas${dataAdmin ? ` (${dataAdmin.length})` : ''}`} />
            <Tab
              label={`Archivadas${laboresArchivadas.length > 0 ? ` (${laboresArchivadas.length})` : ''}`}
              icon={<Archive size={14} />}
              iconPosition="start"
            />
          </Tabs>
        )}

        <Paper sx={{ p: 1.5, borderRadius: 3, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              fullWidth size="small"
              label="Buscar por nombre o descripción"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
            {!esWorker && (
              <TextField
                select fullWidth size="small" label="Filtrar por obra"
                value={obraIdFiltro}
                onChange={(e) => {
                  if (e.target.value) setSearchParams({ obra_id: String(e.target.value) });
                  else setSearchParams({});
                  setFiltroEspecialidad('');
                }}
              >
                <MenuItem value="">Todas las obras</MenuItem>
                {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
              </TextField>
            )}
            {!esWorker && (
              <TextField
                select fullWidth size="small" label="Filtrar por especialidad"
                value={filtroEspecialidad} onChange={(e) => setFiltroEspecialidad(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {especialidadesOpciones.map((esp) => (
                  <MenuItem key={esp} value={esp}>{esp}</MenuItem>
                ))}
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
        title={tab === 1 ? 'Sin labores archivadas' : 'No hay labores'}
        description={
          tab === 1 ? 'No hay labores archivadas.' :
          esWorker ? 'No tenés labores asignadas.' : 'No existen labores o la búsqueda no devolvió resultados.'
        }
        action={!esWorker && tab === 0 ? <Button variant="contained" onClick={() => navigate('/labores/nueva')}>Crear primera labor</Button> : undefined}
      />
    ) : (
      <>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, color: '#64748B' }}>
          {tab === 1 ? 'LABORES ARCHIVADAS' : 'LABORES REGISTRADAS'} ({filteredData.length})
        </Typography>

        {/* VISTA MÓVIL */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
          {filteredData.map((l) => (
            <LaborCardMobile
              key={l.id}
              labor={l}
              estadoNombre={getEstadoNombre(l.estado_id)}
              obraNombre={tab === 1 ? (l.obra_nombre ?? '-') : getObraNombre(l.obra_id)}
              progreso={getProgreso(l.estado_id)}
              color={getProgressColor(getProgreso(l.estado_id))}
              esWorker={esWorker}
              archivado={tab === 1}
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
                const obraNombre = tab === 1 ? (l.obra_nombre ?? '-') : getObraNombre(l.obra_id);
                return (
                  <TableRow key={l.id} hover sx={{ opacity: tab === 1 ? 0.8 : 1 }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{l.nombre}</Typography>
                        {tab === 1 && <Chip label="Archivada" size="small" color="warning" variant="outlined" />}
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2">{obraNombre}</Typography></TableCell>
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
                        {!esWorker && tab === 0 && (
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

    {tab === 0 && (
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
    )}
  </>
)}
      </Box>
    </AppLayout>
  );
};