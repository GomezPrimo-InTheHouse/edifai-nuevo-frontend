

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Divider, Grid,
  MenuItem, Stack, TextField, Typography, CircularProgress, useTheme,
} from '@mui/material';
import { ArrowLeft, Calendar, FileText, Pencil, DollarSign, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { PresupuestoEstadoChip } from '../components/PresupuestoEstadoChip';
import { MaterialesPresupuesto } from '../components/MaterialesPresupuesto';
import { usePresupuestoDetail, useCambiarEstadoPresupuesto } from '../hooks/usePresupuestos';
import { useLaboresList } from '../../labores/hooks/useLabores';
import { useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';
import { useNotify } from '../../../shared/hooks/useNotify';
import type { PresupuestoMiembro } from '../types/presupuesto.types';
import { presupuestoMaterialApi } from '../../../services/api/presupuestoMaterial.api';
import { generarPdfPresupuesto } from '../../../services/pdf/presupuestoPdf';

function formatDate(v?: string | null) {
  if (!v) return '-';
  return new Date(v).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Box sx={{ color: 'text.disabled', mt: 0.3 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>{label}</Typography>
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>{value}</Typography>
      </Box>
    </Box>
  );
}

export const PresupuestoDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const presupuestoId = Number(id);
  const notify = useNotify();
  const [exportando, setExportando] = useState(false);

  const { data: presupuesto, isLoading, isError, refetch } = usePresupuestoDetail(presupuestoId);
  const { data: labores = [] } = useLaboresList();
  const { data: todosEstados = [] } = useEstadosGenerales();
  const estados = todosEstados.filter((e) => e.ambito === 'presupuesto');
  const cambiarEstadoMutation = useCambiarEstadoPresupuesto();

  if (isLoading) return <LoadingState message={t('presupuestos.detail.loading')} />;
  if (isError) return <ErrorState title="Error" message={t('presupuestos.detail.error')} onRetry={refetch} />;
  if (!presupuesto) return <ErrorState title={t('presupuestos.detail.no_encontrado')} message={t('presupuestos.detail.no_encontrado_msg')} />;

  const laborNombre = labores.find((l) => l.id === presupuesto.labor_id)?.nombre ?? '-';
  const estadoNombre = estados.find((e) => e.id === presupuesto.estado_id)?.nombre;
  const confirmado = estadoNombre === 'Confirmado';

  const costoManoObra = Number(presupuesto.costo_mano_obra ?? 0);
  const totalEstimado = Number(presupuesto.total_estimado ?? 0);
  const costoMateriales = Math.max(0, totalEstimado - costoManoObra);

  const handleCambiarEstado = async (estado_id: number) => {
    const nuevoEstado = estados.find((e) => e.id === estado_id)?.nombre;
    const esConfirmar = nuevoEstado === 'Confirmado';
    const confirmed = await notify.confirm({
      title: esConfirmar ? t('presupuestos.detail.confirm_title') : t('presupuestos.detail.cambiar_estado_title'),
      message: esConfirmar ? t('presupuestos.detail.confirm_msg') : t('presupuestos.detail.cambiar_estado_msg'),
      confirmLabel: esConfirmar ? t('presupuestos.detail.confirm_btn') : t('presupuestos.detail.cambiar_btn'),
      severity: esConfirmar ? 'warning' : undefined,
    });
    if (!confirmed) return;
    try {
      await cambiarEstadoMutation.mutateAsync({ id: presupuestoId, estado_id });
      notify.success(t('presupuestos.detail.estado_actualizado'));
    } catch {
      notify.error(t('presupuestos.detail.error_estado'));
    }
  };

  const handleExportarPdf = async () => {
    setExportando(true);
    try {
      const materiales = await presupuestoMaterialApi.getByPresupuesto(presupuestoId);
      generarPdfPresupuesto(presupuesto, materiales);
    } catch {
      notify.error(t('presupuestos.notify.error_pdf'));
    } finally {
      setExportando(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title={presupuesto.nombre || `${t('presupuestos.item')} #${presupuesto.id}`}
        subtitle={t('presupuestos.detail.subtitle')}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/presupuestos')}>
              {t('presupuestos.acciones.volver')}
            </Button>
            <Button
              variant="outlined"
              startIcon={exportando ? <CircularProgress size={16} /> : <Download size={16} />}
              onClick={handleExportarPdf}
              disabled={exportando}
            >
              {exportando ? t('presupuestos.exportando') : t('presupuestos.exportar_pdf')}
            </Button>
            {!confirmado && (
              <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => navigate(`/presupuestos/${presupuesto.id}/editar`)}>
                {t('presupuestos.acciones.editar')}
              </Button>
            )}
          </Stack>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3, mb: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{t('presupuestos.detail.info')}</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2.5}>
                <DetailRow icon={<FileText size={16} />} label={t('presupuestos.detail.labor')} value={laborNombre} />
                <DetailRow icon={<FileText size={16} />} label={t('presupuestos.detail.descripcion')} value={presupuesto.descripcion || '-'} />
                <DetailRow icon={<DollarSign size={16} />} label={t('presupuestos.detail.costo_mano_obra')} value={`$${costoManoObra.toLocaleString('es-AR')}`} />
                <DetailRow icon={<Calendar size={16} />} label={t('presupuestos.detail.creado')} value={formatDate(presupuesto.created_at)} />
                <DetailRow icon={<Calendar size={16} />} label={t('presupuestos.detail.actualizado')} value={formatDate(presupuesto.updated_at)} />
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <MaterialesPresupuesto presupuestoId={presupuestoId} confirmado={confirmado} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{t('presupuestos.detail.estado')}</Typography>
              <Divider sx={{ mb: 3 }} />
              <PresupuestoEstadoChip estadoNombre={estadoNombre} />

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                  {t('presupuestos.detail.cambiar_estado')}
                </Typography>
                <TextField
                  select fullWidth size="small"
                  value={presupuesto.estado_id ?? ''}
                  onChange={(e) => handleCambiarEstado(Number(e.target.value))}
                  disabled={cambiarEstadoMutation.isPending}
                >
                  {estados.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
                </TextField>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={700} sx={{ color: 'text.secondary' }}>
                  {t('presupuestos.detail.desglose')}
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">{t('presupuestos.detail.materiales')}</Typography>
                  <Typography variant="body2" fontWeight={600}>${costoMateriales.toLocaleString('es-AR')}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">{t('presupuestos.detail.mano_obra')}</Typography>
                  <Typography variant="body2" fontWeight={600}>${costoManoObra.toLocaleString('es-AR')}</Typography>
                </Stack>
              </Stack>

              {/* Total — siempre oscuro, intencional */}
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#0F172A', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                  {t('presupuestos.detail.total')}
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#FFFFFF' }}>
                  ${totalEstimado.toLocaleString('es-AR')}
                </Typography>
              </Box>

              {presupuesto.jefe_nombre && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="body2" fontWeight={700} sx={{ color: 'text.secondary', mb: 2 }}>
                    {t('presupuestos.detail.responsable')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: '50%',
                      bgcolor: '#0F172A', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#fff' }}>
                        {presupuesto.jefe_nombre[0]}{presupuesto.jefe_apellido?.[0]}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {presupuesto.jefe_nombre} {presupuesto.jefe_apellido}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {presupuesto.jefe_especialidad ?? t('presupuestos.detail.sin_especialidad')}
                      </Typography>
                    </Box>
                  </Box>

                  {(presupuesto.equipo?.length ?? 0) > 0 && (
                    <>
                      <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                        {t('presupuestos.detail.equipo')} ({presupuesto.equipo?.length})
                      </Typography>
                      <Stack spacing={1}>
                        {presupuesto.equipo?.map((miembro: PresupuestoMiembro) => (
                          <Box key={miembro.id} sx={{
                            display: 'flex', alignItems: 'center', gap: 1,
                            p: 1, borderRadius: 2,
                            bgcolor: theme.palette.action.hover,
                          }}>
                            <Box sx={{
                              width: 28, height: 28, borderRadius: '50%',
                              bgcolor: theme.palette.divider,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <Typography variant="caption" fontWeight={700} color="text.secondary">
                                {miembro.nombre[0]}{miembro.apellido?.[0]}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.2 }}>
                                {miembro.nombre} {miembro.apellido}
                              </Typography>
                              <Typography variant="caption" color="text.disabled">
                                {miembro.especialidad ?? '-'}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </>
                  )}

                  {presupuesto.obra_nombre && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <DetailRow icon={<FileText size={16} />} label={t('presupuestos.detail.obra')} value={presupuesto.obra_nombre} />
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
};