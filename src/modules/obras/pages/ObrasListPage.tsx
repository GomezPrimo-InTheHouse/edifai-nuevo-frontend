

// // import { useMemo, useState } from 'react';
// // import {
// //   Button,
// //   IconButton,
// //   Paper,
// //   Stack,
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableRow,
// //   TextField,
// //   Typography,
// //   Box,
// //   useTheme,
// //   useMediaQuery,
// //   Divider,
// // } from '@mui/material';
// // import { Eye, Pencil, Plus, Settings, Trash2, MapPin, Calendar } from 'lucide-react';
// // import { useNavigate } from 'react-router-dom';
// // import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// // import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// // import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
// // import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
// // import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
// // import { useDeleteObra, useObrasList } from '../hooks/useObras';
// // import { TipoObraModal } from '../modal/tipoObraModal';

// // export function ObrasListPage() {
// //   const navigate = useNavigate();
// //   const theme = useTheme();
// //   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

// //   const { data, isLoading, isError, refetch } = useObrasList();
// //   const deleteMutation = useDeleteObra();

// //   const [search, setSearch] = useState('');
// //   const [tipoObraModalOpen, setTipoObraModalOpen] = useState(false);

// //   const filteredData = useMemo(() => {
// //     if (!data) return [];
// //     const term = search.trim().toLowerCase();
// //     if (!term) return data;
// //     return data.filter(
// //       (obra) =>
// //         obra.nombre?.toLowerCase().includes(term) ||
// //         obra.ubicacion?.toLowerCase().includes(term) ||
// //         obra.descripcion?.toLowerCase().includes(term)
// //     );
// //   }, [data, search]);

// //   const handleDelete = async (id: number) => {
// //     const confirmed = window.confirm('¿Seguro que deseas eliminar esta obra?');
// //     if (!confirmed) return;
// //     await deleteMutation.mutateAsync(id);
// //   };

// //   return (
// //     <AppLayout>
// //       <PageHeader
// //         title="Obras"
// //         subtitle="Gestión general de obras y proyectos."
// //         actions={
// //           <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
// //             <Button
// //               variant="outlined"
// //               fullWidth={isMobile}
// //               startIcon={<Settings size={16} />}
// //               onClick={() => setTipoObraModalOpen(true)}
// //               sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
// //             >
// //               Tipos
// //             </Button>
// //             <Button
// //               variant="contained"
// //               fullWidth={isMobile}
// //               startIcon={<Plus size={18} />}
// //               onClick={() => navigate('/obras/nueva')}
// //               sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, whiteSpace: 'nowrap' }}
// //             >
// //               Nueva Obra
// //             </Button>
// //           </Stack>
// //         }
// //       />

// //       {/* Buscador Optimizado */}
// //       <Paper sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3, mb: 3, boxShadow: 'none', border: '1px solid var(--border)' }}>
// //         <TextField
// //           fullWidth
// //           size={isMobile ? "small" : "medium"}
// //           placeholder="Buscar obra o ubicación..."
// //           value={search}
// //           onChange={(event) => setSearch(event.target.value)}
// //         />
// //       </Paper>

// //       {isLoading && <LoadingState message="Cargando obras..." />}
// //       {isError && <ErrorState title="Error" message="No se cargaron las obras." onRetry={refetch} />}
// //       {!isLoading && !isError && filteredData.length === 0 && (
// //         <EmptyState title="Sin resultados" action={<Button variant="contained" onClick={() => navigate('/obras/nueva')}>Crear obra</Button>} />
// //       )}

// //       {/* VISTA MÓVIL (Cards) */}
// //       {!isLoading && !isError && filteredData.length > 0 && isMobile && (
// //         <Stack spacing={2}>
// //           {filteredData.map((obra) => (
// //             <Paper key={obra.id} sx={{ p: 2, borderRadius: 3, border: '1px solid var(--border)', boxShadow: 'none' }}>
// //               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
// //                 <Typography variant="subtitle1" fontWeight={700} color="primary">
// //                   {obra.nombre}
// //                 </Typography>
// //                 <Typography variant="caption" sx={{ bgcolor: 'var(--accent-bg)', px: 1, py: 0.5, borderRadius: 1, color: 'var(--accent)' }}>
// //                   ID: {obra.id}
// //                 </Typography>
// //               </Box>

// //               <Stack spacing={1} sx={{ mb: 2 }}>
// //                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
// //                   <MapPin size={14} color="#64748B" />
// //                   <Typography variant="body2" color="text.secondary">{obra.ubicacion || 'Sin ubicación'}</Typography>
// //                 </Box>
// //                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
// //                   <Calendar size={14} color="#64748B" />
// //                   <Typography variant="caption" color="text.secondary">
// //                     {obra.fecha_inicio_estimado || '-'} / {obra.fecha_fin_estimado || '-'}
// //                   </Typography>
// //                 </Box>
// //               </Stack>
              
// //               <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

// //               <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
// //                 <Button size="small" startIcon={<Eye size={18} />} onClick={() => navigate(`/obras/${obra.id}`)}>Ver</Button>
// //                 <Button size="small" startIcon={<Pencil size={18} />} onClick={() => navigate(`/obras/${obra.id}/editar`)}>Editar</Button>
// //                 <IconButton color="error" size="small" onClick={() => handleDelete(obra.id)} disabled={deleteMutation.isPending}>
// //                   <Trash2 size={18} />
// //                 </IconButton>
// //               </Box>
// //             </Paper>
// //           ))}
// //         </Stack>
// //       )}

// //       {/* VISTA DESKTOP (Tabla) */}
// //       {!isLoading && !isError && filteredData.length > 0 && !isMobile && (
// //         <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'none' }}>
// //           <Table>
// //             <TableHead sx={{ bgcolor: 'var(--social-bg)' }}>
// //               <TableRow>
// //                 <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
// //                 <TableCell sx={{ fontWeight: 700 }}>Ubicación</TableCell>
// //                 <TableCell sx={{ fontWeight: 700 }}>Inicio estimado</TableCell>
// //                 <TableCell sx={{ fontWeight: 700 }}>Fin estimado</TableCell>
// //                 <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
// //               </TableRow>
// //             </TableHead>
// //             <TableBody>
// //               {filteredData.map((obra) => (
// //                 <TableRow key={obra.id} hover>
// //                   <TableCell><Typography variant="body2" fontWeight={600}>{obra.nombre}</Typography></TableCell>
// //                   <TableCell><Typography variant="body2">{obra.ubicacion || '-'}</Typography></TableCell>
// //                   <TableCell><Typography variant="body2">{obra.fecha_inicio_estimado || '-'}</Typography></TableCell>
// //                   <TableCell><Typography variant="body2">{obra.fecha_fin_estimado || '-'}</Typography></TableCell>
// //                   <TableCell align="right">
// //                     <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
// //                       <IconButton size="small" onClick={() => navigate(`/obras/${obra.id}`)}><Eye size={18} /></IconButton>
// //                       <IconButton size="small" onClick={() => navigate(`/obras/${obra.id}/editar`)}><Pencil size={18} /></IconButton>
// //                       <IconButton size="small" color="error" onClick={() => handleDelete(obra.id)} disabled={deleteMutation.isPending}><Trash2 size={18} /></IconButton>
// //                     </Stack>
// //                   </TableCell>
// //                 </TableRow>
// //               ))}
// //             </TableBody>
// //           </Table>
// //         </Paper>
// //       )}

// //       <TipoObraModal open={tipoObraModalOpen} onClose={() => setTipoObraModalOpen(false)} />
// //     </AppLayout>
// //   );
// // }

// import { useMemo, useState } from 'react';
// import {
//   Box, Button, Chip, Divider, IconButton, Paper, Stack,
//   Tab, Table, TableBody, TableCell, TableHead, TableRow,
//   Tabs, TextField, Typography, useMediaQuery, useTheme,
// } from '@mui/material';
// import { Archive, ArchiveRestore, Calendar, Eye, MapPin, Pencil, Plus, Settings, Trash2 } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
// import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
// import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
// import { useDeleteObra, useObrasList, useObrasArchivadas, useArchivarObra } from '../hooks/useObras';
// import { TipoObraModal } from '../modal/tipoObraModal';
// import { useNotify } from '../../../shared/hooks/useNotify';
// import { useAuthStore } from '../../../app/store/auth.store';

// export function ObrasListPage() {
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const notify = useNotify();

//   const user = useAuthStore((s) => s.user);
//   const esAdmin = [1, 3, 4, 6].includes(user?.rol_id ?? 0);

//   const { data, isLoading, isError, refetch } = useObrasList();
//   const { data: archivadas = [], isLoading: loadingArchivadas, refetch: refetchArchivadas } = useObrasArchivadas();
//   const deleteMutation = useDeleteObra();
//   const archivarMutation = useArchivarObra();

//   const [search, setSearch] = useState('');
//   const [tab, setTab] = useState(0); // 0 = activas, 1 = archivadas
//   const [tipoObraModalOpen, setTipoObraModalOpen] = useState(false);

//   const obraActivas = useMemo(() => {
//     if (!data) return [];
//     const term = search.trim().toLowerCase();
//     if (!term) return data;
//     return data.filter((o) =>
//       o.nombre?.toLowerCase().includes(term) ||
//       o.ubicacion?.toLowerCase().includes(term) ||
//       o.descripcion?.toLowerCase().includes(term)
//     );
//   }, [data, search]);

//   const obrasArchivadas = useMemo(() => {
//     const term = search.trim().toLowerCase();
//     if (!term) return archivadas;
//     return archivadas.filter((o) =>
//       o.nombre?.toLowerCase().includes(term) ||
//       o.ubicacion?.toLowerCase().includes(term)
//     );
//   }, [archivadas, search]);

//   const filteredData = tab === 0 ? obraActivas : obrasArchivadas;
//   const isLoadingCurrent = tab === 0 ? isLoading : loadingArchivadas;
//   const isErrorCurrent = tab === 0 ? isError : false;
//   const refetchCurrent = tab === 0 ? refetch : refetchArchivadas;

//   const handleDelete = async (id: number) => {
//     const confirmed = await notify.confirm({
//       title: '¿Eliminar obra?',
//       message: 'Esta acción no se puede deshacer.',
//       confirmLabel: 'Eliminar',
//       severity: 'error',
//     });
//     if (!confirmed) return;
//     try {
//       await deleteMutation.mutateAsync(id);
//       notify.success('Obra eliminada.');
//     } catch {
//       notify.error('No se pudo eliminar la obra.');
//     }
//   };

//   const handleArchivar = async (id: number, archivar: boolean) => {
//     const confirmed = await notify.confirm({
//       title: archivar ? '¿Archivar obra?' : '¿Desarchivar obra?',
//       message: archivar
//         ? 'Se archivarán también todas las labores, presupuestos, presentismos y pagos asociados.'
//         : 'La obra y todos sus datos asociados volverán a estar activos.',
//       confirmLabel: archivar ? 'Archivar' : 'Desarchivar',
//       severity: 'warning',
//     });
//     if (!confirmed) return;
//     try {
//       await archivarMutation.mutateAsync({ id, archivar });
//       notify.success(archivar ? 'Obra archivada correctamente.' : 'Obra desarchivada correctamente.');
//     } catch {
//       notify.error('No se pudo realizar la acción.');
//     }
//   };

//   const renderCardsMobile = (obras: typeof filteredData, archivada: boolean) => (
//     <Stack spacing={2}>
//       {obras.map((obra) => (
//         <Paper key={obra.id} sx={{ p: 2, borderRadius: 3, border: '1px solid var(--border)', boxShadow: 'none', opacity: archivada ? 0.8 : 1 }}>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
//             <Typography variant="subtitle1" fontWeight={700} color="primary">{obra.nombre}</Typography>
//             <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
//               {archivada && <Chip label="Archivada" size="small" color="warning" variant="outlined" />}
//               <Typography variant="caption" sx={{ bgcolor: 'var(--accent-bg)', px: 1, py: 0.5, borderRadius: 1, color: 'var(--accent)' }}>
//                 ID: {obra.id}
//               </Typography>
//             </Box>
//           </Box>
//           <Stack spacing={1} sx={{ mb: 2 }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <MapPin size={14} color="#64748B" />
//               <Typography variant="body2" color="text.secondary">{obra.ubicacion || 'Sin ubicación'}</Typography>
//             </Box>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <Calendar size={14} color="#64748B" />
//               <Typography variant="caption" color="text.secondary">
//                 {obra.fecha_inicio_estimado || '-'} / {obra.fecha_fin_estimado || '-'}
//               </Typography>
//             </Box>
//           </Stack>
//           <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
//           <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
//             <Button size="small" startIcon={<Eye size={16} />} onClick={() => navigate(`/obras/${obra.id}`)}>Ver</Button>
//             {!archivada && (
//               <Button size="small" startIcon={<Pencil size={16} />} onClick={() => navigate(`/obras/${obra.id}/editar`)}>Editar</Button>
//             )}
//             {esAdmin && (
//               <Button
//                 size="small"
//                 color="warning"
//                 startIcon={archivada ? <ArchiveRestore size={16} /> : <Archive size={16} />}
//                 onClick={() => handleArchivar(obra.id, !archivada)}
//                 disabled={archivarMutation.isPending}
//               >
//                 {archivada ? 'Desarchivar' : 'Archivar'}
//               </Button>
//             )}
//             {!archivada && (
//               <IconButton color="error" size="small" onClick={() => handleDelete(obra.id)} disabled={deleteMutation.isPending}>
//                 <Trash2 size={16} />
//               </IconButton>
//             )}
//           </Box>
//         </Paper>
//       ))}
//     </Stack>
//   );

//   const renderTablaDesktop = (obras: typeof filteredData, archivada: boolean) => (
//     <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'none' }}>
//       <Table>
//         <TableHead sx={{ bgcolor: 'var(--social-bg)' }}>
//           <TableRow>
//             <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
//             <TableCell sx={{ fontWeight: 700 }}>Ubicación</TableCell>
//             <TableCell sx={{ fontWeight: 700 }}>Inicio estimado</TableCell>
//             <TableCell sx={{ fontWeight: 700 }}>Fin estimado</TableCell>
//             <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {obras.map((obra) => (
//             <TableRow key={obra.id} hover sx={{ opacity: archivada ? 0.8 : 1 }}>
//               <TableCell>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <Typography variant="body2" fontWeight={600}>{obra.nombre}</Typography>
//                   {archivada && <Chip label="Archivada" size="small" color="warning" variant="outlined" />}
//                 </Box>
//               </TableCell>
//               <TableCell><Typography variant="body2">{obra.ubicacion || '-'}</Typography></TableCell>
//               <TableCell><Typography variant="body2">{obra.fecha_inicio_estimado || '-'}</Typography></TableCell>
//               <TableCell><Typography variant="body2">{obra.fecha_fin_estimado || '-'}</Typography></TableCell>
//               <TableCell align="right">
//                 <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
//                   <IconButton size="small" onClick={() => navigate(`/obras/${obra.id}`)}><Eye size={18} /></IconButton>
//                   {!archivada && (
//                     <IconButton size="small" onClick={() => navigate(`/obras/${obra.id}/editar`)}><Pencil size={18} /></IconButton>
//                   )}
//                   {esAdmin && (
//                     <IconButton
//                       size="small"
//                       color="warning"
//                       onClick={() => handleArchivar(obra.id, !archivada)}
//                       disabled={archivarMutation.isPending}
//                       title={archivada ? 'Desarchivar' : 'Archivar'}
//                     >
//                       {archivada ? <ArchiveRestore size={18} /> : <Archive size={18} />}
//                     </IconButton>
//                   )}
//                   {!archivada && (
//                     <IconButton size="small" color="error" onClick={() => handleDelete(obra.id)} disabled={deleteMutation.isPending}>
//                       <Trash2 size={18} />
//                     </IconButton>
//                   )}
//                 </Stack>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </Paper>
//   );

//   return (
//     <AppLayout>
//       <PageHeader
//         title="Obras"
//         subtitle="Gestión general de obras y proyectos."
//         actions={
//           <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
//             <Button
//               variant="outlined"
//               fullWidth={isMobile}
//               startIcon={<Settings size={16} />}
//               onClick={() => setTipoObraModalOpen(true)}
//               sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
//             >
//               Tipos
//             </Button>
//             <Button
//               variant="contained"
//               fullWidth={isMobile}
//               startIcon={<Plus size={18} />}
//               onClick={() => navigate('/obras/nueva')}
//               sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, whiteSpace: 'nowrap' }}
//             >
//               Nueva Obra
//             </Button>
//           </Stack>
//         }
//       />

//       <Paper sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3, mb: 2, boxShadow: 'none', border: '1px solid var(--border)' }}>
//         <TextField
//           fullWidth
//           size={isMobile ? 'small' : 'medium'}
//           placeholder="Buscar obra o ubicación..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </Paper>

//       <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
//         <Tab label={`Activas${data ? ` (${data.length})` : ''}`} />
//         <Tab label={`Archivadas${archivadas.length > 0 ? ` (${archivadas.length})` : ''}`} icon={<Archive size={14} />} iconPosition="start" />
//       </Tabs>

//       {isLoadingCurrent && <LoadingState message="Cargando obras..." />}
//       {isErrorCurrent && <ErrorState title="Error" message="No se cargaron las obras." onRetry={refetchCurrent} />}
//       {!isLoadingCurrent && !isErrorCurrent && filteredData.length === 0 && (
//         <EmptyState
//           title={tab === 0 ? 'Sin obras activas' : 'Sin obras archivadas'}
//           description={tab === 0 ? 'No hay obras activas.' : 'No hay obras archivadas.'}
//           action={tab === 0 ? <Button variant="contained" onClick={() => navigate('/obras/nueva')}>Crear obra</Button> : undefined}
//         />
//       )}

//       {!isLoadingCurrent && !isErrorCurrent && filteredData.length > 0 && (
//         isMobile
//           ? renderCardsMobile(filteredData, tab === 1)
//           : renderTablaDesktop(filteredData, tab === 1)
//       )}

//       <TipoObraModal open={tipoObraModalOpen} onClose={() => setTipoObraModalOpen(false)} />
//     </AppLayout>
//   );
// }

import { useMemo, useState } from 'react';
import {
  Box, Button, Chip, Divider, IconButton, Paper, Stack,
  Tab, Table, TableBody, TableCell, TableHead, TableRow,
  Tabs, TextField, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { Archive, ArchiveRestore, Calendar, Eye, MapPin, Pencil, Plus, Settings, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { useDeleteObra, useObrasList, useObrasArchivadas, useArchivarObra } from '../hooks/useObras';
import { TipoObraModal } from '../modal/tipoObraModal';
import { useNotify } from '../../../shared/hooks/useNotify';
import { useAuthStore } from '../../../app/store/auth.store';

export function ObrasListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const notify = useNotify();

  const user = useAuthStore((s) => s.user);
  const esAdmin = [1, 3, 4, 6].includes(user?.rol_id ?? 0);

  const { data, isLoading, isError, refetch } = useObrasList();
  const { data: archivadas = [], isLoading: loadingArchivadas, refetch: refetchArchivadas } = useObrasArchivadas();
  const deleteMutation = useDeleteObra();
  const archivarMutation = useArchivarObra();

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const [tipoObraModalOpen, setTipoObraModalOpen] = useState(false);

  const obraActivas = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((o) =>
      o.nombre?.toLowerCase().includes(term) ||
      o.ubicacion?.toLowerCase().includes(term) ||
      o.descripcion?.toLowerCase().includes(term)
    );
  }, [data, search]);

  const obrasArchivadas = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return archivadas;
    return archivadas.filter((o) =>
      o.nombre?.toLowerCase().includes(term) ||
      o.ubicacion?.toLowerCase().includes(term)
    );
  }, [archivadas, search]);

  const filteredData = tab === 0 ? obraActivas : obrasArchivadas;
  const isLoadingCurrent = tab === 0 ? isLoading : loadingArchivadas;
  const isErrorCurrent = tab === 0 ? isError : false;
  const refetchCurrent = tab === 0 ? refetch : refetchArchivadas;

  const handleDelete = async (id: number) => {
    const confirmed = await notify.confirm({
      title: t('obras.confirm.eliminar_title'),
      message: t('obras.confirm.eliminar_msg'),
      confirmLabel: t('obras.confirm.eliminar_btn'),
      severity: 'error',
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(id);
      notify.success(t('obras.notify.eliminada'));
    } catch {
      notify.error(t('obras.notify.error_eliminar'));
    }
  };

  const handleArchivar = async (id: number, archivar: boolean) => {
    const confirmed = await notify.confirm({
      title: archivar ? t('obras.confirm.archivar_title') : t('obras.confirm.desarchivar_title'),
      message: archivar ? t('obras.confirm.archivar_msg') : t('obras.confirm.desarchivar_msg'),
      confirmLabel: archivar ? t('obras.confirm.archivar_btn') : t('obras.confirm.desarchivar_btn'),
      severity: 'warning',
    });
    if (!confirmed) return;
    try {
      await archivarMutation.mutateAsync({ id, archivar });
      notify.success(archivar ? t('obras.notify.archivada') : t('obras.notify.desarchivada'));
    } catch {
      notify.error(t('obras.notify.error_archivar'));
    }
  };

  const renderCardsMobile = (obras: typeof filteredData, archivada: boolean) => (
    <Stack spacing={2}>
      {obras.map((obra) => (
        <Paper key={obra.id} sx={{ p: 2, borderRadius: 3, border: '1px solid var(--border)', boxShadow: 'none', opacity: archivada ? 0.8 : 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} color="primary">{obra.nombre}</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {archivada && <Chip label={t('obras.archivada')} size="small" color="warning" variant="outlined" />}
              <Typography variant="caption" sx={{ bgcolor: 'var(--accent-bg)', px: 1, py: 0.5, borderRadius: 1, color: 'var(--accent)' }}>
                ID: {obra.id}
              </Typography>
            </Box>
          </Box>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapPin size={14} color="#64748B" />
              <Typography variant="body2" color="text.secondary">{obra.ubicacion || t('obras.sin_ubicacion')}</Typography>
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
            <Button size="small" startIcon={<Eye size={16} />} onClick={() => navigate(`/obras/${obra.id}`)}>
              {t('obras.acciones.ver')}
            </Button>
            {!archivada && (
              <Button size="small" startIcon={<Pencil size={16} />} onClick={() => navigate(`/obras/${obra.id}/editar`)}>
                {t('obras.acciones.editar')}
              </Button>
            )}
            {esAdmin && (
              <Button
                size="small"
                color="warning"
                startIcon={archivada ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                onClick={() => handleArchivar(obra.id, !archivada)}
                disabled={archivarMutation.isPending}
              >
                {archivada ? t('obras.acciones.desarchivar') : t('obras.acciones.archivar')}
              </Button>
            )}
            {!archivada && (
              <IconButton color="error" size="small" onClick={() => handleDelete(obra.id)} disabled={deleteMutation.isPending}>
                <Trash2 size={16} />
              </IconButton>
            )}
          </Box>
        </Paper>
      ))}
    </Stack>
  );

  const renderTablaDesktop = (obras: typeof filteredData, archivada: boolean) => (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'none' }}>
      <Table>
        <TableHead sx={{ bgcolor: 'var(--social-bg)' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>{t('obras.tabla.nombre')}</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>{t('obras.tabla.ubicacion')}</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>{t('obras.tabla.inicio_estimado')}</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>{t('obras.tabla.fin_estimado')}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>{t('obras.tabla.acciones')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {obras.map((obra) => (
            <TableRow key={obra.id} hover sx={{ opacity: archivada ? 0.8 : 1 }}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{obra.nombre}</Typography>
                  {archivada && <Chip label={t('obras.archivada')} size="small" color="warning" variant="outlined" />}
                </Box>
              </TableCell>
              <TableCell><Typography variant="body2">{obra.ubicacion || '-'}</Typography></TableCell>
              <TableCell><Typography variant="body2">{obra.fecha_inicio_estimado || '-'}</Typography></TableCell>
              <TableCell><Typography variant="body2">{obra.fecha_fin_estimado || '-'}</Typography></TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                  <IconButton size="small" onClick={() => navigate(`/obras/${obra.id}`)}>
                    <Eye size={18} />
                  </IconButton>
                  {!archivada && (
                    <IconButton size="small" onClick={() => navigate(`/obras/${obra.id}/editar`)}>
                      <Pencil size={18} />
                    </IconButton>
                  )}
                  {esAdmin && (
                    <IconButton
                      size="small"
                      color="warning"
                      onClick={() => handleArchivar(obra.id, !archivada)}
                      disabled={archivarMutation.isPending}
                      title={archivada ? t('obras.acciones.desarchivar') : t('obras.acciones.archivar')}
                    >
                      {archivada ? <ArchiveRestore size={18} /> : <Archive size={18} />}
                    </IconButton>
                  )}
                  {!archivada && (
                    <IconButton size="small" color="error" onClick={() => handleDelete(obra.id)} disabled={deleteMutation.isPending}>
                      <Trash2 size={18} />
                    </IconButton>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );

  return (
    <AppLayout>
      <PageHeader
        title={t('obras.title')}
        subtitle={t('obras.subtitle')}
        actions={
          <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="outlined"
              fullWidth={isMobile}
              startIcon={<Settings size={16} />}
              onClick={() => setTipoObraModalOpen(true)}
              sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
            >
              {t('obras.tipos')}
            </Button>
            <Button
              variant="contained"
              fullWidth={isMobile}
              startIcon={<Plus size={18} />}
              onClick={() => navigate('/obras/nueva')}
              sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, whiteSpace: 'nowrap' }}
            >
              {t('obras.nueva')}
            </Button>
          </Stack>
        }
      />

      <Paper sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3, mb: 2, boxShadow: 'none', border: '1px solid var(--border)' }}>
        <TextField
          fullWidth
          size={isMobile ? 'small' : 'medium'}
          placeholder={t('obras.buscar')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Paper>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`${t('obras.tabs.activas')}${data ? ` (${data.length})` : ''}`} />
        <Tab
          label={`${t('obras.tabs.archivadas')}${archivadas.length > 0 ? ` (${archivadas.length})` : ''}`}
          icon={<Archive size={14} />}
          iconPosition="start"
        />
      </Tabs>

      {isLoadingCurrent && <LoadingState message={t('obras.loading')} />}
      {isErrorCurrent && <ErrorState title="Error" message={t('obras.error')} onRetry={refetchCurrent} />}
      {!isLoadingCurrent && !isErrorCurrent && filteredData.length === 0 && (
        <EmptyState
          title={tab === 0 ? t('obras.empty.activas') : t('obras.empty.archivadas')}
          description={tab === 0 ? t('obras.empty.activas_desc') : t('obras.empty.archivadas_desc')}
          action={tab === 0
            ? <Button variant="contained" onClick={() => navigate('/obras/nueva')}>{t('obras.empty.crear')}</Button>
            : undefined}
        />
      )}

      {!isLoadingCurrent && !isErrorCurrent && filteredData.length > 0 && (
        isMobile
          ? renderCardsMobile(filteredData, tab === 1)
          : renderTablaDesktop(filteredData, tab === 1)
      )}

      <TipoObraModal open={tipoObraModalOpen} onClose={() => setTipoObraModalOpen(false)} />
    </AppLayout>
  );
}