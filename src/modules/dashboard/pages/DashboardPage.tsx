// import React from 'react';
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Grid,
//   Chip,
//   Stack,
//   LinearProgress,
//   Button,
//   Avatar,
//   Divider,
// } from '@mui/material';

// import {
//   TrendingUp,
//   Group,
//   Construction,
//   AssignmentTurnedIn,
//   ArrowOutward,
// } from '@mui/icons-material';

// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';

// const statCards = [
//   {
//     title: 'Proyectos activos',
//     value: '12',
//     subtitle: '+2 esta semana',
//     icon: <Construction />,
//     color: '#F59E0B',
//     bg: 'rgba(245, 158, 11, 0.10)',
//   },
//   {
//     title: 'Trabajadores hoy',
//     value: '156',
//     subtitle: '92% presentismo',
//     icon: <Group />,
//     color: '#2563EB',
//     bg: 'rgba(37, 99, 235, 0.10)',
//   },
//   {
//     title: 'Labores en curso',
//     value: '28',
//     subtitle: '5 requieren revisión',
//     icon: <TrendingUp />,
//     color: '#10B981',
//     bg: 'rgba(16, 185, 129, 0.10)',
//   },
//   {
//     title: 'Asistencias del día',
//     value: '143',
//     subtitle: '13 ausencias',
//     icon: <AssignmentTurnedIn />,
//     color: '#8B5CF6',
//     bg: 'rgba(139, 92, 246, 0.10)',
//   },
// ];

// const recentActivity = [
//   {
//     title: 'Juan Pérez marcó presentismo',
//     subtitle: 'Obra Norte · hace 12 min',
//   },
//   {
//     title: 'Se asignó nueva labor de encofrado',
//     subtitle: 'Obra Centro · hace 27 min',
//   },
//   {
//     title: 'Ingreso de materiales registrado',
//     subtitle: 'Cemento x120 · hace 45 min',
//   },
//   {
//     title: 'Presupuesto actualizado',
//     subtitle: 'Edificio Sur · hace 1 h',
//   },
// ];

// const activeWorks = [
//   { name: 'Obra Norte', progress: 78, status: 'En tiempo' },
//   { name: 'Edificio Centro', progress: 54, status: 'En seguimiento' },
//   { name: 'Complejo Sur', progress: 31, status: 'Demorado' },
// ];

// const DashboardPage: React.FC = () => {
//   return (
//     <AppLayout>
//     <PageHeader
//         title="Dashboard"
//         subtitle="Resumen general del sistema."
//         />

//       <Stack spacing={3}>
//         <Card
//           elevation={0}
//           sx={{
//             borderRadius: 4,
//             border: '1px solid #E2E8F0',
//             background:
//               'linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #334155 100%)',
//             color: '#FFFFFF',
//             overflow: 'hidden',
//           }}
//         >
//           <CardContent sx={{ p: { xs: 3, md: 4 } }}>
//             <Grid container spacing={3} alignItems="center">
//               <Grid size={{ xs: 12, md: 8 }}>
//                 <Typography
//                   sx={{
//                     fontSize: { xs: 24, md: 34 },
//                     fontWeight: 800,
//                     letterSpacing: '-0.04em',
//                     mb: 1,
//                   }}
//                 >
//                   Bienvenido de nuevo, Julián
//                 </Typography>

//                 <Typography
//                   sx={{
//                     color: 'rgba(255,255,255,0.75)',
//                     maxWidth: 720,
//                     fontSize: 15,
//                     lineHeight: 1.7,
//                   }}
//                 >
//                   Aquí tienes un resumen general de obras, personal y operaciones.
//                   Hoy tienes actividad en 3 obras, 156 trabajadores registrados y 5
//                   alertas operativas que conviene revisar.
//                 </Typography>

//                 <Stack
//                   direction={{ xs: 'column', sm: 'row' }}
//                   spacing={1.5}
//                   sx={{ mt: 3 }}
//                 >
//                   <Button
//                     variant="contained"
//                     sx={{
//                       bgcolor: '#F59E0B',
//                       color: '#0F172A',
//                       fontWeight: 700,
//                       borderRadius: 3,
//                       px: 2.5,
//                       '&:hover': { bgcolor: '#D97706' },
//                     }}
//                   >
//                     Ver obras activas
//                   </Button>

//                   <Button
//                     variant="outlined"
//                     sx={{
//                       borderColor: 'rgba(255,255,255,0.2)',
//                       color: '#FFFFFF',
//                       borderRadius: 3,
//                       px: 2.5,
//                     }}
//                   >
//                     Revisar alertas
//                   </Button>
//                 </Stack>
//               </Grid>

//               <Grid size={{ xs: 12, md: 4 }}>
//                 <Box
//                   sx={{
//                     p: 2.5,
//                     borderRadius: 4,
//                     background: 'rgba(255,255,255,0.08)',
//                     border: '1px solid rgba(255,255,255,0.08)',
//                   }}
//                 >
//                   <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', mb: 1 }}>
//                     Resumen rápido
//                   </Typography>

//                   <Stack spacing={1.2}>
//                     <Box display="flex" justifyContent="space-between">
//                       <Typography sx={{ color: '#CBD5E1', fontSize: 14 }}>
//                         Obras activas
//                       </Typography>
//                       <Typography sx={{ fontWeight: 700 }}>12</Typography>
//                     </Box>
//                     <Box display="flex" justifyContent="space-between">
//                       <Typography sx={{ color: '#CBD5E1', fontSize: 14 }}>
//                         Presentismo hoy
//                       </Typography>
//                       <Typography sx={{ fontWeight: 700 }}>92%</Typography>
//                     </Box>
//                     <Box display="flex" justifyContent="space-between">
//                       <Typography sx={{ color: '#CBD5E1', fontSize: 14 }}>
//                         Alertas pendientes
//                       </Typography>
//                       <Typography sx={{ fontWeight: 700, color: '#FBBF24' }}>
//                         5
//                       </Typography>
//                     </Box>
//                   </Stack>
//                 </Box>
//               </Grid>
//             </Grid>
//           </CardContent>
//         </Card>

//         <Grid container spacing={3}>
//           {statCards.map((item) => (
//             <Grid key={item.title} size={{ xs: 12, sm: 6, xl: 3 }}>
//               <Card
//                 elevation={0}
//                 sx={{
//                   borderRadius: 4,
//                   border: '1px solid #E2E8F0',
//                   boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
//                 }}
//               >
//                 <CardContent sx={{ p: 2.5 }}>
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       alignItems: 'flex-start',
//                       justifyContent: 'space-between',
//                       mb: 2,
//                     }}
//                   >
//                     <Box>
//                       <Typography
//                         sx={{
//                           fontSize: 14,
//                           color: '#64748B',
//                           mb: 0.8,
//                           fontWeight: 600,
//                         }}
//                       >
//                         {item.title}
//                       </Typography>
//                       <Typography
//                         sx={{
//                           fontSize: 34,
//                           lineHeight: 1,
//                           fontWeight: 800,
//                           color: '#0F172A',
//                           letterSpacing: '-0.04em',
//                         }}
//                       >
//                         {item.value}
//                       </Typography>
//                     </Box>

//                     <Box
//                       sx={{
//                         width: 46,
//                         height: 46,
//                         borderRadius: 3,
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         color: item.color,
//                         backgroundColor: item.bg,
//                       }}
//                     >
//                       {item.icon}
//                     </Box>
//                   </Box>

//                   <Chip
//                     label={item.subtitle}
//                     size="small"
//                     sx={{
//                       borderRadius: 2,
//                       fontWeight: 700,
//                       backgroundColor: '#F8FAFC',
//                       color: '#334155',
//                     }}
//                   />
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>

//         <Grid container spacing={3}>
//           <Grid size={{ xs: 12, lg: 7 }}>
//             <Card
//               elevation={0}
//               sx={{
//                 borderRadius: 4,
//                 border: '1px solid #E2E8F0',
//                 height: '100%',
//               }}
//             >
//               <CardContent sx={{ p: 3 }}>
//                 <Box
//                   sx={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     mb: 2.5,
//                   }}
//                 >
//                   <Box>
//                     <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
//                       Actividad reciente
//                     </Typography>
//                     <Typography sx={{ fontSize: 14, color: '#64748B', mt: 0.5 }}>
//                       Últimos movimientos del sistema
//                     </Typography>
//                   </Box>

//                   <Button
//                     size="small"
//                     endIcon={<ArrowOutward sx={{ fontSize: 16 }} />}
//                     sx={{ textTransform: 'none', fontWeight: 700 }}
//                   >
//                     Ver todo
//                   </Button>
//                 </Box>

//                 <Stack spacing={2}>
//                   {recentActivity.map((item, index) => (
//                     <React.Fragment key={item.title}>
//                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//                         <Avatar
//                           sx={{
//                             width: 38,
//                             height: 38,
//                             bgcolor: '#EFF6FF',
//                             color: '#2563EB',
//                             fontSize: 14,
//                             fontWeight: 700,
//                           }}
//                         >
//                           {index + 1}
//                         </Avatar>

//                         <Box sx={{ flex: 1 }}>
//                           <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A' }}>
//                             {item.title}
//                           </Typography>
//                           <Typography sx={{ fontSize: 13, color: '#64748B' }}>
//                             {item.subtitle}
//                           </Typography>
//                         </Box>
//                       </Box>

//                       {index !== recentActivity.length - 1 && <Divider />}
//                     </React.Fragment>
//                   ))}
//                 </Stack>
//               </CardContent>
//             </Card>
//           </Grid>

//           <Grid size={{ xs: 12, lg: 5 }}>
//             <Card
//               elevation={0}
//               sx={{
//                 borderRadius: 4,
//                 border: '1px solid #E2E8F0',
//                 height: '100%',
//               }}
//             >
//               <CardContent sx={{ p: 3 }}>
//                 <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
//                   Obras activas
//                 </Typography>
//                 <Typography sx={{ fontSize: 14, color: '#64748B', mt: 0.5, mb: 3 }}>
//                   Estado general de avance
//                 </Typography>

//                 <Stack spacing={2.5}>
//                   {activeWorks.map((work) => (
//                     <Box key={work.name}>
//                       <Box
//                         sx={{
//                           display: 'flex',
//                           justifyContent: 'space-between',
//                           alignItems: 'center',
//                           mb: 1,
//                         }}
//                       >
//                         <Box>
//                           <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A' }}>
//                             {work.name}
//                           </Typography>
//                           <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>
//                             {work.status}
//                           </Typography>
//                         </Box>

//                         <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
//                           {work.progress}%
//                         </Typography>
//                       </Box>

//                       <LinearProgress
//                         variant="determinate"
//                         value={work.progress}
//                         sx={{
//                           height: 10,
//                           borderRadius: 999,
//                           backgroundColor: '#E2E8F0',
//                           '& .MuiLinearProgress-bar': {
//                             borderRadius: 999,
//                             background:
//                               work.progress < 40
//                                 ? '#EF4444'
//                                 : work.progress < 70
//                                 ? '#F59E0B'
//                                 : '#22C55E',
//                           },
//                         }}
//                       />
//                     </Box>
//                   ))}
//                 </Stack>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </Stack>
//     </AppLayout>
//   );
// };

// export default DashboardPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Avatar, Box, Card, CardContent, Chip, Divider,
  Grid, LinearProgress, MenuItem, Paper, Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography,
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

const ROLES_ADMIN   = [1, 3, 4, 6];
const ROLES_WORKER  = [7, 8];

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

// ── KPI Card ─────────────────────────────────────────────────
function KpiCard({
  icon, label, value, sub, color = '#F59E0B', onClick,
}: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color?: string; onClick?: () => void;
}) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        borderRadius: 3, border: '1px solid #E2E8F0',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s',
        '&:hover': onClick ? { borderColor: color, boxShadow: `0 0 0 1px ${color}22` } : {},
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600, mb: 0.5 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {value}
            </Typography>
            {sub && (
              <Typography sx={{ fontSize: 12, color: '#94A3B8', mt: 0.5 }}>{sub}</Typography>
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

// ── Dashboard Admin ───────────────────────────────────────────
function DashboardAdmin() {
  const navigate = useNavigate();
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
    refetchInterval: 30000, // actualiza cada 30s
  });

  if (isLoading) return <LoadingState message="Cargando dashboard..." />;
  if (!data) return null;

  const { kpis, ausentes_hoy, materiales_criticos, pagos_evolucion,
          obras_por_estado, labores_por_progreso, actividad_reciente } = data;

  return (
    <Stack spacing={3}>

      {/* Filtro período */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Stack direction="row" spacing={1}>
            {(['hoy', 'semana', 'mes'] as const).map((p) => (
              <Chip
                key={p}
                label={p === 'hoy' ? 'Hoy' : p === 'semana' ? 'Esta semana' : 'Este mes'}
                onClick={() => { setPeriodo(p); setFechaDesde(''); setFechaHasta(''); }}
                sx={{
                  fontWeight: 700, cursor: 'pointer',
                  bgcolor: periodo === p && !fechaDesde ? '#F59E0B' : '#F1F5F9',
                  color:   periodo === p && !fechaDesde ? '#0F172A' : '#64748B',
                }}
              />
            ))}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField size="small" type="date" label="Desde"
              value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ width: 150 }}
            />
            <TextField size="small" type="date" label="Hasta"
              value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ width: 150 }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            Actualiza cada 30s
          </Typography>
        </Stack>
      </Paper>

      {/* KPIs — fila 1 */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <KpiCard icon={<Building2 size={20} />} label="Obras activas"
            value={kpis.obras.activas} sub={`${kpis.obras.total} total`}
            color="#F59E0B" onClick={() => navigate('/obras')} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <KpiCard icon={<HardHat size={20} />} label="Labores activas"
            value={kpis.labores.activas} sub={`${kpis.labores.total} total`}
            color="#3B82F6" onClick={() => navigate('/labores')} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <KpiCard icon={<Users size={20} />} label="Trabajadores"
            value={kpis.trabajadores.total} sub="activos en el sistema"
            color="#10B981" onClick={() => navigate('/trabajadores')} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <KpiCard icon={<Receipt size={20} />} label="Presupuestos"
            value={kpis.presupuestos.total}
            sub={`${kpis.presupuestos.confirmados} confirmados`}
            color="#8B5CF6" onClick={() => navigate('/presupuestos')} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <KpiCard icon={<DollarSign size={20} />} label="Pagado en período"
            value={formatMoney(kpis.pagos.total_pagado)}
            sub={`${formatMoney(kpis.pagos.total_pendiente)} pendiente`}
            color="#16A34A" onClick={() => navigate('/pagos')} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <KpiCard icon={<CalendarCheck size={20} />} label="Asistencia hoy"
            value={`${kpis.asistencia.tasa}%`}
            sub={`${kpis.asistencia.presentes_hoy} / ${kpis.asistencia.total_trabajadores} presentes`}
            color={kpis.asistencia.tasa >= 80 ? '#10B981' : '#EF4444'}
            onClick={() => navigate('/presentismo/admin')} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <KpiCard icon={<Package size={20} />} label="Stock crítico"
            value={kpis.materiales_criticos}
            sub="materiales bajo mínimo"
            color={kpis.materiales_criticos > 0 ? '#EF4444' : '#10B981'}
            onClick={() => navigate('/materiales')} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <KpiCard icon={<LogIn size={20} />} label="Ingresos hoy"
            value={kpis.logins_hoy} sub="logins al sistema"
            color="#0891B2" />
        </Grid>
      </Grid>

      {/* Gráficos — fila 2 */}
      <Grid container spacing={2}>

        {/* Evolución de pagos */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <TrendingUp size={16} color="#F59E0B" />
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                  Evolución de pagos
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  Últimos 6 meses
                </Typography>
              </Stack>
              {pagos_evolucion.length === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#94A3B8' }}>
                  Sin datos
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={pagos_evolucion} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => [typeof v === 'number' ? formatMoney(v) : '—', 'Pagado']}
                      contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }} />
                    <Bar dataKey="total" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Obras por estado */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <Building2 size={16} color="#3B82F6" />
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                  Obras por estado
                </Typography>
              </Stack>
              {obras_por_estado.length === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#94A3B8' }}>
                  Sin datos
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={obras_por_estado} cx="50%" cy="50%" innerRadius={50}
                      outerRadius={80} dataKey="total" nameKey="estado" paddingAngle={3}>
                      {obras_por_estado.map((_, i) => (
                        <Cell key={i} fill={DONA_COLORS[i % DONA_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }} />
                    <Legend iconType="circle" iconSize={8}
                      formatter={(v) => <span style={{ fontSize: 12, color: '#64748B' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Labores por progreso */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <HardHat size={16} color="#8B5CF6" />
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                  Labores por progreso
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                {labores_por_progreso.map((l) => {
                  const pct = PROGRESO_MAP[l.estado] ?? 0;
                  const color = PROGRESO_COLOR[l.estado] ?? '#94A3B8';
                  return (
                    <Box key={l.estado}>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography sx={{ fontSize: 13, color: '#0F172A' }}>{l.estado}</Typography>
                        <Stack direction="row" gap={1} alignItems="center">
                          <Typography sx={{ fontSize: 13, color: '#64748B' }}>{l.total} labores</Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</Typography>
                        </Stack>
                      </Stack>
                      <LinearProgress variant="determinate" value={pct} sx={{
                        height: 8, borderRadius: 4, bgcolor: '#E2E8F0',
                        '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: color },
                      }} />
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Ausentes hoy + materiales críticos */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2} height="100%">

            {/* Ausentes */}
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', flex: 1 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                  <AlertTriangle size={16} color="#EF4444" />
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                    Ausentes hoy
                  </Typography>
                  <Chip label={ausentes_hoy.length} size="small" sx={{
                    ml: 'auto', fontWeight: 700, fontSize: 11,
                    bgcolor: ausentes_hoy.length > 0 ? '#FEF2F2' : '#F0FDF4',
                    color:   ausentes_hoy.length > 0 ? '#DC2626' : '#15803D',
                  }} />
                </Stack>
                {ausentes_hoy.length === 0 ? (
                  <Typography sx={{ fontSize: 13, color: '#16A34A', fontWeight: 600 }}>
                    ✓ Todos presentes hoy
                  </Typography>
                ) : (
                  <Stack spacing={1} sx={{ maxHeight: 140, overflowY: 'auto' }}>
                    {ausentes_hoy.map((t) => (
                      <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#FEE2E2', color: '#DC2626', fontSize: 11, fontWeight: 700 }}>
                          {t.nombre[0]}{t.apellido[0]}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                            {t.nombre} {t.apellido}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>{t.obra_nombre}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* Stock crítico */}
            {materiales_criticos.length > 0 && (
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #FEE2E2' }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" gap={1} mb={1}>
                    <Package size={14} color="#EF4444" />
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>
                      Stock crítico
                    </Typography>
                  </Stack>
                  <Stack spacing={0.5}>
                    {materiales_criticos.map((m) => (
                      <Stack key={m.id} direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: 12, color: '#0F172A' }}>{m.nombre}</Typography>
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
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <Clock size={16} color="#64748B" />
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
              Actividad reciente
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              Últimas 8 acciones
            </Typography>
          </Stack>
          <Stack spacing={0}>
            {actividad_reciente.map((a, i) => (
              <React.Fragment key={i}>
                <Stack direction="row" alignItems="center" gap={2} py={1.25}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: 2,
                    bgcolor: '#F8FAFC', border: '1px solid #E2E8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>
                    {TIPO_ICON[a.tipo] ?? '📋'}
                  </Box>
                  <Box flex={1}>
                    <Typography sx={{ fontSize: 14, color: '#0F172A', fontWeight: 500, lineHeight: 1.3 }}>
                      {a.mensaje}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>
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

// ── Dashboard Trabajador ──────────────────────────────────────
function DashboardTrabajador() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-trabajador'],
    queryFn: dashboardApi.getTrabajador,
    refetchInterval: 60000,
  });

  if (isLoading) return <LoadingState message="Cargando tu dashboard..." />;
  if (!data) return null;

  const { trabajador, obra_actual, kpis, labores, dias_asistencia, ultimos_pagos, mes_actual } = data;

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  // Generar grid del mes para calendario de asistencia
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

  return (
    <Stack spacing={3}>

      {/* Header personalizado */}
      <Card elevation={0} sx={{
        borderRadius: 3, border: '1px solid #E2E8F0',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" gap={2}>
            <Avatar sx={{ width: 52, height: 52, bgcolor: '#F59E0B', color: '#0F172A', fontSize: 18, fontWeight: 800 }}>
              {trabajador.nombre[0]}{trabajador.apellido[0]}
            </Avatar>
            <Box flex={1}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                Hola, {trabajador.nombre} {trabajador.apellido}
              </Typography>
              {obra_actual && (
                <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', mt: 0.25 }}>
                  {obra_actual.obra_nombre}
                  {obra_actual.rol_en_obra && ` · ${obra_actual.rol_en_obra}`}
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#F59E0B' }}>
                {kpis.tasa_asistencia}%
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                asistencia {MESES[mes_actual.mes - 1].toLowerCase()}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* KPIs */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard icon={<HardHat size={20} />} label="Labores activas"
            value={kpis.labores_activas} color="#3B82F6"
            onClick={() => navigate('/labores')} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard icon={<DollarSign size={20} />} label="Cobrado este mes"
            value={formatMoney(kpis.cobrado_mes)} color="#10B981" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard icon={<CalendarCheck size={20} />} label="Días presentes"
            value={kpis.dias_marcados}
            sub={`de ${kpis.dias_habiles} hábiles`}
            color="#F59E0B"
            onClick={() => navigate('/presentismo')} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <KpiCard icon={<Receipt size={20} />} label="Pagos pendientes"
            value={formatMoney(kpis.pendiente_mes)}
            color={kpis.pendiente_mes > 0 ? '#EF4444' : '#10B981'} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>

        {/* Calendario de asistencia */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <CalendarCheck size={16} color="#F59E0B" />
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                  {MESES[mes_actual.mes - 1]} {mes_actual.anio}
                </Typography>
              </Stack>

              {/* Cabecera días */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', mb: 1 }}>
                {['Lu','Ma','Mi','Ju','Vi','Sa','Do'].map((d) => (
                  <Typography key={d} sx={{ fontSize: 11, textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                    {d}
                  </Typography>
                ))}
              </Box>

              {/* Grid días */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {diasGrid.map((d, i) => {
                  if (d === null) return <Box key={`e-${i}`} />;
                  const str    = diaStr(d);
                  const hoy    = new Date().toISOString().split('T')[0];
                  const finde  = esFinDeSemana(d);
                  const marcado = dias_asistencia.includes(str);
                  const esHoy  = str === hoy;
                  const futuro = str > hoy;

                  let bg = '#F1F5F9';
                  let color = '#94A3B8';
                  if (finde) { bg = 'transparent'; color = '#CBD5E1'; }
                  else if (futuro) { bg = '#F8FAFC'; color = '#CBD5E1'; }
                  else if (marcado) { bg = '#DCFCE7'; color = '#15803D'; }
                  else { bg = '#FEE2E2'; color = '#DC2626'; }

                  return (
                    <Box key={d} sx={{
                      height: 32, borderRadius: 1, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      bgcolor: bg,
                      border: esHoy ? '2px solid #F59E0B' : 'none',
                    }}>
                      <Typography sx={{ fontSize: 12, fontWeight: esHoy ? 800 : 500, color }}>
                        {d}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Leyenda */}
              <Stack direction="row" gap={2} mt={1.5}>
                {[
                  { bg: '#DCFCE7', color: '#15803D', label: 'Presente' },
                  { bg: '#FEE2E2', color: '#DC2626', label: 'Ausente' },
                  { bg: '#F1F5F9', color: '#94A3B8', label: 'Futuro' },
                ].map((item) => (
                  <Stack key={item.label} direction="row" alignItems="center" gap={0.5}>
                    <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: item.bg }} />
                    <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>{item.label}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Mis labores activas */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <Award size={16} color="#3B82F6" />
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                  Mis labores activas
                </Typography>
              </Stack>
              {labores.length === 0 ? (
                <Typography sx={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', py: 3 }}>
                  No tenés labores activas actualmente
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {labores.slice(0, 5).map((l) => {
                    const pct   = PROGRESO_MAP[l.estado_nombre] ?? 0;
                    const color = PROGRESO_COLOR[l.estado_nombre] ?? '#94A3B8';
                    return (
                      <Box
                        key={l.id}
                        onClick={() => navigate(`/labores/${l.id}`)}
                        sx={{
                          p: 1.5, borderRadius: 2, border: '1px solid #E2E8F0',
                          cursor: 'pointer', transition: 'all 0.15s',
                          '&:hover': { borderColor: color, bgcolor: `${color}08` },
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                            {l.nombre}
                          </Typography>
                          <Chip label={l.estado_nombre} size="small" sx={{
                            fontSize: 11, fontWeight: 700, height: 22,
                            bgcolor: `${color}18`, color,
                          }} />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" mb={0.75}>
                          <Typography sx={{ fontSize: 12, color: '#64748B' }}>Progreso</Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color }}>{pct}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={pct} sx={{
                          height: 6, borderRadius: 3, bgcolor: '#E2E8F0',
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
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <DollarSign size={16} color="#10B981" />
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                  Últimos pagos recibidos
                </Typography>
              </Stack>
              {ultimos_pagos.length === 0 ? (
                <Typography sx={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', py: 2 }}>
                  No hay pagos registrados aún
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, color: '#64748B' } }}>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Monto</TableCell>
                      <TableCell>Forma de pago</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Motivo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ultimos_pagos.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>
                          <Typography sx={{ fontSize: 13 }}>
                            {new Date(p.fecha).toLocaleDateString('es-AR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>
                            {formatMoney(Number(p.monto))}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: 13, color: '#64748B' }}>
                            {p.forma_pago_nombre ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={p.estado} size="small" sx={{
                            fontSize: 11, fontWeight: 700, height: 20,
                            bgcolor: p.estado === 'Pagado' ? '#DCFCE7' : p.estado === 'Pendiente' ? '#FEF9C3' : '#FEE2E2',
                            color:   p.estado === 'Pagado' ? '#15803D' : p.estado === 'Pendiente' ? '#854D0E' : '#DC2626',
                          }} />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: 13, color: '#64748B' }}>
                            {p.motivo ?? '—'}
                          </Typography>
                        </TableCell>
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

// ── Componente principal — detecta rol y renderiza el correcto ─
const DashboardPage: React.FC = () => {
  const user  = useAuthStore((s) => s.user);
  const rolId = user?.rol_id ?? -1;

  const esAdmin  = ROLES_ADMIN.includes(rolId);
  const esWorker = ROLES_WORKER.includes(rolId);

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        subtitle={esAdmin
          ? 'Resumen operativo del sistema'
          : `Bienvenido — aquí está tu resumen`
        }
      />
      {esAdmin  && <DashboardAdmin />}
      {esWorker && <DashboardTrabajador />}
      {!esAdmin && !esWorker && (
        <Typography color="text.secondary">No hay dashboard disponible para tu rol.</Typography>
      )}
    </AppLayout>
  );
};

export default DashboardPage;