import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar, Box, Button, Card, CardContent, Chip, Divider, Grid,
  IconButton, Paper, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography, useTheme,
} from '@mui/material';
import { Eye, Pencil, Plus, Settings, Trash2, Clock, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { EspecialidadModal } from '../components/EspecialidadModal';
import { useDeleteTrabajador, useTrabajadoresList } from '../hooks/useTrabajadores';
import { useEspecialidadesList } from '../hooks/useEspecialidades';
import { useLaboresList } from '../../labores/hooks/useLabores';
import { usePagosList } from '../../pagos/hooks/usePagos';
import { PagoEstadoChip } from '../../pagos/components/PagoEstadoChip';
import { useNotify } from '../../../shared/hooks/useNotify';

const PIE_COLORS = ['#F59E0B', '#0F172A', '#2563EB', '#16A34A', '#EA580C', '#7C3AED', '#DB2777'];

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const TrabajadoresListPage = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const theme = useTheme();
  const { t } = useTranslation();

  const { data, isLoading, isError, refetch } = useTrabajadoresList();
  const { data: especialidades = [] } = useEspecialidadesList();
  const { data: labores = [] } = useLaboresList();
  const { data: pagos = [] } = usePagosList();
  const deleteMutation = useDeleteTrabajador();
  const [search, setSearch] = useState('');
  const [especialidadModalOpen, setEspecialidadModalOpen] = useState(false);

  const handleDelete = async (id: number) => {
    const confirmed = await notify.confirm({
      title: t('trabajadores.confirm.eliminar_title'),
      message: t('trabajadores.confirm.eliminar_msg'),
      confirmLabel: t('trabajadores.confirm.eliminar_btn'),
      cancelLabel: t('trabajadores.confirm.cancelar'),
      severity: 'error',
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(id);
      notify.success(t('trabajadores.notify.eliminado'));
    } catch (error: any) {
      const mensaje = error?.response?.data?.message || error?.response?.data?.error || t('trabajadores.notify.error_eliminar');
      notify.error(mensaje);
    }
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((t) =>
      t.nombre?.toLowerCase().includes(term) ||
      t.apellido?.toLowerCase().includes(term) ||
      t.dni?.toLowerCase().includes(term)
    );
  }, [data, search]);

  const getEspecialidadNombre = (id?: number | null) =>
    especialidades.find((e) => e.id === id)?.nombre ?? '-';

  const ultimoAgregado = useMemo(() => {
    if (!data || data.length === 0) return null;
    return [...data].sort((a, b) =>
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    )[0];
  }, [data]);

  const ultimoModificado = useMemo(() => {
    if (!data || data.length === 0) return null;
    return [...data].sort((a, b) =>
      new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime()
    )[0];
  }, [data]);

  const dataTorta = useMemo(() => {
    if (!data || !especialidades.length) return [];
    const conteo: Record<string, number> = {};
    data.forEach((t) => {
      const nombre = getEspecialidadNombre(t.especialidad_id);
      conteo[nombre] = (conteo[nombre] ?? 0) + 1;
    });
    return Object.entries(conteo).map(([nombre, value]) => ({ nombre, value }));
  }, [data, especialidades]);

  const trabajadoresConMasLabores = useMemo(() => {
    if (!data || !labores.length) return [];
    const conteo: Record<number, number> = {};
    labores.forEach((l) => {
      if (l.trabajador_id) conteo[l.trabajador_id] = (conteo[l.trabajador_id] ?? 0) + 1;
    });
    return [...data]
      .filter((t) => conteo[t.id])
      .sort((a, b) => (conteo[b.id] ?? 0) - (conteo[a.id] ?? 0))
      .slice(0, 5)
      .map((t) => ({ ...t, totalLabores: conteo[t.id] ?? 0 }));
  }, [data, labores]);

  const ultimosPagos = useMemo(() => {
    return [...pagos]
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 5);
  }, [pagos]);

  return (
    <AppLayout>
      <PageHeader
        title={
          <Typography variant="inherit" sx={{ fontSize: { xs: '1.25rem', md: '1.75rem' }, fontWeight: 700 }}>
            {t('trabajadores.title')}
          </Typography>
        }
        subtitle={t('trabajadores.subtitle')}
        actions={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined" size="small"
              startIcon={<Settings size={16} />}
              onClick={() => setEspecialidadModalOpen(true)}
              sx={{ fontSize: { xs: '0.7rem', md: '0.8125rem' }, px: { xs: 1, md: 2 } }}
            >
              {t('trabajadores.especialidades')}
            </Button>
            <Button
              variant="contained" size="small"
              startIcon={<Plus size={16} />}
              onClick={() => navigate('/trabajadores/nuevo')}
              sx={{ fontSize: { xs: '0.7rem', md: '0.8125rem' }, px: { xs: 1, md: 2 }, whiteSpace: 'nowrap' }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{t('trabajadores.nuevo')}</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>{t('trabajadores.nuevo_corto')}</Box>
            </Button>
          </Stack>
        }
      />

      <Paper sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <TextField fullWidth label={t('trabajadores.buscar')} value={search} onChange={(e) => setSearch(e.target.value)} />
      </Paper>

      {isLoading && <LoadingState message={t('trabajadores.loading')} />}
      {isError && <ErrorState title={t('trabajadores.error_title')} message={t('trabajadores.error')} onRetry={refetch} />}

      {!isLoading && !isError && filteredData.length === 0 && (
        <EmptyState
          title={t('trabajadores.empty.title')}
          description={t('trabajadores.empty.desc')}
          action={<Button variant="contained" onClick={() => navigate('/trabajadores/nuevo')}>{t('trabajadores.empty.crear')}</Button>}
        />
      )}

      {!isLoading && !isError && filteredData.length > 0 && (
        <>
          {/* ESCRITORIO */}
          <Paper sx={{
            display: { xs: 'none', md: 'block' }, borderRadius: 3, overflow: 'hidden', mb: 3,
            bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none',
          }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{t('trabajadores.tabla.nombre')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('trabajadores.tabla.dni')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('trabajadores.tabla.especialidad')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('trabajadores.tabla.telefono')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{t('trabajadores.tabla.acciones')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell><Typography fontWeight={600}>{t.nombre} {t.apellido}</Typography></TableCell>
                    <TableCell>{t.dni}</TableCell>
                    <TableCell>{getEspecialidadNombre(t.especialidad_id)}</TableCell>
                    <TableCell>{t.telefono || '-'}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <IconButton size="small" onClick={() => navigate(`/trabajadores/${t.id}`)}><Eye size={18} /></IconButton>
                        <IconButton size="small" onClick={() => navigate(`/trabajadores/${t.id}/editar`)}><Pencil size={18} /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(t.id)} disabled={deleteMutation.isPending}><Trash2 size={18} /></IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          {/* MÓVIL */}
          <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' }, mb: 3 }}>
            {filteredData.map((trabajador) => (
              <Paper key={trabajador.id} sx={{
                p: 2, borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                boxShadow: 'none',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1rem', textTransform: 'capitalize' }}>
                      {trabajador.nombre} {trabajador.apellido}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">DNI: {trabajador.dni}</Typography>
                  </Box>
                  <Chip
                    label={getEspecialidadNombre(trabajador.especialidad_id)}
                    size="small"
                    sx={{ bgcolor: theme.palette.action.hover, color: 'text.secondary', fontWeight: 600 }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>{t('trabajadores.tabla.telefono')}:</strong> {trabajador.telefono || '-'}
                </Typography>

                <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                <Stack direction="row" spacing={2} justifyContent="space-around">
                  <Button fullWidth size="small" startIcon={<Eye size={16} />} onClick={() => navigate(`/trabajadores/${trabajador.id}`)}>
                    {t('trabajadores.acciones.ver')}
                  </Button>
                  <Button fullWidth size="small" startIcon={<Pencil size={16} />} onClick={() => navigate(`/trabajadores/${trabajador.id}/editar`)}>
                    {t('trabajadores.acciones.editar')}
                  </Button>
                  <Button fullWidth size="small" color="error" startIcon={<Trash2 size={16} />} onClick={() => handleDelete(trabajador.id)}>
                    {t('trabajadores.acciones.eliminar')}
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <>
          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', letterSpacing: '0.08em' }}>
              {t('trabajadores.stats.titulo')}
            </Typography>
          </Divider>

          <Grid container spacing={3}>
            {/* Actividad reciente */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3, height: '100%', bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
                    {t('trabajadores.stats.actividad')}
                  </Typography>
                  <Stack spacing={2}>
                    {ultimoAgregado && (
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}` }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(245,158,11,0.1)' }}>
                            <Plus size={16} color="#F59E0B" />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                              {t('trabajadores.stats.ultimo_agregado')}
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>{ultimoAgregado.nombre} {ultimoAgregado.apellido}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(ultimoAgregado.created_at)} — {getEspecialidadNombre(ultimoAgregado.especialidad_id)}
                            </Typography>
                          </Box>
                          <IconButton size="small" onClick={() => navigate(`/trabajadores/${ultimoAgregado.id}`)}>
                            <Eye size={14} />
                          </IconButton>
                        </Stack>
                      </Box>
                    )}

                    {ultimoModificado && (
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}` }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(37,99,235,0.1)' }}>
                            <Clock size={16} color="#2563EB" />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                              {t('trabajadores.stats.ultimo_modificado')}
                            </Typography>
                            <Typography variant="body2" fontWeight={700}>{ultimoModificado.nombre} {ultimoModificado.apellido}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(ultimoModificado.updated_at)} — {getEspecialidadNombre(ultimoModificado.especialidad_id)}
                            </Typography>
                          </Box>
                          <IconButton size="small" onClick={() => navigate(`/trabajadores/${ultimoModificado.id}`)}>
                            <Eye size={14} />
                          </IconButton>
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Gráfico donut por especialidad */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3, height: '100%', bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
                    {t('trabajadores.stats.por_especialidad')}
                  </Typography>
                  {dataTorta.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">{t('trabajadores.stats.sin_datos')}</Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={dataTorta}
                          dataKey="value"
                          nameKey="nombre"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}
                        >
                          {dataTorta.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} ${t('trabajadores.stats.trabajadores_label')}`, '']}
                          contentStyle={{ borderRadius: 8, fontSize: 12, backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Trabajadores con más labores */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <TrendingUp size={16} color="#F59E0B" />
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'text.secondary' }}>
                      {t('trabajadores.stats.mas_labores')}
                    </Typography>
                  </Stack>
                  {trabajadoresConMasLabores.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">{t('trabajadores.stats.sin_datos')}</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {trabajadoresConMasLabores.map((trabajador, index) => (
                        <Stack key={trabajador.id} direction="row" spacing={1.5} alignItems="center"
                          sx={{
                            p: 1.5, borderRadius: 2,
                            bgcolor: theme.palette.action.hover,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: theme.palette.action.selected },
                          }}
                          onClick={() => navigate(`/trabajadores/${trabajador.id}`)}>
                          <Typography variant="body2" fontWeight={800} sx={{ color: '#F59E0B', minWidth: 20 }}>
                            #{index + 1}
                          </Typography>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#F59E0B', color: '#0F172A', fontSize: 12, fontWeight: 700 }}>
                            {trabajador.nombre[0]}{trabajador.apellido[0]}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>{trabajador.nombre} {trabajador.apellido}</Typography>
                            <Typography variant="caption" color="text.secondary">{getEspecialidadNombre(trabajador.especialidad_id)}</Typography>
                          </Box>
                          <Chip
                            label={`${trabajador.totalLabores} ${trabajador.totalLabores !== 1 ? t('trabajadores.stats.labores') : t('trabajadores.stats.labor')}`}
                            size="small"
                            sx={{ bgcolor: 'rgba(245,158,11,0.12)', color: '#B45309', fontWeight: 700, fontSize: 11 }}
                          />
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Últimos pagos */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'text.secondary' }}>
                      {t('trabajadores.stats.ultimos_pagos')}
                    </Typography>
                    <Button size="small" onClick={() => navigate('/pagos')} sx={{ fontSize: 11 }}>
                      {t('trabajadores.stats.ver_todos')}
                    </Button>
                  </Stack>
                  {ultimosPagos.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">{t('trabajadores.stats.sin_pagos')}</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {ultimosPagos.map((p) => (
                        <Stack key={p.id} direction="row" spacing={1.5} alignItems="center"
                          sx={{
                            p: 1.5, borderRadius: 2,
                            bgcolor: theme.palette.action.hover,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: theme.palette.action.selected },
                          }}
                          onClick={() => navigate(`/pagos/${p.id}`)}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {p.trabajador_nombre} {p.trabajador_apellido}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(p.fecha)} — {p.motivo || t('trabajadores.stats.sin_motivo')}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" fontWeight={700} color="text.primary">
                              ${Number(p.monto).toLocaleString('es-AR')}
                            </Typography>
                            <PagoEstadoChip estado={p.estado} />
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      <EspecialidadModal open={especialidadModalOpen} onClose={() => setEspecialidadModalOpen(false)} />
    </AppLayout>
  );
};