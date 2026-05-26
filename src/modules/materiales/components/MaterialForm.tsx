import { useEffect, useRef, useState } from 'react';
import {
  Box, Button, Grid, MenuItem, Paper, Stack,
  TextField, Typography, CircularProgress, IconButton, useTheme,
} from '@mui/material';
import { Camera, ImagePlus, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { materialSchema, type MaterialSchemaValues } from '../schemas/material.schema';
import type { Material, MaterialFormValues } from '../types/material.types';
import { useTiposMaterialList } from '../hooks/useTipoMaterial';
import { useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';
import { materialApi } from '../../../services/api/material.api';

interface MaterialFormProps {
  initialData?: Material | null;
  onSubmit: (values: MaterialFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

const UNIDADES = ['unidad', 'kg', 'g', 'litro', 'ml', 'metro', 'cm', 'mm', 'm²', 'm³', 'bolsa', 'barra', 'rollo', 'caja'];

function toFormDefaults(initialData?: Material | null): MaterialFormValues {
  return {
    nombre: initialData?.nombre ?? '',
    descripcion: initialData?.descripcion ?? '',
    tipo_material_id: initialData?.tipo_material_id ?? '',
    unidad: initialData?.unidad ?? '',
    stock_actual: initialData?.stock_actual !== undefined && initialData?.stock_actual !== null ? Number(initialData.stock_actual) : '',
    precio_unitario: initialData?.precio_unitario !== undefined && initialData?.precio_unitario !== null ? Number(initialData.precio_unitario) : '',
    porcentaje_aumento_mensual: initialData?.porcentaje_aumento_mensual !== undefined && initialData?.porcentaje_aumento_mensual !== null ? Number(initialData.porcentaje_aumento_mensual) : '',
    estado_id: initialData?.estado_id ?? '',
    imagen_url: initialData?.imagen_url ?? '',
  };
}

export function MaterialForm({ initialData, onSubmit, isSubmitting = false }: MaterialFormProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<MaterialSchemaValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: toFormDefaults(initialData),
  });

  const { data: tipos = [] } = useTiposMaterialList();
  const { data: todosEstados = [] } = useEstadosGenerales();
  const estados = todosEstados.filter((e) => e.ambito === 'material');

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imagen_url ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tipos.length > 0) reset(toFormDefaults(initialData));
  }, [initialData, tipos, reset]);

  useEffect(() => {
    if (initialData?.imagen_url) setPreviewUrl(initialData.imagen_url);
  }, [initialData]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await materialApi.uploadImagen(file);
      setValue('imagen_url', url);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Error subiendo imagen:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleRemoveImage = () => {
    setValue('imagen_url', '');
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
      <Box component="form" onSubmit={handleSubmit((v) => onSubmit(v as unknown as MaterialFormValues))}>

        <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
          {t('material_form.info_general')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="nombre" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label={t('material_form.nombre')} error={!!errors.nombre} helperText={errors.nombre?.message ?? ''} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="tipo_material_id" control={control} render={({ field }) => (
              <TextField select fullWidth label={t('material_form.tipo')} value={field.value} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}>
                <MenuItem value="">{t('material_form.sin_tipo')}</MenuItem>
                {tipos.map((t) => <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>)}
              </TextField>
            )} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller name="descripcion" control={control} render={({ field }) => (
              <TextField {...field} fullWidth multiline minRows={3} label={t('material_form.descripcion')} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="estado_id" control={control} render={({ field }) => (
              <TextField select fullWidth label={t('material_form.estado')} value={field.value} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} error={!!errors.estado_id} helperText={errors.estado_id?.message ?? ''}>
                <MenuItem value="">{t('material_form.seleccionar')}</MenuItem>
                {estados.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
              </TextField>
            )} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
              {t('material_form.imagen_titulo')}
            </Typography>

            {previewUrl && (
              <Box sx={{ position: 'relative', mb: 1.5, width: '100%', maxWidth: 200 }}>
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Preview"
                  sx={{ width: '100%', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, objectFit: 'cover', aspectRatio: '1/1' }}
                />
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                >
                  <X size={14} />
                </IconButton>
              </Box>
            )}

            {!previewUrl && (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined" size="small"
                  startIcon={uploading ? <CircularProgress size={14} /> : <ImagePlus size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {t('material_form.galeria')}
                </Button>
                <Button
                  variant="outlined" size="small"
                  startIcon={<Camera size={16} />}
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploading}
                  sx={{ display: { xs: 'flex', md: 'none' } }}
                >
                  {t('material_form.camara')}
                </Button>
              </Stack>
            )}

            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />

            {uploading && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {t('material_form.subiendo')}
              </Typography>
            )}

            <Controller name="imagen_url" control={control} render={({ field }) => (
              <input type="hidden" {...field} />
            )} />
          </Grid>
        </Grid>

        <Typography variant="body2" fontWeight={700} sx={{ mt: 3, mb: 2, color: 'text.secondary' }}>
          {t('material_form.stock_precios')}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller name="unidad" control={control} render={({ field }) => (
              <TextField select fullWidth label={t('material_form.unidad')} value={field.value} onChange={(e) => field.onChange(e.target.value)} error={!!errors.unidad} helperText={errors.unidad?.message ?? ''}>
                <MenuItem value="">{t('material_form.seleccionar')}</MenuItem>
                {UNIDADES.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller name="stock_actual" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="number" label={t('material_form.stock_actual')} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} error={!!errors.stock_actual} helperText={errors.stock_actual?.message ?? ''} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller name="precio_unitario" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="number" label={t('material_form.precio_unit')} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} error={!!errors.precio_unitario} helperText={errors.precio_unitario?.message ?? ''} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller name="porcentaje_aumento_mensual" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="number" label={t('material_form.aumento_mensual')} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
            )} />
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting || uploading}>
            {isSubmitting ? t('material_form.guardando') : t('material_form.guardar')}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}