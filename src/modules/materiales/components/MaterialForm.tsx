import { useEffect } from 'react';
import { Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { materialSchema, type MaterialSchemaValues } from '../schemas/material.schema';
import type { Material, MaterialFormValues } from '../types/material.types';
import { useTiposMaterialList } from '../hooks/useTipoMaterial';
import { useEstadosGenerales } from '../../trabajadores/hooks/useEspecialidades';

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
  const { control, handleSubmit, reset, formState: { errors } } = useForm<MaterialSchemaValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: toFormDefaults(initialData),
  });

  const { data: tipos = [] } = useTiposMaterialList();
  const { data: estados = [] } = useEstadosGenerales();

  useEffect(() => {
    if (tipos.length > 0) reset(toFormDefaults(initialData));
  }, [initialData, tipos, reset]);

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
    <Box component="form" onSubmit={handleSubmit((v) => onSubmit(v as unknown as MaterialFormValues))}>
        {/* Información general */}
        <Typography variant="body2" fontWeight={700} sx={{ mb: 2, color: '#64748B' }}>INFORMACIÓN GENERAL</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="nombre" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Nombre" error={!!errors.nombre} helperText={errors.nombre?.message ?? ''} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="tipo_material_id" control={control} render={({ field }) => (
              <TextField select fullWidth label="Tipo de material" value={field.value} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}>
                <MenuItem value="">Sin tipo</MenuItem>
                {tipos.map((t) => <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>)}
              </TextField>
            )} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller name="descripcion" control={control} render={({ field }) => (
              <TextField {...field} fullWidth multiline minRows={3} label="Descripción" />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="estado_id" control={control} render={({ field }) => (
              <TextField select fullWidth label="Estado" value={field.value} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} error={!!errors.estado_id} helperText={errors.estado_id?.message ?? ''}>
                <MenuItem value="">Seleccionar</MenuItem>
                {estados.map((e) => <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>)}
              </TextField>
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller name="imagen_url" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="URL de imagen (opcional)" />
            )} />
          </Grid>
        </Grid>

        {/* Stock y precios */}
        <Typography variant="body2" fontWeight={700} sx={{ mt: 3, mb: 2, color: '#64748B' }}>STOCK Y PRECIOS</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller name="unidad" control={control} render={({ field }) => (
              <TextField select fullWidth label="Unidad de medida" value={field.value} onChange={(e) => field.onChange(e.target.value)} error={!!errors.unidad} helperText={errors.unidad?.message ?? ''}>
                <MenuItem value="">Seleccionar</MenuItem>
                {UNIDADES.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller name="stock_actual" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="number" label="Stock actual" onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} error={!!errors.stock_actual} helperText={errors.stock_actual?.message ?? ''} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller name="precio_unitario" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="number" label="Precio unitario ($)" onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} error={!!errors.precio_unitario} helperText={errors.precio_unitario?.message ?? ''} />
            )} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller name="porcentaje_aumento_mensual" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="number" label="% aumento mensual estimado" onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
            )} />
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar material'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}