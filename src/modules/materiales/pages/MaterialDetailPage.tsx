
// import React from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import {
//   Box, Button, Card, CardContent, Divider,
//   Grid, Stack, Typography, Table, TableHead,
//   TableRow, TableCell, TableBody, Paper, useTheme,
// } from '@mui/material';
// import { ArrowLeft, Pencil, Package, DollarSign, TrendingUp, Calendar, Image } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
// import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
// import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
// import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
// import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
// import { StockBadge } from '../components/StockBadge';
// import { useMaterialDetail } from '../hooks/useMateriales';
// import { useHistorialByMaterial } from '../hooks/useHistorialIncrementos';
// import { useTiposMaterialList } from '../hooks/useTipoMaterial';

// function formatDate(value?: string | null): string {
//   if (!value) return '-';
//   return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
// }

// function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
//   return (
//     <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
//       <Box sx={{ color: 'text.disabled', mt: 0.3 }}>{icon}</Box>
//       <Box>
//         <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>{label}</Typography>
//         <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>{value}</Typography>
//       </Box>
//     </Box>
//   );
// }

// export const MaterialDetailPage: React.FC = () => {
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const { t } = useTranslation();
//   const { id } = useParams<{ id: string }>();
//   const materialId = Number(id);

//   const { data: material, isLoading, isError, refetch } = useMaterialDetail(materialId);
//   const { data: historial = [] } = useHistorialByMaterial(materialId);
//   const { data: tipos = [] } = useTiposMaterialList();

//   if (isLoading) return <LoadingState message={t('materiales.detail.loading')} />;
//   if (isError) return <ErrorState title="Error" message={t('materiales.detail.error')} onRetry={refetch} />;
//   if (!material) return <ErrorState title={t('materiales.detail.no_encontrado')} message={t('materiales.detail.no_encontrado_msg')} />;

//   const tipoNombre = tipos.find((t) => t.id === material.tipo_material_id)?.nombre ?? '-';

//   return (
//     <AppLayout>
//       <PageHeader
//         title={material.nombre}
//         subtitle={t('materiales.detail.subtitle')}
//         actions={
//           <Stack direction="row" spacing={1}>
//             <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/materiales')}>
//               {t('materiales.acciones.volver')}
//             </Button>
//             <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => navigate(`/materiales/${material.id}/editar`)}>
//               {t('materiales.acciones.editar')}
//             </Button>
//           </Stack>
//         }
//       />

//       <Grid container spacing={3}>
//         <Grid size={{ xs: 12, md: 8 }}>
//           <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
//             <CardContent sx={{ p: 3 }}>
//               <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{t('materiales.detail.info')}</Typography>
//               <Divider sx={{ mb: 3 }} />
//               <Stack spacing={2.5}>
//                 <DetailRow icon={<Package size={16} />} label={t('materiales.detail.tipo')} value={tipoNombre} />
//                 <DetailRow icon={<Package size={16} />} label={t('materiales.detail.descripcion')} value={material.descripcion || '-'} />
//                 <DetailRow icon={<Package size={16} />} label={t('materiales.detail.unidad')} value={material.unidad} />
//                 {material.imagen_url && (
//                   <DetailRow icon={<Image size={16} />} label={t('materiales.detail.imagen')} value={material.imagen_url} />
//                 )}
//               </Stack>

//               <Divider sx={{ my: 3 }} />
//               <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
//                 {t('materiales.detail.stock_precios')}
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid size={{ xs: 6 }}>
//                   <DetailRow icon={<Package size={16} />} label={t('materiales.detail.stock_actual')} value={`${material.stock_actual} ${material.unidad}`} />
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   <DetailRow icon={<DollarSign size={16} />} label={t('materiales.detail.precio_unit')} value={`$${Number(material.precio_unitario).toLocaleString('es-AR')}`} />
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   <DetailRow icon={<TrendingUp size={16} />} label={t('materiales.detail.aumento_mensual')} value={material.porcentaje_aumento_mensual ? `${material.porcentaje_aumento_mensual}%` : '-'} />
//                 </Grid>
//               </Grid>
//             </CardContent>
//           </Card>

//           {historial.length > 0 && (
//             <Card sx={{ borderRadius: 3, mt: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
//               <CardContent sx={{ p: 3 }}>
//                 <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{t('materiales.detail.historial')}</Typography>
//                 <Divider sx={{ mb: 2 }} />
//                 <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
//                   <Table size="small">
//                     <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
//                       <TableRow>
//                         <TableCell>{t('materiales.historial.fecha')}</TableCell>
//                         <TableCell>{t('materiales.historial.precio_anterior')}</TableCell>
//                         <TableCell>{t('materiales.historial.precio_nuevo')}</TableCell>
//                         <TableCell>{t('materiales.historial.porcentaje')}</TableCell>
//                         <TableCell>{t('materiales.historial.motivo')}</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {historial.map((h) => (
//                         <TableRow key={h.id}>
//                           <TableCell>{formatDate(h.created_at)}</TableCell>
//                           <TableCell>${Number(h.precio_anterior).toLocaleString('es-AR')}</TableCell>
//                           <TableCell>${Number(h.precio_nuevo).toLocaleString('es-AR')}</TableCell>
//                           <TableCell>{h.porcentaje_aplicado}%</TableCell>
//                           <TableCell>{h.motivo || '-'}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </Paper>
//               </CardContent>
//             </Card>
//           )}
//         </Grid>

//         <Grid size={{ xs: 12, md: 4 }}>
//           <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
//             <CardContent sx={{ p: 3 }}>
//               <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{t('materiales.detail.estado')}</Typography>
//               <Divider sx={{ mb: 3 }} />
//               <StockBadge stock={Number(material.stock_actual)} unidad={material.unidad} />
//               <Divider sx={{ my: 3 }} />
//               <Stack spacing={2}>
//                 <DetailRow icon={<Calendar size={16} />} label={t('materiales.detail.creado')} value={formatDate(material.created_at)} />
//                 <DetailRow icon={<Calendar size={16} />} label={t('materiales.detail.actualizado')} value={formatDate(material.updated_at)} />
//               </Stack>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     </AppLayout>
//   );
// };

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Chip, Divider,
  Grid, Stack, Typography, Paper, useMediaQuery, useTheme,
} from '@mui/material';
import { ArrowLeft, Pencil, Package, DollarSign, TrendingUp, Calendar, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '../../../layouts/AppLayout/AppLayout';
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader';
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState';
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState';
import { StockBadge } from '../components/StockBadge';
import { useMaterialDetail } from '../hooks/useMateriales';
import { useHistorialByMaterial } from '../hooks/useHistorialIncrementos';
import { useTiposMaterialList } from '../hooks/useTipoMaterial';

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

export const MaterialDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id } = useParams<{ id: string }>();
  const materialId = Number(id);

  const { data: material, isLoading, isError, refetch } = useMaterialDetail(materialId);
  const { data: historial = [] } = useHistorialByMaterial(materialId);
  const { data: tipos = [] } = useTiposMaterialList();

  if (isLoading) return <LoadingState message={t('materiales.detail.loading')} />;
  if (isError) return <ErrorState title="Error" message={t('materiales.detail.error')} onRetry={refetch} />;
  if (!material) return <ErrorState title={t('materiales.detail.no_encontrado')} message={t('materiales.detail.no_encontrado_msg')} />;

  const tipoNombre = tipos.find((tp) => tp.id === material.tipo_material_id)?.nombre ?? '-';

  return (
    <AppLayout>
      <PageHeader
        title={material.nombre}
        subtitle={t('materiales.detail.subtitle')}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/materiales')}>
              {t('materiales.acciones.volver')}
            </Button>
            <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => navigate(`/materiales/${material.id}/editar`)}>
              {t('materiales.acciones.editar')}
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{t('materiales.detail.info')}</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2.5}>
                <DetailRow icon={<Package size={16} />} label={t('materiales.detail.tipo')} value={tipoNombre} />
                <DetailRow icon={<Package size={16} />} label={t('materiales.detail.descripcion')} value={material.descripcion || '-'} />
                <DetailRow icon={<Package size={16} />} label={t('materiales.detail.unidad')} value={material.unidad} />
                {material.imagen_url && (
                  <DetailRow icon={<Image size={16} />} label={t('materiales.detail.imagen')} value={material.imagen_url} />
                )}
              </Stack>

              <Divider sx={{ my: 3 }} />
              <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
                {t('materiales.detail.stock_precios')}
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <DetailRow icon={<Package size={16} />} label={t('materiales.detail.stock_actual')} value={`${material.stock_actual} ${material.unidad}`} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <DetailRow icon={<DollarSign size={16} />} label={t('materiales.detail.precio_unit')} value={`$${Number(material.precio_unitario).toLocaleString('es-AR')}`} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <DetailRow icon={<TrendingUp size={16} />} label={t('materiales.detail.aumento_mensual')} value={material.porcentaje_aumento_mensual ? `${material.porcentaje_aumento_mensual}%` : '-'} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Historial de precios */}
          {historial.length > 0 && (
            <Card sx={{ borderRadius: 3, mt: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{t('materiales.detail.historial')}</Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Mobile — cards */}
                {isMobile ? (
                  <Stack spacing={1.5}>
                    {historial.map((h) => (
                      <Box key={h.id} sx={{
                        p: 2, borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.action.hover,
                      }}>
                        {/* Fecha */}
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1 }}>
                          {formatDate(h.created_at)}
                        </Typography>

                        {/* Precios */}
                        <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
                          <Box sx={{ flex: 1, p: 1.25, borderRadius: 1.5, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {t('materiales.historial.precio_anterior')}
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="text.primary">
                              ${Number(h.precio_anterior).toLocaleString('es-AR')}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, p: 1.25, borderRadius: 1.5, bgcolor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {t('materiales.historial.precio_nuevo')}
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color="#F59E0B">
                              ${Number(h.precio_nuevo).toLocaleString('es-AR')}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Porcentaje + motivo */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Chip
                            label={`+${h.porcentaje_aplicado}%`}
                            size="small"
                            sx={{ bgcolor: 'rgba(245,158,11,0.12)', color: '#F59E0B', fontWeight: 700, fontSize: 11 }}
                          />
                          {h.motivo && (
                            <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 160, textAlign: 'right' }}>
                              {h.motivo}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  /* Desktop — tabla */
                  <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                      <Box component="thead" sx={{ bgcolor: theme.palette.action.hover }}>
                        <Box component="tr">
                          {[
                            t('materiales.historial.fecha'),
                            t('materiales.historial.precio_anterior'),
                            t('materiales.historial.precio_nuevo'),
                            t('materiales.historial.porcentaje'),
                            t('materiales.historial.motivo'),
                          ].map((col) => (
                            <Box component="th" key={col} sx={{
                              p: 1.5, textAlign: 'left', fontSize: 12,
                              fontWeight: 700, color: theme.palette.text.secondary,
                              borderBottom: `1px solid ${theme.palette.divider}`,
                            }}>
                              {col}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {historial.map((h) => (
                          <Box component="tr" key={h.id} sx={{
                            '&:hover': { bgcolor: theme.palette.action.hover },
                            '&:not(:last-child) td, &:not(:last-child) th': { borderBottom: `1px solid ${theme.palette.divider}` },
                          }}>
                            <Box component="td" sx={{ p: 1.5, fontSize: 13 }}>{formatDate(h.created_at)}</Box>
                            <Box component="td" sx={{ p: 1.5, fontSize: 13 }}>${Number(h.precio_anterior).toLocaleString('es-AR')}</Box>
                            <Box component="td" sx={{ p: 1.5, fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>${Number(h.precio_nuevo).toLocaleString('es-AR')}</Box>
                            <Box component="td" sx={{ p: 1.5 }}>
                              <Chip label={`+${h.porcentaje_aplicado}%`} size="small"
                                sx={{ bgcolor: 'rgba(245,158,11,0.12)', color: '#F59E0B', fontWeight: 700 }} />
                            </Box>
                            <Box component="td" sx={{ p: 1.5, fontSize: 13, color: theme.palette.text.secondary }}>{h.motivo || '-'}</Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Paper>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{t('materiales.detail.estado')}</Typography>
              <Divider sx={{ mb: 3 }} />
              <StockBadge stock={Number(material.stock_actual)} unidad={material.unidad} />
              <Divider sx={{ my: 3 }} />
              <Stack spacing={2}>
                <DetailRow icon={<Calendar size={16} />} label={t('materiales.detail.creado')} value={formatDate(material.created_at)} />
                <DetailRow icon={<Calendar size={16} />} label={t('materiales.detail.actualizado')} value={formatDate(material.updated_at)} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
};