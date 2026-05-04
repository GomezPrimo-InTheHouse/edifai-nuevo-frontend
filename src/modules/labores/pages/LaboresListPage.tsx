// import { useMemo, useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import {
//   Avatar, Box, Button, Card, CardContent, Chip, Divider, Grid, IconButton,
//   LinearProgress, MenuItem, Paper, Stack, Table, TableBody, TableCell,
//   TableHead, TableRow, TextField, Typography,
// } from '@mui/material';
// import { Calendar, Eye, HardHat, Pencil, Plus, Trash2, User } from 'lucide-react';
// import { useQuery } from '@tanstack/react-query';
// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
// import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
// import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
// import { LaborEstadoChip } from '../components/LaborEstadoChip';
// import { useDeleteLabor, useLaboresList } from '../hooks/useLabores';
// import { useObrasList } from '../../obras/hooks/useObras';
// import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
// import { useEspecialidadesList } from '../../trabajadores/hooks/useEspecialidades';
// import { estadoApi } from '../../../services/api/estado.api';
// import { useNotify } from '../../../shared/hooks/useNotify';
// import { useAuthStore } from '../../../app/store/auth.store';


// const PROGRESO_MAP: Record<string, number> = {
//   'Planificada': 0,
//   'Labor en proceso': 25,
//   'Avanzada': 50,
//   'Muy avanzada': 75,
//   'Finalizada': 100,
// };

// function getProgressColor(progreso: number): string {
//   if (progreso === 100) return '#16A34A';
//   if (progreso >= 75) return '#2563EB';
//   if (progreso >= 50) return '#F59E0B';
//   if (progreso >= 25) return '#EA580C';
//   return '#94A3B8';
// }

// export const LaboresListPage = () => {
//   const navigate = useNavigate();
//   const notify = useNotify();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [search, setSearch] = useState('');

//   const { data, isLoading, isError, refetch } = useLaboresList();
//   const { data: obras = [] } = useObrasList();
//   const { data: trabajadores = [] } = useTrabajadoresList();
//   const { data: especialidades = [] } = useEspecialidadesList();
//   const deleteMutation = useDeleteLabor();

//   const { data: estadosLabor = [] } = useQuery({
//     queryKey: ['estados', 'labor'],
//     queryFn: () => estadoApi.getByAmbito('labor'),
//   });

//   const obraIdFiltro = searchParams.get('obra_id') ? Number(searchParams.get('obra_id')) : '';

//   const filteredData = useMemo(() => {
//     if (!data) return [];
//     let result = data;
//     if (obraIdFiltro) result = result.filter((l) => l.obra_id === obraIdFiltro);
//     const term = search.trim().toLowerCase();
//     if (term) result = result.filter((l) =>
//       l.nombre?.toLowerCase().includes(term) ||
//       l.descripcion?.toLowerCase().includes(term)
//     );
//     return result;
//   }, [data, search, obraIdFiltro]);

//   const laboresConTrabajador = useMemo(() => {
//     if (!data) return [];
//     return data.filter((l) => l.trabajador_id != null);
//   }, [data]);

//   const getObraNombre = (id?: number | null) => obras.find((o) => o.id === id)?.nombre ?? '-';
//   const getEstadoNombre = (id?: number | null) => estadosLabor.find((e) => e.id === id)?.nombre;
//   const getTrabajador = (id?: number | null) => trabajadores.find((t) => t.id === id);
//   const getEspecialidadNombre = (id?: number | null) => especialidades.find((e) => e.id === id)?.nombre ?? '-';
//   const getProgreso = (estadoId?: number | null) => {
//     const nombre = getEstadoNombre(estadoId);
//     return nombre ? PROGRESO_MAP[nombre] ?? 0 : 0;
//   };

//   const handleDelete = async (id: number) => {
//     if (!await notify.confirm({
//       title: '¿Dar de baja esta labor?',
//       message: 'Esta acción no se puede deshacer.',
//       confirmLabel: 'Eliminar',
//       severity: 'error',
//     })) return;
//     try {
//       await deleteMutation.mutateAsync(id);
//       notify.success('Labor eliminada.');
//     } catch {
//       notify.error('No se pudo eliminar la labor.');
//     }
//   };

//   return (
//     <AppLayout noPadding>
//       {/* px al mínimo para máximo ancho de contenido */}
//       <Box sx={{
//         px: { xs: 0.5, md: 1 },
//         py: { xs: 1, md: 1.5 },
//         width: '100%',
//         boxSizing: 'border-box',
//       }}>
//         <PageHeader
//           title="Labores"
//           subtitle="Gestión de labores y tareas por obra."
//           actions={
//             <Button
//               variant="contained"
//               startIcon={<Plus size={18} />}
//               onClick={() => navigate('/labores/nueva')}
//             >
//               Nueva labor
//             </Button>
//           }
//         />

//         {/* Filtros */}
//         <Paper sx={{ p: 1.5, borderRadius: 3, mb: 2 }}>
//           <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
//             <TextField
//               fullWidth
//               size="small"
//               label="Buscar por nombre o descripción"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//             <TextField
//               select
//               fullWidth
//               size="small"
//               label="Filtrar por obra"
//               value={obraIdFiltro}
//               onChange={(e) =>
//                 e.target.value
//                   ? setSearchParams({ obra_id: String(e.target.value) })
//                   : setSearchParams({})
//               }
//             >
//               <MenuItem value="">Todas las obras</MenuItem>
//               {obras.map((o) => (
//                 <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>
//               ))}
//             </TextField>
//           </Stack>
//         </Paper>

//         {isLoading && <LoadingState message="Cargando labores..." />}
//         {isError && (
//           <ErrorState
//             title="Error al cargar labores"
//             message="Revisa la conexión con el microservicio."
//             onRetry={refetch}
//           />
//         )}

//         {!isLoading && !isError && (
//           <Grid container spacing={2}>

// {/* Columna izquierda — tabla principal (Optimizada para Móvil) */}
// <Grid size={{ xs: 12, lg: 9 }}>
//   {filteredData.length === 0 ? (
//     <EmptyState
//       title="No hay labores"
//       description="No existen labores o la búsqueda no devolvió resultados."
//       action={
//         <Button variant="contained" onClick={() => navigate('/labores/nueva')}>
//           Crear primera labor
//         </Button>
//       }
//     />
//   ) : (
//     /* Contenedor condicional: Cards en móvil, Tabla en escritorio */
//     <Box>
     
//      {/* VISTA MÓVIL (Cards Diferenciadas) */}
//                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, color: '#64748B' }}>
//                   LABORES REGISTRADAS ({filteredData.length})
//                 </Typography>
// <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
//   {filteredData.map((l) => {
//     const progreso = getProgreso(l.estado_id);
//     const color = getProgressColor(progreso);
//     const estadoNombre = getEstadoNombre(l.estado_id);
//     return (
//       <Paper 
//         key={l.id} 
//         onClick={() => navigate(`/labores/${l.id}`)}
//         sx={{ 
//           p: 0, // Quitamos padding general para el acento lateral
//           borderRadius: 3, 
//           border: '1px solid #E2E8F0', 
//           boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
//           bgcolor: '#ffffff',
//           overflow: 'hidden',
//           display: 'flex',
//           position: 'relative',
//           transition: 'transform 0.2s, box-shadow 0.2s',
//           '&:active': { transform: 'scale(0.98)' }
//         }}
//       >
//         {/* 1. Barra de acento lateral según el color del progreso */}
//         <Box sx={{ width: 6, bgcolor: color }} />

//         <Stack spacing={1.5} sx={{ p: 2, flex: 1 }}>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//             <Box sx={{ pr: 1 }}>
//               <Typography variant="caption" sx={{ color: color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
//                 {estadoNombre}
//               </Typography>
//               <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#1E293B', lineHeight: 1.2, mt: 0.2 }}>
//                 {l.nombre}
//               </Typography>
//               <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
//                 <HardHat size={12} /> {getObraNombre(l.obra_id)}
//               </Typography>
//             </Box>
            
//             {/* 2. Badge de ID o indicador visual secundario */}
//             <Typography variant="caption" sx={{ bgcolor: '#F1F5F9', px: 1, py: 0.5, borderRadius: 1.5, fontWeight: 700, color: '#64748B' }}>
//               #{l.id}
//             </Typography>
//           </Box>

//           {/* 3. Fechas con diseño de "píldora" */}
//           <Box sx={{ display: 'flex', gap: 1 }}>
//              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: '#F8FAFC', px: 1, py: 0.5, borderRadius: 2, border: '1px solid #F1F5F9' }}>
//                 <Calendar size={12} color="#64748B" />
//                 <Typography variant="caption" fontWeight={600} color="#475569">
//                   {l.fecha_inicio_estimada ? new Date(l.fecha_inicio_estimada).toLocaleDateString('es-AR') : '-'}
//                 </Typography>
//              </Stack>
//              <Typography variant="caption" sx={{ alignSelf: 'center', color: '#CBD5E1' }}>→</Typography>
//              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: '#F8FAFC', px: 1, py: 0.5, borderRadius: 2, border: '1px solid #F1F5F9' }}>
//                 <Typography variant="caption" fontWeight={600} color="#475569">
//                   {l.fecha_fin_estimada ? new Date(l.fecha_fin_estimada).toLocaleDateString('es-AR') : '-'}
//                 </Typography>
//              </Stack>
//           </Box>

//           {/* 4. Barra de progreso más estilizada */}
//           <Box>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
//               <Typography variant="caption" fontWeight={800} color="text.primary">PROGRESO</Typography>
//               <Typography variant="caption" fontWeight={800} sx={{ color }}>{progreso}%</Typography>
//             </Box>
//             <LinearProgress
//               variant="determinate"
//               value={progreso}
//               sx={{
//                 height: 10,
//                 borderRadius: 5,
//                 backgroundColor: '#F1F5F9',
//                 '& .MuiLinearProgress-bar': { borderRadius: 5, backgroundColor: color },
//               }}
//             />
//           </Box>

//           <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

//           {/* Acciones */}
//           <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
//             <IconButton 
//               size="small" 
//               onClick={(e) => { e.stopPropagation(); navigate(`/labores/${l.id}/editar`); }}
//               sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}
//             >
//               <Pencil size={16} color="#64748B" />
//             </IconButton>
//             <IconButton 
//               size="small" 
//               color="error" 
//               onClick={(e) => { e.stopPropagation(); handleDelete(l.id); }}
//               disabled={deleteMutation.isPending}
//               sx={{ bgcolor: '#FFF1F2', border: '1px solid #FECACA' }}
//             >
//               <Trash2 size={16} />
//             </IconButton>
//           </Box>
//         </Stack>
//       </Paper>
//     );
//   })}
// </Box>

//       {/* VISTA ESCRITORIO (se oculta en xs y sm) */}
//       <Paper sx={{ display: { xs: 'none', md: 'block' }, borderRadius: 3, overflow: 'hidden' }}>
//         <Table size="small">
//           <TableHead sx={{ bgcolor: '#F8FAFC' }}>
//             <TableRow>
//               <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
//               <TableCell sx={{ fontWeight: 700 }}>Obra</TableCell>
//               <TableCell sx={{ fontWeight: 700 }}>Inicio estimado</TableCell>
//               <TableCell sx={{ fontWeight: 700 }}>Fin estimado</TableCell>
//               <TableCell sx={{ fontWeight: 700 }}>Progreso</TableCell>
//               <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {filteredData.map((l) => {
//               const progreso = getProgreso(l.estado_id);
//               const color = getProgressColor(progreso);
//               const estadoNombre = getEstadoNombre(l.estado_id);
//               return (
//                 <TableRow key={l.id} hover>
//                   <TableCell><Typography variant="body2" fontWeight={600}>{l.nombre}</Typography></TableCell>
//                   <TableCell><Typography variant="body2">{getObraNombre(l.obra_id)}</Typography></TableCell>
//                   <TableCell>
//                     <Typography variant="body2">
//                       {l.fecha_inicio_estimada ? new Date(l.fecha_inicio_estimada).toLocaleDateString('es-AR') : '-'}
//                     </Typography>
//                   </TableCell>
//                   <TableCell>
//                     <Typography variant="body2">
//                       {l.fecha_fin_estimada ? new Date(l.fecha_fin_estimada).toLocaleDateString('es-AR') : '-'}
//                     </Typography>
//                   </TableCell>
//                   <TableCell sx={{ minWidth: 160 }}>
//                     <Stack spacing={0.5}>
//                       <Stack direction="row" justifyContent="space-between" alignItems="center">
//                         <LaborEstadoChip estadoNombre={estadoNombre} />
//                         <Typography variant="caption" fontWeight={700} sx={{ color }}>{progreso}%</Typography>
//                       </Stack>
//                       <LinearProgress variant="determinate" value={progreso} sx={{ height: 6, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { borderRadius: 3, backgroundColor: color } }} />
//                     </Stack>
//                   </TableCell>
//                   <TableCell align="right">
//                     <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
//                       <IconButton size="small" onClick={() => navigate(`/labores/${l.id}`)}><Eye size={16} /></IconButton>
//                       <IconButton size="small" onClick={() => navigate(`/labores/${l.id}/editar`)}><Pencil size={16} /></IconButton>
//                       <IconButton size="small" color="error" onClick={() => handleDelete(l.id)} disabled={deleteMutation.isPending}><Trash2 size={16} /></IconButton>
//                     </Stack>
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </Paper>
//     </Box>
//   )}
// </Grid>

//             {/* Columna derecha — trabajadores asignados */}
//             <Grid size={{ xs: 12, lg: 3 }}>
//               <Box sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
//                 <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, color: '#64748B' }}>
//                   TRABAJADORES ASIGNADOS ({laboresConTrabajador.length})
//                 </Typography>

//                 {laboresConTrabajador.length === 0 && (
//                   <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
//                     <CardContent sx={{ p: 2, textAlign: 'center' }}>
//                       <Typography variant="body2" color="text.secondary">
//                         No hay labores con trabajadores asignados.
//                       </Typography>
//                     </CardContent>
//                   </Card>
//                 )}

//                 <Stack spacing={1.5}>
//                   {laboresConTrabajador.map((l) => {
//                     const trabajador = getTrabajador(l.trabajador_id);
//                     const especialidadNombre = getEspecialidadNombre(trabajador?.especialidad_id);
//                     const estadoNombre = getEstadoNombre(l.estado_id);
//                     const progreso = getProgreso(l.estado_id);
//                     const color = getProgressColor(progreso);

//                     return (
//                       <Card
//                         key={l.id}
//                         sx={{
//                           borderRadius: 3,
//                           boxShadow: 'none',
//                           border: '1px solid #E2E8F0',
//                           cursor: 'pointer',
//                           '&:hover': { borderColor: '#F59E0B', boxShadow: 1 },
//                           transition: 'all 0.2s',
//                         }}
//                         onClick={() => navigate(`/labores/${l.id}`)}
//                       >
//                         <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
//                           <Stack
//                             direction="row"
//                             justifyContent="space-between"
//                             alignItems="flex-start"
//                             sx={{ mb: 1 }}
//                           >
//                             <Typography
//                               variant="body2"
//                               fontWeight={700}
//                               sx={{ color: '#0F172A', fontSize: 13, lineHeight: 1.3 }}
//                             >
//                               {l.nombre}
//                             </Typography>
//                             <LaborEstadoChip estadoNombre={estadoNombre} />
//                           </Stack>

//                           <Box sx={{ mb: 1.5 }}>
//                             <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
//                               <Typography variant="caption" color="text.secondary">Progreso</Typography>
//                               <Typography variant="caption" fontWeight={700} sx={{ color }}>
//                                 {progreso}%
//                               </Typography>
//                             </Stack>
//                             <LinearProgress
//                               variant="determinate"
//                               value={progreso}
//                               sx={{
//                                 height: 5,
//                                 borderRadius: 3,
//                                 backgroundColor: '#E2E8F0',
//                                 '& .MuiLinearProgress-bar': {
//                                   borderRadius: 3,
//                                   backgroundColor: color,
//                                 },
//                               }}
//                             />
//                           </Box>

//                           <Typography
//                             variant="caption"
//                             color="text.secondary"
//                             sx={{ display: 'block', mb: 1 }}
//                           >
//                             {getObraNombre(l.obra_id)}
//                           </Typography>

//                           {trabajador && (
//                             <Stack direction="row" spacing={1} alignItems="center">
//                               <Avatar sx={{ width: 28, height: 28, bgcolor: '#0F172A', fontSize: 11, fontWeight: 700 }}>
//                                 {trabajador.nombre[0]}{trabajador.apellido[0]}
//                               </Avatar>
//                               <Box sx={{ flex: 1, minWidth: 0 }}>
//                                 <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: 12 }}>
//                                   {trabajador.nombre} {trabajador.apellido}
//                                 </Typography>
//                                 <Chip
//                                   label={especialidadNombre}
//                                   size="small"
//                                   sx={{
//                                     fontSize: 10,
//                                     height: 16,
//                                     bgcolor: 'rgba(245,158,11,0.12)',
//                                     color: '#B45309',
//                                     fontWeight: 700,
//                                   }}
//                                 />
//                               </Box>
//                               <IconButton
//                                 size="small"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   navigate(`/trabajadores/${trabajador.id}`);
//                                 }}
//                               >
//                                 <User size={13} />
//                               </IconButton>
//                             </Stack>
//                           )}
//                         </CardContent>
//                       </Card>
//                     );
//                   })}
//                 </Stack>
//               </Box>
//             </Grid>

//           </Grid>
//         )}
//       </Box>
//     </AppLayout>
//   );
// };

import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Avatar, Box, Button, Card, CardContent, Chip, Divider, Grid, IconButton,
  LinearProgress, MenuItem, Paper, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { Calendar, Eye, HardHat, Pencil, Plus, Trash2, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { LaborEstadoChip } from '../components/LaborEstadoChip';
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

function getProgressColor(progreso: number): string {
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

  // ── Rol del usuario logueado ──────────────────────────────
  const user = useAuthStore((s) => s.user);
  const esWorker = user?.rol_id === 7 || user?.rol_id === 8;
  // ─────────────────────────────────────────────────────────

  // ── Data condicional por rol ──────────────────────────────
  const {
    data: dataAdmin,
    isLoading: loadingAdmin,
    isError: errorAdmin,
    refetch: refetchAdmin,
  } = useLaboresList();

  const {
    data: dataMisLabores,
    isLoading: loadingWorker,
    isError: errorWorker,
    refetch: refetchWorker,
  } = useMisLabores();

  const data      = esWorker ? dataMisLabores : dataAdmin;
  const isLoading = esWorker ? loadingWorker  : loadingAdmin;
  const isError   = esWorker ? errorWorker    : errorAdmin;
  const refetch   = esWorker ? refetchWorker  : refetchAdmin;
  // ─────────────────────────────────────────────────────────

  const { data: obras = [] } = useObrasList();
  const { data: trabajadores = [] } = useTrabajadoresList();
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
      l.nombre?.toLowerCase().includes(term) ||
      l.descripcion?.toLowerCase().includes(term)
    );
    return result;
  }, [data, search, obraIdFiltro]);

  const laboresConTrabajador = useMemo(() => {
    if (!data) return [];
    return data.filter((l) => l.trabajador_id != null);
  }, [data]);

  const getObraNombre = (id?: number | null) => obras.find((o) => o.id === id)?.nombre ?? '-';
  const getEstadoNombre = (id?: number | null) => estadosLabor.find((e) => e.id === id)?.nombre;
  const getTrabajador = (id?: number | null) => trabajadores.find((t) => t.id === id);
  const getEspecialidadNombre = (id?: number | null) => especialidades.find((e) => e.id === id)?.nombre ?? '-';
  const getProgreso = (estadoId?: number | null) => {
    const nombre = getEstadoNombre(estadoId);
    return nombre ? PROGRESO_MAP[nombre] ?? 0 : 0;
  };

  const handleDelete = async (id: number) => {
    if (!await notify.confirm({
      title: '¿Dar de baja esta labor?',
      message: 'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      severity: 'error',
    })) return;
    try {
      await deleteMutation.mutateAsync(id);
      notify.success('Labor eliminada.');
    } catch {
      notify.error('No se pudo eliminar la labor.');
    }
  };

  return (
    <AppLayout noPadding>
      <Box sx={{
        px: { xs: 0.5, md: 1 },
        py: { xs: 1, md: 1.5 },
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <PageHeader
          title="Labores"
          subtitle={esWorker ? 'Tus labores asignadas.' : 'Gestión de labores y tareas por obra.'}
          actions={
            // Solo admins pueden crear labores
            !esWorker ? (
              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={() => navigate('/labores/nueva')}
              >
                Nueva labor
              </Button>
            ) : undefined
          }
        />

        {/* Filtros */}
        <Paper sx={{ p: 1.5, borderRadius: 3, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              fullWidth
              size="small"
              label="Buscar por nombre o descripción"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {/* Filtro por obra solo para admins */}
            {!esWorker && (
              <TextField
                select
                fullWidth
                size="small"
                label="Filtrar por obra"
                value={obraIdFiltro}
                onChange={(e) =>
                  e.target.value
                    ? setSearchParams({ obra_id: String(e.target.value) })
                    : setSearchParams({})
                }
              >
                <MenuItem value="">Todas las obras</MenuItem>
                {obras.map((o) => (
                  <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </Paper>

        {isLoading && <LoadingState message="Cargando labores..." />}
        {isError && (
          <ErrorState
            title="Error al cargar labores"
            message="Revisa la conexión con el microservicio."
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && (
          <Grid container spacing={2}>

            {/* Columna izquierda — tabla principal */}
            <Grid size={{ xs: 12, lg: 9 }}>
              {filteredData.length === 0 ? (
                <EmptyState
                  title="No hay labores"
                  description={
                    esWorker
                      ? 'No tenés labores asignadas.'
                      : 'No existen labores o la búsqueda no devolvió resultados.'
                  }
                  action={
                    !esWorker ? (
                      <Button variant="contained" onClick={() => navigate('/labores/nueva')}>
                        Crear primera labor
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <Box>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, color: '#64748B' }}>
                    LABORES REGISTRADAS ({filteredData.length})
                  </Typography>

                  {/* VISTA MÓVIL */}
                  <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                    {filteredData.map((l) => {
                      const progreso = getProgreso(l.estado_id);
                      const color = getProgressColor(progreso);
                      const estadoNombre = getEstadoNombre(l.estado_id);
                      return (
                        <Paper
                          key={l.id}
                          onClick={() => navigate(`/labores/${l.id}`)}
                          sx={{
                            p: 0,
                            borderRadius: 3,
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            bgcolor: '#ffffff',
                            overflow: 'hidden',
                            display: 'flex',
                            position: 'relative',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:active': { transform: 'scale(0.98)' },
                          }}
                        >
                          <Box sx={{ width: 6, bgcolor: color }} />
                          <Stack spacing={1.5} sx={{ p: 2, flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box sx={{ pr: 1 }}>
                                <Typography variant="caption" sx={{ color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
                                  {estadoNombre}
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#1E293B', lineHeight: 1.2, mt: 0.2 }}>
                                  {l.nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                  <HardHat size={12} /> {getObraNombre(l.obra_id)}
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ bgcolor: '#F1F5F9', px: 1, py: 0.5, borderRadius: 1.5, fontWeight: 700, color: '#64748B' }}>
                                #{l.id}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: '#F8FAFC', px: 1, py: 0.5, borderRadius: 2, border: '1px solid #F1F5F9' }}>
                                <Calendar size={12} color="#64748B" />
                                <Typography variant="caption" fontWeight={600} color="#475569">
                                  {l.fecha_inicio_estimada ? new Date(l.fecha_inicio_estimada).toLocaleDateString('es-AR') : '-'}
                                </Typography>
                              </Stack>
                              <Typography variant="caption" sx={{ alignSelf: 'center', color: '#CBD5E1' }}>→</Typography>
                              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: '#F8FAFC', px: 1, py: 0.5, borderRadius: 2, border: '1px solid #F1F5F9' }}>
                                <Typography variant="caption" fontWeight={600} color="#475569">
                                  {l.fecha_fin_estimada ? new Date(l.fecha_fin_estimada).toLocaleDateString('es-AR') : '-'}
                                </Typography>
                              </Stack>
                            </Box>

                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" fontWeight={800} color="text.primary">PROGRESO</Typography>
                                <Typography variant="caption" fontWeight={800} sx={{ color }}>{progreso}%</Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={progreso}
                                sx={{
                                  height: 10,
                                  borderRadius: 5,
                                  backgroundColor: '#F1F5F9',
                                  '& .MuiLinearProgress-bar': { borderRadius: 5, backgroundColor: color },
                                }}
                              />
                            </Box>

                            <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

                            {/* Acciones móvil — solo admins */}
                            {!esWorker && (
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => { e.stopPropagation(); navigate(`/labores/${l.id}/editar`); }}
                                  sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}
                                >
                                  <Pencil size={16} color="#64748B" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => { e.stopPropagation(); handleDelete(l.id); }}
                                  disabled={deleteMutation.isPending}
                                  sx={{ bgcolor: '#FFF1F2', border: '1px solid #FECACA' }}
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </Box>
                            )}
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Box>

                  {/* VISTA ESCRITORIO */}
                  <Paper sx={{ display: { xs: 'none', md: 'block' }, borderRadius: 3, overflow: 'hidden' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#F8FAFC' }}>
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
                          const estadoNombre = getEstadoNombre(l.estado_id);
                          return (
                            <TableRow key={l.id} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>{l.nombre}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{getObraNombre(l.obra_id)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {l.fecha_inicio_estimada ? new Date(l.fecha_inicio_estimada).toLocaleDateString('es-AR') : '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {l.fecha_fin_estimada ? new Date(l.fecha_fin_estimada).toLocaleDateString('es-AR') : '-'}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ minWidth: 160 }}>
                                <Stack spacing={0.5}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <LaborEstadoChip estadoNombre={estadoNombre} />
                                    <Typography variant="caption" fontWeight={700} sx={{ color }}>{progreso}%</Typography>
                                  </Stack>
                                  <LinearProgress
                                    variant="determinate"
                                    value={progreso}
                                    sx={{ height: 6, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { borderRadius: 3, backgroundColor: color } }}
                                  />
                                </Stack>
                              </TableCell>
                              <TableCell align="right">
                                <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                                  {/* Ver — disponible para todos */}
                                  <IconButton size="small" onClick={() => navigate(`/labores/${l.id}`)}>
                                    <Eye size={16} />
                                  </IconButton>
                                  {/* Editar y eliminar — solo admins */}
                                  {!esWorker && (
                                    <>
                                      <IconButton size="small" onClick={() => navigate(`/labores/${l.id}/editar`)}>
                                        <Pencil size={16} />
                                      </IconButton>
                                      <IconButton size="small" color="error" onClick={() => handleDelete(l.id)} disabled={deleteMutation.isPending}>
                                        <Trash2 size={16} />
                                      </IconButton>
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
                </Box>
              )}
            </Grid>

            {/* Columna derecha — trabajadores asignados */}
            <Grid size={{ xs: 12, lg: 3 }}>
              <Box sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, color: '#64748B' }}>
                  TRABAJADORES ASIGNADOS ({laboresConTrabajador.length})
                </Typography>

                {laboresConTrabajador.length === 0 && (
                  <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No hay labores con trabajadores asignados.
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                <Stack spacing={1.5}>
                  {laboresConTrabajador.map((l) => {
                    const trabajador = getTrabajador(l.trabajador_id);
                    const especialidadNombre = getEspecialidadNombre(trabajador?.especialidad_id);
                    const estadoNombre = getEstadoNombre(l.estado_id);
                    const progreso = getProgreso(l.estado_id);
                    const color = getProgressColor(progreso);

                    return (
                      <Card
                        key={l.id}
                        sx={{
                          borderRadius: 3,
                          boxShadow: 'none',
                          border: '1px solid #E2E8F0',
                          cursor: 'pointer',
                          '&:hover': { borderColor: '#F59E0B', boxShadow: 1 },
                          transition: 'all 0.2s',
                        }}
                        onClick={() => navigate(`/labores/${l.id}`)}
                      >
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ color: '#0F172A', fontSize: 13, lineHeight: 1.3 }}>
                              {l.nombre}
                            </Typography>
                            <LaborEstadoChip estadoNombre={estadoNombre} />
                          </Stack>

                          <Box sx={{ mb: 1.5 }}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">Progreso</Typography>
                              <Typography variant="caption" fontWeight={700} sx={{ color }}>{progreso}%</Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={progreso}
                              sx={{
                                height: 5,
                                borderRadius: 3,
                                backgroundColor: '#E2E8F0',
                                '& .MuiLinearProgress-bar': { borderRadius: 3, backgroundColor: color },
                              }}
                            />
                          </Box>

                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {getObraNombre(l.obra_id)}
                          </Typography>

                          {trabajador && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar sx={{ width: 28, height: 28, bgcolor: '#0F172A', fontSize: 11, fontWeight: 700 }}>
                                {trabajador.nombre[0]}{trabajador.apellido[0]}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: 12 }}>
                                  {trabajador.nombre} {trabajador.apellido}
                                </Typography>
                                <Chip
                                  label={especialidadNombre}
                                  size="small"
                                  sx={{
                                    fontSize: 10,
                                    height: 16,
                                    bgcolor: 'rgba(245,158,11,0.12)',
                                    color: '#B45309',
                                    fontWeight: 700,
                                  }}
                                />
                              </Box>
                              {/* Ver trabajador — solo admins */}
                              {!esWorker && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/trabajadores/${trabajador.id}`);
                                  }}
                                >
                                  <User size={13} />
                                </IconButton>
                              )}
                            </Stack>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            </Grid>

          </Grid>
        )}
      </Box>
    </AppLayout>
  );
};