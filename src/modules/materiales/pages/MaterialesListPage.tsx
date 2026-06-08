
// import { useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Box, Button, Card, CardContent, Chip, Divider, Grid, IconButton,
//   Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow,
//   TextField, Typography, useMediaQuery, useTheme,
// } from '@mui/material';
// import { Eye, Pencil, Plus, Settings, Tag, TrendingUp, Package, DollarSign, Trash2 } from 'lucide-react';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, Cell
// } from 'recharts';
// import { useTranslation } from 'react-i18next';
// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
// import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
// import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
// import { StockBadge } from '../components/StockBadge';
// import { TipoMaterialModal } from '../components/TipoMaterialModal';
// import { AjustePreciosModal } from '../components/AjustePreciosModal';
// import { useDeleteMaterial, useEstadisticasMateriales, useMaterialesList } from '../hooks/useMateriales';
// import { useTiposMaterialList } from '../hooks/useTipoMaterial';
// import { useNotify } from '../../../shared/hooks/useNotify';

// const PIE_COLORS = ['#F59E0B', '#0F172A', '#2563EB', '#16A34A', '#EA580C'];

// export const MaterialesListPage = () => {
//   const navigate = useNavigate();
//   const notify = useNotify();
//   const theme = useTheme();
//   const { t } = useTranslation();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

//   const { data, isLoading, isError, refetch } = useMaterialesList();
//   const { data: tipos = [] } = useTiposMaterialList();
//   const { data: estadisticas } = useEstadisticasMateriales();
//   const deleteMutation = useDeleteMaterial();
//   const [search, setSearch] = useState('');
//   const [tipoModalOpen, setTipoModalOpen] = useState(false);
//   const [ajusteModalOpen, setAjusteModalOpen] = useState(false);

//   const filteredData = useMemo(() => {
//     if (!data) return [];
//     const term = search.trim().toLowerCase();
//     if (!term) return data;
//     return data.filter((m) =>
//       m.nombre?.toLowerCase().includes(term) ||
//       m.descripcion?.toLowerCase().includes(term)
//     );
//   }, [data, search]);

//   const getTipoNombre = (id?: number | null) => tipos.find((t) => t.id === id)?.nombre ?? '-';

//   const handleDelete = async (id: number) => {
//     const confirmed = await notify.confirm({
//       title: t('materiales.confirm.eliminar_title'),
//       message: t('materiales.confirm.eliminar_msg'),
//       confirmLabel: t('materiales.confirm.eliminar_btn'),
//       severity: 'error',
//     });
//     if (!confirmed) return;
//     try {
//       await deleteMutation.mutateAsync(id);
//       notify.success(t('materiales.notify.eliminado'));
//     } catch (error: any) {
//       notify.error(error?.response?.data?.message || t('materiales.notify.error_eliminar'));
//     }
//   };

//   return (
//     <AppLayout>
//       <PageHeader
//         title={t('materiales.title')}
//         subtitle={t('materiales.subtitle')}
//         actions={
//           <Stack direction={isMobile ? 'column' : 'row'} spacing={1} sx={{ width: isMobile ? '100%' : 'auto' }}>
//             <Stack direction="row" spacing={1}>
//               <Button variant="outlined" startIcon={<Settings size={16} />} onClick={() => setTipoModalOpen(true)}>
//                 {t('materiales.tipos')}
//               </Button>
//               <Button variant="outlined" color="warning" startIcon={<TrendingUp size={16} />} onClick={() => setAjusteModalOpen(true)}>
//                 {t('materiales.precios')}
//               </Button>
//             </Stack>
//             <Button variant="contained" fullWidth={isMobile} startIcon={<Plus size={18} />} onClick={() => navigate('/materiales/nuevo')}>
//               {t('materiales.nuevo')}
//             </Button>
//           </Stack>
//         }
//       />

//       <Paper sx={{ p: 2, borderRadius: 3, mb: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
//         <TextField fullWidth size={isMobile ? 'small' : 'medium'} label={t('materiales.buscar')}
//           value={search} onChange={(e) => setSearch(e.target.value)} />
//       </Paper>

//       {isLoading && <LoadingState message={t('materiales.loading')} />}
//       {isError && <ErrorState title="Error" message={t('materiales.error')} onRetry={refetch} />}
//       {!isLoading && !isError && filteredData.length === 0 && (
//         <EmptyState
//           title={t('materiales.empty.title')}
//           description={t('materiales.empty.desc')}
//           action={<Button variant="contained" onClick={() => navigate('/materiales/nuevo')}>{t('materiales.empty.crear')}</Button>}
//         />
//       )}

//       {!isLoading && !isError && filteredData.length > 0 && (
//         isMobile ? (
//           <Stack spacing={2} sx={{ mb: 3 }}>
//             {filteredData.map((m) => (
//               <Paper key={m.id} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//                   <Box>
//                     <Typography variant="subtitle1" fontWeight={800} color="text.primary">{m.nombre}</Typography>
//                     <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                       <Tag size={12} /> {getTipoNombre(m.tipo_material_id)}
//                     </Typography>
//                   </Box>
//                   <StockBadge stock={Number(m.stock_actual)} unidad={m.unidad} />
//                 </Box>
//                 <Box sx={{
//                   display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2,
//                   bgcolor: theme.palette.action.hover, p: 1.5, borderRadius: 2,
//                 }}>
//                   <Box>
//                     <Typography variant="caption" color="text.secondary" display="block">{t('materiales.tabla.precio_unit')}</Typography>
//                     <Typography variant="body2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center' }} color="text.primary">
//                       <DollarSign size={14} /> {Number(m.precio_unitario).toLocaleString('es-AR')}
//                     </Typography>
//                   </Box>
//                   <Box>
//                     <Typography variant="caption" color="text.secondary" display="block">{t('materiales.tabla.unidad')}</Typography>
//                     <Typography variant="body2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center' }} color="text.primary">
//                       <Package size={14} style={{ marginRight: 4 }} /> {m.unidad}
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
//                 <Box sx={{ display: 'flex', justifyContent: 'space-around', pt: 1 }}>
//                   <Button size="small" startIcon={<Eye size={18} />} onClick={() => navigate(`/materiales/${m.id}`)}>
//                     {t('materiales.acciones.ver')}
//                   </Button>
//                   <Button size="small" startIcon={<Pencil size={18} />} onClick={() => navigate(`/materiales/${m.id}/editar`)}>
//                     {t('materiales.acciones.editar')}
//                   </Button>
//                   <IconButton color="error" size="small" onClick={() => handleDelete(m.id)} disabled={deleteMutation.isPending}>
//                     <Trash2 size={18} />
//                   </IconButton>
//                 </Box>
//               </Paper>
//             ))}
//           </Stack>
//         ) : (
//           <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3, bgcolor: 'background.paper' }}>
//             <Table size="small">
//               <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
//                 <TableRow>
//                   <TableCell sx={{ fontWeight: 700 }}>{t('materiales.tabla.nombre')}</TableCell>
//                   <TableCell sx={{ fontWeight: 700 }}>{t('materiales.tabla.tipo')}</TableCell>
//                   <TableCell sx={{ fontWeight: 700 }}>{t('materiales.tabla.unidad')}</TableCell>
//                   <TableCell sx={{ fontWeight: 700 }}>{t('materiales.tabla.precio_unit')}</TableCell>
//                   <TableCell sx={{ fontWeight: 700 }}>{t('materiales.tabla.stock')}</TableCell>
//                   <TableCell align="right" sx={{ fontWeight: 700 }}>{t('materiales.tabla.acciones')}</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {filteredData.map((m) => (
//                   <TableRow key={m.id} hover>
//                     <TableCell><Typography variant="body2" fontWeight={600}>{m.nombre}</Typography></TableCell>
//                     <TableCell><Typography variant="body2">{getTipoNombre(m.tipo_material_id)}</Typography></TableCell>
//                     <TableCell><Typography variant="body2">{m.unidad}</Typography></TableCell>
//                     <TableCell><Typography variant="body2">${Number(m.precio_unitario).toLocaleString('es-AR')}</Typography></TableCell>
//                     <TableCell><StockBadge stock={Number(m.stock_actual)} unidad={m.unidad} /></TableCell>
//                     <TableCell align="right">
//                       <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
//                         <IconButton size="small" onClick={() => navigate(`/materiales/${m.id}`)}><Eye size={18} /></IconButton>
//                         <IconButton size="small" onClick={() => navigate(`/materiales/${m.id}/editar`)}><Pencil size={18} /></IconButton>
//                         <IconButton size="small" color="error" onClick={() => handleDelete(m.id)} disabled={deleteMutation.isPending}><Trash2 size={18} /></IconButton>
//                       </Stack>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </Paper>
//         )
//       )}

//       {estadisticas && (
//         <>
//           <Divider sx={{ my: 3 }}>
//             <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', letterSpacing: '0.08em' }}>
//               {t('materiales.stats.titulo')}
//             </Typography>
//           </Divider>

//           <Grid container spacing={3}>
//             <Grid size={{ xs: 12, lg: 6 }}>
//               <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
//                 <CardContent sx={{ p: 3 }}>
//                   <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
//                     {t('materiales.stats.mas_utilizados')}
//                   </Typography>
//                   {estadisticas.mas_utilizados.length === 0 ? (
//                     <Typography variant="body2" color="text.secondary">{t('materiales.stats.sin_datos')}</Typography>
//                   ) : (
//                     <ResponsiveContainer width="100%" height={220}>
//                       <BarChart data={estadisticas.mas_utilizados} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
//                         <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
//                         <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
//                         <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
//                         <Tooltip
//                           formatter={(value) => [`${value} ${t('materiales.stats.veces')}`, t('materiales.stats.usos')]}
//                           contentStyle={{ borderRadius: 8, fontSize: 12, backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}
//                         />
//                         <Bar dataKey="veces_usado" name={t('materiales.stats.usos')} radius={[4, 4, 0, 0]}>
//                           {estadisticas.mas_utilizados.map((_, i) => (
//                             <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
//                           ))}
//                         </Bar>
//                       </BarChart>
//                     </ResponsiveContainer>
//                   )}
//                 </CardContent>
//               </Card>
//             </Grid>

//             <Grid size={{ xs: 12, lg: 6 }}>
//               <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
//                 <CardContent sx={{ p: 3 }}>
//                   <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
//                     {t('materiales.stats.mayor_aumento')}
//                   </Typography>
//                   {estadisticas.mas_aumentaron.length === 0 ? (
//                     <Typography variant="body2" color="text.secondary">{t('materiales.stats.sin_historial')}</Typography>
//                   ) : (
//                     <Stack spacing={1.5}>
//                       {estadisticas.mas_aumentaron.map((m, i) => (
//                         <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: theme.palette.action.hover }}>
//                           <Typography variant="body2" fontWeight={800} sx={{ color: PIE_COLORS[i % PIE_COLORS.length], minWidth: 20 }}>
//                             #{i + 1}
//                           </Typography>
//                           <Box sx={{ flex: 1 }}>
//                             <Typography variant="body2" fontWeight={600}>{m.nombre}</Typography>
//                             <Typography variant="caption" color="text.secondary">
//                               ${Number(m.precio_inicial).toLocaleString('es-AR')} → ${Number(m.precio_actual).toLocaleString('es-AR')}
//                             </Typography>
//                           </Box>
//                           <Chip
//                             label={`+${m.porcentaje_aumento}%`}
//                             size="small"
//                             sx={{ bgcolor: 'rgba(245,158,11,0.12)', color: '#B45309', fontWeight: 700, fontSize: 11 }}
//                           />
//                         </Box>
//                       ))}
//                     </Stack>
//                   )}
//                 </CardContent>
//               </Card>
//             </Grid>

//             <Grid size={{ xs: 12, md: 6 }}>
//               <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
//                 <CardContent sx={{ p: 3 }}>
//                   <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
//                     {t('materiales.stats.mayor_stock')}
//                   </Typography>
//                   <Stack spacing={1.5}>
//                     {estadisticas.mas_stock.map((m, i) => (
//                       <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'rgba(22,163,74,0.06)' }}>
//                         <Typography variant="body2" fontWeight={800} sx={{ color: '#16A34A', minWidth: 20 }}>#{i + 1}</Typography>
//                         <Box sx={{ flex: 1 }}>
//                           <Typography variant="body2" fontWeight={600}>{m.nombre}</Typography>
//                         </Box>
//                         <Chip
//                           label={`${Number(m.stock_actual).toLocaleString('es-AR')} ${m.unidad}`}
//                           size="small"
//                           sx={{ bgcolor: 'rgba(22,163,74,0.12)', color: '#16A34A', fontWeight: 700, fontSize: 11 }}
//                         />
//                       </Box>
//                     ))}
//                   </Stack>
//                 </CardContent>
//               </Card>
//             </Grid>

//             <Grid size={{ xs: 12, md: 6 }}>
//               <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
//                 <CardContent sx={{ p: 3 }}>
//                   <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
//                     {t('materiales.stats.menor_stock')}
//                   </Typography>
//                   <Stack spacing={1.5}>
//                     {estadisticas.menos_stock.map((m, i) => (
//                       <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'rgba(220,38,38,0.06)' }}>
//                         <Typography variant="body2" fontWeight={800} sx={{ color: '#DC2626', minWidth: 20 }}>#{i + 1}</Typography>
//                         <Box sx={{ flex: 1 }}>
//                           <Typography variant="body2" fontWeight={600}>{m.nombre}</Typography>
//                         </Box>
//                         <Chip
//                           label={`${Number(m.stock_actual).toLocaleString('es-AR')} ${m.unidad}`}
//                           size="small"
//                           sx={{ bgcolor: 'rgba(220,38,38,0.12)', color: '#DC2626', fontWeight: 700, fontSize: 11 }}
//                         />
//                       </Box>
//                     ))}
//                   </Stack>
//                 </CardContent>
//               </Card>
//             </Grid>
//           </Grid>
//         </>
//       )}

//       <TipoMaterialModal open={tipoModalOpen} onClose={() => setTipoModalOpen(false)} />
//       <AjustePreciosModal open={ajusteModalOpen} onClose={() => setAjusteModalOpen(false)} />
//     </AppLayout>
//   );
// };

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Chip, Divider, Grid, IconButton,
  Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { Eye, Pencil, Plus, Settings, Tag, TrendingUp, Package, DollarSign, Trash2, ShoppingBag } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { StockBadge } from '../components/StockBadge';
import { TipoMaterialModal } from '../components/TipoMaterialModal';
import { AjustePreciosModal } from '../components/AjustePreciosModal';
import { useDeleteMaterial, useEstadisticasMateriales, useMaterialesList } from '../hooks/useMateriales';
import { useTiposMaterialList } from '../hooks/useTipoMaterial';
import { useNotify } from '../../../shared/hooks/useNotify';
import { PublicarMaterialModal } from '../../market/components/PublicarMaterialModal';
import { useMisPublicaciones } from '../../market/hooks/useMisPublicaciones';
import { useAuthStore } from '../../../app/store/auth.store';
import type { Material } from '../types/material.types';

const PIE_COLORS = ['#F59E0B', '#0F172A', '#2563EB', '#16A34A', '#EA580C'];
const ROLES_MARKET = [1, 3, 4, 6, 9];

export const MaterialesListPage = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const { data: response, isLoading, isError, refetch } = useMaterialesList(page, limit);
  const data = response?.data ?? [];
  const pagination = response?.pagination;

  const { data: tipos = [] } = useTiposMaterialList();
  const { data: estadisticas } = useEstadisticasMateriales();
  const { data: misPublicaciones = [] } = useMisPublicaciones();
  const deleteMutation = useDeleteMaterial();
  const user = useAuthStore((s) => s.user);

  const [search, setSearch] = useState('');
  const [tipoModalOpen, setTipoModalOpen] = useState(false);
  const [ajusteModalOpen, setAjusteModalOpen] = useState(false);
  const [materialAPublicar, setMaterialAPublicar] = useState<Material | null>(null);

  const puedePublicar = ROLES_MARKET.includes(user?.rol_id ?? -1);

  const tienePublicacionActiva = (materialId: number) =>
    misPublicaciones.some((p) => p.material_id === materialId && p.estado === 'activa');

  const filteredData = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((m) =>
      m.nombre?.toLowerCase().includes(term) ||
      m.descripcion?.toLowerCase().includes(term)
    );
  }, [data, search]);

  const getTipoNombre = (id?: number | null) => tipos.find((tp) => tp.id === id)?.nombre ?? '-';

  const handleDelete = async (id: number) => {
    const confirmed = await notify.confirm({
      title: t('materiales.confirm.eliminar_title'),
      message: t('materiales.confirm.eliminar_msg'),
      confirmLabel: t('materiales.confirm.eliminar_btn'),
      severity: 'error',
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(id);
      notify.success(t('materiales.notify.eliminado'));
    } catch (error: any) {
      notify.error(error?.response?.data?.message || t('materiales.notify.error_eliminar'));
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={t('materiales.title')}
        subtitle={t('materiales.subtitle')}
        actions={
          <Stack direction={isMobile ? 'column' : 'row'} spacing={1} sx={{ width: isMobile ? '100%' : 'auto' }}>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<Settings size={16} />} onClick={() => setTipoModalOpen(true)}>
                {t('materiales.tipos')}
              </Button>
              <Button variant="outlined" color="warning" startIcon={<TrendingUp size={16} />} onClick={() => setAjusteModalOpen(true)}>
                {t('materiales.precios')}
              </Button>
            </Stack>
            <Button variant="contained" fullWidth={isMobile} startIcon={<Plus size={18} />} onClick={() => navigate('/materiales/nuevo')}>
              {t('materiales.nuevo')}
            </Button>
          </Stack>
        }
      />

      <Paper sx={{ p: 2, borderRadius: 3, mb: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
        <TextField fullWidth size={isMobile ? 'small' : 'medium'} label={t('materiales.buscar')}
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </Paper>

      {isLoading && <LoadingState message={t('materiales.loading')} />}
      {isError && <ErrorState title="Error" message={t('materiales.error')} onRetry={refetch} />}
      {!isLoading && !isError && filteredData.length === 0 && (
        <EmptyState
          title={t('materiales.empty.title')}
          description={t('materiales.empty.desc')}
          action={<Button variant="contained" onClick={() => navigate('/materiales/nuevo')}>{t('materiales.empty.crear')}</Button>}
        />
      )}

      {!isLoading && !isError && filteredData.length > 0 && (
        isMobile ? (
          <Stack spacing={2} sx={{ mb: 3 }}>
            {filteredData.map((m) => (
              <Paper key={m.id} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800} color="text.primary">{m.nombre}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tag size={12} /> {getTipoNombre(m.tipo_material_id)}
                    </Typography>
                  </Box>
                  <StockBadge stock={Number(m.stock_actual)} unidad={m.unidad} />
                </Box>
                <Box sx={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2,
                  bgcolor: theme.palette.action.hover, p: 1.5, borderRadius: 2,
                }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">{t('materiales.tabla.precio_unit')}</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center' }} color="text.primary">
                      <DollarSign size={14} /> {Number(m.precio_unitario).toLocaleString('es-AR')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">{t('materiales.tabla.unidad')}</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center' }} color="text.primary">
                      <Package size={14} style={{ marginRight: 4 }} /> {m.unidad}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-around', pt: 1 }}>
                  <Button size="small" startIcon={<Eye size={18} />} onClick={() => navigate(`/materiales/${m.id}`)}>
                    {t('materiales.acciones.ver')}
                  </Button>
                  <Button size="small" startIcon={<Pencil size={18} />} onClick={() => navigate(`/materiales/${m.id}/editar`)}>
                    {t('materiales.acciones.editar')}
                  </Button>
                  {puedePublicar && (
                    <Button
                      size="small"
                      startIcon={<ShoppingBag size={18} />}
                      onClick={() => setMaterialAPublicar(m)}
                      disabled={tienePublicacionActiva(m.id) || Number(m.stock_actual) <= 0}
                      sx={{ color: tienePublicacionActiva(m.id) ? '#F59E0B' : 'inherit' }}
                    >
                      {tienePublicacionActiva(m.id) ? t('market.publicacion.ya_publicado') : t('market.publicacion.publicar')}
                    </Button>
                  )}
                  <IconButton color="error" size="small" onClick={() => handleDelete(m.id)} disabled={deleteMutation.isPending}>
                    <Trash2 size={18} />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', mb: 3, bgcolor: 'background.paper' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{t('materiales.tabla.nombre')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('materiales.tabla.tipo')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('materiales.tabla.unidad')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('materiales.tabla.precio_unit')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('materiales.tabla.stock')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{t('materiales.tabla.acciones')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>{m.nombre}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{getTipoNombre(m.tipo_material_id)}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{m.unidad}</Typography></TableCell>
                    <TableCell><Typography variant="body2">${Number(m.precio_unitario).toLocaleString('es-AR')}</Typography></TableCell>
                    <TableCell><StockBadge stock={Number(m.stock_actual)} unidad={m.unidad} /></TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                        <IconButton size="small" onClick={() => navigate(`/materiales/${m.id}`)}>
                          <Eye size={18} />
                        </IconButton>
                        <IconButton size="small" onClick={() => navigate(`/materiales/${m.id}/editar`)}>
                          <Pencil size={18} />
                        </IconButton>
                        {puedePublicar && (
                          <IconButton
                            size="small"
                            onClick={() => setMaterialAPublicar(m)}
                            disabled={tienePublicacionActiva(m.id) || Number(m.stock_actual) <= 0}
                            title={tienePublicacionActiva(m.id) ? t('market.publicacion.ya_publicado') : t('market.publicacion.publicar')}
                            sx={{ color: tienePublicacionActiva(m.id) ? '#F59E0B' : theme.palette.text.secondary }}
                          >
                            <ShoppingBag size={18} />
                          </IconButton>
                        )}
                        <IconButton size="small" color="error" onClick={() => handleDelete(m.id)} disabled={deleteMutation.isPending}>
                          <Trash2 size={18} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )
      )}

      {estadisticas && (
        <>
          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', letterSpacing: '0.08em' }}>
              {t('materiales.stats.titulo')}
            </Typography>
          </Divider>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
                    {t('materiales.stats.mas_utilizados')}
                  </Typography>
                  {estadisticas.mas_utilizados.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">{t('materiales.stats.sin_datos')}</Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={estadisticas.mas_utilizados} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
                        <YAxis tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
                        <Tooltip
                          formatter={(value) => [`${value} ${t('materiales.stats.veces')}`, t('materiales.stats.usos')]}
                          contentStyle={{ borderRadius: 8, fontSize: 12, backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}
                        />
                        <Bar dataKey="veces_usado" name={t('materiales.stats.usos')} radius={[4, 4, 0, 0]}>
                          {estadisticas.mas_utilizados.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
                    {t('materiales.stats.mayor_aumento')}
                  </Typography>
                  {estadisticas.mas_aumentaron.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">{t('materiales.stats.sin_historial')}</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {estadisticas.mas_aumentaron.map((m, i) => (
                        <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: theme.palette.action.hover }}>
                          <Typography variant="body2" fontWeight={800} sx={{ color: PIE_COLORS[i % PIE_COLORS.length], minWidth: 20 }}>
                            #{i + 1}
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>{m.nombre}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ${Number(m.precio_inicial).toLocaleString('es-AR')} → ${Number(m.precio_actual).toLocaleString('es-AR')}
                            </Typography>
                          </Box>
                          <Chip
                            label={`+${m.porcentaje_aumento}%`}
                            size="small"
                            sx={{ bgcolor: 'rgba(245,158,11,0.12)', color: '#B45309', fontWeight: 700, fontSize: 11 }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
                    {t('materiales.stats.mayor_stock')}
                  </Typography>
                  <Stack spacing={1.5}>
                    {estadisticas.mas_stock.map((m, i) => (
                      <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'rgba(22,163,74,0.06)' }}>
                        <Typography variant="body2" fontWeight={800} sx={{ color: '#16A34A', minWidth: 20 }}>#{i + 1}</Typography>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{m.nombre}</Typography>
                        </Box>
                        <Chip
                          label={`${Number(m.stock_actual).toLocaleString('es-AR')} ${m.unidad}`}
                          size="small"
                          sx={{ bgcolor: 'rgba(22,163,74,0.12)', color: '#16A34A', fontWeight: 700, fontSize: 11 }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
                    {t('materiales.stats.menor_stock')}
                  </Typography>
                  <Stack spacing={1.5}>
                    {estadisticas.menos_stock.map((m, i) => (
                      <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'rgba(220,38,38,0.06)' }}>
                        <Typography variant="body2" fontWeight={800} sx={{ color: '#DC2626', minWidth: 20 }}>#{i + 1}</Typography>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{m.nombre}</Typography>
                        </Box>
                        <Chip
                          label={`${Number(m.stock_actual).toLocaleString('es-AR')} ${m.unidad}`}
                          size="small"
                          sx={{ bgcolor: 'rgba(220,38,38,0.12)', color: '#DC2626', fontWeight: 700, fontSize: 11 }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      <TipoMaterialModal open={tipoModalOpen} onClose={() => setTipoModalOpen(false)} />
      <AjustePreciosModal open={ajusteModalOpen} onClose={() => setAjusteModalOpen(false)} />

      {pagination && pagination.totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            mt: 3,
            pb: 2,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            sx={{ borderRadius: 2 }}
          >
            ← Anterior
          </Button>
          <Typography variant="body2" color="text.secondary">
            Página {pagination.page} de {pagination.totalPages} — {pagination.total} registros
          </Typography>
          <Button
            variant="outlined"
            size="small"
            disabled={!pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
            sx={{ borderRadius: 2 }}
          >
            Siguiente →
          </Button>
        </Box>
      )}

      {materialAPublicar && (
        <PublicarMaterialModal
          open={Boolean(materialAPublicar)}
          onClose={() => setMaterialAPublicar(null)}
          material={materialAPublicar}
        />
      )}
    </AppLayout>
  );
};
