import React, { useState } from 'react';
import {
  Alert, Avatar, Box, Card, CardContent, Chip,
  Grid, MenuItem, Paper, Stack, Tab, Table, TableBody,
  TableCell, TableHead, TableRow, Tabs, TextField, Typography,
  useTheme,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  Users, TrendingUp, Building2, CalendarCheck,
  AlertTriangle, Award, Star,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { presentismoApi } from '../../../services/api/presentismo.api';
import { useObrasListAll } from '../../obras/hooks/useObras';

const hoy = new Date();
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
const hoyStr = hoy.toISOString().split('T')[0];

const COLORES_BARRAS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F97316', '#06B6D4'];
const MEDALLAS = ['🥇', '🥈', '🥉'];

function MetricCard({ icon, label, value, color = '#F59E0B', subtitle }: {
  icon: React.ReactNode; label: string; value: string | number; color?: string; subtitle?: string;
}) {
  const theme = useTheme();
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ color, mt: 0.5 }}>{value}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export const PresentismoAdminPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [tab, setTab] = useState(0);
  const [fechaDesde, setFechaDesde] = useState(primerDiaMes);
  const [fechaHasta, setFechaHasta] = useState(hoyStr);
  const [obraFiltro, setObraFiltro] = useState<number | ''>('');
  const [histFecha, setHistFecha] = useState('');
  const [histTrabajador, setHistTrabajador] = useState('');
  const [histObra, setHistObra] = useState<number | ''>('');

const DIAS = [
  t('presentismo_admin.dias_semana.dom'),
  t('presentismo_admin.dias_semana.lun'),
  t('presentismo_admin.dias_semana.mar'),
  t('presentismo_admin.dias_semana.mie'),
  t('presentismo_admin.dias_semana.jue'),
  t('presentismo_admin.dias_semana.vie'),
  t('presentismo_admin.dias_semana.sab'),
];

  const { data: obras = [] } = useObrasListAll();

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['presentismo-estadisticas', fechaDesde, fechaHasta, obraFiltro],
    queryFn: () => presentismoApi.getEstadisticas({
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      obra_id: obraFiltro || undefined,
    }),
  });

  const { data: historial = [], isLoading: loadingHist } = useQuery({
    queryKey: ['presentismo-historial-admin', histFecha, histTrabajador, histObra],
    queryFn: () => presentismoApi.getHistorialAdmin({
      fecha: histFecha || undefined,
      trabajador_id: histTrabajador ? Number(histTrabajador) : undefined,
      obra_id: histObra || undefined,
    }),
    enabled: tab === 1,
  });

  const dataDias = (stats?.por_dia_semana ?? []).map((d) => ({
    dia: DIAS[Number(d.dia_semana)] ?? d.nombre_dia.trim(),
    total: Number(d.total),
  }));

  return (
    <AppLayout>
      <PageHeader
        title={t('presentismo_admin.title')}
        subtitle={t('presentismo_admin.subtitle')}
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Tab label={t('presentismo_admin.tab_stats')} />
        <Tab label={t('presentismo_admin.tab_historial')} />
      </Tabs>

      {/* TAB 0: ESTADÍSTICAS */}
      {tab === 0 && (
        <Box>
          <Paper sx={{ p: 2, borderRadius: 3, mb: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                size="small" type="date" label={t('presentismo_admin.desde')}
                value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
                InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }}
              />
              <TextField
                size="small" type="date" label={t('presentismo_admin.hasta')}
                value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
                InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }}
              />
              <TextField
                select size="small" label={t('presentismo_admin.filtro_obra')}
                value={obraFiltro}
                onChange={(e) => setObraFiltro(e.target.value ? Number(e.target.value) : '')}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">{t('presentismo_admin.todas_obras')}</MenuItem>
                {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
              </TextField>
            </Stack>
          </Paper>

          {loadingStats ? <LoadingState message={t('presentismo_admin.calculando')} /> : (
            <Stack spacing={3}>

              {/* KPIs */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetricCard icon={<CalendarCheck size={20} />}
                    label={t('presentismo_admin.total_registros')}
                    value={Number(stats?.resumen.total_registros ?? 0).toLocaleString()}
                    color="#F59E0B"
                    subtitle={t('presentismo_admin.dias_periodo', { dias: stats?.dias_periodo })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetricCard icon={<Users size={20} />}
                    label={t('presentismo_admin.trabajadores_activos')}
                    value={stats?.resumen.trabajadores_activos ?? 0}
                    color="#3B82F6"
                    subtitle={t('presentismo_admin.al_menos_uno')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetricCard icon={<Building2 size={20} />}
                    label={t('presentismo_admin.obras_actividad')}
                    value={stats?.resumen.obras_con_actividad ?? 0}
                    color="#10B981"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetricCard icon={<TrendingUp size={20} />}
                    label={t('presentismo_admin.dias_actividad')}
                    value={stats?.resumen.dias_con_actividad ?? 0}
                    color="#8B5CF6"
                    subtitle={t('presentismo_admin.de_dias', { dias: stats?.dias_periodo })}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>

                {/* Gráfico por día */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="body2" fontWeight={700} color="text.secondary" mb={2}>
                        {t('presentismo_admin.registros_dia_semana')}
                      </Typography>
                      {dataDias.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                          {t('presentismo_admin.sin_datos')}
                        </Typography>
                      ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={dataDias} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="dia" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                            <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider, borderRadius: 8 }}
                            />
                            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                              {dataDias.map((_, i) => (
                                <Cell key={i} fill={COLORES_BARRAS[i % COLORES_BARRAS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Asistencia perfecta */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', height: '100%' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" alignItems="center" gap={1} mb={2}>
                        <Award size={16} color="#F59E0B" />
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                          {t('presentismo_admin.asistencia_perfecta', { dias: stats?.dias_periodo })}
                        </Typography>
                      </Stack>
                      {(stats?.asistencia_perfecta ?? []).length === 0 ? (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                          {t('presentismo_admin.sin_asistencia_perfecta')}
                        </Typography>
                      ) : (
                        <Stack spacing={1}>
{stats?.asistencia_perfecta.map((trabajador) => (
  <Stack key={trabajador.id} direction="row" alignItems="center" gap={1.5}>
    <Avatar sx={{ width: 32, height: 32, bgcolor: '#F59E0B', color: '#0F172A', fontSize: 12, fontWeight: 700 }}>
      {trabajador.nombre[0]}{trabajador.apellido[0]}
    </Avatar>
    <Typography variant="body2" fontWeight={600} flex={1}>
      {trabajador.nombre} {trabajador.apellido}
    </Typography>
    <Chip
      label={`${trabajador.dias_asistidos} ${Number(trabajador.dias_asistidos) === 1 ? t('presentismo_admin.dia') : t('presentismo_admin.dias_label')}`}
      size="small"
      sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#065F46', fontWeight: 700, fontSize: 11 }}
    />
  </Stack>
))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Ranking cumplidores */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" alignItems="center" gap={1} mb={2}>
                        <TrendingUp size={16} color="#3B82F6" />
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                          {t('presentismo_admin.ranking_cumplidores')}
                        </Typography>
                      </Stack>
                      {(stats?.ranking ?? []).length === 0 ? (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                          {t('presentismo_admin.sin_datos')}
                        </Typography>
                      ) : (
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, color: theme.palette.text.secondary } }}>
                              <TableCell>#</TableCell>
                              <TableCell>{t('presentismo_admin.tabla.trabajador')}</TableCell>
                              <TableCell align="center">{t('presentismo_admin.tabla.dias')}</TableCell>
                              <TableCell align="center">{t('presentismo_admin.tabla.registros')}</TableCell>
                              <TableCell align="center">{t('presentismo_admin.tabla.puntos')}</TableCell>
                              <TableCell align="center">{t('presentismo_admin.tabla.ultimo')}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stats?.ranking.map((t, i) => (
                              <TableRow key={t.trabajador_id} hover>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={700}>{MEDALLAS[i] ?? i + 1}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Stack direction="row" alignItems="center" gap={1}>
                                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#0F172A', fontSize: 11, fontWeight: 700 }}>
                                      {t.nombre[0]}{t.apellido[0]}
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={600}>{t.nombre} {t.apellido}</Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={t.dias_distintos} size="small"
                                    sx={{ bgcolor: 'rgba(59,130,246,0.1)', color: '#1D4ED8', fontWeight: 700, fontSize: 11 }} />
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2">{t.total_registros}</Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={`${t.puntos ?? 0} pts`} size="small"
                                    sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#B45309', fontWeight: 700, fontSize: 11 }} />
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="caption" color="text.secondary">
                                    {t.ultimo_registro ? new Date(t.ultimo_registro).toLocaleDateString('es-AR') : '—'}
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

                {/* Ausentes hoy */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', height: '100%' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" alignItems="center" gap={1} mb={2}>
                        <AlertTriangle size={16} color="#EF4444" />
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                          {t('presentismo_admin.ausentes_hoy')}
                        </Typography>
                        {(stats?.ausentes_hoy ?? []).length > 0 && (
                          <Chip label={(stats?.ausentes_hoy ?? []).length} size="small"
                            sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#DC2626', fontWeight: 700, fontSize: 11, ml: 'auto' }} />
                        )}
                      </Stack>
                      {(stats?.ausentes_hoy ?? []).length === 0 ? (
                        <Alert severity="success" sx={{ borderRadius: 2, fontSize: 13 }}>
                          {t('presentismo_admin.todos_marcaron')}
                        </Alert>
                      ) : (
                        <Stack spacing={1} sx={{ maxHeight: 280, overflowY: 'auto' }}>
                          {stats?.ausentes_hoy.map((t) => (
                            <Box key={t.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }}>
                              <Typography variant="body2" fontWeight={600} color="#991B1B">
                                {t.nombre} {t.apellido}
                              </Typography>
                              <Typography variant="caption" color="#EF4444">{t.obra_nombre}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Ranking global puntos */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" alignItems="center" gap={1} mb={2}>
                        <Star size={16} color="#F59E0B" />
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                          {t('presentismo_admin.ranking_puntos')}
                        </Typography>
                      </Stack>
                      {(stats?.ranking_puntos ?? []).length === 0 ? (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                          {t('presentismo_admin.sin_puntos')}
                        </Typography>
                      ) : (
                        <Stack spacing={1.5}>
                          {stats?.ranking_puntos.map((t, i) => (
                            <Box key={t.id} sx={{
                              p: 1.5, borderRadius: 2,
                              bgcolor: i === 0 ? 'rgba(245,158,11,0.08)' : theme.palette.action.hover,
                              border: `1px solid ${i === 0 ? '#F59E0B' : theme.palette.divider}`,
                            }}>
                              <Stack direction="row" alignItems="center" gap={1.5}>
                                <Typography sx={{ fontSize: 20, lineHeight: 1, width: 28 }}>
                                  {MEDALLAS[i] ?? `${i + 1}.`}
                                </Typography>
                                <Avatar sx={{
                                  width: 32, height: 32,
                                  bgcolor: i === 0 ? '#F59E0B' : '#0F172A',
                                  color: i === 0 ? '#0F172A' : '#fff',
                                  fontSize: 12, fontWeight: 700,
                                }}>
                                  {t.nombre[0]}{t.apellido[0]}
                                </Avatar>
                                <Typography variant="body2" fontWeight={700} flex={1}>{t.nombre} {t.apellido}</Typography>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="body1" fontWeight={800} color={i === 0 ? '#B45309' : 'text.secondary'}>
                                    {t.puntos}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">pts</Typography>
                                </Box>
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Asistencia por obra */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" alignItems="center" gap={1} mb={2}>
                        <Building2 size={16} color="#10B981" />
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                          {t('presentismo_admin.asistencia_por_obra')}
                        </Typography>
                      </Stack>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, color: theme.palette.text.secondary } }}>
                            <TableCell>{t('presentismo_admin.obra_tabla.obra')}</TableCell>
                            <TableCell align="center">{t('presentismo_admin.obra_tabla.registros')}</TableCell>
                            <TableCell align="center">{t('presentismo_admin.obra_tabla.trabajadores')}</TableCell>
                            <TableCell align="center">{t('presentismo_admin.obra_tabla.dias')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(stats?.por_obra ?? []).map((o) => (
                            <TableRow key={o.obra_id} hover>
                              <TableCell><Typography variant="body2" fontWeight={600}>{o.obra_nombre}</Typography></TableCell>
                              <TableCell align="center"><Typography variant="body2">{o.total_registros}</Typography></TableCell>
                              <TableCell align="center"><Typography variant="body2">{o.trabajadores_distintos}</Typography></TableCell>
                              <TableCell align="center">
                                <Chip label={o.dias_con_actividad} size="small"
                                  sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#065F46', fontWeight: 700, fontSize: 11 }} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          )}
        </Box>
      )}

      {/* TAB 1: HISTORIAL */}
      {tab === 1 && (
        <Box>
          <Paper sx={{ p: 2, borderRadius: 3, mb: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                size="small" type="date" label={t('presentismo_admin.hist_fecha')}
                value={histFecha} onChange={(e) => setHistFecha(e.target.value)}
                InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }}
              />
              <TextField
                size="small" label={t('presentismo_admin.hist_trabajador')}
                value={histTrabajador} onChange={(e) => setHistTrabajador(e.target.value)}
                sx={{ minWidth: 160 }}
              />
              <TextField
                select size="small" label={t('presentismo_admin.hist_obra')}
                value={histObra}
                onChange={(e) => setHistObra(e.target.value ? Number(e.target.value) : '')}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">{t('presentismo_admin.todas_obras')}</MenuItem>
                {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
              </TextField>
            </Stack>
          </Paper>

          {loadingHist ? <LoadingState message={t('presentismo_admin.cargando_historial')} /> : (
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>{t('presentismo_admin.hist_tabla.trabajador')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('presentismo_admin.hist_tabla.obra')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('presentismo_admin.hist_tabla.fecha')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('presentismo_admin.hist_tabla.hora')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('presentismo_admin.hist_tabla.coordenadas')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('presentismo_admin.hist_tabla.observaciones')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historial.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.disabled">{t('presentismo_admin.sin_registros')}</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    historial.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {p.trabajador_nombre} {p.trabajador_apellido}
                          </Typography>
                        </TableCell>
                        <TableCell><Typography variant="body2">{p.obra_nombre}</Typography></TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(p.fecha).toLocaleDateString('es-AR')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(p.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {parseFloat(p.latitud as any).toFixed(4)}, {parseFloat(p.longitud as any).toFixed(4)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{p.observaciones ?? '—'}</Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Box>
      )}
    </AppLayout>
  );
};