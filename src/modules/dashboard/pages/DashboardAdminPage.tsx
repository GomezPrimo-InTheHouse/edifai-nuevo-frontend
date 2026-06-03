// src/modules/dashboard/pages/DashboardAdminPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Card, CardContent, Chip, Divider, Grid, LinearProgress,
  Paper, Stack, Typography, useTheme, Avatar, TextField,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Building2, HardHat, Users, Receipt, Package,
  CalendarCheck, LogIn, AlertTriangle, TrendingUp,
  DollarSign, Clock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { useAuthStore } from '../../../app/store/auth.store';
import { dashboardApi } from '../../../services/api/dashboard.api';
import { KpiCard, formatMoney, tiempoRelativo } from '../components/DashboardShared';

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
  gasto_imprevisto_creado: '🧾', gasto_imprevisto_estado: '🔄',
};

export const DashboardAdminPage: React.FC = () => {
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

  const {
    kpis, ausentes_hoy, materiales_criticos, pagos_evolucion,
    obras_por_estado, labores_por_progreso, actividad_reciente,
  } = data;

  const gridColor    = theme.palette.divider;
  const tickColor    = theme.palette.text.secondary;
  const tooltipBg    = theme.palette.background.paper;
  const tooltipBorder = theme.palette.divider;
  const actividadBg  = theme.palette.action.hover;

  return (
    <Stack spacing={3}>

      {/* Filtro período */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Stack direction="row" spacing={1}>
            {(['hoy', 'semana', 'mes'] as const).map((p) => (
              <Chip key={p} label={t(`dashboard.periodos.${p}`)}
                onClick={() => { setPeriodo(p); setFechaDesde(''); setFechaHasta(''); }}
                sx={{
                  fontWeight: 700, cursor: 'pointer',
                  bgcolor: periodo === p && !fechaDesde ? '#F59E0B' : theme.palette.action.hover,
                  color: periodo === p && !fechaDesde ? '#0F172A' : theme.palette.text.secondary,
                }} />
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
        {esDetallado && (
          <Grid size={{ xs: 12, md: 7 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" gap={1} mb={2}>
                  <TrendingUp size={16} color="#F59E0B" />
                  <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t('dashboard.graficos.evolucion_pagos')}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>{t('dashboard.graficos.ultimos_6_meses')}</Typography>
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
                      <Tooltip formatter={(v) => [typeof v === 'number' ? formatMoney(v) : '—', t('dashboard.graficos.pagado')]}
                        contentStyle={{ borderRadius: 8, border: `1px solid ${tooltipBorder}`, fontSize: 13, backgroundColor: tooltipBg, color: theme.palette.text.primary }} />
                      <Bar dataKey="total" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid size={{ xs: 12, md: esDetallado ? 5 : 6 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <Building2 size={16} color="#3B82F6" />
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t('dashboard.graficos.obras_por_estado')}</Typography>
              </Stack>
              {obras_por_estado.length === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'text.disabled' }}>
                  {t('dashboard.sin_datos')}
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={obras_por_estado} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      dataKey="total" nameKey="estado" paddingAngle={3}>
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

        <Grid size={{ xs: 12, md: esDetallado ? 7 : 6 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <HardHat size={16} color="#8B5CF6" />
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t('dashboard.graficos.labores_por_progreso')}</Typography>
              </Stack>
              <Stack spacing={1.5}>
                {labores_por_progreso.map((l) => {
                  const pct   = PROGRESO_MAP[l.estado] ?? 0;
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

        <Grid size={{ xs: 12, md: esDetallado ? 5 : 12 }}>
          <Stack spacing={2} height="100%">
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, flex: 1 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                  <AlertTriangle size={16} color="#EF4444" />
                  <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t('dashboard.graficos.ausentes_hoy')}</Typography>
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
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t('dashboard.graficos.actividad_reciente')}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              {t('dashboard.graficos.ultimas_acciones')}
            </Typography>
          </Stack>
          <Stack spacing={0}>
            {actividad_reciente.map((a, i) => (
              <React.Fragment key={`actividad-${a.created_at}-${i}`}>
                <Stack direction="row" alignItems="center" gap={2} py={1.25}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: 2, bgcolor: actividadBg,
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>
                    {TIPO_ICON[a.tipo] ?? '📋'}
                  </Box>
                  <Box flex={1}>
                    <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3 }}>{a.mensaje}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>{tiempoRelativo(a.created_at)}</Typography>
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
};