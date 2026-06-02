// import React, { useMemo, useState } from 'react';
// import {
//   Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
//   DialogContent, DialogTitle, Grid, IconButton, MenuItem,
//   Stack, Tab, Tabs, TextField, Typography, useTheme,
// } from '@mui/material';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, Cell,
// } from 'recharts';
// import {  Trash2, RefreshCw, AlertCircle } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
// import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
// import {
//   useGastosImprevistosList,
//   useCrearGastoImprevisto,
//   useActualizarEstadoGasto,
//   useEliminarGastoImprevisto,
// } from '../hooks/useGastosImprevistos';
// import type { CreateGastoImprevistoPayload, GastoImprevisto } from '../types/gastosImprevisto.types';
// import { useAuthStore } from '../../../app/store/auth.store';
// import { useObrasList } from '../../obras/hooks/useObras';
// import { useEspecialidadesList } from '../../trabajadores/hooks/useEspecialidades';
// import { useFormasPagoList } from '../../pagos/hooks/useFormasPago';
// import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
// import { useNotify } from '../../../shared/hooks/useNotify';
// import { BotGastoImprevisto } from '../components/BotGastosImprevisto';

// // ── Colores gráficos ──────────────────────────────────────────
// const CHART_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F97316', '#06B6D4', '#EC4899'];

// // ── Estado chip ──────────────────────────────────────────────
// const ESTADO_KEY: Record<string, 'pendiente' | 'parcialmente_pagado' | 'saldado'> = {
//   pendiente: 'pendiente',
//   parcialmente_pagado: 'parcialmente_pagado',
//   saldado: 'saldado',
// };

// const ESTADO_COLOR: Record<string, 'warning' | 'info' | 'success'> = {
//   pendiente: 'warning',
//   parcialmente_pagado: 'info',
//   saldado: 'success',
// };

// const EstadoChip: React.FC<{ estadoNombre?: string }> = ({ estadoNombre }) => {
//   const { t } = useTranslation();
//   if (!estadoNombre) return null;
//   const key = ESTADO_KEY[estadoNombre] ?? estadoNombre;
//   const color = ESTADO_COLOR[estadoNombre] ?? 'default';
//   return <Chip label={t(`gastos.estados.${key}`, estadoNombre)} color={color} size="small" />;
// };

// // ── Formulario vacío ─────────────────────────────────────────
// const EMPTY_FORM: CreateGastoImprevistoPayload = {
//   obra_id: 0,
//   especialidad_id: 0,
//   descripcion: '',
//   motivo: '',
//   monto: 0,
//   forma_pago_id: 0,
//   pagado_por_id: undefined,
//   fecha: new Date().toISOString().split('T')[0],
// };

// // ── Formateo de moneda ────────────────────────────────────────
// function formatMoney(n: number): string {
//   return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
// }

// // ── Página principal ─────────────────────────────────────────
// export const GastosImprevistosPage: React.FC = () => {
//   const { t } = useTranslation();
//   const theme = useTheme();
//   const notify = useNotify();

//   const { user } = useAuthStore();
//   const isAdmin = [1, 3, 4, 6].includes(user?.rol_id ?? 0);

//   // Data
//   const { data: gastos = [], isLoading, isError, refetch } = useGastosImprevistosList() as {
//     data: GastoImprevisto[]; isLoading: boolean; isError: boolean; refetch: () => void;
//   };
//   const { data: obras = [] } = useObrasList();
//   const { data: especialidades = [] } = useEspecialidadesList();
//   const { data: formasPago = [] } = useFormasPagoList();
//   const { data: trabajadores = [] } = useTrabajadoresList();

//   const crearMutation = useCrearGastoImprevisto();
//   const estadoMutation = useActualizarEstadoGasto();
//   const eliminarMutation = useEliminarGastoImprevisto();

//   const [tab, setTab] = useState(0);
//   const [openCrear, setOpenCrear] = useState(false);
//   const [openEstado, setOpenEstado] = useState<GastoImprevisto | null>(null);
//   const [openEliminar, setOpenEliminar] = useState<number | null>(null);
//   const [form, setForm] = useState<CreateGastoImprevistoPayload>(EMPTY_FORM);
//   const [nuevoEstado, setNuevoEstado] = useState<number>(0);
//   const [errors, setErrors] = useState<string[]>([]);

//   // ── Estadísticas calculadas ──────────────────────────────────
//   const stats = useMemo(() => {
//     const total = gastos.length;
//     const montoTotal = gastos.reduce((acc, g) => acc + Number(g.monto), 0);
//     const pendiente = gastos.filter((g) => g.estado_nombre === 'pendiente').reduce((acc, g) => acc + Number(g.monto), 0);
//     const saldado = gastos.filter((g) => g.estado_nombre === 'saldado').reduce((acc, g) => acc + Number(g.monto), 0);

//     // Por especialidad — ordenado de mayor a menor
//     const porEspecialidad = Object.values(
//       gastos.reduce((acc, g) => {
//         const key = g.especialidad_nombre ?? 'Sin especialidad';
//         if (!acc[key]) acc[key] = { nombre: key, total: 0, cantidad: 0 };
//         acc[key].total += Number(g.monto);
//         acc[key].cantidad += 1;
//         return acc;
//       }, {} as Record<string, { nombre: string; total: number; cantidad: number }>)
//     ).sort((a, b) => b.total - a.total);

//     // Por obra — ordenado de mayor a menor
//     const porObra = Object.values(
//       gastos.reduce((acc, g) => {
//         const key = g.obra_nombre ?? 'Sin obra';
//         if (!acc[key]) acc[key] = { nombre: key, total: 0, cantidad: 0 };
//         acc[key].total += Number(g.monto);
//         acc[key].cantidad += 1;
//         return acc;
//       }, {} as Record<string, { nombre: string; total: number; cantidad: number }>)
//     ).sort((a, b) => b.total - a.total);

//     return { total, montoTotal, pendiente, saldado, porEspecialidad, porObra };
//   }, [gastos]);

//   if (isLoading) return <LoadingState message={t('gastos.loading')} />;
//   if (isError) return <ErrorState title="Error" message={t('gastos.error')} onRetry={refetch} />;

//   // ── Handlers ────────────────────────────────────────────────
//   const handleCrear = async () => {
//     const errs: string[] = [];
//     if (!form.obra_id) errs.push('obra_id');
//     if (!form.especialidad_id) errs.push('especialidad_id');
//     if (!form.descripcion) errs.push('descripcion');
//     if (!form.motivo) errs.push('motivo');
//     if (!form.monto || form.monto <= 0) errs.push('monto');
//     if (!form.forma_pago_id) errs.push('forma_pago_id');
//     if (!form.fecha) errs.push('fecha');
//     if (!form.pagado_por_id) errs.push('pagado_por');
//     if (errs.length > 0) { setErrors(errs); return; }

//     try {
//       await crearMutation.mutateAsync(form);
//       notify.success(t('gastos.notify.creado'));
//       setOpenCrear(false);
//       setForm(EMPTY_FORM);
//       setErrors([]);
//     } catch {
//       notify.error(t('gastos.notify.error_crear'));
//     }
//   };

//   const handleEstado = async () => {
//     if (!openEstado || !nuevoEstado) return;
//     try {
//       await estadoMutation.mutateAsync({ id: openEstado.id, payload: { estado_id: nuevoEstado } });
//       notify.success(t('gastos.notify.estado_actualizado'));
//       setOpenEstado(null);
//     } catch {
//       notify.error(t('gastos.notify.error_estado'));
//     }
//   };

//   const handleEliminar = async () => {
//     if (!openEliminar) return;
//     try {
//       await eliminarMutation.mutateAsync(openEliminar);
//       notify.success(t('gastos.notify.eliminado'));
//       setOpenEliminar(null);
//     } catch {
//       notify.error(t('gastos.notify.error_eliminar'));
//     }
//   };

//   // ── Colores del tema para gráficos ───────────────────────────
//   const tickColor = theme.palette.text.secondary;
//   const tooltipBg = theme.palette.background.paper;
//   const tooltipBorder = theme.palette.divider;

//   // ── Render ──────────────────────────────────────────────────
//   return (
//     <AppLayout>
//       <PageHeader
//         title={t('gastos.title')}
//         subtitle={t(gastos.length === 1 ? 'gastos.subtitle_one' : 'gastos.subtitle_other', { count: gastos.length })}
//         actions={
//           <BotGastoImprevisto
//             obras={obras}
//             especialidades={especialidades}
//             formasPago={formasPago}
//             trabajadores={trabajadores}
//             onConfirmar={async (payload) => {
//               try {
//                 await crearMutation.mutateAsync(payload);
//                 notify.success(t('gastos.notify.creado'));
//               } catch {
//                 notify.error(t('gastos.notify.error_crear'));
//               }
//             }}
//             isSubmitting={crearMutation.isPending}
//           />
//         }
//       />

//       {/* Tabs */}
//       <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
//         <Tab label={t('gastos.tabs.listado')} />
//         <Tab label={t('gastos.tabs.estadisticas')} />
//       </Tabs>

//       {/* ── TAB 0: LISTADO ── */}
//       {tab === 0 && (
//         <>
//           {gastos.length === 0 ? (
//             <Box sx={{ textAlign: 'center', py: 8 }}>
//               <Typography variant="h6" color="text.secondary">{t('gastos.sin_gastos')}</Typography>
//               <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpenCrear(true)}>
//                 {t('gastos.registrar_primero')}
//               </Button>
//             </Box>
//           ) : (
//             <Grid container spacing={2}>
//               {/* Ordenado de mayor a menor monto */}
//               {[...gastos].sort((a, b) => Number(b.monto) - Number(a.monto)).map((gasto) => (
//                 <Grid key={gasto.id} size={{ xs: 12, md: 6, lg: 4 }}>
//                   <Card elevation={0} sx={{ borderRadius: 3, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
//                     <CardContent sx={{ p: 3 }}>
//                       <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
//                         <Box>
//                           <Typography variant="h5" fontWeight={800} color="text.primary">
//                             {formatMoney(Number(gasto.monto))}
//                           </Typography>
//                           <Box sx={{ mt: 0.5 }}>
//                             <EstadoChip estadoNombre={gasto.estado_nombre} />
//                           </Box>
//                         </Box>
//                         {isAdmin && (
//                           <Stack direction="row" spacing={0.5}>
//                             <IconButton size="small" onClick={() => { setOpenEstado(gasto); setNuevoEstado(gasto.estado_id); }}>
//                               <RefreshCw size={16} />
//                             </IconButton>
//                             <IconButton size="small" color="error" onClick={() => setOpenEliminar(gasto.id)}>
//                               <Trash2 size={16} />
//                             </IconButton>
//                           </Stack>
//                         )}
//                       </Stack>

//                       <Stack spacing={0.75}>
//                         <Typography variant="body2" fontWeight={600} color="text.primary">
//                           {gasto.descripcion}
//                         </Typography>
//                         <Typography variant="caption" color="text.secondary">
//                           {gasto.motivo}
//                         </Typography>

//                         {gasto.obra_nombre && (
//                           <Chip
//                             label={gasto.obra_nombre} size="small"
//                             sx={{ width: 'fit-content', bgcolor: theme.palette.action.hover, color: 'text.secondary' }}
//                           />
//                         )}

//                         {gasto.especialidad_nombre && (
//                           <Typography variant="caption" color="text.secondary">
//                             {gasto.especialidad_nombre} · {gasto.forma_pago_nombre}
//                           </Typography>
//                         )}

//                         <Typography variant="caption" color="text.disabled">
//                           {new Date(gasto.fecha).toLocaleDateString('es-AR')}
//                         </Typography>

//                         {gasto.deudor_automatico && (
//                           <Chip
//                             label={t('gastos.deudor_automatico')} size="small" color="warning"
//                             sx={{ width: 'fit-content' }}
//                           />
//                         )}
//                       </Stack>
//                     </CardContent>
//                   </Card>
//                 </Grid>
//               ))}
//             </Grid>
//           )}
//         </>
//       )}

//       {/* ── TAB 1: ESTADÍSTICAS ── */}
//       {tab === 1 && (
//         <Stack spacing={3}>

//           {/* KPIs resumen */}
//           <Grid container spacing={2}>
//             <Grid size={{ xs: 6, md: 3 }}>
//               <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
//                 <CardContent sx={{ p: 2.5 }}>
//                   <Typography variant="caption" color="text.secondary" fontWeight={600}>
//                     {t('gastos.stats.total_gastos')}
//                   </Typography>
//                   <Typography variant="h4" fontWeight={800} color="#F59E0B" sx={{ mt: 0.5 }}>
//                     {stats.total}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//             <Grid size={{ xs: 6, md: 3 }}>
//               <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
//                 <CardContent sx={{ p: 2.5 }}>
//                   <Typography variant="caption" color="text.secondary" fontWeight={600}>
//                     {t('gastos.stats.monto_total')}
//                   </Typography>
//                   <Typography variant="h4" fontWeight={800} color="#3B82F6" sx={{ mt: 0.5 }}>
//                     {formatMoney(stats.montoTotal)}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//             <Grid size={{ xs: 6, md: 3 }}>
//               <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
//                 <CardContent sx={{ p: 2.5 }}>
//                   <Typography variant="caption" color="text.secondary" fontWeight={600}>
//                     {t('gastos.stats.pendiente')}
//                   </Typography>
//                   <Typography variant="h4" fontWeight={800} color="#EF4444" sx={{ mt: 0.5 }}>
//                     {formatMoney(stats.pendiente)}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//             <Grid size={{ xs: 6, md: 3 }}>
//               <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
//                 <CardContent sx={{ p: 2.5 }}>
//                   <Typography variant="caption" color="text.secondary" fontWeight={600}>
//                     {t('gastos.stats.saldado')}
//                   </Typography>
//                   <Typography variant="h4" fontWeight={800} color="#16A34A" sx={{ mt: 0.5 }}>
//                     {formatMoney(stats.saldado)}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//           </Grid>

//           {/* Gráfico por especialidad */}
//           <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
//             <CardContent sx={{ p: 2.5 }}>
//               <Typography variant="body1" fontWeight={700} sx={{ mb: 2 }}>
//                 {t('gastos.stats.por_especialidad')}
//               </Typography>
//               {stats.porEspecialidad.length === 0 ? (
//                 <Typography color="text.disabled" textAlign="center" py={3}>{t('gastos.stats.sin_datos')}</Typography>
//               ) : (
//                 <ResponsiveContainer width="100%" height={280}>
//                   <BarChart data={stats.porEspecialidad} margin={{ top: 4, right: 4, left: 0, bottom: 60 }}>
//                     <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
//                     <XAxis
//                       dataKey="nombre"
//                       tick={{ fontSize: 11, fill: tickColor }}
//                       angle={-35}
//                       textAnchor="end"
//                       interval={0}
//                     />
//                     <YAxis
//                       tick={{ fontSize: 11, fill: tickColor }}
//                       tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
//                     />
//                     <Tooltip
//                       formatter={(v) => [formatMoney(Number(v)), t('gastos.tabla.monto')]}
//                       contentStyle={{ borderRadius: 8, border: `1px solid ${tooltipBorder}`, fontSize: 13, backgroundColor: tooltipBg, color: theme.palette.text.primary }}
//                     />
//                     <Bar dataKey="total" radius={[4, 4, 0, 0]}>
//                       {stats.porEspecialidad.map((_, i) => (
//                         <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
//                       ))}
//                     </Bar>
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </CardContent>
//           </Card>

//           {/* Gráfico por obra */}
//           <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
//             <CardContent sx={{ p: 2.5 }}>
//               <Typography variant="body1" fontWeight={700} sx={{ mb: 2 }}>
//                 {t('gastos.stats.por_obra')}
//               </Typography>
//               {stats.porObra.length === 0 ? (
//                 <Typography color="text.disabled" textAlign="center" py={3}>{t('gastos.stats.sin_datos')}</Typography>
//               ) : (
//                 <ResponsiveContainer width="100%" height={280}>
//                   <BarChart data={stats.porObra} margin={{ top: 4, right: 4, left: 0, bottom: 60 }}>
//                     <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
//                     <XAxis
//                       dataKey="nombre"
//                       tick={{ fontSize: 11, fill: tickColor }}
//                       angle={-35}
//                       textAnchor="end"
//                       interval={0}
//                     />
//                     <YAxis
//                       tick={{ fontSize: 11, fill: tickColor }}
//                       tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
//                     />
//                     <Tooltip
//                       formatter={(v) => [formatMoney(Number(v)), t('gastos.tabla.monto')]}
//                       contentStyle={{ borderRadius: 8, border: `1px solid ${tooltipBorder}`, fontSize: 13, backgroundColor: tooltipBg, color: theme.palette.text.primary }}
//                     />
//                     <Bar dataKey="total" radius={[4, 4, 0, 0]}>
//                       {stats.porObra.map((_, i) => (
//                         <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
//                       ))}
//                     </Bar>
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}

//               {/* Ranking textual */}
//               <Stack spacing={1} sx={{ mt: 2 }}>
//                 {stats.porObra.map((item, i) => (
//                   <Stack key={item.nombre} direction="row" alignItems="center" justifyContent="space-between"
//                     sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.action.hover }}>
//                     <Stack direction="row" alignItems="center" gap={1.5}>
//                       <Typography sx={{ fontSize: 13, fontWeight: 700, color: CHART_COLORS[i % CHART_COLORS.length], minWidth: 20 }}>
//                         {i + 1}
//                       </Typography>
//                       <Typography variant="body2" fontWeight={600}>{item.nombre}</Typography>
//                       <Chip label={`${item.cantidad} gasto${item.cantidad !== 1 ? 's' : ''}`} size="small"
//                         sx={{ bgcolor: `${CHART_COLORS[i % CHART_COLORS.length]}18`, color: CHART_COLORS[i % CHART_COLORS.length], fontWeight: 700, fontSize: 11 }} />
//                     </Stack>
//                     <Typography variant="body2" fontWeight={800} color={CHART_COLORS[i % CHART_COLORS.length]}>
//                       {formatMoney(item.total)}
//                     </Typography>
//                   </Stack>
//                 ))}
//               </Stack>
//             </CardContent>
//           </Card>

//         </Stack>
//       )}

//       {/* ── Modal Crear ── */}
//       <Dialog open={openCrear} onClose={() => { setOpenCrear(false); setErrors([]); }} maxWidth="sm" fullWidth>
//         <DialogTitle>{t('gastos.form.title')}</DialogTitle>
//         <DialogContent>
//           <Stack spacing={2} sx={{ mt: 1 }}>
//             {errors.length > 0 && (
//               <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'error.main' }}>
//                 <AlertCircle size={16} />
//                 <Typography variant="caption">{t('gastos.form.campos_requeridos')}: {errors.join(', ')}</Typography>
//               </Stack>
//             )}

//             {/* Obra — select real */}
//             <TextField select fullWidth size="small" label={t('gastos.form.obra')}
//               error={errors.includes('obra_id')}
//               value={form.obra_id || ''}
//               onChange={(e) => setForm((f) => ({ ...f, obra_id: Number(e.target.value) }))}>
//               <MenuItem value="">{t('gastos.form.seleccionar')}</MenuItem>
//               {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
//             </TextField>

//             {/* Especialidad — select real */}
//             <TextField select fullWidth size="small" label={t('gastos.form.especialidad')}
//               error={errors.includes('especialidad_id')}
//               value={form.especialidad_id || ''}
//               onChange={(e) => setForm((f) => ({ ...f, especialidad_id: Number(e.target.value) }))}>
//               <MenuItem value="">{t('gastos.form.seleccionar')}</MenuItem>
//               {especialidades.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
//             </TextField>

//             <TextField fullWidth size="small" label={t('gastos.form.descripcion')}
//               error={errors.includes('descripcion')}
//               value={form.descripcion}
//               onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />

//             <TextField fullWidth size="small" label={t('gastos.form.motivo')}
//               error={errors.includes('motivo')}
//               value={form.motivo}
//               onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))} />

//             <TextField fullWidth size="small" type="number" label={t('gastos.form.monto')}
//               error={errors.includes('monto')}
//               value={form.monto || ''}
//               onChange={(e) => setForm((f) => ({ ...f, monto: Number(e.target.value) }))} />

//             {/* Forma de pago — select real */}
//             <TextField select fullWidth size="small" label={t('gastos.form.forma_pago')}
//               error={errors.includes('forma_pago_id')}
//               value={form.forma_pago_id || ''}
//               onChange={(e) => setForm((f) => ({ ...f, forma_pago_id: Number(e.target.value) }))}>
//               <MenuItem value="">{t('gastos.form.seleccionar')}</MenuItem>
//               {formasPago.map((fp) => <MenuItem key={fp.id} value={fp.id}>{fp.nombre}</MenuItem>)}
//             </TextField>

//             {/* Pagado por — select de trabajadores */}
//             <TextField select fullWidth size="small" label={t('gastos.form.pagado_por')}
//               error={errors.includes('pagado_por')}
//               value={form.pagado_por_id || ''}
//               onChange={(e) => setForm((f) => ({ ...f, pagado_por_id: Number(e.target.value) }))}>
//               <MenuItem value="">{t('gastos.form.seleccionar')}</MenuItem>
//               {trabajadores.map((tr) => (
//                 <MenuItem key={tr.id} value={tr.id}>{tr.nombre} {tr.apellido}</MenuItem>
//               ))}
//             </TextField>

//             <TextField fullWidth size="small" type="date" label={t('gastos.form.fecha')}
//               error={errors.includes('fecha')}
//               value={form.fecha}
//               onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
//               InputLabelProps={{ shrink: true }} />
//           </Stack>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => { setOpenCrear(false); setErrors([]); }}>{t('gastos.form.cancelar')}</Button>
//           <Button variant="contained" onClick={handleCrear} disabled={crearMutation.isPending}>
//             {crearMutation.isPending ? t('gastos.form.registrando') : t('gastos.form.registrar')}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* ── Modal Cambiar Estado ── */}
//       <Dialog open={!!openEstado} onClose={() => setOpenEstado(null)} maxWidth="xs" fullWidth>
//         <DialogTitle>{t('gastos.estado_modal.title')}</DialogTitle>
//         <DialogContent>
//           <TextField select fullWidth size="small" label={t('gastos.estado_modal.nuevo_estado')} sx={{ mt: 1 }}
//             value={nuevoEstado}
//             onChange={(e) => setNuevoEstado(Number(e.target.value))}>
//             <MenuItem value={16}>{t('gastos.estados.pendiente')}</MenuItem>
//             <MenuItem value={17}>{t('gastos.estados.parcialmente_pagado')}</MenuItem>
//             <MenuItem value={18}>{t('gastos.estados.saldado')}</MenuItem>
//           </TextField>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenEstado(null)}>{t('gastos.estado_modal.cancelar')}</Button>
//           <Button variant="contained" onClick={handleEstado} disabled={estadoMutation.isPending}>
//             {estadoMutation.isPending ? t('gastos.estado_modal.guardando') : t('gastos.estado_modal.guardar')}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* ── Modal Confirmar Eliminar ── */}
//       <Dialog open={!!openEliminar} onClose={() => setOpenEliminar(null)} maxWidth="xs" fullWidth>
//         <DialogTitle>{t('gastos.eliminar_modal.title')}</DialogTitle>
//         <DialogContent>
//           <Typography variant="body2">{t('gastos.eliminar_modal.mensaje')}</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenEliminar(null)}>{t('gastos.eliminar_modal.cancelar')}</Button>
//           <Button variant="contained" color="error" onClick={handleEliminar} disabled={eliminarMutation.isPending}>
//             {eliminarMutation.isPending ? t('gastos.eliminar_modal.eliminando') : t('gastos.eliminar_modal.eliminar')}
//           </Button>
//         </DialogActions>
//       </Dialog>

//     </AppLayout>
//   );
// };

// src/modules/gastosImprevistos/pages/GastosImprevistosPage.tsx
import React, { useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, IconButton, MenuItem,
  Stack, Tab, Tabs, TextField, Typography, useTheme,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Trash2, RefreshCw, AlertCircle, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import {
  useGastosImprevistosList,
  useCrearGastoImprevisto,
  useActualizarEstadoGasto,
  useEliminarGastoImprevisto,
  useActualizarDeudorGasto,
} from '../hooks/useGastosImprevistos';
import type { CreateGastoImprevistoPayload, GastoImprevisto } from '../types/gastosImprevisto.types';
import { useAuthStore } from '../../../app/store/auth.store';
import { useObrasList } from '../../obras/hooks/useObras';
import { useEspecialidadesList } from '../../trabajadores/hooks/useEspecialidades';
import { useFormasPagoList } from '../../pagos/hooks/useFormasPago';
import { useTrabajadoresList } from '../../trabajadores/hooks/useTrabajadores';
import { useClientesList } from '../../clientes/hooks/useClientes';
import { useNotify } from '../../../shared/hooks/useNotify';
import { BotGastoImprevisto } from '../components/BotGastosImprevisto';
import type { Cliente } from '../../clientes/types/cliente.types';

// ── Colores gráficos ──────────────────────────────────────────
const CHART_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F97316', '#06B6D4', '#EC4899'];

// ── Estado chip ──────────────────────────────────────────────
const ESTADO_COLOR: Record<string, 'warning' | 'info' | 'success'> = {
  activo:               'warning',
  'parcialmente pagado': 'info',
  saldado:              'success',
};

const EstadoChip: React.FC<{ estadoNombre?: string }> = ({ estadoNombre }) => {
  if (!estadoNombre) return null;
  const color = ESTADO_COLOR[estadoNombre] ?? 'default';
  return <Chip label={estadoNombre} color={color} size="small" />;
};

// ── Helpers ───────────────────────────────────────────────────
const EMPTY_FORM: CreateGastoImprevistoPayload = {
  obra_id: 0, especialidad_id: 0, descripcion: '', motivo: '',
  monto: 0, forma_pago_id: 0, pagado_por_id: undefined,
  fecha: new Date().toISOString().split('T')[0],
};

function formatMoney(n: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

function clienteLabel(c: Cliente): string {
  if (c.razon_social) return c.razon_social;
  return `${c.nombre}${c.apellido ? ` ${c.apellido}` : ''}`;
}

// ── Página ────────────────────────────────────────────────────
export const GastosImprevistosPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const notify = useNotify();
  const { user } = useAuthStore();
  const isAdmin = [1, 3, 4, 6].includes(user?.rol_id ?? 0);

  // ── Data ─────────────────────────────────────────────────────
  const { data: gastos = [], isLoading, isError, refetch } = useGastosImprevistosList() as {
    data: GastoImprevisto[]; isLoading: boolean; isError: boolean; refetch: () => void;
  };
  const { data: obras       = [] } = useObrasList();
  const { data: especialidades = [] } = useEspecialidadesList();
  const { data: formasPago  = [] } = useFormasPagoList();
  const { data: trabajadores = [] } = useTrabajadoresList();
  const { data: clientes    = [] } = useClientesList();

  // ── Mutations ─────────────────────────────────────────────────
  const crearMutation    = useCrearGastoImprevisto();
  const estadoMutation   = useActualizarEstadoGasto();
  const eliminarMutation = useEliminarGastoImprevisto();
  const deudorMutation   = useActualizarDeudorGasto();

  // ── UI state ─────────────────────────────────────────────────
  const [tab,           setTab]          = useState(0);
  const [openCrear,     setOpenCrear]    = useState(false);
  const [openEstado,    setOpenEstado]   = useState<GastoImprevisto | null>(null);
  const [openEliminar,  setOpenEliminar] = useState<number | null>(null);
  const [form,          setForm]         = useState<CreateGastoImprevistoPayload>(EMPTY_FORM);
  const [nuevoEstado,   setNuevoEstado]  = useState<number>(0);
  const [errors,        setErrors]       = useState<string[]>([]);

  // Deudor inline
  const [editandoDeudor,    setEditandoDeudor]    = useState<number | null>(null);
  const [deudorSeleccionado, setDeudorSeleccionado] = useState<number | ''>('');

  // ── Stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total      = gastos.length;
    const montoTotal = gastos.reduce((acc, g) => acc + Number(g.monto), 0);
    const pendiente  = gastos.filter(g => g.estado_nombre === 'pendiente').reduce((acc, g) => acc + Number(g.monto), 0);
    const saldado    = gastos.filter(g => g.estado_nombre === 'saldado').reduce((acc, g) => acc + Number(g.monto), 0);

    const porEspecialidad = Object.values(
      gastos.reduce((acc, g) => {
        const key = g.especialidad_nombre ?? 'Sin especialidad';
        if (!acc[key]) acc[key] = { nombre: key, total: 0, cantidad: 0 };
        acc[key].total += Number(g.monto);
        acc[key].cantidad += 1;
        return acc;
      }, {} as Record<string, { nombre: string; total: number; cantidad: number }>)
    ).sort((a, b) => b.total - a.total);

    const porObra = Object.values(
      gastos.reduce((acc, g) => {
        const key = g.obra_nombre ?? 'Sin obra';
        if (!acc[key]) acc[key] = { nombre: key, total: 0, cantidad: 0 };
        acc[key].total += Number(g.monto);
        acc[key].cantidad += 1;
        return acc;
      }, {} as Record<string, { nombre: string; total: number; cantidad: number }>)
    ).sort((a, b) => b.total - a.total);

    return { total, montoTotal, pendiente, saldado, porEspecialidad, porObra };
  }, [gastos]);

  if (isLoading) return <LoadingState message={t('gastos.loading')} />;
  if (isError)   return <ErrorState title="Error" message={t('gastos.error')} onRetry={refetch} />;

  // ── Handlers ─────────────────────────────────────────────────
  const handleCrear = async () => {
    const errs: string[] = [];
    if (!form.obra_id)                    errs.push('obra_id');
    if (!form.especialidad_id)            errs.push('especialidad_id');
    if (!form.descripcion)                errs.push('descripcion');
    if (!form.motivo)                     errs.push('motivo');
    if (!form.monto || form.monto <= 0)   errs.push('monto');
    if (!form.forma_pago_id)              errs.push('forma_pago_id');
    if (!form.fecha)                      errs.push('fecha');
    if (!form.pagado_por_id)              errs.push('pagado_por');
    if (errs.length > 0) { setErrors(errs); return; }
    try {
      await crearMutation.mutateAsync(form);
      notify.success(t('gastos.notify.creado'));
      setOpenCrear(false);
      setForm(EMPTY_FORM);
      setErrors([]);
    } catch { notify.error(t('gastos.notify.error_crear')); }
  };

  const handleEstado = async () => {
    if (!openEstado || !nuevoEstado) return;
    try {
      await estadoMutation.mutateAsync({ id: openEstado.id, payload: { estado_id: nuevoEstado } });
      notify.success(t('gastos.notify.estado_actualizado'));
      setOpenEstado(null);
    } catch { notify.error(t('gastos.notify.error_estado')); }
  };

  const handleEliminar = async () => {
    if (!openEliminar) return;
    try {
      await eliminarMutation.mutateAsync(openEliminar);
      notify.success(t('gastos.notify.eliminado'));
      setOpenEliminar(null);
    } catch { notify.error(t('gastos.notify.error_eliminar')); }
  };

  const handleGuardarDeudor = async (gastoId: number) => {
    if (!deudorSeleccionado) return;
    try {
      await deudorMutation.mutateAsync({
        id: gastoId,
        payload: { deudor_cliente_id: Number(deudorSeleccionado), deudor_usuario_id: null },
      });
      notify.success('Deudor asignado correctamente');
      setEditandoDeudor(null);
      setDeudorSeleccionado('');
    } catch { notify.error('Error al asignar deudor'); }
  };

  // ── Chart colors ──────────────────────────────────────────────
  const tickColor  = theme.palette.text.secondary;
  const tooltipBg  = theme.palette.background.paper;
  const tooltipBorder = theme.palette.divider;

  // ── Render ────────────────────────────────────────────────────
  return (
    <AppLayout>
      <PageHeader
        title={t('gastos.title')}
        subtitle={t(gastos.length === 1 ? 'gastos.subtitle_one' : 'gastos.subtitle_other', { count: gastos.length })}
        actions={
          isAdmin ? (
            <BotGastoImprevisto
              obras={obras}
              especialidades={especialidades}
              formasPago={formasPago}
              trabajadores={trabajadores}
              onConfirmar={async (payload) => {
                try {
                  await crearMutation.mutateAsync(payload);
                  notify.success(t('gastos.notify.creado'));
                } catch { notify.error(t('gastos.notify.error_crear')); }
              }}
              isSubmitting={crearMutation.isPending}
            />
          ) : undefined
        }
      />

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Tab label={t('gastos.tabs.listado')} />
        <Tab label={t('gastos.tabs.estadisticas')} />
      </Tabs>

      {/* ── TAB 0: LISTADO ── */}
      {tab === 0 && (
        gastos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">{t('gastos.sin_gastos')}</Typography>
            {isAdmin && (
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpenCrear(true)}>
                {t('gastos.registrar_primero')}
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={2}>
            {[...gastos].sort((a, b) => Number(b.monto) - Number(a.monto)).map((gasto) => (
              <Grid key={gasto.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card elevation={0} sx={{
                  borderRadius: 3, height: '100%',
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                }}>
                  <CardContent sx={{ p: 3 }}>

                    {/* Header: monto + estado + acciones */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                      <Box>
                        <Typography variant="h5" fontWeight={800} color="text.primary">
                          {formatMoney(Number(gasto.monto))}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <EstadoChip estadoNombre={gasto.estado_nombre} />
                        </Box>
                      </Box>
                      {isAdmin && (
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small"
                            onClick={() => { setOpenEstado(gasto); setNuevoEstado(gasto.estado_id); }}>
                            <RefreshCw size={16} />
                          </IconButton>
                          <IconButton size="small" color="error"
                            onClick={() => setOpenEliminar(gasto.id)}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>

                    {/* Detalle */}
                    <Stack spacing={0.75}>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {gasto.descripcion}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {gasto.motivo}
                      </Typography>

                      {gasto.obra_nombre && (
                        <Chip label={gasto.obra_nombre} size="small"
                          sx={{ width: 'fit-content', bgcolor: theme.palette.action.hover, color: 'text.secondary' }} />
                      )}

                      {gasto.especialidad_nombre && (
                        <Typography variant="caption" color="text.secondary">
                          {gasto.especialidad_nombre} · {gasto.forma_pago_nombre}
                        </Typography>
                      )}

                      <Typography variant="caption" color="text.disabled">
                        {new Date(gasto.fecha).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
                      </Typography>

                      {gasto.deudor_automatico && (
                        <Chip label={t('gastos.deudor_automatico')} size="small" color="warning"
                          sx={{ width: 'fit-content' }} />
                      )}

                      {/* ── Deudor: asignar si no tiene ── */}
                      {isAdmin && !gasto.deudor_cliente_id && !gasto.deudor_usuario_id && (
                        <Box sx={{ mt: 0.5 }}>
                          {editandoDeudor === gasto.id ? (
                            <Stack spacing={1}>
                              <TextField
                                select size="small" fullWidth
                                label="Asignar cliente deudor"
                                value={deudorSeleccionado}
                                onChange={(e) => setDeudorSeleccionado(e.target.value as number | '')}
                              >
                                <MenuItem value="">Seleccionar cliente</MenuItem>
                                {(clientes as Cliente[]).map((c) => (
                                  <MenuItem key={c.id} value={c.id}>
                                    {clienteLabel(c)}
                                    {c.telefono && (
                                      <Typography component="span" variant="caption"
                                        sx={{ ml: 1, color: 'text.disabled' }}>
                                        · {c.telefono}
                                      </Typography>
                                    )}
                                  </MenuItem>
                                ))}
                              </TextField>
                              <Stack direction="row" spacing={1}>
                                <Button size="small" variant="contained" fullWidth
                                  disabled={!deudorSeleccionado || deudorMutation.isPending}
                                  startIcon={<Check size={14} />}
                                  onClick={() => handleGuardarDeudor(gasto.id)}
                                  sx={{ bgcolor: '#F59E0B', color: '#0F172A', '&:hover': { bgcolor: '#D97706' } }}>
                                  Guardar
                                </Button>
                                <Button size="small" variant="outlined" fullWidth
                                  startIcon={<X size={14} />}
                                  onClick={() => { setEditandoDeudor(null); setDeudorSeleccionado(''); }}>
                                  Cancelar
                                </Button>
                              </Stack>
                            </Stack>
                          ) : (
                            <Alert severity="warning" sx={{ py: 0.5, cursor: 'pointer' }}
                              onClick={() => { setEditandoDeudor(gasto.id); setDeudorSeleccionado(''); }}>
                              <Typography variant="caption" fontWeight={600}>
                                Sin deudor asignado — tocá para asignar
                              </Typography>
                            </Alert>
                          )}
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}

      {/* ── TAB 1: ESTADÍSTICAS ── */}
      {tab === 1 && (
        <Stack spacing={3}>
          {/* KPIs */}
          <Grid container spacing={2}>
            {[
              { label: t('gastos.stats.total_gastos'),  value: stats.total,       color: '#F59E0B', isCount: true },
              { label: t('gastos.stats.monto_total'),   value: stats.montoTotal,  color: '#3B82F6' },
              { label: t('gastos.stats.pendiente'),     value: stats.pendiente,   color: '#EF4444' },
              { label: t('gastos.stats.saldado'),       value: stats.saldado,     color: '#16A34A' },
            ].map((kpi) => (
              <Grid key={kpi.label} size={{ xs: 6, md: 3 }}>
                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {kpi.label}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color={kpi.color} sx={{ mt: 0.5 }}>
                      {kpi.isCount ? kpi.value : formatMoney(kpi.value as number)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Gráfico por especialidad */}
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body1" fontWeight={700} sx={{ mb: 2 }}>
                {t('gastos.stats.por_especialidad')}
              </Typography>
              {stats.porEspecialidad.length === 0 ? (
                <Typography color="text.disabled" textAlign="center" py={3}>{t('gastos.stats.sin_datos')}</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={stats.porEspecialidad} margin={{ top: 4, right: 4, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: tickColor }} angle={-35} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(v) => [formatMoney(Number(v)), t('gastos.tabla.monto')]}
                      contentStyle={{ borderRadius: 8, border: `1px solid ${tooltipBorder}`, fontSize: 13, backgroundColor: tooltipBg, color: theme.palette.text.primary }}
                    />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                      {stats.porEspecialidad.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Gráfico por obra */}
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body1" fontWeight={700} sx={{ mb: 2 }}>
                {t('gastos.stats.por_obra')}
              </Typography>
              {stats.porObra.length === 0 ? (
                <Typography color="text.disabled" textAlign="center" py={3}>{t('gastos.stats.sin_datos')}</Typography>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats.porObra} margin={{ top: 4, right: 4, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: tickColor }} angle={-35} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(v) => [formatMoney(Number(v)), t('gastos.tabla.monto')]}
                        contentStyle={{ borderRadius: 8, border: `1px solid ${tooltipBorder}`, fontSize: 13, backgroundColor: tooltipBg, color: theme.palette.text.primary }}
                      />
                      <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                        {stats.porObra.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {stats.porObra.map((item, i) => (
                      <Stack key={item.nombre} direction="row" alignItems="center" justifyContent="space-between"
                        sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.action.hover }}>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: CHART_COLORS[i % CHART_COLORS.length], minWidth: 20 }}>
                            {i + 1}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>{item.nombre}</Typography>
                          <Chip label={`${item.cantidad} gasto${item.cantidad !== 1 ? 's' : ''}`} size="small"
                            sx={{ bgcolor: `${CHART_COLORS[i % CHART_COLORS.length]}18`, color: CHART_COLORS[i % CHART_COLORS.length], fontWeight: 700, fontSize: 11 }} />
                        </Stack>
                        <Typography variant="body2" fontWeight={800} color={CHART_COLORS[i % CHART_COLORS.length]}>
                          {formatMoney(item.total)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* ── Modal Crear manual ── */}
      <Dialog open={openCrear} onClose={() => { setOpenCrear(false); setErrors([]); }} maxWidth="sm" fullWidth>
        <DialogTitle>{t('gastos.form.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {errors.length > 0 && (
              <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'error.main' }}>
                <AlertCircle size={16} />
                <Typography variant="caption">
                  {t('gastos.form.campos_requeridos')}: {errors.join(', ')}
                </Typography>
              </Stack>
            )}
            <TextField select fullWidth size="small" label={t('gastos.form.obra')}
              error={errors.includes('obra_id')} value={form.obra_id || ''}
              onChange={(e) => setForm(f => ({ ...f, obra_id: Number(e.target.value) }))}>
              <MenuItem value="">{t('gastos.form.seleccionar')}</MenuItem>
              {obras.map(o => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
            </TextField>
            <TextField select fullWidth size="small" label={t('gastos.form.especialidad')}
              error={errors.includes('especialidad_id')} value={form.especialidad_id || ''}
              onChange={(e) => setForm(f => ({ ...f, especialidad_id: Number(e.target.value) }))}>
              <MenuItem value="">{t('gastos.form.seleccionar')}</MenuItem>
              {especialidades.map(esp => <MenuItem key={esp.id} value={esp.id}>{esp.nombre}</MenuItem>)}
            </TextField>
            <TextField fullWidth size="small" label={t('gastos.form.descripcion')}
              error={errors.includes('descripcion')} value={form.descripcion}
              onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))} />
            <TextField fullWidth size="small" label={t('gastos.form.motivo')}
              error={errors.includes('motivo')} value={form.motivo}
              onChange={(e) => setForm(f => ({ ...f, motivo: e.target.value }))} />
            <TextField fullWidth size="small" type="number" label={t('gastos.form.monto')}
              error={errors.includes('monto')} value={form.monto || ''}
              onChange={(e) => setForm(f => ({ ...f, monto: Number(e.target.value) }))} />
            <TextField select fullWidth size="small" label={t('gastos.form.forma_pago')}
              error={errors.includes('forma_pago_id')} value={form.forma_pago_id || ''}
              onChange={(e) => setForm(f => ({ ...f, forma_pago_id: Number(e.target.value) }))}>
              <MenuItem value="">{t('gastos.form.seleccionar')}</MenuItem>
              {formasPago.map(fp => <MenuItem key={fp.id} value={fp.id}>{fp.nombre}</MenuItem>)}
            </TextField>
            <TextField select fullWidth size="small" label={t('gastos.form.pagado_por')}
              error={errors.includes('pagado_por')} value={form.pagado_por_id || ''}
              onChange={(e) => setForm(f => ({ ...f, pagado_por_id: Number(e.target.value) }))}>
              <MenuItem value="">{t('gastos.form.seleccionar')}</MenuItem>
              {trabajadores.map(tr => (
                <MenuItem key={tr.id} value={tr.id}>{tr.nombre} {tr.apellido}</MenuItem>
              ))}
            </TextField>
            <TextField fullWidth size="small" type="date" label={t('gastos.form.fecha')}
              error={errors.includes('fecha')} value={form.fecha}
              onChange={(e) => setForm(f => ({ ...f, fecha: e.target.value }))}
              InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenCrear(false); setErrors([]); }}>{t('gastos.form.cancelar')}</Button>
          <Button variant="contained" onClick={handleCrear} disabled={crearMutation.isPending}>
            {crearMutation.isPending ? t('gastos.form.registrando') : t('gastos.form.registrar')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal Cambiar Estado ── */}
    {/* ── Modal Cambiar Estado ── */}
<Dialog open={!!openEstado} onClose={() => setOpenEstado(null)} maxWidth="xs" fullWidth>
  <DialogTitle>{t('gastos.estado_modal.title')}</DialogTitle>
  <DialogContent>
    <TextField select fullWidth size="small" label={t('gastos.estado_modal.nuevo_estado')} sx={{ mt: 1 }}
      value={nuevoEstado} onChange={(e) => setNuevoEstado(Number(e.target.value))}>
      <MenuItem value={16}>Activo / Pendiente</MenuItem>
      <MenuItem value={26}>Parcialmente pagado</MenuItem>
      <MenuItem value={27}>Saldado</MenuItem>
    </TextField>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenEstado(null)}>{t('gastos.estado_modal.cancelar')}</Button>
    <Button variant="contained" onClick={handleEstado} disabled={estadoMutation.isPending}>
      {estadoMutation.isPending ? t('gastos.estado_modal.guardando') : t('gastos.estado_modal.guardar')}
    </Button>
  </DialogActions>
</Dialog>

      {/* ── Modal Confirmar Eliminar ── */}
      <Dialog open={!!openEliminar} onClose={() => setOpenEliminar(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('gastos.eliminar_modal.title')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{t('gastos.eliminar_modal.mensaje')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEliminar(null)}>{t('gastos.eliminar_modal.cancelar')}</Button>
          <Button variant="contained" color="error" onClick={handleEliminar} disabled={eliminarMutation.isPending}>
            {eliminarMutation.isPending ? t('gastos.eliminar_modal.eliminando') : t('gastos.eliminar_modal.eliminar')}
          </Button>
        </DialogActions>
      </Dialog>

    </AppLayout>
  );
};