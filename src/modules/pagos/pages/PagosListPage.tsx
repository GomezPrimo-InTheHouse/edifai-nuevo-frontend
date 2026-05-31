// import { useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Box, Button, Card, CardContent, Chip, IconButton, InputAdornment,
//   Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow,
//   TextField, Typography, useMediaQuery, useTheme,
// } from '@mui/material';
// import { Eye, Plus, Search, Trash2 } from 'lucide-react';
// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
// import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
// import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
// import { PagoEstadoChip } from '../components/PagoEstadoChip';
// import { PagoModal } from '../components/PagoModal';
// import { PagosEstadisticas } from '../components/PagosEstadisticas';
// import { useDeletePago, usePagosList } from '../hooks/usePagos';
// import { useNotify } from '../../../shared/hooks/useNotify';
// import type { Pago } from '../types/pago.types';

// export const PagosListPage = () => {
//   const navigate = useNavigate();
//   const notify = useNotify();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

//   const { data, isLoading, isError, refetch } = usePagosList();
//   const deleteMutation = useDeletePago();
//   const [search, setSearch] = useState('');
//   const [pagoModalOpen, setPagoModalOpen] = useState(false);

//   const filteredData = useMemo(() => {
//     if (!data) return [];
//     const term = search.trim().toLowerCase();
//     if (!term) return data;
//     return data.filter((p) =>
//       p.trabajador_nombre?.toLowerCase().includes(term) ||
//       p.trabajador_apellido?.toLowerCase().includes(term) ||
//       p.presupuesto_nombre?.toLowerCase().includes(term) ||
//       p.motivo?.toLowerCase().includes(term)
//     );
//   }, [data, search]);

//   const handleDelete = async (id: number) => {
//     const confirmed = await notify.confirm({
//       title: '¿Eliminar pago?',
//       message: 'Esta acción no se puede deshacer.',
//       confirmLabel: 'Eliminar',
//       severity: 'error',
//     });
//     if (!confirmed) return;
//     try {
//       await deleteMutation.mutateAsync(id);
//       notify.success('Pago eliminado.');
//     } catch {
//       notify.error('No se pudo eliminar el pago.');
//     }
//   };

//   return (
//     <AppLayout>
//       <PageHeader
//         title="Pagos"
//         subtitle="Historial de pagos y adelantos a trabajadores."
//         actions={
//           <Button
//             variant="contained"
//             startIcon={<Plus size={18} />}
//             onClick={() => setPagoModalOpen(true)}
//             size={isMobile ? 'small' : 'medium'}
//           >
//             {isMobile ? 'Nuevo' : 'Registrar pago'}
//           </Button>
//         }
//       />

//       {/* Estadísticas */}
//       <PagosEstadisticas />

//       {/* Buscador */}
//       <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
//         <TextField
//           fullWidth
//           label="Buscar por trabajador, presupuesto o motivo"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           size={isMobile ? 'small' : 'medium'}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <Search size={18} color="#94A3B8" />
//               </InputAdornment>
//             ),
//           }}
//         />
//       </Paper>

//       {isLoading && <LoadingState message="Cargando pagos..." />}
//       {isError && <ErrorState title="Error" message="No se pudieron cargar los pagos." onRetry={refetch} />}
//       {!isLoading && !isError && filteredData.length === 0 && (
//         <EmptyState
//           title="Sin pagos"
//           description="No hay pagos registrados."
//           action={<Button variant="contained" onClick={() => setPagoModalOpen(true)}>Registrar primero</Button>}
//         />
//       )}

//       {!isLoading && !isError && filteredData.length > 0 && (
//         <>
//           {/* Vista mobile — cards */}
//           {isMobile ? (
//             <Stack spacing={2}>
//               {filteredData.map((p) => (
//                 <MobilePagoCard
//                   key={p.id}
//                   pago={p}
//                   onView={() => navigate(`/pagos/${p.id}`)}
//                   onDelete={() => handleDelete(p.id)}
//                   isDeleting={deleteMutation.isPending}
//                 />
//               ))}
//             </Stack>
//           ) : (
//             /* Vista desktop — tabla */
//             <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Trabajador</TableCell>
//                     <TableCell>Presupuesto</TableCell>
//                     <TableCell>Monto</TableCell>
//                     <TableCell>Fecha</TableCell>
//                     <TableCell>Forma de pago</TableCell>
//                     <TableCell>Estado</TableCell>
//                     <TableCell align="right">Acciones</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {filteredData.map((p) => (
//                     <TableRow key={p.id} hover>
//                       <TableCell>
//                         <Typography fontWeight={600}>
//                           {p.trabajador_nombre} {p.trabajador_apellido}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>{p.presupuesto_nombre || `#${p.presupuesto_id}`}</TableCell>
//                       <TableCell>${Number(p.monto).toLocaleString('es-AR')}</TableCell>
//                       <TableCell>{new Date(p.fecha).toLocaleDateString('es-AR')}</TableCell>
//                       <TableCell>{p.forma_pago_nombre || '-'}</TableCell>
//                       <TableCell><PagoEstadoChip estado={p.estado} /></TableCell>
//                       <TableCell align="right">
//                         <Stack direction="row" justifyContent="flex-end" spacing={1}>
//                           <IconButton onClick={() => navigate(`/pagos/${p.id}`)}>
//                             <Eye size={18} />
//                           </IconButton>
//                           <IconButton
//                             color="error"
//                             onClick={() => handleDelete(p.id)}
//                             disabled={deleteMutation.isPending}
//                           >
//                             <Trash2 size={18} />
//                           </IconButton>
//                         </Stack>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </Paper>
//           )}
//         </>
//       )}

//       <PagoModal open={pagoModalOpen} onClose={() => setPagoModalOpen(false)} />
//     </AppLayout>
//   );
// };

// // ── Card mobile ──────────────────────────────────────────────
// interface MobilePagoCardProps {
//   pago: Pago;
//   onView: () => void;
//   onDelete: () => void;
//   isDeleting: boolean;
// }

// function MobilePagoCard({ pago, onView, onDelete, isDeleting }: MobilePagoCardProps) {
//   return (
//     <Card sx={{ borderRadius: 3 }}>
//       <CardContent sx={{ p: 2 }}>
//         <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
//           <Box>
//             <Typography variant="body1" fontWeight={700}>
//               {pago.trabajador_nombre} {pago.trabajador_apellido}
//             </Typography>
//             <Typography variant="caption" sx={{ color: '#64748B' }}>
//               {pago.presupuesto_nombre || `Presupuesto #${pago.presupuesto_id}`}
//             </Typography>
//           </Box>
//           <PagoEstadoChip estado={pago.estado} />
//         </Stack>

//         <Stack direction="row" justifyContent="space-between" alignItems="center">
//           <Stack spacing={0.5}>
//             <Typography variant="h6" fontWeight={800} sx={{ color: '#0F172A' }}>
//               ${Number(pago.monto).toLocaleString('es-AR')}
//             </Typography>
//             <Stack direction="row" spacing={1}>
//               <Typography variant="caption" sx={{ color: '#94A3B8' }}>
//                 {new Date(pago.fecha).toLocaleDateString('es-AR')}
//               </Typography>
//               {pago.forma_pago_nombre && (
//                 <>
//                   <Typography variant="caption" sx={{ color: '#94A3B8' }}>·</Typography>
//                   <Chip label={pago.forma_pago_nombre} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#F1F5F9' }} />
//                 </>
//               )}
//             </Stack>
//           </Stack>

//           <Stack direction="row" spacing={0.5}>
//             <IconButton size="small" onClick={onView}>
//               <Eye size={16} />
//             </IconButton>
//             <IconButton size="small" color="error" onClick={onDelete} disabled={isDeleting}>
//               <Trash2 size={16} />
//             </IconButton>
//           </Stack>
//         </Stack>
//       </CardContent>
//     </Card>
//   );
// }

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Chip, IconButton, InputAdornment,
  Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { Eye, Plus, Search, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { PagoEstadoChip } from '../components/PagoEstadoChip';
import { PagoModal } from '../components/PagoModal';
import { PagosEstadisticas } from '../components/PagosEstadisticas';
import { useDeletePago, usePagosList } from '../hooks/usePagos';
import { useNotify } from '../../../shared/hooks/useNotify';
import type { Pago } from '../types/pago.types';

export const PagosListPage = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data, isLoading, isError, refetch } = usePagosList();
  const deleteMutation = useDeletePago();
  const [search, setSearch] = useState('');
  const [pagoModalOpen, setPagoModalOpen] = useState(false);

  const filteredData = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((p) =>
      p.trabajador_nombre?.toLowerCase().includes(term) ||
      p.trabajador_apellido?.toLowerCase().includes(term) ||
      p.presupuesto_nombre?.toLowerCase().includes(term) ||
      p.motivo?.toLowerCase().includes(term)
    );
  }, [data, search]);

  const handleDelete = async (id: number) => {
    const confirmed = await notify.confirm({
      title: t('pagos.confirm.eliminar_title'),
      message: t('pagos.confirm.eliminar_msg'),
      confirmLabel: t('pagos.confirm.eliminar_btn'),
      severity: 'error',
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(id);
      notify.success(t('pagos.notify.eliminado'));
    } catch {
      notify.error(t('pagos.notify.error_eliminar'));
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={t('pagos.title')}
        subtitle={t('pagos.subtitle')}
        actions={
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setPagoModalOpen(true)}
            size={isMobile ? 'small' : 'medium'}
          >
            {isMobile ? t('pagos.nuevo_corto') : t('pagos.nuevo')}
          </Button>
        }
      />

      <PagosEstadisticas />

      <Paper sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <TextField
          fullWidth
          label={t('pagos.buscar')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size={isMobile ? 'small' : 'medium'}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color={theme.palette.text.disabled} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {isLoading && <LoadingState message={t('pagos.loading')} />}
      {isError && <ErrorState title="Error" message={t('pagos.error')} onRetry={refetch} />}
      {!isLoading && !isError && filteredData.length === 0 && (
        <EmptyState
          title={t('pagos.empty.title')}
          description={t('pagos.empty.desc')}
          action={<Button variant="contained" onClick={() => setPagoModalOpen(true)}>{t('pagos.empty.crear')}</Button>}
        />
      )}

      {!isLoading && !isError && filteredData.length > 0 && (
        <>
          {isMobile ? (
            <Stack spacing={2}>
              {filteredData.map((p) => (
                <MobilePagoCard
                  key={p.id}
                  pago={p}
                  onView={() => navigate(`/pagos/${p.id}`)}
                  onDelete={() => handleDelete(p.id)}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </Stack>
          ) : (
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
              <Table>
                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>{t('pagos.tabla.trabajador')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('pagos.tabla.presupuesto')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('pagos.tabla.monto')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('pagos.tabla.fecha')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('pagos.tabla.forma_pago')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('pagos.tabla.estado')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{t('pagos.tabla.acciones')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{p.trabajador_nombre} {p.trabajador_apellido}</Typography>
                      </TableCell>
                      <TableCell>{p.presupuesto_nombre || `#${p.presupuesto_id}`}</TableCell>
                      <TableCell>${Number(p.monto).toLocaleString('es-AR')}</TableCell>
                      <TableCell>{new Date(p.fecha).toLocaleDateString('es-AR')}</TableCell>
                      <TableCell>{p.forma_pago_nombre || '-'}</TableCell>
                      <TableCell><PagoEstadoChip estado={p.estado} /></TableCell>
                      <TableCell align="right">
                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                          <IconButton size="small" onClick={() => navigate(`/pagos/${p.id}`)}>
                            <Eye size={18} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(p.id)} disabled={deleteMutation.isPending}>
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
        </>
      )}

      <PagoModal open={pagoModalOpen} onClose={() => setPagoModalOpen(false)} />
    </AppLayout>
  );
};

interface MobilePagoCardProps {
  pago: Pago;
  onView: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function MobilePagoCard({ pago, onView, onDelete, isDeleting }: MobilePagoCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
          <Box>
            <Typography variant="body1" fontWeight={700} color="text.primary">
              {pago.trabajador_nombre} {pago.trabajador_apellido}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {pago.presupuesto_nombre || `${t('pagos.presupuesto')} #${pago.presupuesto_id}`}
            </Typography>
          </Box>
          <PagoEstadoChip estado={pago.estado} />
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={800} color="text.primary">
              ${Number(pago.monto).toLocaleString('es-AR')}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Typography variant="caption" color="text.disabled">
                {new Date(pago.fecha).toLocaleDateString('es-AR')}
              </Typography>
              {pago.forma_pago_nombre && (
                <>
                  <Typography variant="caption" color="text.disabled">·</Typography>
                  <Chip label={pago.forma_pago_nombre} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: theme.palette.action.hover }} />
                </>
              )}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={onView}><Eye size={16} /></IconButton>
            <IconButton size="small" color="error" onClick={onDelete} disabled={isDeleting}><Trash2 size={16} /></IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}