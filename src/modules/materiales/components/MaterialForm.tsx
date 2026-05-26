// import { useEffect, useRef, useState } from 'react';
// import {
//   Box, Button, Grid, MenuItem, Paper, Stack,
//   TextField, Typography, CircularProgress, IconButton,
// } from '@mui/material';
// import { Camera, ImagePlus, X } from 'lucide-react';
// import { Controller, useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { materialSchema, type MaterialSchemaValues } from '../schemas/material.schema';
// import type { Material, MaterialFormValues } from '../types/material.types';
// import { useTiposMaterialList } from '../hooks/useTipoMaterial';
// import { useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';
// import { materialApi } from '../../../services/api/material.api';

// interface MaterialFormProps {
//   initialData?: Material | null;
//   onSubmit: (values: MaterialFormValues) => void | Promise<void>;
//   isSubmitting?: boolean;
// }

// const UNIDADES = ['unidad', 'kg', 'g', 'litro', 'ml', 'metro', 'cm', 'mm', 'm²', 'm³', 'bolsa', 'barra', 'rollo', 'caja'];

// function toFormDefaults(initialData?: Material | null): MaterialFormValues {
//   return {
//     nombre: initialData?.nombre ?? '',
//     descripcion: initialData?.descripcion ?? '',
//     tipo_material_id: initialData?.tipo_material_id ?? '',
//     unidad: initialData?.unidad ?? '',
//     stock_actual: initialData?.stock_actual !== undefined && initialData?.stock_actual !== null ? Number(initialData.stock_actual) : '',
//     precio_unitario: initialData?.precio_unitario !== undefined && initialData?.precio_unitario !== null ? Number(initialData.precio_unitario) : '',
//     porcentaje_aumento_mensual: initialData?.porcentaje_aumento_mensual !== undefined && initialData?.porcentaje_aumento_mensual !== null ? Number(initialData.porcentaje_aumento_mensual) : '',
//     estado_id: initialData?.estado_id ?? '',
//     imagen_url: initialData?.imagen_url ?? '',
//   };
// }

// export function MaterialForm({ initialData, onSubmit, isSubmitting = false }: MaterialFormProps) {
//   const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<MaterialSchemaValues>({
//     resolver: zodResolver(materialSchema),
//     defaultValues: toFormDefaults(initialData),
//   });

//   const { data: tipos = [] } = useTiposMaterialList();
//   const { data: todosEstados = [] } = useEstadosGenerales();
//   // const estados = todosEstados.filter((e) => e.ambito === 'gastos imprevistos' || e.ambito === 'material' || !e.ambito);
//   const estados = todosEstados.filter((e) => e.ambito === 'material');

//   const [uploading, setUploading] = useState(false);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imagen_url ?? null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const cameraInputRef = useRef<HTMLInputElement>(null);

//   // const imagenUrl = watch('imagen_url');

//   useEffect(() => {
//     if (tipos.length > 0) reset(toFormDefaults(initialData));
//   }, [initialData, tipos, reset]);

//   useEffect(() => {
//     if (initialData?.imagen_url) setPreviewUrl(initialData.imagen_url);
//   }, [initialData]);

//   const handleFileUpload = async (file: File) => {
//     if (!file) return;
//     setUploading(true);
//     try {
//       const url = await materialApi.uploadImagen(file);
//       setValue('imagen_url', url);
//       setPreviewUrl(url);
//     } catch (err) {
//       console.error('Error subiendo imagen:', err);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) handleFileUpload(file);
//   };

//   const handleRemoveImage = () => {
//     setValue('imagen_url', '');
//     setPreviewUrl(null);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//     if (cameraInputRef.current) cameraInputRef.current.value = '';
//   };

//   return (
//     <Paper sx={{ p: 3, borderRadius: 3 }}>
//       <Box component="form" onSubmit={handleSubmit((v) => onSubmit(v as unknown as MaterialFormValues))}>

//         {/* Información general */}
//         <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>INFORMACIÓN GENERAL</Typography>
//         <Grid container spacing={2}>
//           <Grid size={{ xs: 12, md: 6 }}>
//             <Controller name="nombre" control={control} render={({ field }) => (
//               <TextField {...field} fullWidth label="Nombre" error={!!errors.nombre} helperText={errors.nombre?.message ?? ''} />
//             )} />
//           </Grid>
//           <Grid size={{ xs: 12, md: 6 }}>
//             <Controller name="tipo_material_id" control={control} render={({ field }) => (
//               <TextField select fullWidth label="Tipo de material" value={field.value} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}>
//                 <MenuItem value="">Sin tipo</MenuItem>
//                 {tipos.map((t) => <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>)}
//               </TextField>
//             )} />
//           </Grid>
//           <Grid size={{ xs: 12 }}>
//             <Controller name="descripcion" control={control} render={({ field }) => (
//               <TextField {...field} fullWidth multiline minRows={3} label="Descripción" />
//             )} />
//           </Grid>
//           <Grid size={{ xs: 12, md: 6 }}>
//             <Controller name="estado_id" control={control} render={({ field }) => (
//               <TextField select fullWidth label="Estado" value={field.value} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} error={!!errors.estado_id} helperText={errors.estado_id?.message ?? ''}>
//                 <MenuItem value="">Seleccionar</MenuItem>
//                 {estados.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
//               </TextField>
//             )} />
//           </Grid>

//           {/* Imagen */}
//           <Grid size={{ xs: 12, md: 6 }}>
//             <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: '#64748B' }}>
//               IMAGEN DEL MATERIAL
//             </Typography>

//             {/* Preview */}
//             {previewUrl && (
//               <Box sx={{ position: 'relative', mb: 1.5, width: '100%', maxWidth: 200 }}>
//                 <Box
//                   component="img"
//                   src={previewUrl}
//                   alt="Preview"
//                   sx={{ width: '100%', borderRadius: 2, border: '1px solid #E2E8F0', objectFit: 'cover', aspectRatio: '1/1' }}
//                 />
//                 <IconButton
//                   size="small"
//                   onClick={handleRemoveImage}
//                   sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
//                 >
//                   <X size={14} />
//                 </IconButton>
//               </Box>
//             )}

//             {/* Botones de upload */}
//             {!previewUrl && (
//               <Stack direction="row" spacing={1}>
//                 {/* Galería */}
//                 <Button
//                   variant="outlined" size="small"
//                   startIcon={uploading ? <CircularProgress size={14} /> : <ImagePlus size={16} />}
//                   onClick={() => fileInputRef.current?.click()}
//                   disabled={uploading}
//                 >
//                   Galería
//                 </Button>

//                 {/* Cámara — solo en mobile */}
//                 <Button
//                   variant="outlined" size="small"
//                   startIcon={<Camera size={16} />}
//                   onClick={() => cameraInputRef.current?.click()}
//                   disabled={uploading}
//                   sx={{ display: { xs: 'flex', md: 'none' } }}
//                 >
//                   Cámara
//                 </Button>
//               </Stack>
//             )}

//             {/* Input galería */}
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/jpeg,image/png,image/webp"
//               style={{ display: 'none' }}
//               onChange={handleFileChange}
//             />

//             {/* Input cámara */}
//             <input
//               ref={cameraInputRef}
//               type="file"
//               accept="image/*"
//               capture="environment"
//               style={{ display: 'none' }}
//               onChange={handleFileChange}
//             />

//             {uploading && (
//               <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
//                 Subiendo imagen...
//               </Typography>
//             )}

//             {/* Campo oculto para imagen_url */}
//             <Controller name="imagen_url" control={control} render={({ field }) => (
//               <input type="hidden" {...field} />
//             )} />
//           </Grid>
//         </Grid>

//         {/* Stock y precios */}
//         <Typography variant="body2" fontWeight={700} sx={{ mt: 3, mb: 2, color: '#64748B' }}>STOCK Y PRECIOS</Typography>
//         <Grid container spacing={2}>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Controller name="unidad" control={control} render={({ field }) => (
//               <TextField select fullWidth label="Unidad de medida" value={field.value} onChange={(e) => field.onChange(e.target.value)} error={!!errors.unidad} helperText={errors.unidad?.message ?? ''}>
//                 <MenuItem value="">Seleccionar</MenuItem>
//                 {UNIDADES.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
//               </TextField>
//             )} />
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Controller name="stock_actual" control={control} render={({ field }) => (
//               <TextField {...field} fullWidth type="number" label="Stock actual" onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} error={!!errors.stock_actual} helperText={errors.stock_actual?.message ?? ''} />
//             )} />
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Controller name="precio_unitario" control={control} render={({ field }) => (
//               <TextField {...field} fullWidth type="number" label="Precio unitario ($)" onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} error={!!errors.precio_unitario} helperText={errors.precio_unitario?.message ?? ''} />
//             )} />
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <Controller name="porcentaje_aumento_mensual" control={control} render={({ field }) => (
//               <TextField {...field} fullWidth type="number" label="% aumento mensual estimado" onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
//             )} />
//           </Grid>
//         </Grid>

//         <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
//           <Button type="submit" variant="contained" disabled={isSubmitting || uploading}>
//             {isSubmitting ? 'Guardando...' : 'Guardar material'}
//           </Button>
//         </Stack>
//       </Box>
//     </Paper>
//   );
// }

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Divider,
  Grid, Stack, Typography, Table, TableHead,
  TableRow, TableCell, TableBody, Paper, useTheme,
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
  const { id } = useParams<{ id: string }>();
  const materialId = Number(id);

  const { data: material, isLoading, isError, refetch } = useMaterialDetail(materialId);
  const { data: historial = [] } = useHistorialByMaterial(materialId);
  const { data: tipos = [] } = useTiposMaterialList();

  if (isLoading) return <LoadingState message={t('materiales.detail.loading')} />;
  if (isError) return <ErrorState title="Error" message={t('materiales.detail.error')} onRetry={refetch} />;
  if (!material) return <ErrorState title={t('materiales.detail.no_encontrado')} message={t('materiales.detail.no_encontrado_msg')} />;

  const tipoNombre = tipos.find((t) => t.id === material.tipo_material_id)?.nombre ?? '-';

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

          {historial.length > 0 && (
            <Card sx={{ borderRadius: 3, mt: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{t('materiales.detail.historial')}</Typography>
                <Divider sx={{ mb: 2 }} />
                <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                      <TableRow>
                        <TableCell>{t('materiales.historial.fecha')}</TableCell>
                        <TableCell>{t('materiales.historial.precio_anterior')}</TableCell>
                        <TableCell>{t('materiales.historial.precio_nuevo')}</TableCell>
                        <TableCell>{t('materiales.historial.porcentaje')}</TableCell>
                        <TableCell>{t('materiales.historial.motivo')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historial.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell>{formatDate(h.created_at)}</TableCell>
                          <TableCell>${Number(h.precio_anterior).toLocaleString('es-AR')}</TableCell>
                          <TableCell>${Number(h.precio_nuevo).toLocaleString('es-AR')}</TableCell>
                          <TableCell>{h.porcentaje_aplicado}%</TableCell>
                          <TableCell>{h.motivo || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
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