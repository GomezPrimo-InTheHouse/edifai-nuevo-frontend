
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Chip, CircularProgress, Divider, IconButton, InputAdornment, MenuItem,
  Paper, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow,
  Tabs, TextField, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { Archive, Download, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState';
import { PresupuestoEstadoChip } from '../components/PresupuestoEstadoChip';
import { useDeletePresupuesto, usePresupuestosList, usePresupuestosArchivados } from '../hooks/usePresupuestos';
import { useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';
import { useNotify } from '../../../shared/hooks/useNotify';
import { presupuestoMaterialApi } from '../../../services/api/presupuestoMaterial.api';
import { generarPdfReporteFiltrado } from '../../../services/pdf/presupuestoPdf';
import { useLaboresList, useLaboresArchivadas } from '../../labores/hooks/useLabores';

export const PresupuestosListPage = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: laboresArchivadas = [] } = useLaboresArchivadas();

  const { data, isLoading, isError, refetch } = usePresupuestosList();
  const { data: presupuestosArchivados = [], isLoading: loadingArchivados } = usePresupuestosArchivados();
  const { data: labores = [] } = useLaboresList();
  const { data: todosEstados = [] } = useEstadosGenerales();
  const estados = todosEstados.filter((e) => e.ambito === 'presupuesto');
  const deleteMutation = useDeletePresupuesto();

  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [filtroObra, setFiltroObra] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroTrabajador, setFiltroTrabajador] = useState('');
  const [exportando, setExportando] = useState(false);

  const getLaborById = (id?: number | null) =>
    labores.find((l) => l.id === id) ?? laboresArchivadas.find((l) => l.id === id);
  const getEstadoNombre = (id?: number | null) => estados.find((e) => e.id === id)?.nombre;

  const obras = useMemo(() => {
    const seen = new Set<string>();
    return labores
      .filter((l) => l.obra_nombre && !seen.has(l.obra_nombre) && seen.add(l.obra_nombre))
      .map((l) => ({ id: l.obra_id, nombre: l.obra_nombre as string }));
  }, [labores]);

  const especialidades = useMemo(() => {
    const base = filtroObra ? labores.filter((l) => String(l.obra_id) === filtroObra) : labores;
    const seen = new Set<string>();
    return base
      .filter((l) => l.especialidad_nombre && !seen.has(l.especialidad_nombre) && seen.add(l.especialidad_nombre))
      .map((l) => l.especialidad_nombre as string);
  }, [labores, filtroObra]);

  const trabajadores = useMemo(() => {
    const seen = new Set<number>();
    return labores
      .filter((l) => l.trabajador_id && !seen.has(l.trabajador_id) && seen.add(l.trabajador_id))
      .map((l) => ({ id: l.trabajador_id as number, nombre: `${l.trabajador_nombre ?? ''} ${l.trabajador_apellido ?? ''}`.trim() }));
  }, [labores]);

  const applyFilters = (list: typeof data) => {
    if (!list) return [];
    return list.filter((p) => {
      const labor = getLaborById(p.labor_id);
      const termOk = !search.trim() || p.nombre?.toLowerCase().includes(search.trim().toLowerCase());
      const obraOk = !filtroObra || String(labor?.obra_id) === filtroObra;
      const espOk = !filtroEspecialidad || labor?.especialidad_nombre === filtroEspecialidad;
      const trabOk = !filtroTrabajador || String(labor?.trabajador_id) === filtroTrabajador;
      return termOk && obraOk && espOk && trabOk;
    });
  };

  const filteredData = useMemo(
    () => applyFilters(tab === 0 ? data : presupuestosArchivados),
    [tab, data, presupuestosArchivados, search, filtroObra, filtroEspecialidad, filtroTrabajador, labores]
  );

  const hayFiltros = search || filtroObra || filtroEspecialidad || filtroTrabajador;
  const limpiarFiltros = () => { setSearch(''); setFiltroObra(''); setFiltroEspecialidad(''); setFiltroTrabajador(''); };
  const handleTabChange = (_: any, v: number) => { setTab(v); limpiarFiltros(); };
  const isLoadingCurrent = tab === 0 ? isLoading : loadingArchivados;
  const isArchivado = tab === 1;

  const handleExportarPdf = async () => {
    if (filteredData.length === 0) return;
    setExportando(true);
    try {
      const materialesPorPresupuesto: Record<number, any[]> = {};
      await Promise.all(filteredData.map(async (p) => {
        try { materialesPorPresupuesto[p.id] = await presupuestoMaterialApi.getByPresupuesto(p.id); }
        catch { materialesPorPresupuesto[p.id] = []; }
      }));
      await generarPdfReporteFiltrado(filteredData, labores, materialesPorPresupuesto, getEstadoNombre);
    } catch {
      notify.error(t('presupuestos.notify.error_pdf'));
    } finally {
      setExportando(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await notify.confirm({
      title: t('presupuestos.confirm.eliminar_title'),
      message: t('presupuestos.confirm.eliminar_msg'),
      confirmLabel: t('presupuestos.confirm.eliminar_btn'),
      severity: 'error',
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(id);
      notify.success(t('presupuestos.notify.eliminado'));
    } catch (error: any) {
      notify.error(error?.response?.data?.message || t('presupuestos.notify.error_eliminar'));
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={t('presupuestos.title')}
        subtitle={t('presupuestos.subtitle')}

        actions={
          <Stack
            direction="column"
            spacing={1}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {!isArchivado && (
              <Button
                variant="contained"
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
                startIcon={<Plus size={16} />}
                onClick={() => navigate('/presupuestos/nuevo')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {t('presupuestos.nuevo')}
              </Button>
            )}
            {filteredData.length > 0 && (
              <Button
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
                startIcon={exportando ? <CircularProgress size={14} /> : <Download size={16} />}
                onClick={handleExportarPdf}
                disabled={exportando}
              >
                {exportando ? t('presupuestos.exportando') : t('presupuestos.exportar_pdf')}
              </Button>
            )}
          </Stack>
        }
      />

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label={`${t('presupuestos.tabs.activos')}${data ? ` (${data.length})` : ''}`} />
        <Tab
          label={`${t('presupuestos.tabs.archivados')}${presupuestosArchivados.length > 0 ? ` (${presupuestosArchivados.length})` : ''}`}
          icon={<Archive size={14} />}
          iconPosition="start"
        />
      </Tabs>

      <Paper sx={{ p: 2, borderRadius: 3, mb: 2, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <Stack spacing={1.5}>
          <TextField
            fullWidth size="small" label={t('presupuestos.buscar')}
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField select fullWidth size="small" label={t('presupuestos.filtro_obra')} value={filtroObra}
              onChange={(e) => { setFiltroObra(e.target.value); setFiltroEspecialidad(''); }}
            >
              <MenuItem value="">{t('presupuestos.todas_obras')}</MenuItem>
              {obras.map((o) => <MenuItem key={o.id} value={String(o.id)}>{o.nombre}</MenuItem>)}
            </TextField>
            <TextField select fullWidth size="small" label={t('presupuestos.filtro_especialidad')} value={filtroEspecialidad}
              onChange={(e) => setFiltroEspecialidad(e.target.value)}
            >
              <MenuItem value="">{t('presupuestos.todas')}</MenuItem>
              {especialidades.map((esp) => <MenuItem key={esp} value={esp}>{esp}</MenuItem>)}
            </TextField>
            <TextField select fullWidth size="small" label={t('presupuestos.filtro_trabajador')} value={filtroTrabajador}
              onChange={(e) => setFiltroTrabajador(e.target.value)}
            >
              <MenuItem value="">{t('presupuestos.todos')}</MenuItem>
              {trabajadores.map((t) => <MenuItem key={t.id} value={String(t.id)}>{t.nombre}</MenuItem>)}
            </TextField>
          </Stack>
          {hayFiltros && (
            <Box>
              <Chip label={t('presupuestos.limpiar_filtros')} size="small" onDelete={limpiarFiltros} onClick={limpiarFiltros} />
            </Box>
          )}
        </Stack>
      </Paper>

      {isLoadingCurrent && <LoadingState message={t('presupuestos.loading')} />}
      {isError && !isArchivado && <ErrorState title="Error" message={t('presupuestos.error')} onRetry={refetch} />}
      {!isLoadingCurrent && filteredData.length === 0 && (
        <EmptyState
          title={isArchivado ? t('presupuestos.empty.archivados') : t('presupuestos.empty.title')}
          description={
            isArchivado ? t('presupuestos.empty.archivados_desc') :
              hayFiltros ? t('presupuestos.empty.sin_resultados') : t('presupuestos.empty.desc')
          }
          action={!isArchivado && !hayFiltros
            ? <Button variant="contained" onClick={() => navigate('/presupuestos/nuevo')}>{t('presupuestos.empty.crear')}</Button>
            : undefined}
        />
      )}

      {/* Mobile */}
      {!isLoadingCurrent && filteredData.length > 0 && isMobile && (
        <Stack spacing={2}>
          {filteredData.map((p) => {
            const labor = getLaborById(p.labor_id);
            return (
              <Paper key={p.id} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper', opacity: isArchivado ? 0.8 : 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="primary">
                      {p.nombre || `${t('presupuestos.item')} #${p.id}`}
                    </Typography>
                    {isArchivado && <Chip label={t('presupuestos.archivado')} size="small" color="warning" variant="outlined" sx={{ mt: 0.5 }} />}
                  </Box>
                  <PresupuestoEstadoChip estadoNombre={getEstadoNombre(p.estado_id)} />
                </Box>
                <Stack spacing={0.5} sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary"><strong>{t('presupuestos.tabla.labor')}:</strong> {labor?.nombre ?? '-'}</Typography>
                  <Typography variant="body2" color="text.secondary"><strong>{t('presupuestos.tabla.obra')}:</strong> {labor?.obra_nombre ?? '-'}</Typography>
                  {labor?.especialidad_nombre && (
                    <Typography variant="body2" color="text.secondary"><strong>{t('presupuestos.tabla.especialidad')}:</strong> {labor.especialidad_nombre}</Typography>
                  )}
                  {(labor?.trabajador_nombre || labor?.trabajador_apellido) && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>{t('presupuestos.tabla.trabajador')}:</strong> {`${labor.trabajador_nombre ?? ''} ${labor.trabajador_apellido ?? ''}`.trim()}
                    </Typography>
                  )}
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    ${Number(p.total_estimado ?? 0).toLocaleString('es-AR')}
                  </Typography>
                </Stack>
                <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                  <Button size="small" startIcon={<Eye size={16} />} onClick={() => navigate(`/presupuestos/${p.id}`)}>
                    {t('presupuestos.acciones.ver')}
                  </Button>
                  {!isArchivado && (
                    <>
                      <Button size="small" startIcon={<Pencil size={16} />} onClick={() => navigate(`/presupuestos/${p.id}/editar`)}>
                        {t('presupuestos.acciones.editar')}
                      </Button>
                      <IconButton color="error" size="small" onClick={() => handleDelete(p.id)} disabled={deleteMutation.isPending}>
                        <Trash2 size={16} />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* Desktop */}
      {!isLoadingCurrent && filteredData.length > 0 && !isMobile && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>{t('presupuestos.tabla.nombre')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('presupuestos.tabla.labor')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('presupuestos.tabla.obra')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('presupuestos.tabla.especialidad')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('presupuestos.tabla.trabajador')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('presupuestos.tabla.total')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('presupuestos.tabla.estado')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>{t('presupuestos.tabla.acciones')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((p) => {
                const labor = getLaborById(p.labor_id);
                return (
                  <TableRow key={p.id} hover sx={{ opacity: isArchivado ? 0.8 : 1 }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{p.nombre || `${t('presupuestos.item')} #${p.id}`}</Typography>
                        {isArchivado && <Chip label={t('presupuestos.archivado')} size="small" color="warning" variant="outlined" />}
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2">{labor?.nombre ?? '-'}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{labor?.obra_nombre ?? '-'}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{labor?.especialidad_nombre ?? '-'}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {labor?.trabajador_nombre ? `${labor.trabajador_nombre} ${labor.trabajador_apellido ?? ''}`.trim() : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2">${Number(p.total_estimado ?? 0).toLocaleString('es-AR')}</Typography></TableCell>
                    <TableCell><PresupuestoEstadoChip estadoNombre={getEstadoNombre(p.estado_id)} /></TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                        <IconButton size="small" onClick={() => navigate(`/presupuestos/${p.id}`)}><Eye size={18} /></IconButton>
                        {!isArchivado && (
                          <>
                            <IconButton size="small" onClick={() => navigate(`/presupuestos/${p.id}/editar`)}><Pencil size={18} /></IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete(p.id)} disabled={deleteMutation.isPending}><Trash2 size={18} /></IconButton>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </AppLayout>
  );
};