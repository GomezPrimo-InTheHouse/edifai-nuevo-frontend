// import { useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Button, IconButton, Paper, Stack, Table, TableBody,
//   TableCell, TableHead, TableRow, TextField, Typography,
// } from '@mui/material';
// import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
// import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
// import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
// import { PresupuestoEstadoChip } from '../components/PresupuestoEstadoChip';
// import { useDeletePresupuesto, usePresupuestosList } from '../hooks/usePresupuestos';
// import { useLaboresList } from '../../labores/hooks/useLabores';
// import { useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';
// import { useNotify } from '../../../shared/hooks/useNotify';

// export const PresupuestosListPage = () => {
//   const navigate = useNavigate();
//   const notify = useNotify();
//   const { data, isLoading, isError, refetch } = usePresupuestosList();
//   const { data: labores = [] } = useLaboresList();
//   const { data: todosEstados = [] } = useEstadosGenerales();
//   const estados = todosEstados.filter((e) => e.ambito === 'presupuesto');
//   const deleteMutation = useDeletePresupuesto();
//   const [search, setSearch] = useState('');

//   const filteredData = useMemo(() => {
//     if (!data) return [];
//     const term = search.trim().toLowerCase();
//     if (!term) return data;
//     return data.filter((p) => p.nombre?.toLowerCase().includes(term));
//   }, [data, search]);

//   const getLaborNombre = (id?: number | null) => labores.find((l) => l.id === id)?.nombre ?? '-';
//   const getEstadoNombre = (id?: number | null) => estados.find((e) => e.id === id)?.nombre;

//   const handleDelete = async (id: number) => {
//     const confirmed = await notify.confirm({
//       title: '¿Eliminar presupuesto?',
//       message: 'Se eliminarán también los materiales asociados.',
//       confirmLabel: 'Eliminar',
//       severity: 'error',
//     });
//     if (!confirmed) return;
//     try {
//       await deleteMutation.mutateAsync(id);
//       notify.success('Presupuesto eliminado.');
//     } catch (error: any) {
//       notify.error(error?.response?.data?.message || 'No se pudo eliminar.');
//     }
//   };

//   return (
//     <AppLayout>
//       <PageHeader
//         title="Presupuestos"
//         subtitle="Gestión de presupuestos vinculados a labores."
//         actions={
//           <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/presupuestos/nuevo')}>
//             Nuevo presupuesto
//           </Button>
//         }
//       />

//       <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
//         <TextField fullWidth label="Buscar por nombre" value={search} onChange={(e) => setSearch(e.target.value)} />
//       </Paper>

//       {isLoading && <LoadingState message="Cargando presupuestos..." />}
//       {isError && <ErrorState title="Error" message="No se pudieron cargar los presupuestos." onRetry={refetch} />}
//       {!isLoading && !isError && filteredData.length === 0 && (
//         <EmptyState
//           title="Sin presupuestos"
//           description="No hay presupuestos creados."
//           action={<Button variant="contained" onClick={() => navigate('/presupuestos/nuevo')}>Crear primero</Button>}
//         />
//       )}

//       {!isLoading && !isError && filteredData.length > 0 && (
//         <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Nombre</TableCell>
//                 <TableCell>Labor</TableCell>
//                 <TableCell>Total estimado</TableCell>
//                 <TableCell>Estado</TableCell>
//                 <TableCell align="right">Acciones</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredData.map((p) => (
//                 <TableRow key={p.id} hover>
//                   <TableCell><Typography fontWeight={600}>{p.nombre || `Presupuesto #${p.id}`}</Typography></TableCell>
//                   <TableCell>{getLaborNombre(p.labor_id)}</TableCell>
//                   <TableCell>${Number(p.total_estimado ?? 0).toLocaleString('es-AR')}</TableCell>
//                   <TableCell><PresupuestoEstadoChip estadoNombre={getEstadoNombre(p.estado_id)} /></TableCell>
//                   <TableCell align="right">
//                     <Stack direction="row" justifyContent="flex-end" spacing={1}>
//                       <IconButton onClick={() => navigate(`/presupuestos/${p.id}`)}><Eye size={18} /></IconButton>
//                       <IconButton onClick={() => navigate(`/presupuestos/${p.id}/editar`)}><Pencil size={18} /></IconButton>
//                       <IconButton color="error" onClick={() => handleDelete(p.id)} disabled={deleteMutation.isPending}><Trash2 size={18} /></IconButton>
//                     </Stack>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Paper>
//       )}
//     </AppLayout>
//   );
// };

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Chip, Divider, IconButton, InputAdornment, MenuItem,
  Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data, isLoading, isError, refetch } = usePresupuestosList();
  const { data: labores = [] } = useLaboresList();
  const { data: todosEstados = [] } = useEstadosGenerales();
  const estados = todosEstados.filter((e) => e.ambito === 'presupuesto');
  const deleteMutation = useDeletePresupuesto();

  const [search, setSearch] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroTrabajador, setFiltroTrabajador] = useState('');

  // Opciones únicas para los selects
  const especialidades = useMemo(() => {
    const seen = new Set<string>();
    return labores
      .filter((l) => l.especialidad_nombre && !seen.has(l.especialidad_nombre) && seen.add(l.especialidad_nombre))
      .map((l) => l.especialidad_nombre as string);
  }, [labores]);

  const trabajadores = useMemo(() => {
    const seen = new Set<number>();
    return labores
      .filter((l) => l.trabajador_id && !seen.has(l.trabajador_id) && seen.add(l.trabajador_id))
      .map((l) => ({
        id: l.trabajador_id as number,
        nombre: `${l.trabajador_nombre ?? ''} ${l.trabajador_apellido ?? ''}`.trim(),
      }));
  }, [labores]);

  const getLaborByid = (id?: number | null) => labores.find((l) => l.id === id);
  const getEstadoNombre = (id?: number | null) => estados.find((e) => e.id === id)?.nombre;

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((p) => {
      const labor = getLaborByid(p.labor_id);
      const termOk = !search.trim() || p.nombre?.toLowerCase().includes(search.trim().toLowerCase());
      const espOk = !filtroEspecialidad || labor?.especialidad_nombre === filtroEspecialidad;
      const trabOk = !filtroTrabajador || String(labor?.trabajador_id) === filtroTrabajador;
      return termOk && espOk && trabOk;
    });
  }, [data, search, filtroEspecialidad, filtroTrabajador, labores]);

  const hayFiltros = search || filtroEspecialidad || filtroTrabajador;
  const limpiarFiltros = () => { setSearch(''); setFiltroEspecialidad(''); setFiltroTrabajador(''); };

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

      {/* Filtros */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack spacing={1.5}>
          <TextField
            fullWidth size="small" label="Buscar por nombre"
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              select fullWidth size="small" label="Especialidad"
              value={filtroEspecialidad} onChange={(e) => setFiltroEspecialidad(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {especialidades.map((esp) => (
                <MenuItem key={esp} value={esp}>{esp}</MenuItem>
              ))}
            </TextField>
            <TextField
              select fullWidth size="small" label="Trabajador"
              value={filtroTrabajador} onChange={(e) => setFiltroTrabajador(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {trabajadores.map((t) => (
                <MenuItem key={t.id} value={String(t.id)}>{t.nombre}</MenuItem>
              ))}
            </TextField>
          </Stack>
          {hayFiltros && (
            <Box>
              <Chip label="Limpiar filtros" size="small" onDelete={limpiarFiltros} onClick={limpiarFiltros} />
            </Box>
          )}
        </Stack>
      </Paper>

      {isLoading && <LoadingState message="Cargando presupuestos..." />}
      {isError && <ErrorState title="Error" message="No se pudieron cargar los presupuestos." onRetry={refetch} />}
      {!isLoading && !isError && filteredData.length === 0 && (
        <EmptyState
          title="Sin presupuestos"
          description={hayFiltros ? 'No hay resultados para los filtros aplicados.' : 'No hay presupuestos creados.'}
          action={!hayFiltros ? <Button variant="contained" onClick={() => navigate('/presupuestos/nuevo')}>Crear primero</Button> : undefined}
        />
      )}

      {/* Vista mobile — cards */}
      {!isLoading && !isError && filteredData.length > 0 && isMobile && (
        <Stack spacing={2}>
          {filteredData.map((p) => {
            const labor = getLaborByid(p.labor_id);
            return (
              <Paper key={p.id} sx={{ p: 2, borderRadius: 3, border: '1px solid var(--border)', boxShadow: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} color="primary">
                    {p.nombre || `Presupuesto #${p.id}`}
                  </Typography>
                  <PresupuestoEstadoChip estadoNombre={getEstadoNombre(p.estado_id)} />
                </Box>

                <Stack spacing={0.5} sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Labor:</strong> {labor?.nombre ?? '-'}
                  </Typography>
                  {labor?.especialidad_nombre && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Especialidad:</strong> {labor.especialidad_nombre}
                    </Typography>
                  )}
                  {(labor?.trabajador_nombre || labor?.trabajador_apellido) && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Trabajador:</strong> {`${labor.trabajador_nombre ?? ''} ${labor.trabajador_apellido ?? ''}`.trim()}
                    </Typography>
                  )}
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    ${Number(p.total_estimado ?? 0).toLocaleString('es-AR')}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                  <Button size="small" startIcon={<Eye size={16} />} onClick={() => navigate(`/presupuestos/${p.id}`)}>Ver</Button>
                  <Button size="small" startIcon={<Pencil size={16} />} onClick={() => navigate(`/presupuestos/${p.id}/editar`)}>Editar</Button>
                  <IconButton color="error" size="small" onClick={() => handleDelete(p.id)} disabled={deleteMutation.isPending}>
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* Vista desktop — tabla */}
      {!isLoading && !isError && filteredData.length > 0 && !isMobile && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'none' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'var(--social-bg)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Labor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Especialidad</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trabajador</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total estimado</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((p) => {
                const labor = getLaborByid(p.labor_id);
                return (
                  <TableRow key={p.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>{p.nombre || `Presupuesto #${p.id}`}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{labor?.nombre ?? '-'}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{labor?.especialidad_nombre ?? '-'}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {labor?.trabajador_nombre ? `${labor.trabajador_nombre} ${labor.trabajador_apellido ?? ''}`.trim() : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2">${Number(p.total_estimado ?? 0).toLocaleString('es-AR')}</Typography></TableCell>
                    <TableCell><PresupuestoEstadoChip estadoNombre={getEstadoNombre(p.estado_id)} /></TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                        <IconButton size="small" onClick={() => navigate(`/presupuestos/${p.id}`)}><Eye size={18} /></IconButton>
                        <IconButton size="small" onClick={() => navigate(`/presupuestos/${p.id}/editar`)}><Pencil size={18} /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(p.id)} disabled={deleteMutation.isPending}><Trash2 size={18} /></IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </AppLayout>
  );
};