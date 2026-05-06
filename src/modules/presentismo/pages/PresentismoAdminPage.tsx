import React, { useState } from 'react';
import {
  Alert, Avatar, Box, Card, CardContent, Chip,
  Grid, MenuItem, Paper, Stack, Tab, Table, TableBody,
  TableCell, TableHead, TableRow, Tabs, TextField, Typography,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  Users, TrendingUp, Building2, CalendarCheck,
  AlertTriangle, Award,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { presentismoApi } from '../../../services/api/presentismo.api';
import { useObrasList } from '../../obras/hooks/useObras';

// ── Helpers ───────────────────────────────────────────────────
const hoy = new Date();
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  .toISOString().split('T')[0];
const hoyStr = hoy.toISOString().split('T')[0];

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const COLORES_BARRAS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F97316', '#06B6D4'];

// ── Tarjeta de métrica ────────────────────────────────────────
function MetricCard({
  icon, label, value, color = '#F59E0B', subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  subtitle?: string;
}) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ color, mt: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2,
            bgcolor: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color,
          }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── Componente principal ──────────────────────────────────────
export const PresentismoAdminPage: React.FC = () => {
  const [tab, setTab]             = useState(0);
  const [fechaDesde, setFechaDesde] = useState(primerDiaMes);
  const [fechaHasta, setFechaHasta] = useState(hoyStr);
  const [obraFiltro, setObraFiltro] = useState<number | ''>('');

  // Filtros historial
  const [histFecha, setHistFecha]           = useState('');
  const [histTrabajador, setHistTrabajador] = useState('');
  const [histObra, setHistObra]             = useState<number | ''>('');

  const { data: obras = [] } = useObrasList();

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
      fecha:         histFecha   || undefined,
      trabajador_id: histTrabajador ? Number(histTrabajador) : undefined,
      obra_id:       histObra    || undefined,
    }),
    enabled: tab === 1,
  });

  // Datos para el gráfico de barras por día de semana
  const dataDias = (stats?.por_dia_semana ?? []).map((d) => ({
    dia:   DIAS[Number(d.dia_semana)] ?? d.nombre_dia.trim(),
    total: Number(d.total),
  }));

  return (
    <AppLayout>
      <PageHeader
        title="Presentismo — Panel admin"
        subtitle="Estadísticas e historial de asistencia de todos los trabajadores"
      />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: '1px solid #E2E8F0' }}
      >
        <Tab label="Estadísticas" />
        <Tab label="Historial completo" />
      </Tabs>

      {/* ── TAB 0: ESTADÍSTICAS ── */}
      {tab === 0 && (
        <Box>
          {/* Filtros */}
          <Paper sx={{ p: 2, borderRadius: 3, mb: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                size="small" type="date" label="Desde"
                value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
                InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }}
              />
              <TextField
                size="small" type="date" label="Hasta"
                value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
                InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }}
              />
              <TextField
                select size="small" label="Filtrar por obra"
                value={obraFiltro} onChange={(e) => setObraFiltro(e.target.value ? Number(e.target.value) : '')}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">Todas las obras</MenuItem>
                {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
              </TextField>
            </Stack>
          </Paper>

          {loadingStats ? <LoadingState message="Calculando estadísticas..." /> : (
            <Stack spacing={3}>

              {/* Métricas generales */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetricCard
                    icon={<CalendarCheck size={20} />}
                    label="Total registros"
                    value={Number(stats?.resumen.total_registros ?? 0).toLocaleString()}
                    color="#F59E0B"
                    subtitle={`${stats?.dias_periodo} días de período`}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetricCard
                    icon={<Users size={20} />}
                    label="Trabajadores activos"
                    value={stats?.resumen.trabajadores_activos ?? 0}
                    color="#3B82F6"
                    subtitle="Con al menos 1 registro"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetricCard
                    icon={<Building2 size={20} />}
                    label="Obras con actividad"
                    value={stats?.resumen.obras_con_actividad ?? 0}
                    color="#10B981"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <MetricCard
                    icon={<TrendingUp size={20} />}
                    label="Días con actividad"
                    value={stats?.resumen.dias_con_actividad ?? 0}
                    color="#8B5CF6"
                    subtitle={`de ${stats?.dias_periodo} días`}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>

                {/* Gráfico por día de semana */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="body2" fontWeight={700} color="text.secondary" mb={2}>
                        REGISTROS POR DÍA DE LA SEMANA
                      </Typography>
                      {dataDias.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                          Sin datos en el período
                        </Typography>
                      ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={dataDias} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
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
                  <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0', height: '100%' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" alignItems="center" gap={1} mb={2}>
                        <Award size={16} color="#F59E0B" />
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                          ASISTENCIA PERFECTA ({stats?.dias_periodo} días)
                        </Typography>
                      </Stack>
                      {(stats?.asistencia_perfecta ?? []).length === 0 ? (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                          Ningún trabajador con asistencia perfecta en el período
                        </Typography>
                      ) : (
                        <Stack spacing={1}>
                          {stats?.asistencia_perfecta.map((t) => (
                            <Stack key={t.id} direction="row" alignItems="center" gap={1.5}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: '#0F172A', fontSize: 12, fontWeight: 700 }}>
                                {t.nombre[0]}{t.apellido[0]}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600} flex={1}>
                                {t.nombre} {t.apellido}
                              </Typography>
                              <Chip
                                label={`${t.dias_asistidos} días`}
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

                {/* Ranking más cumplidores */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" alignItems="center" gap={1} mb={2}>
                        <TrendingUp size={16} color="#3B82F6" />
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                          RANKING — MÁS CUMPLIDORES
                        </Typography>
                      </Stack>
                      {(stats?.ranking ?? []).length === 0 ? (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                          Sin datos en el período
                        </Typography>
                      ) : (
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, color: '#64748B' } }}>
                              <TableCell>#</TableCell>
                              <TableCell>Trabajador</TableCell>
                              <TableCell align="center">Días</TableCell>
                              <TableCell align="center">Registros</TableCell>
                              <TableCell align="center">Último</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stats?.ranking.map((t, i) => (
                              <TableRow key={t.trabajador_id} hover>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={700} color={i < 3 ? '#F59E0B' : 'text.secondary'}>
                                    {i + 1}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Stack direction="row" alignItems="center" gap={1}>
                                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#0F172A', fontSize: 11, fontWeight: 700 }}>
                                      {t.nombre[0]}{t.apellido[0]}
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={600}>
                                      {t.nombre} {t.apellido}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={t.dias_distintos}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(59,130,246,0.1)', color: '#1D4ED8', fontWeight: 700, fontSize: 11 }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2">{t.total_registros}</Typography>
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
                  <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0', height: '100%' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" alignItems="center" gap={1} mb={2}>
                        <AlertTriangle size={16} color="#EF4444" />
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                          AUSENTES HOY
                        </Typography>
                        {(stats?.ausentes_hoy ?? []).length > 0 && (
                          <Chip
                            label={(stats?.ausentes_hoy ?? []).length}
                            size="small"
                            sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#DC2626', fontWeight: 700, fontSize: 11, ml: 'auto' }}
                          />
                        )}
                      </Stack>
                      {(stats?.ausentes_hoy ?? []).length === 0 ? (
                        <Alert severity="success" sx={{ borderRadius: 2, fontSize: 13 }}>
                          Todos los trabajadores marcaron hoy
                        </Alert>
                      ) : (
                        <Stack spacing={1} sx={{ maxHeight: 280, overflowY: 'auto' }}>
                          {stats?.ausentes_hoy.map((t) => (
                            <Box key={t.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
                              <Typography variant="body2" fontWeight={600} color="#991B1B">
                                {t.nombre} {t.apellido}
                              </Typography>
                              <Typography variant="caption" color="#EF4444">
                                {t.obra_nombre}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Asistencia por obra */}
                <Grid size={{ xs: 12 }}>
                  <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" alignItems="center" gap={1} mb={2}>
                        <Building2 size={16} color="#10B981" />
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                          ASISTENCIA POR OBRA
                        </Typography>
                      </Stack>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ '& th': { fontWeight: 700, fontSize: 12, color: '#64748B' } }}>
                            <TableCell>Obra</TableCell>
                            <TableCell align="center">Registros totales</TableCell>
                            <TableCell align="center">Trabajadores distintos</TableCell>
                            <TableCell align="center">Días con actividad</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(stats?.por_obra ?? []).map((o) => (
                            <TableRow key={o.obra_id} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>{o.obra_nombre}</Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">{o.total_registros}</Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">{o.trabajadores_distintos}</Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={o.dias_con_actividad}
                                  size="small"
                                  sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#065F46', fontWeight: 700, fontSize: 11 }}
                                />
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

      {/* ── TAB 1: HISTORIAL COMPLETO ── */}
      {tab === 1 && (
        <Box>
          {/* Filtros historial */}
          <Paper sx={{ p: 2, borderRadius: 3, mb: 3, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                size="small" type="date" label="Fecha"
                value={histFecha} onChange={(e) => setHistFecha(e.target.value)}
                InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }}
              />
              <TextField
                size="small" label="ID trabajador"
                value={histTrabajador} onChange={(e) => setHistTrabajador(e.target.value)}
                sx={{ minWidth: 160 }}
              />
              <TextField
                select size="small" label="Obra"
                value={histObra} onChange={(e) => setHistObra(e.target.value ? Number(e.target.value) : '')}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">Todas las obras</MenuItem>
                {obras.map((o) => <MenuItem key={o.id} value={o.id}>{o.nombre}</MenuItem>)}
              </TextField>
            </Stack>
          </Paper>

          {loadingHist ? <LoadingState message="Cargando historial..." /> : (
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Trabajador</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Obra</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Hora</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Coordenadas</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Observaciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historial.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#94A3B8' }}>
                        No hay registros con los filtros aplicados
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
                        <TableCell>
                          <Typography variant="body2">{p.obra_nombre}</Typography>
                        </TableCell>
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
                          <Typography variant="body2" color="text.secondary">
                            {p.observaciones ?? '—'}
                          </Typography>
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