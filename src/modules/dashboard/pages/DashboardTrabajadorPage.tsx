// src/modules/dashboard/pages/DashboardTrabajadorPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box, Card, CardContent, Chip, Grid, LinearProgress,
  Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, useTheme, Avatar,
} from '@mui/material';
import { CalendarCheck, HardHat, DollarSign, Receipt, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { dashboardApi } from '../../../services/api/dashboard.api';
import { KpiCard, formatMoney } from '../components/DashboardShared';
import { useCrearGastoImprevisto } from '../../gastosImprevistos/hooks/useGastosImprevistos';
import { useFormasPagoList } from '../../pagos/hooks/useFormasPago';
import { useNotify } from '../../../shared/hooks/useNotify';
import { BotGastoImprevisto } from '../../gastosImprevistos/components/BotGastosImprevisto';

const PROGRESO_MAP: Record<string, number> = {
  'Planificada': 0, 'Labor en proceso': 25,
  'Avanzada': 50, 'Muy avanzada': 75, 'Finalizada': 100,
};

const PROGRESO_COLOR: Record<string, string> = {
  'Planificada': '#94A3B8', 'Labor en proceso': '#EA580C',
  'Avanzada': '#F59E0B', 'Muy avanzada': '#2563EB', 'Finalizada': '#16A34A',
};

export const DashboardTrabajadorPage: React.FC = () => {
  const { t }    = useTranslation();
  const theme    = useTheme();
  const navigate = useNavigate();
  const notify   = useNotify();

  const { data, isLoading } = useQuery({
    queryKey:        ['dashboard-trabajador'],
    queryFn:         dashboardApi.getTrabajador,
    refetchInterval: 60000,
  });

  const { data: formasPago = [] } = useFormasPagoList();
  const crearGastoMutation        = useCrearGastoImprevisto();

  if (isLoading) return <LoadingState message={t('dashboard.loading_worker')} />;
  if (!data)     return null;

  const { trabajador, obra_actual, kpis, labores, dias_asistencia, ultimos_pagos, mes_actual } = data;

  const trabajadorId = trabajador.id;
  const equipo: { id: number; nombre: string; apellido: string }[] = trabajador.equipo ?? [];

  // Obras disponibles extraídas de las labores activas
  const obrasDisponibles = Array.from(
    new Map(
      labores
        .filter((l: any) => l.obra_id && l.obra_nombre)
        .map((l: any) => [l.obra_id, { id: l.obra_id, nombre: l.obra_nombre }])
    ).values()
  );

  // ── Calendario ───────────────────────────────────────────────
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

      {/* ── Header trabajador ── */}
      <Card elevation={0} sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
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
                  {obra_actual.obra_nombre}{obra_actual.rol_en_obra && ` · ${obra_actual.rol_en_obra}`}
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

      {/* ── KPIs ── */}
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

      {/* ── Bot registrar gasto ── */}
      <Box sx={{ width: '100%' }}>
        <BotGastoImprevisto
          obras={obrasDisponibles as any[]}
          especialidades={
            trabajador.especialidad_id
              ? [{ id: trabajador.especialidad_id, nombre: (trabajador as any).especialidad_nombre ?? 'Mi especialidad' }]
              : []
          }
          formasPago={formasPago as any[]}
          trabajadores={[
            { id: trabajadorId, nombre: trabajador.nombre, apellido: trabajador.apellido },
            ...equipo,
          ]}
          onConfirmar={async (payload) => {
            await crearGastoMutation.mutateAsync(payload as any);
            notify.success('Gasto registrado correctamente');
          }}
          isSubmitting={crearGastoMutation.isPending}
        />
      </Box>

      <Grid container spacing={2}>

        {/* ── Calendario ── */}
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
                  const str     = diaStr(d);
                  const hoy     = new Date().toISOString().split('T')[0];
                  const finde   = esFinDeSemana(d);
                  const marcado = dias_asistencia.includes(str);
                  const esHoy   = str === hoy;
                  const futuro  = str > hoy;

                  let bg    = theme.palette.action.hover;
                  let color = theme.palette.text.disabled;
                  if (finde)        { bg = 'transparent'; }
                  else if (futuro)  { bg = theme.palette.action.hover; }
                  else if (marcado) { bg = '#DCFCE7'; color = '#15803D'; }
                  else              { bg = '#FEE2E2'; color = '#DC2626'; }

                  return (
                    <Box key={`dia-${d}`} sx={{
                      height: 32, borderRadius: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: bg, border: esHoy ? '2px solid #F59E0B' : 'none',
                    }}>
                      <Typography sx={{ fontSize: 12, fontWeight: esHoy ? 800 : 500, color }}>{d}</Typography>
                    </Box>
                  );
                })}
              </Box>

              <Stack direction="row" gap={2} mt={1.5}>
                {(['presente', 'ausente', 'futuro'] as const).map((key) => {
                  const cfg = {
                    presente: { bg: '#DCFCE7' },
                    ausente:  { bg: '#FEE2E2' },
                    futuro:   { bg: theme.palette.action.hover },
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

        {/* ── Mis labores ── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <Award size={16} color="#3B82F6" />
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t('dashboard.worker.mis_labores')}</Typography>
              </Stack>
              {labores.length === 0 ? (
                <Typography sx={{ fontSize: 14, color: 'text.disabled', textAlign: 'center', py: 3 }}>
                  {t('dashboard.worker.sin_labores')}
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {labores.slice(0, 5).map((l: any) => {
                    const pct   = PROGRESO_MAP[l.estado_nombre] ?? 0;
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
                          <Chip label={l.estado_nombre} size="small"
                            sx={{ fontSize: 11, fontWeight: 700, height: 22, bgcolor: `${color}18`, color }} />
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

        {/* ── Últimos pagos ── */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <DollarSign size={16} color="#10B981" />
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t('dashboard.worker.ultimos_pagos')}</Typography>
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
                    {ultimos_pagos.map((p: any) => (
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
                          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                            {p.forma_pago_nombre ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={p.estado} size="small" sx={{
                            fontSize: 11, fontWeight: 700, height: 20,
                            bgcolor: p.estado === 'Pagado'   ? '#DCFCE7'
                                   : p.estado === 'Pendiente' ? '#FEF9C3' : '#FEE2E2',
                            color:   p.estado === 'Pagado'   ? '#15803D'
                                   : p.estado === 'Pendiente' ? '#854D0E' : '#DC2626',
                          }} />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
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
};