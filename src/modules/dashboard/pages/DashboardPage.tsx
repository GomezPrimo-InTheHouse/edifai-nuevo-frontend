

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useQuery } from '@tanstack/react-query';
// import {
//   Avatar, Box, Card, CardContent, Chip, Divider,
//   Grid, LinearProgress, Paper, Stack,
//   Table, TableBody, TableCell, TableHead, TableRow,
//   TextField, Typography, useTheme,
// } from '@mui/material';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, PieChart, Pie, Cell, Legend,
// } from 'recharts';
// import {
//   Building2, HardHat, Users, Receipt, Package,
//   CalendarCheck, LogIn, AlertTriangle, TrendingUp,
//   DollarSign, Clock, Award,
// } from 'lucide-react';
// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
// import { useAuthStore } from '../../../app/store/auth.store';
// import { dashboardApi } from '../../../services/api/dashboard.api';
// import { useTranslation } from 'react-i18next';

// const ROLES_ADMIN = [1, 3, 4, 6];
// const ROLES_WORKER = [7, 8];

// const PROGRESO_MAP: Record<string, number> = {
//   'Planificada': 0, 'Labor en proceso': 25,
//   'Avanzada': 50, 'Muy avanzada': 75, 'Finalizada': 100,
// };

// const PROGRESO_COLOR: Record<string, string> = {
//   'Planificada': '#94A3B8', 'Labor en proceso': '#EA580C',
//   'Avanzada': '#F59E0B', 'Muy avanzada': '#2563EB', 'Finalizada': '#16A34A',
// };

// const DONA_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444'];

// const TIPO_ICON: Record<string, string> = {
//   login: '🔐', labor_creada: '🔨', labor_modificada: '✏️',
//   obra_creada: '🏗️', obra_modificada: '🏗️', pago_realizado: '💰',
//   pago_estado: '💳', usuario_creado: '👤', baja_usuario: '🚫',
//   presentismo: '📍', error_sistema: '⚠️',
// };

// function tiempoRelativo(fecha: string): string {
//   const diff = Date.now() - new Date(fecha).getTime();
//   const min = Math.floor(diff / 60000);
//   if (min < 1) return 'ahora';
//   if (min < 60) return `hace ${min} min`;
//   const hs = Math.floor(min / 60);
//   if (hs < 24) return `hace ${hs}h`;
//   return `hace ${Math.floor(hs / 24)}d`;
// }

// function formatMoney(n: number): string {
//   return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
// }

// // ── KPI Card ─────────────────────────────────────────────────
// function KpiCard({
//   icon, label, value, sub, color = '#F59E0B', onClick,
// }: {
//   icon: React.ReactNode; label: string; value: string | number;
//   sub?: string; color?: string; onClick?: () => void;
// }) {
//   const theme = useTheme();
//   return (
//     <Card
//       elevation={0}
//       onClick={onClick}
//       sx={{
//         borderRadius: 3,
//         border: `1px solid ${theme.palette.divider}`,
//         cursor: onClick ? 'pointer' : 'default',
//         transition: 'all 0.15s',
//         '&:hover': onClick ? { borderColor: color, boxShadow: `0 0 0 1px ${color}22` } : {},
//       }}
//     >
//       <CardContent sx={{ p: 2.5 }}>
//         <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
//           <Box>
//             <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 600, mb: 0.5 }}>
//               {label}
//             </Typography>
//             <Typography sx={{ fontSize: 28, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em', lineHeight: 1 }}>
//               {value}
//             </Typography>
//             {sub && (
//               <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.5 }}>{sub}</Typography>
//             )}
//           </Box>
//           <Box sx={{
//             width: 44, height: 44, borderRadius: 2,
//             bgcolor: `${color}18`, color,
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//           }}>
//             {icon}
//           </Box>
//         </Stack>
//       </CardContent>
//     </Card>
//   );
// }

// // ── Dashboard Admin ───────────────────────────────────────────
// function DashboardAdmin() {
//   const theme = useTheme();
//   const navigate = useNavigate();
//   const { t } = useTranslation();
//   const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'mes'>('mes');
//   const [fechaDesde, setFechaDesde] = useState('');
//   const [fechaHasta, setFechaHasta] = useState('');

//   const { data, isLoading } = useQuery({
//     queryKey: ['dashboard-admin', periodo, fechaDesde, fechaHasta],
//     queryFn: () => dashboardApi.getAdmin({
//       periodo: (!fechaDesde && !fechaHasta) ? periodo : undefined,
//       fecha_desde: fechaDesde || undefined,
//       fecha_hasta: fechaHasta || undefined,
//     }),
//     refetchInterval: 30000,
//   });

//   if (isLoading) return <LoadingState message={t('dashboard.loading')} />;
//   if (!data) return null;

//   const { kpis, ausentes_hoy, materiales_criticos, pagos_evolucion,
//     obras_por_estado, labores_por_progreso, actividad_reciente } = data;

//   // Colores del tema para gráficos
//   const gridColor = theme.palette.divider;
//   const tickColor = theme.palette.text.secondary;
//   const tooltipBg = theme.palette.background.paper;
//   const tooltipBorder = theme.palette.divider;
//   const actividadBg  = theme.palette.action.hover;

//   return (
//     <Stack spacing={3}>

//       {/* Filtro período */}
//       <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
//         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
//           <Stack direction="row" spacing={1}>
//             {(['hoy', 'semana', 'mes'] as const).map((p) => (
//               <Chip
//                 key={p}
//                 label={t(`dashboard.periodos.${p}`)}
//                 onClick={() => { setPeriodo(p); setFechaDesde(''); setFechaHasta(''); }}
//                 sx={{
//                   fontWeight: 700, cursor: 'pointer',
//                   bgcolor: periodo === p && !fechaDesde ? '#F59E0B' : theme.palette.action.hover,
//                   color:   periodo === p && !fechaDesde ? '#0F172A' : theme.palette.text.secondary,
//                 }}
//               />
//             ))}
//           </Stack>
//           <Stack direction="row" spacing={1} alignItems="center">
//             <TextField size="small" type="date" label={t('dashboard.filtros.desde')}
//               value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
//               InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
//             <TextField size="small" type="date" label={t('dashboard.filtros.hasta')}
//               value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
//               InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
//           </Stack>
//           <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
//             {t('dashboard.actualiza')}
//           </Typography>
//         </Stack>
//       </Paper>

//       {/* KPIs */}
//       <Grid container spacing={2}>
//         <Grid size={{ xs: 6, sm: 4, md: 3 }}>
//           <KpiCard icon={<Building2 size={20} />} label={t('dashboard.kpis.obras_activas')}
//             value={kpis.obras.activas} sub={t('dashboard.kpis.obras_total', { total: kpis.obras.total })}
//             color="#F59E0B" onClick={() => navigate('/obras')} />
//         </Grid>
//         <Grid size={{ xs: 6, sm: 4, md: 3 }}>
//           <KpiCard icon={<HardHat size={20} />} label={t('dashboard.kpis.labores_activas')}
//             value={kpis.labores.activas} sub={t('dashboard.kpis.obras_total', { total: kpis.labores.total })}
//             color="#3B82F6" onClick={() => navigate('/labores')} />
//         </Grid>
//         <Grid size={{ xs: 6, sm: 4, md: 3 }}>
//           <KpiCard icon={<Users size={20} />} label={t('dashboard.kpis.trabajadores')}
//             value={kpis.trabajadores.total} sub={t('dashboard.kpis.trabajadores_sub')}
//             color="#10B981" onClick={() => navigate('/trabajadores')} />
//         </Grid>
//         <Grid size={{ xs: 6, sm: 4, md: 3 }}>
//           <KpiCard icon={<Receipt size={20} />} label={t('dashboard.kpis.presupuestos')}
//             value={kpis.presupuestos.total}
//             sub={t('dashboard.kpis.presupuestos_sub', { confirmados: kpis.presupuestos.confirmados })}
//             color="#8B5CF6" onClick={() => navigate('/presupuestos')} />
//         </Grid>
//         <Grid size={{ xs: 6, sm: 4, md: 3 }}>
//           <KpiCard icon={<DollarSign size={20} />} label={t('dashboard.kpis.pagado_periodo')}
//             value={formatMoney(kpis.pagos.total_pagado)}
//             sub={t('dashboard.kpis.pendiente', { monto: formatMoney(kpis.pagos.total_pendiente) })}
//             color="#16A34A" onClick={() => navigate('/pagos')} />
//         </Grid>
//         <Grid size={{ xs: 6, sm: 4, md: 3 }}>
//           <KpiCard icon={<CalendarCheck size={20} />} label={t('dashboard.kpis.asistencia_hoy')}
//             value={`${kpis.asistencia.tasa}%`}
//             sub={t('dashboard.kpis.presentes_sub', { presentes: kpis.asistencia.presentes_hoy, total: kpis.asistencia.total_trabajadores })}
//             color={kpis.asistencia.tasa >= 80 ? '#10B981' : '#EF4444'}
//             onClick={() => navigate('/presentismo/admin')} />
//         </Grid>
//         <Grid size={{ xs: 6, sm: 4, md: 3 }}>
//           <KpiCard icon={<Package size={20} />} label={t('dashboard.kpis.stock_critico')}
//             value={kpis.materiales_criticos} sub={t('dashboard.kpis.stock_sub')}
//             color={kpis.materiales_criticos > 0 ? '#EF4444' : '#10B981'}
//             onClick={() => navigate('/materiales')} />
//         </Grid>
//         <Grid size={{ xs: 6, sm: 4, md: 3 }}>
//           <KpiCard icon={<LogIn size={20} />} label={t('dashboard.kpis.ingresos_hoy')}
//             value={kpis.logins_hoy} sub={t('dashboard.kpis.logins_sub')} color="#0891B2" />
//         </Grid>
//       </Grid>

//       {/* Gráficos */}
//       <Grid container spacing={2}>

//         {/* Evolución de pagos */}
//         <Grid size={{ xs: 12, md: 7 }}>
//           <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
//             <CardContent sx={{ p: 2.5 }}>
//               <Stack direction="row" alignItems="center" gap={1} mb={2}>
//                 <TrendingUp size={16} color="#F59E0B" />
//                 <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
//                   {t('dashboard.graficos.evolucion_pagos')}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
//                   {t('dashboard.graficos.ultimos_6_meses')}
//                 </Typography>
//               </Stack>
//               {pagos_evolucion.length === 0 ? (
//                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'text.disabled' }}>
//                   {t('dashboard.sin_datos')}
//                 </Box>
//               ) : (
//                 <ResponsiveContainer width="100%" height={200}>
//                   <BarChart data={pagos_evolucion} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
//                     <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
//                     <XAxis dataKey="mes" tick={{ fontSize: 12, fill: tickColor }} />
//                     <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
//                     <Tooltip
//                       formatter={(v) => [typeof v === 'number' ? formatMoney(v) : '—', t('dashboard.graficos.pagado')]}
//                       contentStyle={{ borderRadius: 8, border: `1px solid ${tooltipBorder}`, fontSize: 13, backgroundColor: tooltipBg, color: theme.palette.text.primary }}
//                     />
//                     <Bar dataKey="total" fill="#F59E0B" radius={[4, 4, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Obras por estado */}
//         <Grid size={{ xs: 12, md: 5 }}>
//           <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
//             <CardContent sx={{ p: 2.5 }}>
//               <Stack direction="row" alignItems="center" gap={1} mb={2}>
//                 <Building2 size={16} color="#3B82F6" />
//                 <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
//                   {t('dashboard.graficos.obras_por_estado')}
//                 </Typography>
//               </Stack>
//               {obras_por_estado.length === 0 ? (
//                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'text.disabled' }}>
//                   {t('dashboard.sin_datos')}
//                 </Box>
//               ) : (
//                 <ResponsiveContainer width="100%" height={200}>
//                   <PieChart>
//                     <Pie data={obras_por_estado} cx="50%" cy="50%" innerRadius={50}
//                       outerRadius={80} dataKey="total" nameKey="estado" paddingAngle={3}>
//                       {obras_por_estado.map((item, i) => (
//                         <Cell key={`cell-${item.estado}`} fill={DONA_COLORS[i % DONA_COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${tooltipBorder}`, fontSize: 13, backgroundColor: tooltipBg, color: theme.palette.text.primary }} />
//                     <Legend iconType="circle" iconSize={8}
//                       formatter={(v) => <span style={{ fontSize: 12, color: tickColor }}>{v}</span>} />
//                   </PieChart>
//                 </ResponsiveContainer>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Labores por progreso */}
//         <Grid size={{ xs: 12, md: 7 }}>
//           <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
//             <CardContent sx={{ p: 2.5 }}>
//               <Stack direction="row" alignItems="center" gap={1} mb={2}>
//                 <HardHat size={16} color="#8B5CF6" />
//                 <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
//                   {t('dashboard.graficos.labores_por_progreso')}
//                 </Typography>
//               </Stack>
//               <Stack spacing={1.5}>
//                 {labores_por_progreso.map((l) => {
//                   const pct = PROGRESO_MAP[l.estado] ?? 0;
//                   const color = PROGRESO_COLOR[l.estado] ?? '#94A3B8';
//                   return (
//                     <Box key={`labor-progreso-${l.estado}`}>
//                       <Stack direction="row" justifyContent="space-between" mb={0.5}>
//                         <Typography sx={{ fontSize: 13 }}>{l.estado}</Typography>
//                         <Stack direction="row" gap={1} alignItems="center">
//                           <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
//                             {t('dashboard.graficos.labores_count', { total: l.total })}
//                           </Typography>
//                           <Typography sx={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</Typography>
//                         </Stack>
//                       </Stack>
//                       <LinearProgress variant="determinate" value={pct} sx={{
//                         height: 8, borderRadius: 4, bgcolor: theme.palette.divider,
//                         '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: color },
//                       }} />
//                     </Box>
//                   );
//                 })}
//               </Stack>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Ausentes hoy + stock crítico */}
//         <Grid size={{ xs: 12, md: 5 }}>
//           <Stack spacing={2} height="100%">
//             <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, flex: 1 }}>
//               <CardContent sx={{ p: 2.5 }}>
//                 <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
//                   <AlertTriangle size={16} color="#EF4444" />
//                   <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
//                     {t('dashboard.graficos.ausentes_hoy')}
//                   </Typography>
//                   <Chip label={ausentes_hoy.length} size="small" sx={{
//                     ml: 'auto', fontWeight: 700, fontSize: 11,
//                     bgcolor: ausentes_hoy.length > 0 ? '#FEF2F2' : '#F0FDF4',
//                     color:   ausentes_hoy.length > 0 ? '#DC2626' : '#15803D',
//                   }} />
//                 </Stack>
//                 {ausentes_hoy.length === 0 ? (
//                   <Typography sx={{ fontSize: 13, color: '#16A34A', fontWeight: 600 }}>
//                     {t('dashboard.graficos.todos_presentes')}
//                   </Typography>
//                 ) : (
//                   <Stack spacing={1} sx={{ maxHeight: 140, overflowY: 'auto' }}>
//                     {ausentes_hoy.map((t_item) => (
//                       <Box key={`ausente-${t_item.id}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                         <Avatar sx={{ width: 28, height: 28, bgcolor: '#FEE2E2', color: '#DC2626', fontSize: 11, fontWeight: 700 }}>
//                           {t_item.nombre[0]}{t_item.apellido[0]}
//                         </Avatar>
//                         <Box>
//                           <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
//                             {t_item.nombre} {t_item.apellido}
//                           </Typography>
//                           <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{t_item.obra_nombre}</Typography>
//                         </Box>
//                       </Box>
//                     ))}
//                   </Stack>
//                 )}
//               </CardContent>
//             </Card>

//             {materiales_criticos.length > 0 && (
//               <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #FEE2E2' }}>
//                 <CardContent sx={{ p: 2 }}>
//                   <Stack direction="row" alignItems="center" gap={1} mb={1}>
//                     <Package size={14} color="#EF4444" />
//                     <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>
//                       {t('dashboard.graficos.stock_critico')}
//                     </Typography>
//                   </Stack>
//                   <Stack spacing={0.5}>
//                     {materiales_criticos.map((m) => (
//                       <Stack key={`material-${m.id}`} direction="row" justifyContent="space-between">
//                         <Typography sx={{ fontSize: 12 }}>{m.nombre}</Typography>
//                         <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#EF4444' }}>
//                           {m.stock_actual} {m.unidad}
//                         </Typography>
//                       </Stack>
//                     ))}
//                   </Stack>
//                 </CardContent>
//               </Card>
//             )}
//           </Stack>
//         </Grid>
//       </Grid>

//       {/* Actividad reciente */}
//       <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
//         <CardContent sx={{ p: 2.5 }}>
//           <Stack direction="row" alignItems="center" gap={1} mb={2}>
//             <Clock size={16} color={theme.palette.text.secondary} />
//             <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
//               {t('dashboard.graficos.actividad_reciente')}
//             </Typography>
//             <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
//               {t('dashboard.graficos.ultimas_acciones')}
//             </Typography>
//           </Stack>
//           <Stack spacing={0}>
//             {actividad_reciente.map((a, i) => (
//               <React.Fragment key={`actividad-${a.created_at}-${i}`}>
//                 <Stack direction="row" alignItems="center" gap={2} py={1.25}>
//                   <Box sx={{
//                     width: 36, height: 36, borderRadius: 2,
//                     bgcolor: actividadBg,
//                     border: `1px solid ${theme.palette.divider}`,
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     fontSize: 16, flexShrink: 0,
//                   }}>
//                     {TIPO_ICON[a.tipo] ?? '📋'}
//                   </Box>
//                   <Box flex={1}>
//                     <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3 }}>
//                       {a.mensaje}
//                     </Typography>
//                     <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
//                       {tiempoRelativo(a.created_at)}
//                     </Typography>
//                   </Box>
//                 </Stack>
//                 {i < actividad_reciente.length - 1 && <Divider />}
//               </React.Fragment>
//             ))}
//           </Stack>
//         </CardContent>
//       </Card>

//     </Stack>
//   );
// }

// // ── Dashboard Trabajador ──────────────────────────────────────
// function DashboardTrabajador() {
//   const { t } = useTranslation();
//   const theme = useTheme();
//   const navigate = useNavigate();

//   const { data, isLoading } = useQuery({
//     queryKey: ['dashboard-trabajador'],
//     queryFn: dashboardApi.getTrabajador,
//     refetchInterval: 60000,
//   });

//   if (isLoading) return <LoadingState message={t('dashboard.loading_worker')} />;
//   if (!data) return null;

//   const { trabajador, obra_actual, kpis, labores, dias_asistencia, ultimos_pagos, mes_actual } = data;
//   const MESES = t('dashboard.meses', { returnObjects: true }) as string[];

//   const primerDia = new Date(mes_actual.anio, mes_actual.mes - 1, 1).getDay();
//   const diasGrid: (number | null)[] = Array(primerDia === 0 ? 6 : primerDia - 1).fill(null);
//   for (let d = 1; d <= mes_actual.dias; d++) diasGrid.push(d);

//   const diaStr = (d: number) => {
//     const mm = String(mes_actual.mes).padStart(2, '0');
//     const dd = String(d).padStart(2, '0');
//     return `${mes_actual.anio}-${mm}-${dd}`;
//   };

//   const esFinDeSemana = (d: number) => {
//     const dia = new Date(mes_actual.anio, mes_actual.mes - 1, d).getDay();
//     return dia === 0 || dia === 6;
//   };

//   const diasSemana = ['lu', 'ma', 'mi', 'ju', 'vi', 'sa', 'do'];

//   return (
//     <Stack spacing={3}>

//       {/* Header trabajador — siempre oscuro, independiente del tema */}
//       <Card elevation={0} sx={{
//         borderRadius: 3,
//         border: `1px solid ${theme.palette.divider}`,
//         background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
//       }}>
//         <CardContent sx={{ p: 3 }}>
//           <Stack direction="row" alignItems="center" gap={2}>
//             <Avatar sx={{ width: 52, height: 52, bgcolor: '#F59E0B', color: '#0F172A', fontSize: 18, fontWeight: 800 }}>
//               {trabajador.nombre[0]}{trabajador.apellido[0]}
//             </Avatar>
//             <Box flex={1}>
//               <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
//                 {t('dashboard.worker.hola', { nombre: trabajador.nombre, apellido: trabajador.apellido })}
//               </Typography>
//               {obra_actual && (
//                 <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', mt: 0.25 }}>
//                   {obra_actual.obra_nombre}
//                   {obra_actual.rol_en_obra && ` · ${obra_actual.rol_en_obra}`}
//                 </Typography>
//               )}
//             </Box>
//             <Stack alignItems="flex-end" spacing={1}>
//               <Box sx={{ textAlign: 'right' }}>
//                 <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#F59E0B' }}>
//                   {kpis.tasa_asistencia}%
//                 </Typography>
//                 <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
//                   {t('dashboard.worker.asistencia_mes', { mes: MESES[mes_actual.mes - 1].toLowerCase() })}
//                 </Typography>
//               </Box>
//               <Box sx={{ textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.1)', pt: 1 }}>
//                 <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#F59E0B' }}>
//                   {trabajador.puntos ?? 0} pts
//                 </Typography>
//                 <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
//                   {t('dashboard.worker.puntos_acumulados')}
//                 </Typography>
//               </Box>
//             </Stack>
//           </Stack>
//         </CardContent>
//       </Card>

//       {/* KPIs */}
//       <Grid container spacing={2}>
//         <Grid size={{ xs: 6, sm: 3 }}>
//           <KpiCard icon={<HardHat size={20} />} label={t('dashboard.kpis.labores_activas_worker')}
//             value={kpis.labores_activas} color="#3B82F6" onClick={() => navigate('/labores')} />
//         </Grid>
//         <Grid size={{ xs: 6, sm: 3 }}>
//           <KpiCard icon={<DollarSign size={20} />} label={t('dashboard.kpis.cobrado_mes')}
//             value={formatMoney(kpis.cobrado_mes)} color="#10B981" />
//         </Grid>
//         <Grid size={{ xs: 6, sm: 3 }}>
//           <KpiCard icon={<CalendarCheck size={20} />} label={t('dashboard.kpis.dias_presentes')}
//             value={kpis.dias_marcados}
//             sub={t('dashboard.kpis.dias_habiles_sub', { dias: kpis.dias_habiles })}
//             color="#F59E0B" onClick={() => navigate('/presentismo')} />
//         </Grid>
//         <Grid size={{ xs: 6, sm: 3 }}>
//           <KpiCard icon={<Receipt size={20} />} label={t('dashboard.kpis.pagos_pendientes')}
//             value={formatMoney(kpis.pendiente_mes)}
//             color={kpis.pendiente_mes > 0 ? '#EF4444' : '#10B981'} />
//         </Grid>
//         <Grid size={{ xs: 6, sm: 3 }}>
//           <KpiCard icon={<Award size={20} />} label={t('dashboard.kpis.mis_puntos')}
//             value={trabajador.puntos ?? 0} sub={t('dashboard.kpis.puntos_sub')} color="#F59E0B" />
//         </Grid>
//       </Grid>

//       <Grid container spacing={2}>

//         {/* Calendario asistencia */}
//         <Grid size={{ xs: 12, md: 5 }}>
//           <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
//             <CardContent sx={{ p: 2.5 }}>
//               <Stack direction="row" alignItems="center" gap={1} mb={2}>
//                 <CalendarCheck size={16} color="#F59E0B" />
//                 <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
//                   {t('dashboard.worker.calendario_titulo', { mes: MESES[mes_actual.mes - 1], anio: mes_actual.anio })}
//                 </Typography>
//               </Stack>

//               {/* Cabecera días */}
//               <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', mb: 1 }}>
//                 {diasSemana.map((d) => (
//                   <Typography key={d} sx={{ fontSize: 11, textAlign: 'center', color: 'text.disabled', fontWeight: 600 }}>
//                     {t(`dashboard.worker.dias_semana.${d}`)}
//                   </Typography>
//                 ))}
//               </Box>

//               {/* Grid días */}
//               <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
//                 {diasGrid.map((d, i) => {
//                   if (d === null) return <Box key={`e-${i}`} />;
//                   const str = diaStr(d);
//                   const hoy = new Date().toISOString().split('T')[0];
//                   const finde = esFinDeSemana(d);
//                   const marcado = dias_asistencia.includes(str);
//                   const esHoy = str === hoy;
//                   const futuro = str > hoy;

//                   let bg = theme.palette.action.hover;
//                   let color = theme.palette.text.disabled;
//                   if (finde) { bg = 'transparent'; color = theme.palette.text.disabled; }
//                   else if (futuro) { bg = theme.palette.action.hover; color = theme.palette.text.disabled; }
//                   else if (marcado) { bg = '#DCFCE7'; color = '#15803D'; }
//                   else { bg = '#FEE2E2'; color = '#DC2626'; }

//                   return (
//                     <Box key={`dia-${d}`} sx={{
//                       height: 32, borderRadius: 1, display: 'flex',
//                       alignItems: 'center', justifyContent: 'center', bgcolor: bg,
//                       border: esHoy ? '2px solid #F59E0B' : 'none',
//                     }}>
//                       <Typography sx={{ fontSize: 12, fontWeight: esHoy ? 800 : 500, color }}>{d}</Typography>
//                     </Box>
//                   );
//                 })}
//               </Box>

//               {/* Leyenda */}
//               <Stack direction="row" gap={2} mt={1.5}>
//                 {(['presente', 'ausente', 'futuro'] as const).map((key) => {
//                   const cfg = {
//                     presente: { bg: '#DCFCE7', color: '#15803D' },
//                     ausente:  { bg: '#FEE2E2', color: '#DC2626' },
//                     futuro:   { bg: theme.palette.action.hover, color: theme.palette.text.disabled },
//                   }[key];
//                   return (
//                     <Stack key={key} direction="row" alignItems="center" gap={0.5}>
//                       <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: cfg.bg }} />
//                       <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
//                         {t(`dashboard.worker.leyenda.${key}`)}
//                       </Typography>
//                     </Stack>
//                   );
//                 })}
//               </Stack>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Mis labores activas */}
//         <Grid size={{ xs: 12, md: 7 }}>
//           <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
//             <CardContent sx={{ p: 2.5 }}>
//               <Stack direction="row" alignItems="center" gap={1} mb={2}>
//                 <Award size={16} color="#3B82F6" />
//                 <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
//                   {t('dashboard.worker.mis_labores')}
//                 </Typography>
//               </Stack>
//               {labores.length === 0 ? (
//                 <Typography sx={{ fontSize: 14, color: 'text.disabled', textAlign: 'center', py: 3 }}>
//                   {t('dashboard.worker.sin_labores')}
//                 </Typography>
//               ) : (
//                 <Stack spacing={2}>
//                   {labores.slice(0, 5).map((l) => {
//                     const pct = PROGRESO_MAP[l.estado_nombre] ?? 0;
//                     const color = PROGRESO_COLOR[l.estado_nombre] ?? '#94A3B8';
//                     return (
//                       <Box key={l.id} onClick={() => navigate(`/labores/${l.id}`)}
//                         sx={{
//                           p: 1.5, borderRadius: 2,
//                           border: `1px solid ${theme.palette.divider}`,
//                           cursor: 'pointer', transition: 'all 0.15s',
//                           '&:hover': { borderColor: color, bgcolor: `${color}08` },
//                         }}>
//                         <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
//                           <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{l.nombre}</Typography>
//                           <Chip label={l.estado_nombre} size="small" sx={{ fontSize: 11, fontWeight: 700, height: 22, bgcolor: `${color}18`, color }} />
//                         </Stack>
//                         <Stack direction="row" justifyContent="space-between" mb={0.75}>
//                           <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{t('dashboard.worker.progreso')}</Typography>
//                           <Typography sx={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</Typography>
//                         </Stack>
//                         <LinearProgress variant="determinate" value={pct} sx={{
//                           height: 6, borderRadius: 3, bgcolor: theme.palette.divider,
//                           '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: color },
//                         }} />
//                       </Box>
//                     );
//                   })}
//                 </Stack>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Últimos pagos */}
//         <Grid size={{ xs: 12 }}>
//           <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
//             <CardContent sx={{ p: 2.5 }}>
//               <Stack direction="row" alignItems="center" gap={1} mb={2}>
//                 <DollarSign size={16} color="#10B981" />
//                 <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
//                   {t('dashboard.worker.ultimos_pagos')}
//                 </Typography>
//               </Stack>
//               {ultimos_pagos.length === 0 ? (
//                 <Typography sx={{ fontSize: 14, color: 'text.disabled', textAlign: 'center', py: 2 }}>
//                   {t('dashboard.worker.sin_pagos')}
//                 </Typography>
//               ) : (
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, color: 'text.secondary' } }}>
//                       <TableCell>{t('dashboard.worker.tabla_fecha')}</TableCell>
//                       <TableCell>{t('dashboard.worker.tabla_monto')}</TableCell>
//                       <TableCell>{t('dashboard.worker.tabla_forma_pago')}</TableCell>
//                       <TableCell>{t('dashboard.worker.tabla_estado')}</TableCell>
//                       <TableCell>{t('dashboard.worker.tabla_motivo')}</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {ultimos_pagos.map((p) => (
//                       <TableRow key={p.id} hover>
//                         <TableCell><Typography sx={{ fontSize: 13 }}>{new Date(p.fecha).toLocaleDateString('es-AR')}</Typography></TableCell>
//                         <TableCell><Typography sx={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>{formatMoney(Number(p.monto))}</Typography></TableCell>
//                         <TableCell><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{p.forma_pago_nombre ?? '—'}</Typography></TableCell>
//                         <TableCell>
//                           <Chip label={p.estado} size="small" sx={{
//                             fontSize: 11, fontWeight: 700, height: 20,
//                             bgcolor: p.estado === 'Pagado' ? '#DCFCE7' : p.estado === 'Pendiente' ? '#FEF9C3' : '#FEE2E2',
//                             color:   p.estado === 'Pagado' ? '#15803D' : p.estado === 'Pendiente' ? '#854D0E' : '#DC2626',
//                           }} />
//                         </TableCell>
//                         <TableCell><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{p.motivo ?? '—'}</Typography></TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>

//       </Grid>
//     </Stack>
//   );
// }

// // ── Componente principal ──────────────────────────────────────
// const DashboardPage: React.FC = () => {
//   const { t } = useTranslation();
//   const user = useAuthStore((s) => s.user);
//   const rolId = user?.rol_id ?? -1;
//   const esAdmin = ROLES_ADMIN.includes(rolId);
//   const esWorker = ROLES_WORKER.includes(rolId);

//   return (
//     <AppLayout>
//       <PageHeader
//         title={t('dashboard.title')}
//         subtitle={esAdmin ? t('dashboard.subtitle_admin') : t('dashboard.subtitle_worker')}
//       />
//       {esAdmin  && <DashboardAdmin />}
//       {esWorker && <DashboardTrabajador />}
//       {!esAdmin && !esWorker && (
//         <Typography color="text.secondary">{t('dashboard.no_dashboard')}</Typography>
//       )}
//     </AppLayout>
//   );
// };

// export default DashboardPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Avatar, Box, Card, CardContent, Chip, Divider,
  Grid, LinearProgress, Paper, Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography, useTheme,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Building2, HardHat, Users, Receipt, Package,
  CalendarCheck, LogIn, AlertTriangle, TrendingUp,
  DollarSign, Clock, Award,
} from 'lucide-react';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { useAuthStore } from '../../../app/store/auth.store';
import { dashboardApi } from '../../../services/api/dashboard.api';
import { useTranslation } from 'react-i18next';

const ROLES_ADMIN = [1, 3, 4, 6];
const ROLES_WORKER = [7, 8];

const PROGRESO_MAP: Record<string, number> = {
  'Planificada': 0, 'Labor en proceso': 25,
  'Avanzada': 50, 'Muy avanzada': 75, 'Finalizada': 100,
};

const PROGRESO_COLOR: Record<string, string> = {
  'Planificada': '#94A3B8', 'Labor en proceso': '#EA580C',
  'Avanzada': '#F59E0B', 'Muy avanzada': '#2563EB', 'Finalizada': '#16A34A',
};

const DONA_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444'];

const TIPO_ICON: Record<string, string> = {
  login: '🔐', labor_creada: '🔨', labor_modificada: '✏️',
  obra_creada: '🏗️', obra_modificada: '🏗️', pago_realizado: '💰',
  pago_estado: '💳', usuario_creado: '👤', baja_usuario: '🚫',
  presentismo: '📍', error_sistema: '⚠️',
};

function tiempoRelativo(fecha: string): string {
  const diff = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const hs = Math.floor(min / 60);
  if (hs < 24) return `hace ${hs}h`;
  return `hace ${Math.floor(hs / 24)}d`;
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

function KpiCard({
  icon, label, value, sub, color = '#F59E0B', onClick,
}: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color?: string; onClick?: () => void;
}) {
  const theme = useTheme();
  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s',
        '&:hover': onClick ? { borderColor: color, boxShadow: `0 0 0 1px ${color}22` } : {},
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 600, mb: 0.5 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {value}
            </Typography>
            {sub && (
              <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.5 }}>{sub}</Typography>
            )}
          </Box>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2,
            bgcolor: `${color}18`, color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DashboardAdmin() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const preferencias = useAuthStore((s) => s.preferencias);
  const esDetallado = preferencias.dashboard_vista === 'detallado';

  const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'mes'>('mes');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-admin', periodo, fechaDesde, fechaHasta],
    queryFn: () => dashboardApi.getAdmin({
      periodo: (!fechaDesde && !fechaHasta) ? periodo : undefined,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
    }),
    refetchInterval: 30000,
  });

  if (isLoading) return <LoadingState message={t('dashboard.loading')} />;
  if (!data) return null;

  const { kpis, ausentes_hoy, materiales_criticos, pagos_evolucion,
    obras_por_estado, labores_por_progreso, actividad_reciente } = data;

  const gridColor = theme.palette.divider;
  const tickColor = theme.palette.text.secondary;
  const tooltipBg = theme.palette.background.paper;
  const tooltipBorder = theme.palette.divider;
  const actividadBg = theme.palette.action.hover;

  return (
    <Stack spacing={3}>

      {/* Filtro período */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Stack direction="row" spacing={1}>
            {(['hoy', 'semana', 'mes'] as const).map((p) => (
              <Chip
                key={p}
                label={t(`dashboard.periodos.${p}`)}
                onClick={() => { setPeriodo(p); setFechaDesde(''); setFechaHasta(''); }}
                sx={{
                  fontWeight: 700, cursor: 'pointer',
                  bgcolor: periodo === p && !fechaDesde ? '#F59E0B' : theme.palette.action.hover,
                  color: periodo === p && !fechaDesde ? '#0F172A' : theme.palette.text.secondary,
                }}
              />
            ))}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField size="small" type="date" label={t('dashboard.filtros.desde')}
              value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
            <TextField size="small" type="date" label={t('dashboard.filtros.hasta')}
              value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            {t('dashboard.actualiza')}
          </Typography>
        </Stack>
      </Paper>

      {/* KPIs */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <KpiCard icon={<Building2 size={20} />} label={t('dashboard.kpis.obras_activas')}
            value={kpis.obras.activas} sub={t('dashboard.kpis.obras_total', { total: kpis.obras.total })}
            color="#F59E0B" onClick={() => navigate('/obras')} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <KpiCard icon={<HardHat size={20} />} label={t('dashboard.kpis.labores_activas')}
            value={kpis.labores.activas} sub={t('dashboard.kpis.obras_total', { total: kpis.labores.total })}
            color="#3B82F6" onClick={() => navigate('/labores')} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <KpiCard icon={<Users size={20} />} label={t('dashboard.kpis.trabajadores')}
            value={kpis.trabajadores.total} sub={t('dashboard.kpis.trabajadores_sub')}
            color="#10B981" onClick={() => navigate('/trabajadores')} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <KpiCard icon={<Receipt size={20} />} label={t('dashboard.kpis.presupuestos')}
            value={kpis.presupuestos.total}
            sub={t('dashboard.kpis.presupuestos_sub', { confirmados: kpis.presupuestos.confirmados })}
            color="#8B5CF6" onClick={() => navigate('/presupuestos')} />
        </Grid>

        {/* Solo en modo detallado */}
        {esDetallado && (
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <KpiCard icon={<DollarSign size={20} />} label={t('dashboard.kpis.pagado_periodo')}
              value={formatMoney(kpis.pagos.total_pagado)}
              sub={t('dashboard.kpis.pendiente', { monto: formatMoney(kpis.pagos.total_pendiente) })}
              color="#16A34A" onClick={() => navigate('/pagos')} />
          </Grid>
        )}

        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <KpiCard icon={<CalendarCheck size={20} />} label={t('dashboard.kpis.asistencia_hoy')}
            value={`${kpis.asistencia.tasa}%`}
            sub={t('dashboard.kpis.presentes_sub', { presentes: kpis.asistencia.presentes_hoy, total: kpis.asistencia.total_trabajadores })}
            color={kpis.asistencia.tasa >= 80 ? '#10B981' : '#EF4444'}
            onClick={() => navigate('/presentismo/admin')} />
        </Grid>

        {/* Solo en modo detallado */}
        {esDetallado && (
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <KpiCard icon={<Package size={20} />} label={t('dashboard.kpis.stock_critico')}
              value={kpis.materiales_criticos} sub={t('dashboard.kpis.stock_sub')}
              color={kpis.materiales_criticos > 0 ? '#EF4444' : '#10B981'}
              onClick={() => navigate('/materiales')} />
          </Grid>
        )}

        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <KpiCard icon={<LogIn size={20} />} label={t('dashboard.kpis.ingresos_hoy')}
            value={kpis.logins_hoy} sub={t('dashboard.kpis.logins_sub')} color="#0891B2" />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={2}>

        {/* Evolución de pagos — solo en modo detallado */}
        {esDetallado && (
          <Grid size={{ xs: 12, md: 7 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" gap={1} mb={2}>
                  <TrendingUp size={16} color="#F59E0B" />
                  <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                    {t('dashboard.graficos.evolucion_pagos')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    {t('dashboard.graficos.ultimos_6_meses')}
                  </Typography>
                </Stack>
                {pagos_evolucion.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'text.disabled' }}>
                    {t('dashboard.sin_datos')}
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={pagos_evolucion} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="mes" tick={{ fontSize: 12, fill: tickColor }} />
                      <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(v) => [typeof v === 'number' ? formatMoney(v) : '—', t('dashboard.graficos.pagado')]}
                        contentStyle={{ borderRadius: 8, border: `1px solid ${tooltipBorder}`, fontSize: 13, backgroundColor: tooltipBg, color: theme.palette.text.primary }}
                      />
                      <Bar dataKey="total" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Obras por estado */}
        <Grid size={{ xs: 12, md: esDetallado ? 5 : 6 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <Building2 size={16} color="#3B82F6" />
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                  {t('dashboard.graficos.obras_por_estado')}
                </Typography>
              </Stack>
              {obras_por_estado.length === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'text.disabled' }}>
                  {t('dashboard.sin_datos')}
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={obras_por_estado} cx="50%" cy="50%" innerRadius={50}
                      outerRadius={80} dataKey="total" nameKey="estado" paddingAngle={3}>
                      {obras_por_estado.map((item, i) => (
                        <Cell key={`cell-${item.estado}`} fill={DONA_COLORS[i % DONA_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${tooltipBorder}`, fontSize: 13, backgroundColor: tooltipBg, color: theme.palette.text.primary }} />
                    <Legend iconType="circle" iconSize={8}
                      formatter={(v) => <span style={{ fontSize: 12, color: tickColor }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Labores por progreso */}
        <Grid size={{ xs: 12, md: esDetallado ? 7 : 6 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <HardHat size={16} color="#8B5CF6" />
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                  {t('dashboard.graficos.labores_por_progreso')}
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                {labores_por_progreso.map((l) => {
                  const pct = PROGRESO_MAP[l.estado] ?? 0;
                  const color = PROGRESO_COLOR[l.estado] ?? '#94A3B8';
                  return (
                    <Box key={`labor-progreso-${l.estado}`}>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography sx={{ fontSize: 13 }}>{l.estado}</Typography>
                        <Stack direction="row" gap={1} alignItems="center">
                          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                            {t('dashboard.graficos.labores_count', { total: l.total })}
                          </Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</Typography>
                        </Stack>
                      </Stack>
                      <LinearProgress variant="determinate" value={pct} sx={{
                        height: 8, borderRadius: 4, bgcolor: theme.palette.divider,
                        '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: color },
                      }} />
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Ausentes hoy + stock crítico */}
        <Grid size={{ xs: 12, md: esDetallado ? 5 : 12 }}>
          <Stack spacing={2} height="100%">
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, flex: 1 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                  <AlertTriangle size={16} color="#EF4444" />
                  <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                    {t('dashboard.graficos.ausentes_hoy')}
                  </Typography>
                  <Chip label={ausentes_hoy.length} size="small" sx={{
                    ml: 'auto', fontWeight: 700, fontSize: 11,
                    bgcolor: ausentes_hoy.length > 0 ? '#FEF2F2' : '#F0FDF4',
                    color: ausentes_hoy.length > 0 ? '#DC2626' : '#15803D',
                  }} />
                </Stack>
                {ausentes_hoy.length === 0 ? (
                  <Typography sx={{ fontSize: 13, color: '#16A34A', fontWeight: 600 }}>
                    {t('dashboard.graficos.todos_presentes')}
                  </Typography>
                ) : (
                  <Stack spacing={1} sx={{ maxHeight: 140, overflowY: 'auto' }}>
                    {ausentes_hoy.map((t_item) => (
                      <Box key={`ausente-${t_item.id}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#FEE2E2', color: '#DC2626', fontSize: 11, fontWeight: 700 }}>
                          {t_item.nombre[0]}{t_item.apellido[0]}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
                            {t_item.nombre} {t_item.apellido}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{t_item.obra_nombre}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>

            {esDetallado && materiales_criticos.length > 0 && (
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #FEE2E2' }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" gap={1} mb={1}>
                    <Package size={14} color="#EF4444" />
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>
                      {t('dashboard.graficos.stock_critico')}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.5}>
                    {materiales_criticos.map((m) => (
                      <Stack key={`material-${m.id}`} direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 12 }}>{m.nombre}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#EF4444' }}>
                          {m.stock_actual} {m.unidad}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Actividad reciente */}
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <Clock size={16} color={theme.palette.text.secondary} />
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
              {t('dashboard.graficos.actividad_reciente')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              {t('dashboard.graficos.ultimas_acciones')}
            </Typography>
          </Stack>
          <Stack spacing={0}>
            {actividad_reciente.map((a, i) => (
              <React.Fragment key={`actividad-${a.created_at}-${i}`}>
                <Stack direction="row" alignItems="center" gap={2} py={1.25}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: 2,
                    bgcolor: actividadBg,
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>
                    {TIPO_ICON[a.tipo] ?? '📋'}
                  </Box>
                  <Box flex={1}>
                    <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3 }}>
                      {a.mensaje}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                      {tiempoRelativo(a.created_at)}
                    </Typography>
                  </Box>
                </Stack>
                {i < actividad_reciente.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Stack>
        </CardContent>
      </Card>

    </Stack>
  );
}

function DashboardTrabajador() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-trabajador'],
    queryFn: dashboardApi.getTrabajador,
    refetchInterval: 60000,
  });

  if (isLoading) return <LoadingState message={t('dashboard.loading_worker')} />;
  if (!data) return null;

  const { trabajador, obra_actual, kpis, labores, dias_asistencia, ultimos_pagos, mes_actual } = data;
  const MESES = t('dashboard.meses', { returnObjects: true }) as string[];

  const primerDia = new Date(mes_actual.anio, mes_actual.mes - 1, 1).getDay();
  const diasGrid: (number | null)[] = Array(primerDia === 0 ? 6 : primerDia - 1).fill(null);
  for (let d = 1; d <= mes_actual.dias; d++) diasGrid.push(d);

  const diaStr = (d: number) => {
    const mm = String(mes_actual.mes).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${mes_actual.anio}-${mm}-${dd}`;
  };

  const esFinDeSemana = (d: number) => {
    const dia = new Date(mes_actual.anio, mes_actual.mes - 1, d).getDay();
    return dia === 0 || dia === 6;
  };

  const diasSemana = ['lu', 'ma', 'mi', 'ju', 'vi', 'sa', 'do'];

  return (
    <Stack spacing={3}>

      {/* Header trabajador — siempre oscuro */}
      <Card elevation={0} sx={{
        borderRadius: 3,
        border: `1px solid ${useTheme().palette.divider}`,
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" gap={2}>
            <Avatar sx={{ width: 52, height: 52, bgcolor: '#F59E0B', color: '#0F172A', fontSize: 18, fontWeight: 800 }}>
              {trabajador.nombre[0]}{trabajador.apellido[0]}
            </Avatar>
            <Box flex={1}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                {t('dashboard.worker.hola', { nombre: trabajador.nombre, apellido: trabajador.apellido })}
              </Typography>
              {obra_actual && (
                <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', mt: 0.25 }}>
                  {obra_actual.obra_nombre}
                  {obra_actual.rol_en_obra && ` · ${obra_actual.rol_en_obra}`}
                </Typography>
              )}
            </Box>
            <Stack alignItems="flex-end" spacing={1}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#F59E0B' }}>
                  {kpis.tasa_asistencia}%
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  {t('dashboard.worker.asistencia_mes', { mes: MESES[mes_actual.mes - 1].toLowerCase() })}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.1)', pt: 1 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#F59E0B' }}>
                  {trabajador.puntos ?? 0} pts
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  {t('dashboard.worker.puntos_acumulados')}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* KPIs */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard icon={<HardHat size={20} />} label={t('dashboard.kpis.labores_activas_worker')}
            value={kpis.labores_activas} color="#3B82F6" onClick={() => navigate('/labores')} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard icon={<DollarSign size={20} />} label={t('dashboard.kpis.cobrado_mes')}
            value={formatMoney(kpis.cobrado_mes)} color="#10B981" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard icon={<CalendarCheck size={20} />} label={t('dashboard.kpis.dias_presentes')}
            value={kpis.dias_marcados}
            sub={t('dashboard.kpis.dias_habiles_sub', { dias: kpis.dias_habiles })}
            color="#F59E0B" onClick={() => navigate('/presentismo')} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard icon={<Receipt size={20} />} label={t('dashboard.kpis.pagos_pendientes')}
            value={formatMoney(kpis.pendiente_mes)}
            color={kpis.pendiente_mes > 0 ? '#EF4444' : '#10B981'} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard icon={<Award size={20} />} label={t('dashboard.kpis.mis_puntos')}
            value={trabajador.puntos ?? 0} sub={t('dashboard.kpis.puntos_sub')} color="#F59E0B" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>

        {/* Calendario asistencia */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <CalendarCheck size={16} color="#F59E0B" />
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                  {t('dashboard.worker.calendario_titulo', { mes: MESES[mes_actual.mes - 1], anio: mes_actual.anio })}
                </Typography>
              </Stack>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', mb: 1 }}>
                {diasSemana.map((d) => (
                  <Typography key={d} sx={{ fontSize: 11, textAlign: 'center', color: 'text.disabled', fontWeight: 600 }}>
                    {t(`dashboard.worker.dias_semana.${d}`)}
                  </Typography>
                ))}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {diasGrid.map((d, i) => {
                  if (d === null) return <Box key={`e-${i}`} />;
                  const str = diaStr(d);
                  const hoy = new Date().toISOString().split('T')[0];
                  const finde = esFinDeSemana(d);
                  const marcado = dias_asistencia.includes(str);
                  const esHoy = str === hoy;
                  const futuro = str > hoy;

                  let bg = theme.palette.action.hover;
                  let color = theme.palette.text.disabled;
                  if (finde) { bg = 'transparent'; color = theme.palette.text.disabled; }
                  else if (futuro) { bg = theme.palette.action.hover; color = theme.palette.text.disabled; }
                  else if (marcado) { bg = '#DCFCE7'; color = '#15803D'; }
                  else { bg = '#FEE2E2'; color = '#DC2626'; }

                  return (
                    <Box key={`dia-${d}`} sx={{
                      height: 32, borderRadius: 1, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', bgcolor: bg,
                      border: esHoy ? '2px solid #F59E0B' : 'none',
                    }}>
                      <Typography sx={{ fontSize: 12, fontWeight: esHoy ? 800 : 500, color }}>{d}</Typography>
                    </Box>
                  );
                })}
              </Box>

              <Stack direction="row" gap={2} mt={1.5}>
                {(['presente', 'ausente', 'futuro'] as const).map((key) => {
                  const cfg = {
                    presente: { bg: '#DCFCE7', color: '#15803D' },
                    ausente:  { bg: '#FEE2E2', color: '#DC2626' },
                    futuro:   { bg: theme.palette.action.hover, color: theme.palette.text.disabled },
                  }[key];
                  return (
                    <Stack key={key} direction="row" alignItems="center" gap={0.5}>
                      <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: cfg.bg }} />
                      <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                        {t(`dashboard.worker.leyenda.${key}`)}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Mis labores */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <Award size={16} color="#3B82F6" />
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                  {t('dashboard.worker.mis_labores')}
                </Typography>
              </Stack>
              {labores.length === 0 ? (
                <Typography sx={{ fontSize: 14, color: 'text.disabled', textAlign: 'center', py: 3 }}>
                  {t('dashboard.worker.sin_labores')}
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {labores.slice(0, 5).map((l) => {
                    const pct = PROGRESO_MAP[l.estado_nombre] ?? 0;
                    const color = PROGRESO_COLOR[l.estado_nombre] ?? '#94A3B8';
                    return (
                      <Box key={l.id} onClick={() => navigate(`/labores/${l.id}`)}
                        sx={{
                          p: 1.5, borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          cursor: 'pointer', transition: 'all 0.15s',
                          '&:hover': { borderColor: color, bgcolor: `${color}08` },
                        }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{l.nombre}</Typography>
                          <Chip label={l.estado_nombre} size="small" sx={{ fontSize: 11, fontWeight: 700, height: 22, bgcolor: `${color}18`, color }} />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" mb={0.75}>
                          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{t('dashboard.worker.progreso')}</Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={pct} sx={{
                          height: 6, borderRadius: 3, bgcolor: theme.palette.divider,
                          '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: color },
                        }} />
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Últimos pagos */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <DollarSign size={16} color="#10B981" />
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                  {t('dashboard.worker.ultimos_pagos')}
                </Typography>
              </Stack>
              {ultimos_pagos.length === 0 ? (
                <Typography sx={{ fontSize: 14, color: 'text.disabled', textAlign: 'center', py: 2 }}>
                  {t('dashboard.worker.sin_pagos')}
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, color: 'text.secondary' } }}>
                      <TableCell>{t('dashboard.worker.tabla_fecha')}</TableCell>
                      <TableCell>{t('dashboard.worker.tabla_monto')}</TableCell>
                      <TableCell>{t('dashboard.worker.tabla_forma_pago')}</TableCell>
                      <TableCell>{t('dashboard.worker.tabla_estado')}</TableCell>
                      <TableCell>{t('dashboard.worker.tabla_motivo')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ultimos_pagos.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell><Typography sx={{ fontSize: 13 }}>{new Date(p.fecha).toLocaleDateString('es-AR')}</Typography></TableCell>
                        <TableCell><Typography sx={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>{formatMoney(Number(p.monto))}</Typography></TableCell>
                        <TableCell><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{p.forma_pago_nombre ?? '—'}</Typography></TableCell>
                        <TableCell>
                          <Chip label={p.estado} size="small" sx={{
                            fontSize: 11, fontWeight: 700, height: 20,
                            bgcolor: p.estado === 'Pagado' ? '#DCFCE7' : p.estado === 'Pendiente' ? '#FEF9C3' : '#FEE2E2',
                            color: p.estado === 'Pagado' ? '#15803D' : p.estado === 'Pendiente' ? '#854D0E' : '#DC2626',
                          }} />
                        </TableCell>
                        <TableCell><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{p.motivo ?? '—'}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const rolId = user?.rol_id ?? -1;
  const esAdmin = ROLES_ADMIN.includes(rolId);
  const esWorker = ROLES_WORKER.includes(rolId);

  return (
    <AppLayout>
      <PageHeader
        title={t('dashboard.title')}
        subtitle={esAdmin ? t('dashboard.subtitle_admin') : t('dashboard.subtitle_worker')}
      />
      {esAdmin  && <DashboardAdmin />}
      {esWorker && <DashboardTrabajador />}
      {!esAdmin && !esWorker && (
        <Typography color="text.secondary">{t('dashboard.no_dashboard')}</Typography>
      )}
    </AppLayout>
  );
};

export default DashboardPage;